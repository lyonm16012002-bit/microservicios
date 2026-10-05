// Reglas de cada deporte (funciones puras, fáciles de probar y de explicar):
//  - validar que un marcador sea posible
//  - cuántos puntos de tabla recibe cada equipo
//  - construir la tabla de posiciones
const AppError = require('./AppError');

const SETS_PARA_GANAR = 3; // voleibol: mejor de 5 sets

function validarMarcador(tipo, local, visitante) {
  for (const v of [local, visitante]) {
    if (!Number.isInteger(v) || v < 0) throw new AppError(400, 'El marcador debe ser un número entero mayor o igual a 0');
  }
  if (tipo === 'puntos' && local === visitante) {
    throw new AppError(400, 'En baloncesto no puede haber empate');
  }
  if (tipo === 'sets') {
    const mayor = Math.max(local, visitante);
    const menor = Math.min(local, visitante);
    if (mayor !== SETS_PARA_GANAR || menor > SETS_PARA_GANAR - 1) {
      throw new AppError(400, 'En voleibol el ganador debe tener 3 sets y el perdedor 0, 1 o 2 (3-0, 3-1 o 3-2)');
    }
  }
}

// Puntos de tabla { local, visitante } según la disciplina
function puntosDePartido(tipo, local, visitante) {
  if (tipo === 'goles') {
    if (local > visitante) return { local: 3, visitante: 0 };
    if (local < visitante) return { local: 0, visitante: 3 };
    return { local: 1, visitante: 1 };
  }
  if (tipo === 'puntos') {
    return local > visitante ? { local: 2, visitante: 1 } : { local: 1, visitante: 2 };
  }
  // sets: 3-0 y 3-1 -> 3 puntos al ganador; 3-2 -> 2 al ganador y 1 al perdedor
  const ganaLocal = local > visitante;
  const setsPerdedor = Math.min(local, visitante);
  const ganador = setsPerdedor <= 1 ? 3 : 2;
  const perdedor = setsPerdedor <= 1 ? 0 : 1;
  return ganaLocal ? { local: ganador, visitante: perdedor } : { local: perdedor, visitante: ganador };
}

/**
 * Tabla de posiciones calculada SIEMPRE desde los partidos jugados (no se guardan acumulados),
 * así nunca queda desactualizada al editar o eliminar un resultado.
 * equipos: [{ id, nombre }]   partidos: [{ equipo_local_id, equipo_visitante_id, marcador_local, marcador_visitante }]
 */
function construirTabla(tipo, equipos, partidos) {
  const filas = new Map();
  for (const e of equipos) {
    filas.set(e.id, { equipo_id: e.id, equipo: e.nombre, pj: 0, pg: 0, pe: 0, pp: 0, favor: 0, contra: 0, dif: 0, puntos: 0 });
  }

  for (const p of partidos) {
    const L = filas.get(p.equipo_local_id);
    const V = filas.get(p.equipo_visitante_id);
    if (!L || !V) continue; // equipo que ya no está aprobado en el torneo
    const pts = puntosDePartido(tipo, p.marcador_local, p.marcador_visitante);

    L.pj++; V.pj++;
    L.favor += p.marcador_local; L.contra += p.marcador_visitante;
    V.favor += p.marcador_visitante; V.contra += p.marcador_local;
    L.puntos += pts.local; V.puntos += pts.visitante;

    if (p.marcador_local === p.marcador_visitante) { L.pe++; V.pe++; }
    else if (p.marcador_local > p.marcador_visitante) { L.pg++; V.pp++; }
    else { V.pg++; L.pp++; }
  }

  const tabla = [...filas.values()];
  tabla.forEach((f) => { f.dif = f.favor - f.contra; });
  tabla.sort((a, b) => b.puntos - a.puntos || b.dif - a.dif || b.favor - a.favor || a.equipo.localeCompare(b.equipo, 'es'));
  tabla.forEach((f, i) => { f.posicion = i + 1; });
  return tabla;
}

module.exports = { validarMarcador, puntosDePartido, construirTabla, SETS_PARA_GANAR };
