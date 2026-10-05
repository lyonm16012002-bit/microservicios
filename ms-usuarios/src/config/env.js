const path = require('path');
const dotenv = require('dotenv');

// Primero el .env propio del servicio (si existe) y luego el .env de la raíz del proyecto.
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

if (!process.env.JWT_SECRET) {
  console.error('[ms-usuarios] Falta JWT_SECRET. Copia .env.example a .env y defínelo.');
  process.exit(1);
}

module.exports = {
  PORT: Number(process.env.USUARIOS_PORT) || 3001,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  DB_PATH: process.env.USUARIOS_DB_PATH || path.join(__dirname, '..', '..', 'data', 'usuarios.db'),
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'leomontes',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'LeoMontes77-Admin',
  DELEGADO_USERNAME: process.env.DELEGADO_USERNAME || 'delegado',
  DELEGADO_PASSWORD: process.env.DELEGADO_PASSWORD || 'LeoMontes77-Delegado'
};
