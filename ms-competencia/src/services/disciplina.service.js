// SERVICE: reglas de negocio de las disciplinas.
const repo = require('../repositories/disciplina.repository');
const AppError = require('../utils/AppError');
const { FIELDS, TIPOS } = require('../models/disciplina.model');

function validar(d) {
  if (typeof d.nombre !== 'string' || d.nombre.trim().length < 3) throw new AppError(400, 'El nombre de la disciplina debe tener al menos 3 caracteres');
  if (!TIPOS.includes(d.tipo_marcador)) throw new AppError(400, `Tipo de marcador inválido. Permitidos: ${TIPOS.join(', ')}`);
  for (const campo of ['jugadores_min', 'jugadores_max']) {
    if (!Number.isInteger(d[campo]) || d[campo] < 1 || d[campo] > 60) throw new AppError(400, `${campo} debe ser un entero entre 1 y 60`);
  }
  if (d.jugadores_max < d.jugadores_min) throw new AppError(400, 'El máximo de jugadores no puede ser menor que el mínimo');
}

function normalizar(body, base = {}) {
  const d = {};
  for (const f of FIELDS) {
    let v = body[f] ?? base[f];
    if (typeof v === 'string') v = v.trim();
    if (f.startsWith('jugadores_') && typeof v === 'string' && v !== '') v = Number(v);
    d[f] = v;
  }
  return d;
}

const listar = () => repo.findAll();

function obtener(id) {
  const d = repo.findById(id);
  if (!d) throw new AppError(404, 'Disciplina no encontrada');
  return d;
}

function crear(body) {
  const d = normalizar(body);
  validar(d);
  if (repo.findByNombre(d.nombre)) throw new AppError(409, 'Ya existe una disciplina con ese nombre');
  return repo.create(d);
}

function actualizar(id, body) {
  const existente = obtener(id);
  const d = normalizar(body, existente);
  validar(d);
  const repetida = repo.findByNombre(d.nombre);
  if (repetida && repetida.id !== existente.id) throw new AppError(409, 'Ya existe una disciplina con ese nombre');
  return repo.update(id, d);
}

function eliminar(id) {
  obtener(id);
  if (repo.contarTorneos(id) > 0) throw new AppError(409, 'No se puede eliminar: hay torneos de esta disciplina');
  repo.remove(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
