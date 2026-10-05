// MODEL: un jugador pertenece a un equipo. Datos personales: documento, nombre, carrera, facultad y EPS.
// "torneo_id" y "delegado" se copian del equipo para poder validar (un estudiante, un solo equipo por torneo)
// y filtrar (cada delegado solo ve a sus jugadores).
const TABLE = 'jugadores';
const FIELDS = ['documento', 'nombre', 'apellido', 'carrera', 'facultad', 'semestre', 'eps', 'dorsal', 'posicion', 'telefono'];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS jugadores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  equipo_id  INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  torneo_id  INTEGER NOT NULL,
  documento  TEXT NOT NULL,
  nombre     TEXT NOT NULL,
  apellido   TEXT NOT NULL,
  carrera    TEXT NOT NULL,
  facultad   TEXT NOT NULL,
  semestre   INTEGER,
  eps        TEXT NOT NULL,
  dorsal     INTEGER,
  posicion   TEXT,
  telefono   TEXT,
  delegado   TEXT NOT NULL,
  creado_en  TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_jugador_documento_torneo ON jugadores(torneo_id, documento);
CREATE UNIQUE INDEX IF NOT EXISTS ux_jugador_dorsal_equipo ON jugadores(equipo_id, dorsal) WHERE dorsal IS NOT NULL;`;

module.exports = { TABLE, FIELDS, SCHEMA };
