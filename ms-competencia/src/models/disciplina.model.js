// MODEL: una disciplina es un deporte con sus reglas: cómo se cuenta el marcador y cuántos jugadores admite un equipo.
const TABLE = 'disciplinas';
const FIELDS = ['nombre', 'tipo_marcador', 'jugadores_min', 'jugadores_max', 'descripcion'];
const TIPOS = ['goles', 'puntos', 'sets']; // goles: fútbol/futsal/balonmano · puntos: baloncesto · sets: voleibol

const SCHEMA = `
CREATE TABLE IF NOT EXISTS disciplinas (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre         TEXT NOT NULL UNIQUE,
  tipo_marcador  TEXT NOT NULL CHECK(tipo_marcador IN ('goles','puntos','sets')),
  jugadores_min  INTEGER NOT NULL,
  jugadores_max  INTEGER NOT NULL,
  descripcion    TEXT
);`;

// Disciplinas que se crean la primera vez (el administrador puede editarlas o agregar más).
const SEED = [
  { nombre: 'Futsal',    tipo_marcador: 'goles',   jugadores_min: 5,  jugadores_max: 12, descripcion: 'Fútbol sala. Se juega con 5 jugadores por equipo en cancha.' },
  { nombre: 'Fútbol',    tipo_marcador: 'goles',   jugadores_min: 11, jugadores_max: 22, descripcion: 'Fútbol 11. Se juega con 11 jugadores por equipo en cancha.' },
  { nombre: 'Baloncesto', tipo_marcador: 'puntos', jugadores_min: 5,  jugadores_max: 12, descripcion: 'Baloncesto. Se juega con 5 jugadores por equipo en cancha; no hay empates.' },
  { nombre: 'Voleibol',  tipo_marcador: 'sets',    jugadores_min: 6,  jugadores_max: 12, descripcion: 'Voleibol. El marcador se cuenta en sets (mejor de 5, gana quien llega a 3).' },
  { nombre: 'Balonmano', tipo_marcador: 'goles',   jugadores_min: 7,  jugadores_max: 14, descripcion: 'Balonmano. Se juega con 7 jugadores por equipo en cancha.' }
];

module.exports = { TABLE, FIELDS, TIPOS, SCHEMA, SEED };
