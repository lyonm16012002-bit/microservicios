const bcrypt = require('bcryptjs');
const repo = require('../repositories/usuario.repository');
const env = require('./env');

// Crea el administrador y un delegado de ejemplo definidos en .env, solo si la tabla está vacía.
function seedUsers() {
  if (repo.count() > 0) return;

  if (!process.env.ADMIN_PASSWORD || !process.env.DELEGADO_PASSWORD) {
    console.warn('[ms-usuarios] AVISO: usando contraseñas por defecto. Defínelas en .env antes de publicar.');
  }

  repo.create({ username: env.ADMIN_USERNAME, nombre: 'Administrador de la Liga', passwordHash: bcrypt.hashSync(env.ADMIN_PASSWORD, 10), role: 'admin' });
  repo.create({ username: env.DELEGADO_USERNAME, nombre: 'Delegado de ejemplo', passwordHash: bcrypt.hashSync(env.DELEGADO_PASSWORD, 10), role: 'delegado' });

  console.log('[ms-usuarios] Usuarios iniciales creados:');
  console.log('   admin    ->', env.ADMIN_USERNAME);
  console.log('   delegado ->', env.DELEGADO_USERNAME);
}

module.exports = seedUsers;
