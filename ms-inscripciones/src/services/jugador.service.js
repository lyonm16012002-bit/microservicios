// SERVICE: reglas de negocio de los jugadores.
const repo = require('../repositories/jugador.repository');
const equipoRepo = require('../repositories/equipo.repository');
const competencia = require('../clients/competencia.client');
const { validarJugador } = require('../utils/validarJugador');
const AppError = require('../utils/AppError');
const { FIELDS } = require('../models/jugador.model');

const esAdmin = (user) => user.role === 'admin';

function verificarUnicos(d, equipo, excluirId = null) {
  if (repo.documentoEnTorneo(equipo.torneo_id, d.documento, excluirId)) {
    throw new AppError(409, `El documento ${d.documento} ya está inscrito en este torneo (un estudiante solo puede jugar en un equipo)`);
  }
  if (d.dorsal !== null && repo.dorsalEnEquipo(equipo.id, d.dorsal, excluirId)) {
    throw new AppError(409, `El dorsal ${d.dorsal} ya está ocupado en este equipo`);
  }
}

// Privacidad: un delegado solo ve a los jugadores de SUS equipos.
function listar(filtros, user) {
  const f = { ...filtros };
  if (!esAdmin(user)) f.delegado = user.username;
  return repo.findAll(f);
}

function obtener(id, user) {
  const j = repo.findById(id);
  if (!j) throw new AppError(404, 'Jugador no encontrado');
  if (!esAdmin(user) && j.delegado !== user.username) throw new AppError(403, 'Solo puedes consultar jugadores de tus propios equipos');
  return j;
}

async function crear(body, user, token) {
  const equipo = equipoRepo.findById(Number(body.equipo_id));
  if (!equipo) throw new AppError(400, 'El equipo no existe');
  if (!esAdmin(user) && equipo.delegado !== user.username) throw new AppError(403, 'Solo puedes agregar jugadores a tus propios equipos');

  const torneo = await competencia.obtenerTorneo(equipo.torneo_id, token);
  if (!esAdmin(user) && torneo.estado !== 'Inscripciones abiertas') throw new AppError(409, 'Las inscripciones de este torneo están cerradas');
  if (repo.contarPorEquipo(equipo.id) >= torneo.jugadores_max) {
    throw new AppError(409, `El equipo ya tiene el máximo de ${torneo.jugadores_max} jugadores para ${torneo.disciplina}`);
  }

  const d = validarJugador(body);
  verificarUnicos(d, equipo);
  return repo.create({ ...d, equipo_id: equipo.id, torneo_id: equipo.torneo_id, delegado: equipo.delegado });
}

// Editar (solo admin, lo controla la ruta)
function actualizar(id, body) {
  const existente = repo.findById(id);
  if (!existente) throw new AppError(404, 'Jugador no encontrado');
  const mezcla = {};
  for (const f of FIELDS) mezcla[f] = body[f] ?? existente[f];
  const d = validarJugador(mezcla);
  verificarUnicos(d, { id: existente.equipo_id, torneo_id: existente.torneo_id }, existente.id);
  return repo.update(id, d);
}

function eliminar(id) {
  if (!repo.findById(id)) throw new AppError(404, 'Jugador no encontrado');
  repo.remove(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
