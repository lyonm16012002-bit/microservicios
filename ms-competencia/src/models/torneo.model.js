// MODEL: un torneo es una disciplina + rama + periodo académico (ej: Futsal Masculino 2026-2).
const TABLE = 'torneos';
const FIELDS = ['nombre', 'disciplina_id', 'rama', 'periodo', 'estado', 'cupo_equipos', 'cierre_inscripcion', 'fecha_inicio', 'observaciones'];
const RAMAS = ['Masculino', 'Femenino', 'Mixto'];
const ESTADOS = ['Inscripciones abiertas', 'En juego', 'Finalizado'];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS torneos (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre              TEXT NOT NULL,
  disciplina_id       INTEGER NOT NULL REFERENCES disciplinas(id),
  rama                TEXT NOT NULL CHECK(rama IN ('Masculino','Femenino','Mixto')),
  periodo             TEXT NOT NULL,
  estado              TEXT NOT NULL DEFAULT 'Inscripciones abiertas' CHECK(estado IN ('Inscripciones abiertas','En juego','Finalizado')),
  cupo_equipos        INTEGER NOT NULL DEFAULT 16,
  cierre_inscripcion  TEXT,
  fecha_inicio        TEXT,
  observaciones       TEXT,
  UNIQUE (disciplina_id, rama, periodo)
);`;

module.exports = { TABLE, FIELDS, RAMAS, ESTADOS, SCHEMA };
