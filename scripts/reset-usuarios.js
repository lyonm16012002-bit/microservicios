/**
 * Aplica a la base de usuarios las credenciales actuales del .env.
 * Úsalo cuando ya existe la base y quieres que el administrador y el delegado de ejemplo
 * tengan el nombre y la contraseña definidos en .env.
 *
 * Uso:  npm run usuarios:reset      (con los servicios detenidos)
 * Actualiza al PRIMER usuario con rol admin y al PRIMER usuario con rol delegado (o los crea).
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const rutas = require('./rutas-db');
const usuario = require('../ms-usuarios/src/models/usuario.model');

const definidos = [
  ['admin', process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, 'Administrador de la Liga'],
  ['delegado', process.env.DELEGADO_USERNAME, process.env.DELEGADO_PASSWORD, 'Delegado de ejemplo']
];
if (definidos.some(([, u, p]) => !u || !p)) {
  console.error('Faltan ADMIN_USERNAME/ADMIN_PASSWORD o DELEGADO_USERNAME/DELEGADO_PASSWORD en el .env');
  process.exit(1);
}

fs.mkdirSync(path.dirname(rutas.usuarios), { recursive: true });
const db = new Database(rutas.usuarios);
db.exec(usuario.SCHEMA);

for (const [role, username, password, nombre] of definidos) {
  const hash = bcrypt.hashSync(password, 10);
  const existente = db.prepare('SELECT id FROM users WHERE role = ? ORDER BY id LIMIT 1').get(role);
  const otro = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (otro && (!existente || otro.id !== existente.id)) {
    console.error(`El usuario "${username}" ya existe con otro rol; elige otro nombre en el .env.`);
    process.exit(1);
  }
  if (existente) {
    db.prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?').run(username, hash, existente.id);
    console.log(`  ${role}: actualizado -> usuario "${username}"`);
  } else {
    db.prepare('INSERT INTO users (username, nombre, password_hash, role) VALUES (?, ?, ?, ?)').run(username, nombre, hash, role);
    console.log(`  ${role}: creado -> usuario "${username}"`);
  }
}
console.log('Listo. Ya puedes iniciar sesión con las credenciales del .env.');
