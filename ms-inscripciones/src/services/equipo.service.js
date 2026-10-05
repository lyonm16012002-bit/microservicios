// SERVICE: reglas de negocio de los equipos inscritos.
const repo = require('../repositories/equipo.repository');
const competencia = require('../clients/competencia.client');
const AppError = require('../utils/AppError');
const { ESTADOS } = require('../models/equipo.model');

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TEL = /^[0-9+()\s-]{7,20}$/;

// Privacidad: los datos de contacto del delegado solo los ven el admin y el propio delegado.
function ocultarContacto(equipo, user) {
  if (!equipo || user.role === 'admin' || equipo.delegado === user.username) return equipo;
  return { ...equipo, telefono_contacto: null, correo_contacto: null, delegado: null };
}

function validarDatos(d) {
  if (typeof d.nombre !== 'string' || d.nombre.length < 3 || d.nombre.length > 60) throw new AppError(400, 'El nombre del equipo debe tener entre 3 y 60 caracteres');
  if (typeof d.facultad !== 'string' || d.facultad.length < 2 || d.facultad.length > 80) throw new AppError(400, 'La facultad o programa que representa el equipo es requerida');
  if (d.telefono_contacto && !REGEX_TEL.test(d.telefono_contacto)) throw new AppError(400, 'El teléfono de contacto no es válido');
  if (d.correo_contacto && !REGEX_CORREO.test(d.correo_contacto)) throw new AppError(400, 'El correo de contacto no es válido');
  if (!ESTADOS.includes(d.estado)) throw new AppError(400, `Estado inválido. Permitidos: ${ESTADOS.join(', ')}`);
}

function listar(filtros, user) {
  return repo.findAll(filtros).map((e) => ocultarContacto(e, user));
}

function obtener(id, user) {
  const e = repo.findById(id);
  if (!e) throw new AppError(404, 'Equipo no encontrado');
  return ocultarContacto(e, user);
}

// Editar (solo admin, lo controla la ruta). Aprobar exige tener el mínimo de jugadores del deporte.
async function actualizar(id, body, token) {
  const existente = repo.findById(id);
  if (!existente) throw new AppError(404, 'Equipo no encontrado');

  const d = {};
  for (const f of ['nombre', 'facultad', 'telefono_contacto', 'correo_contacto', 'estado', 'observaciones']) {
    let v = body[f] ?? existente[f];
    if (typeof v === 'string') v = v.trim();
    d[f] = v === '' ? null : v;
  }
  validarDatos(d);

  if (repo.nombreExiste(existente.torneo_id, d.nombre, existente.id)) throw new AppError(409, 'Ya hay un equipo con ese nombre en este torneo');

  if (d.estado === 'Aprobada' && existente.estado !== 'Aprobada') {
    const torneo = await competencia.obtenerTorneo(existente.torneo_id, token);
    if (existente.numero_jugadores < torneo.jugadores_min) {
      throw new AppError(409, `No se puede aprobar: tiene ${existente.numero_jugadores} jugador(es) y ${torneo.disciplina} exige mínimo ${torneo.jugadores_min}`);
    }
  }
  return repo.update(id, d);
}

// Borrado coordinado: primero ms-competencia elimina los partidos del equipo; solo si funciona se borra el equipo.
async function eliminar(id, token) {
  if (!repo.findById(id)) throw new AppError(404, 'Equipo no encontrado');
  await competencia.eliminarPartidosDeEquipo(id, token);
  repo.remove(id); // sus jugadores se eliminan en cascada
}

const estadisticas = () => repo.estadisticas();

module.exports = { listar, obtener, actualizar, eliminar, estadisticas, validarDatos, REGEX_CORREO, REGEX_TEL };
