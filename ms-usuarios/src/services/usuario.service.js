// SERVICE: reglas de negocio de la gestión de usuarios.
const bcrypt = require('bcryptjs');
const repo = require('../repositories/usuario.repository');
const AppError = require('../utils/AppError');
const { ROLES } = require('../models/usuario.model');

const REGEX_USUARIO = /^[A-Za-z0-9._-]{3,30}$/;

function validarNombre(nombre, obligatorio) {
  const n = nombre === undefined || nombre === null ? '' : String(nombre).trim();
  if (obligatorio && n.length < 3) throw new AppError(400, 'El nombre completo debe tener al menos 3 caracteres');
  if (n.length > 80) throw new AppError(400, 'El nombre completo no puede superar 80 caracteres');
  return n;
}

function validarUsuario(username) {
  if (typeof username !== 'string' || !REGEX_USUARIO.test(username.trim())) {
    throw new AppError(400, 'El usuario debe tener de 3 a 30 caracteres (letras, números, punto, guion o guion bajo)');
  }
  return username.trim();
}

function listar() {
  return repo.findAll();
}

function obtener(id) {
  const user = repo.findById(id);
  if (!user) throw new AppError(404, 'Usuario no encontrado');
  return user;
}

function crear({ username, password, role, nombre } = {}, { obligarNombre = false } = {}) {
  const usuario = validarUsuario(username);
  if (typeof password !== 'string' || password.length < 6) {
    throw new AppError(400, 'La contraseña debe tener al menos 6 caracteres');
  }
  if (!ROLES.includes(role)) {
    throw new AppError(400, `Rol inválido. Roles permitidos: ${ROLES.join(', ')}`);
  }
  const nombreOk = validarNombre(nombre, obligarNombre);
  if (repo.findByUsername(usuario)) {
    throw new AppError(409, 'Ese nombre de usuario ya existe');
  }

  // La contraseña NUNCA se guarda en texto plano: solo su hash bcrypt.
  return repo.create({ username: usuario, nombre: nombreOk, passwordHash: bcrypt.hashSync(password, 10), role });
}

// Editar usuario: nombre de usuario, nombre completo, rol y (opcional) nueva contraseña.
function actualizar(id, body = {}) {
  const actual = obtener(id);

  const username = body.username ? validarUsuario(body.username) : actual.username;
  const role = body.role || actual.role;
  const nombre = body.nombre !== undefined && body.nombre !== null ? validarNombre(body.nombre, false) : actual.nombre;
  const password = body.password;

  if (!ROLES.includes(role)) throw new AppError(400, `Rol inválido. Roles permitidos: ${ROLES.join(', ')}`);
  if (password !== undefined && password !== null && password !== '' && (typeof password !== 'string' || password.length < 6)) {
    throw new AppError(400, 'La contraseña debe tener al menos 6 caracteres');
  }

  const repetido = repo.findByUsername(username);
  if (repetido && repetido.id !== actual.id) throw new AppError(409, 'Ese nombre de usuario ya existe');

  // Regla: nunca puede quedar el sistema sin administrador
  if (actual.role === 'admin' && role !== 'admin' && repo.countByRole('admin') <= 1) {
    throw new AppError(400, 'Debe existir al menos un administrador');
  }

  return repo.update(id, { username, nombre, role, passwordHash: password ? bcrypt.hashSync(password, 10) : null });
}

function eliminar(id, usuarioActual) {
  const user = obtener(id);
  if (String(user.id) === String(usuarioActual.sub)) {
    throw new AppError(400, 'No puedes eliminar tu propio usuario');
  }
  repo.remove(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
