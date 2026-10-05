// MODEL: un partido enfrenta a dos equipos de un torneo. Los equipos viven en OTRO microservicio
// (ms-inscripciones), por eso aquí solo se guardan sus ids y se validan por HTTP en el service.
const TABLE = 'partidos';
const FIELDS = ['torneo_id', 'jornada', 'equipo_local_id', 'equipo_visitante_id', 'fecha', 'hora', 'lugar', 'estado', 'marcador_local', 'marcador_visitante', 'observaciones'];
const ESTADOS = ['Programado', 'Jugado', 'Aplazado', 'Cancelado'];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS partidos (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  torneo_id            INTEGER NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
  jornada              INTEGER NOT NULL DEFAULT 1,
  equipo_local_id      INTEGER NOT NULL,
  equipo_visitante_id  INTEGER NOT NULL,
  fecha                TEXT NOT NULL,
  hora                 TEXT NOT NULL,
  lugar                TEXT,
  estado               TEXT NOT NULL DEFAULT 'Programado',
  marcador_local       INTEGER,
  marcador_visitante   INTEGER,
  observaciones        TEXT,
  CHECK (equipo_local_id != equipo_visitante_id)
);
CREATE INDEX IF NOT EXISTS idx_partidos_torneo ON partidos(torneo_id);`;

module.exports = { TABLE, FIELDS, ESTADOS, SCHEMA };
