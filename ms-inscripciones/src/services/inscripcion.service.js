// SERVICE: el FORMULARIO DE INSCRIPCIÓN. Recibe el equipo y toda su lista de jugadores en una sola solicitud.
const equipoRepo = require('../repositories/equipo.repository');
const inscripcionRepo = require('../repositories/inscripcion.repository');
const competencia = require('../clients/competencia.client');
const equipoService = require('./equipo.service');
const { validarJugador } = require('../utils/validarJugador');
const AppError = require('../utils/AppError');

const texto = (v) => (v === undefined || v === null ? '' : String(v).trim());

async function inscribir(body, user, token) {
  const torneoId = Number(body.torneo_id);
  if (!Number.isInteger(torneoId)) throw new AppError(400, 'Selecciona el torneo en el que quieres inscribirte');

  // Reglas del deporte y estado del torneo (se consultan a ms-competencia)
  const torneo = await competencia.obtenerTorneo(torneoId, token);
  const admin = user.role === 'admin';
  if (!admin && torneo.estado !== 'Inscripciones abiertas') throw new AppError(409, 'Las inscripciones de este torneo están cerradas');

  // Datos del equipo
  const equipo = {
    torneo_id: torneoId,
    nombre: texto(body.nombre),
    facultad: texto(body.facultad),
    telefono_contacto: texto(body.telefono_contacto),
    correo_contacto: texto(body.correo_contacto) || null,
    estado: 'Pendiente',
    observaciones: texto(body.observaciones) || null,
    delegado: user.username
  };
  equipoService.validarDatos(equipo);
  if (!equipo.telefono_contacto) throw new AppError(400, 'El teléfono de contacto del delegado es requerido');

  // Plantilla de jugadores
  const lista = Array.isArray(body.jugadores) ? body.jugadores : [];
  if (lista.length < 1) throw new AppError(400, 'Agrega al menos un jugador');
  if (lista.length > torneo.jugadores_max) throw new AppError(400, `${torneo.disciplina} admite máximo ${torneo.jugadores_max} jugadores por equipo`);
  const jugadores = lista.map((j, i) => validarJugador(j, `Jugador ${i + 1}`));

  const documentos = new Set(), dorsales = new Set();
  jugadores.forEach((j, i) => {
    if (documentos.has(j.documento)) throw new AppError(400, `Jugador ${i + 1}: el documento ${j.documento} está repetido en la lista`);
    documentos.add(j.documento);
    if (j.dorsal !== null) {
      if (dorsales.has(j.dorsal)) throw new AppError(400, `Jugador ${i + 1}: el dorsal ${j.dorsal} está repetido en la lista`);
      dorsales.add(j.dorsal);
    }
  });

  // Reglas contra los datos ya guardados
  if (equipoRepo.nombreExiste(torneoId, equipo.nombre)) throw new AppError(409, 'Ya hay un equipo con ese nombre en este torneo');
  if (equipoRepo.contarActivosPorTorneo(torneoId) >= torneo.cupo_equipos) throw new AppError(409, `El torneo ya completó su cupo de ${torneo.cupo_equipos} equipos`);
  const yaInscritos = inscripcionRepo.documentosEnTorneo(torneoId, [...documentos]);
  if (yaInscritos.length) throw new AppError(409, `Ya están inscritos en este torneo (en otro equipo): ${yaInscritos.join(', ')}`);

  return inscripcionRepo.crearConJugadores(equipo, jugadores); // todo o nada
}

module.exports = { inscribir };
