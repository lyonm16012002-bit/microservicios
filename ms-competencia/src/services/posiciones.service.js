// SERVICE: tabla de posiciones de un torneo. Une datos de DOS microservicios:
//  - partidos y reglas del deporte (aquí, ms-competencia)
//  - equipos aprobados y sus nombres (ms-inscripciones, por HTTP)
const torneoService = require('./torneo.service');
const partidoRepo = require('../repositories/partido.repository');
const inscripciones = require('../clients/inscripciones.client');
const { construirTabla } = require('../utils/reglas');

const ETIQUETAS = {
  goles:  { favor: 'GF', contra: 'GC', dif: 'DG' },
  puntos: { favor: 'PF', contra: 'PC', dif: 'DP' },
  sets:   { favor: 'SF', contra: 'SC', dif: 'DS' }
};

async function calcular(torneoId, token) {
  const torneo = torneoService.obtener(torneoId);
  const equipos = (await inscripciones.equiposAprobadosDeTorneo(torneo.id, token)) || [];
  const nombres = new Map(equipos.map((e) => [e.id, e.nombre]));
  const nombre = (id) => nombres.get(id) || `Equipo #${id}`;

  const jugados = partidoRepo.jugadosDeTorneo(torneo.id);
  const tabla = construirTabla(torneo.tipo_marcador, equipos.map((e) => ({ id: e.id, nombre: e.nombre })), jugados);

  const conNombres = (p) => ({
    id: p.id, jornada: p.jornada, fecha: p.fecha, hora: p.hora, lugar: p.lugar,
    local: nombre(p.equipo_local_id), visitante: nombre(p.equipo_visitante_id),
    marcador_local: p.marcador_local, marcador_visitante: p.marcador_visitante
  });

  return {
    torneo: { id: torneo.id, nombre: torneo.nombre, disciplina: torneo.disciplina, tipo_marcador: torneo.tipo_marcador, rama: torneo.rama, periodo: torneo.periodo, estado: torneo.estado },
    etiquetas: ETIQUETAS[torneo.tipo_marcador],
    tabla,
    resultados: jugados.slice(0, 20).map(conNombres),
    proximos: partidoRepo.programadosDeTorneo(torneo.id).slice(0, 10).map(conNombres)
  };
}

module.exports = { calcular };
