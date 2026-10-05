const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

if (!process.env.JWT_SECRET) {
  console.error('[ms-inscripciones] Falta JWT_SECRET. Copia .env.example a .env y defínelo.');
  process.exit(1);
}

module.exports = {
  PORT: Number(process.env.INSCRIPCIONES_PORT) || 3003,
  JWT_SECRET: process.env.JWT_SECRET,
  COMPETENCIA_URL: process.env.COMPETENCIA_URL || 'http://localhost:3002',
  DB_PATH: process.env.INSCRIPCIONES_DB_PATH || path.join(__dirname, '..', '..', 'data', 'inscripciones.db')
};
