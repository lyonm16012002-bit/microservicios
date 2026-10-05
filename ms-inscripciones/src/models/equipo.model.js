// MODEL: un equipo es la inscripción de un grupo de estudiantes en UN torneo.
// "torneo_id" referencia a un torneo de OTRO microservicio (ms-competencia), por eso no hay FOREIGN KEY:
// la existencia del torneo se valida por HTTP en el service.
const TABLE = 'equipos';
const FIELDS = ['nombre', 'facultad', 'telefono_contacto', 'correo_contacto', 'estado', 'observaciones'];
const ESTADOS = ['Pendiente', 'Aprobada', 'Rechazada'];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS equipos (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  torneo_id          INTEGER NOT NULL,
  nombre             TEXT NOT NULL,
  facultad           TEXT NOT NULL,
  telefono_contacto  TEXT,
  correo_contacto    TEXT,
  estado             TEXT NOT NULL DEFAULT 'Pendiente' CHECK(estado IN ('Pendiente','Aprobada','Rechazada')),
  observaciones      TEXT,
  delegado           TEXT NOT NULL,
  creado_en          TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_equipo_nombre_torneo ON equipos(torneo_id, nombre COLLATE NOCASE);`;

module.exports = { TABLE, FIELDS, ESTADOS, SCHEMA };
