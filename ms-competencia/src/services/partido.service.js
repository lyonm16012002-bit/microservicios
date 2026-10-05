// SERVICE: reglas de negocio del calendario y los resultados.
const repo = require('../repositories/partido.repository');
const torneoService = require('./torneo.service');
const inscripciones = require('../clients/inscripciones.client');
const AppError = require('../utils/AppError');
const { esFecha, esHora } = require('../utils/fechas');
const { validarMarcador } = require('../utils/reglas');
const { FIELDS, ESTADOS } = require('../models/partido.model');

const ENTEROS = ['torneo_id', 'jornada', 'equipo_local_id', 'equipo_visitante_id', 'marcador_local', 'marcador_visitante'];

function normalizar(body, base = {}) {
  const d = {};
  for (const f of FIELDS) {
    let v = body[f] !== undefined ? body[f] : base[f];
    if (typeof v === 'string') v = v.trim();
    if (v === '') v = null;
    if (ENTEROS.includes(f) && typeof v === 'string') v = Number(v);
    d[f] = v === undefined ? null : v;
  }
  if (d.jornada === null) d.jornada = 1;
  if (d.estado === null) d.estado = 'Programado';
  return d;
}

function validarCampos(d) {
  for (const campo of ['torneo_id', 'equipo_local_id', 'equipo_visitante_id']) {
    if (!Number.isInteger(d[campo])) throw new AppError(400, `El campo ${campo} es requerido`);
  }
  if (d.equipo_local_id === d.equipo_visitante_id) throw new AppError(400, 'Un equipo no puede jugar contra sí mismo');
  if (!Number.isInteger(d.jornada) || d.jornada < 1) throw new AppError(400, 'La jornada debe ser un entero mayor o igual a 1');
  if (!esFecha(d.fecha)) throw new AppError(400, 'La fecha es requerida con formato AAAA-MM-DD');
  if (!esHora(d.hora)) throw new AppError(400, 'La hora es requerida con formato HH:MM (24 horas)');
  if (!ESTADOS.includes(d.estado)) throw new AppError(400, `Estado inválido. Permitidos: ${ESTADOS.join(', ')}`);
}

// Los dos equipos deben existir, ser de ESTE torneo y estar aprobados (se consulta a ms-inscripciones).
async function validarEquipos(d, torneo, token) {
  const [local, visitante] = await Promise.all([
    inscripciones.obtenerEquipo(d.equipo_local_id, token),
    inscripciones.obtenerEquipo(d.equipo_visitante_id, token)
  ]);
  for (const [equipo, etiqueta] of [[local, 'local'], [visitante, 'visitante']]) {
    if (!equipo) throw new AppError(400, `El equipo ${etiqueta} no existe`);
    if (equipo.torneo_id !== torneo.id) throw new AppError(400, `El equipo "${equipo.nombre}" no pertenece a este torneo`);
    if (equipo.estado !== 'Aprobada') throw new AppError(400, `El equipo "${equipo.nombre}" no está aprobado`);
  }
}

// Si el partido está "Jugado" el marcador es obligatorio y se valida con las reglas del deporte.
// Si no, el marcador se limpia.
function aplicarMarcador(d, torneo) {
  if (d.estado === 'Jugado') {
    if (d.marcador_local === null || d.marcador_visitante === null) throw new AppError(400, 'Un partido jugado necesita el marcador de ambos equipos');
    validarMarcador(torneo.tipo_marcador, d.marcador_local, d.marcador_visitante);
  } else {
    d.marcador_local = null;
    d.marcador_visitante = null;
  }
}

function validarChoque(d, excluirId) {
  if (d.estado !== 'Programado' && d.estado !== 'Jugado') return;
  if (repo.findChoque({ fecha: d.fecha, hora: d.hora, lugar: d.lugar, local: d.equipo_local_id, visitante: d.equipo_visitante_id }, excluirId)) {
    throw new AppError(409, 'Choque de horario: la cancha o alguno de los equipos ya tiene un partido a esa fecha y hora');
  }
}

const listar = (torneoId) => repo.findAll(torneoId);

function obtener(id) {
  const p = repo.findById(id);
  if (!p) throw new AppError(404, 'Partido no encontrado');
  return p;
}

async function crear(body, token) {
  const d = normalizar(body);
  validarCampos(d);
  const torneo = torneoService.obtener(d.torneo_id);
  if (torneo.estado !== 'En juego') throw new AppError(409, 'Solo se programan partidos en torneos con estado "En juego"');
  await validarEquipos(d, torneo, token);
  aplicarMarcador(d, torneo);
  validarChoque(d, null);
  return repo.create(d);
}

async function actualizar(id, body, token) {
  const existente = obtener(id);
  const d = normalizar(body, existente);
  d.torneo_id = existente.torneo_id; // el torneo de un partido no se cambia
  validarCampos(d);
  const torneo = torneoService.obtener(d.torneo_id);
  if (d.equipo_local_id !== existente.equipo_local_id || d.equipo_visitante_id !== existente.equipo_visitante_id) {
    await validarEquipos(d, torneo, token);
  }
  aplicarMarcador(d, torneo);
  validarChoque(d, existente.id);
  return repo.update(id, d);
}

function eliminar(id) {
  obtener(id);
  repo.remove(id);
}

// Uso interno: cuando ms-inscripciones elimina un equipo, aquí se eliminan sus partidos.
function eliminarPorEquipo(equipoId) {
  return { partidosEliminados: repo.removeByEquipo(equipoId) };
}

module.exports = { listar, obtener, crear, actualizar, eliminar, eliminarPorEquipo };
