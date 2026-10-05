// MODEL: describe la tabla (nombre, roles válidos y esquema SQL). No tiene lógica.
const TABLE = 'users';
const ROLES = ['admin', 'delegado'];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  nombre        TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK(role IN ('admin','delegado'))
);`;

module.exports = { TABLE, ROLES, SCHEMA };
