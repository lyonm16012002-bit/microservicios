// SERVICE: reglas de negocio de los torneos.
const repo = require('../repositories/torneo.repository');
const disciplinaRepo = require('../repositories/disciplina.repository');
const partidoRepo = require('../repositories/partido.repository');
const inscripciones = require('../clients/inscripciones.client');
const AppError = require('../utils/AppError');
const { esFecha, hoyLocal } = require('../utils/fechas');
const { FIELDS, RAMAS, ESTADOS } = require('../models/torneo.model');

const REGEX_PERIODO = /^\d{4}-[12]$/; // ej: 2026-2

function normalizar(body, base = {}) {
  const d = {};
  for (const f of FIELDS) {
    let v = body[f] ?? base[f];
    if (typeof v === 'string') v = v.trim();
    if ((f === 'disciplina_id' || f === 'cupo_equipos') && typeof v === 'string' && v !== '') v = Number(v);
    d[f] = v === '' ? null : v;
  }
  if (d.estado === null || d.estado === undefined) d.estado = 'Inscripciones abiertas';
  if (d.cupo_equipos === null || d.cupo_equipos === undefined) d.cupo_equipos = 16;
  return d;
}

function validar(d, excluirId = null) {
  if (typeof d.nombre !== 'string' || d.nombre.length < 3 || d.nombre.length > 80) throw new AppError(400, 'El nombre del torneo debe tener entre 3 y 80 caracteres');
  if (!Number.isInteger(d.disciplina_id) || !disciplinaRepo.findById(d.disciplina_id)) throw new AppError(400, 'La disciplina no existe');
  if (!RAMAS.includes(d.rama)) throw new AppError(400, `Rama inválida. Permitidas: ${RAMAS.join(', ')}`);
  if (typeof d.periodo !== 'string' || !REGEX_PERIODO.test(d.periodo)) throw new AppError(400, 'El periodo debe tener formato AAAA-1 o AAAA-2 (ej: 2026-2)');
  if (!ESTADOS.includes(d.estado)) throw new AppError(400, `Estado inválido. Permitidos: ${ESTADOS.join(', ')}`);
  if (!Number.isInteger(d.cupo_equipos) || d.cupo_equipos < 2 || d.cupo_equipos > 64) throw new AppError(400, 'El cupo de equipos debe ser un entero entre 2 y 64');
  for (const campo of ['cierre_inscripcion', 'fecha_inicio']) {
    if (d[campo] && !esFecha(d[campo])) throw new AppError(400, `${campo} debe tener formato AAAA-MM-DD`);
  }
  if (repo.findCombinacion(d.disciplina_id, d.rama, d.periodo, excluirId)) {
    throw new AppError(409, 'Ya existe un torneo de esa disciplina, rama y periodo');
  }
}

const listar = () => repo.findAll();

function obtener(id) {
  const t = repo.findById(id);
  if (!t) throw new AppError(404, 'Torneo no encontrado');
  return t;
}

function crear(body) {
  const d = normalizar(body);
  validar(d);
  return repo.create(d);
}

function actualizar(id, body) {
  const existente = obtener(id);
  const d = normalizar(body, existente);
  validar(d, existente.id);
  return repo.update(id, d);
}

// No se elimina un torneo que todavía tiene equipos inscritos (viven en otro microservicio).
async function eliminar(id, token) {
  obtener(id);
  const equipos = await inscripciones.equiposDeTorneo(id, token);
  if (equipos && equipos.length > 0) {
    throw new AppError(409, `No se puede eliminar: el torneo tiene ${equipos.length} equipo(s) inscrito(s). Elimínalos primero.`);
  }
  repo.remove(id); // sus partidos se eliminan en cascada
}

function estadisticas() {
  return { torneosActivos: repo.contarActivos(), partidosProgramados: partidoRepo.contarProgramados(hoyLocal()) };
}

module.exports = { listar, obtener, crear, actualizar, eliminar, estadisticas };
