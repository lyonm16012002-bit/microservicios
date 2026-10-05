// SERVICE: reglas de negocio de la autenticación. Aquí se EMITE el JWT.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('../repositories/usuario.repository');
const usuarioService = require('./usuario.service');
const AppError = require('../utils/AppError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

function login(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    throw new AppError(400, 'Usuario y contraseña son requeridos');
  }

  const user = repo.findByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new AppError(401, 'Usuario o contraseña incorrectos');
  }

  // Payload del JWT: quién es (sub, username) y qué rol tiene. La firma evita que lo alteren.
  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN }
  );

  return { token, username: user.username, nombre: user.nombre, role: user.role };
}

// Registro público: SOLO puede crear delegados de equipo. Nadie puede registrarse como admin desde afuera.
function registrar({ username, password, nombre } = {}) {
  return usuarioService.crear({ username, password, nombre, role: 'delegado' }, { obligarNombre: true });
}

function perfil(payload) {
  const user = repo.findById(payload.sub);
  if (!user) throw new AppError(401, 'El usuario del token ya no existe');
  return user;
}

module.exports = { login, registrar, perfil };
