/**
 * Inserta datos FICTICIOS para la demostración (torneos, equipos, jugadores y partidos).
 * No uses datos reales de estudiantes (documento, EPS) en clases ni en GitHub.
 * Uso:  npm run demo:datos     (con los servicios detenidos)
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const rutas = require('./rutas-db');

function abrir(ruta, esquemas) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const db = new Database(ruta);
  db.pragma('foreign_keys = ON');
  esquemas.forEach((s) => db.exec(s));
  return db;
}
const M = (svc, file) => require(path.join('..', svc, 'src', 'models', file));

const comp = abrir(rutas.competencia, [M('ms-competencia', 'disciplina.model').SCHEMA, M('ms-competencia', 'torneo.model').SCHEMA, M('ms-competencia', 'partido.model').SCHEMA]);
const insc = abrir(rutas.inscripciones, [M('ms-inscripciones', 'equipo.model').SCHEMA, M('ms-inscripciones', 'jugador.model').SCHEMA]);

if (comp.prepare('SELECT COUNT(*) c FROM torneos').get().c > 0) { console.log('Ya existen torneos. No se insertó nada.'); process.exit(0); }

// Disciplinas (las mismas que crea ms-competencia al arrancar)
const { SEED } = M('ms-competencia', 'disciplina.model');
if (comp.prepare('SELECT COUNT(*) c FROM disciplinas').get().c === 0) {
  const ins = comp.prepare('INSERT INTO disciplinas (nombre, tipo_marcador, jugadores_min, jugadores_max, descripcion) VALUES (?,?,?,?,?)');
  SEED.forEach((d) => ins.run(d.nombre, d.tipo_marcador, d.jugadores_min, d.jugadores_max, d.descripcion));
}
const disc = (n) => comp.prepare('SELECT * FROM disciplinas WHERE nombre = ?').get(n);

const hoy = new Date();
const dia = (delta) => new Date(hoy.getTime() + delta * 86400000).toISOString().slice(0, 10);
const nuevoTorneo = (nombre, d, rama, estado) => comp.prepare('INSERT INTO torneos (nombre, disciplina_id, rama, periodo, estado, cupo_equipos, cierre_inscripcion) VALUES (?,?,?,?,?,?,?)')
  .run(nombre, disc(d).id, rama, '2026-2', estado, 8, dia(10)).lastInsertRowid;

const NOMBRES = ['Andrés', 'Camila', 'Sebastián', 'Valentina', 'Mateo', 'Sofía', 'Daniel', 'Laura', 'Santiago', 'Isabella', 'Felipe', 'Mariana'];
const APELLIDOS = ['Gómez', 'Ruiz', 'Torres', 'Mejía', 'Castro', 'Ríos', 'Vélez', 'Londoño', 'Giraldo', 'Zapata'];
const CARRERAS = [['Ingeniería de Sistemas', 'Ciencias e Ingeniería'], ['Medicina', 'Ciencias de la Salud'], ['Derecho', 'Ciencias Jurídicas'], ['Contaduría Pública', 'Ciencias Contables, Económicas y Administrativas'], ['Psicología', 'Ciencias Sociales y Humanas']];
const EPS = ['Sura EPS', 'Sanitas EPS', 'Nueva EPS', 'Salud Total', 'Coosalud'];
let docSeq = 9000000;

function equipo(torneoId, nombre, facultad, nJug, estado) {
  const id = insc.prepare('INSERT INTO equipos (torneo_id, nombre, facultad, telefono_contacto, correo_contacto, estado, delegado) VALUES (?,?,?,?,?,?,?)')
    .run(torneoId, nombre, facultad, '3000000000', 'delegado@ejemplo.com', estado, 'delegado').lastInsertRowid;
  const j = insc.prepare('INSERT INTO jugadores (equipo_id, torneo_id, documento, nombre, apellido, carrera, facultad, semestre, eps, dorsal, posicion, delegado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  for (let i = 0; i < nJug; i++) {
    const [carrera, fac] = CARRERAS[(id + i) % CARRERAS.length];
    j.run(id, torneoId, String(++docSeq), NOMBRES[(id + i) % NOMBRES.length], APELLIDOS[(id * 3 + i) % APELLIDOS.length], carrera, fac, 1 + ((id + i) % 10), EPS[(id + i) % EPS.length], i + 1, i === 0 ? 'Portero' : 'Jugador', 'delegado');
  }
  return id;
}
const partido = (t, l, v, jornada, d, hora, lugar, estado, ml, mv) =>
  comp.prepare('INSERT INTO partidos (torneo_id, jornada, equipo_local_id, equipo_visitante_id, fecha, hora, lugar, estado, marcador_local, marcador_visitante) VALUES (?,?,?,?,?,?,?,?,?,?)').run(t, jornada, l, v, d, hora, lugar, estado, ml ?? null, mv ?? null);

// --- Futsal masculino (en juego) ---
const tf = nuevoTorneo('Futsal Masculino 2026-2', 'Futsal', 'Masculino', 'En juego');
const f = [equipo(tf, 'Ingeniería FC', 'Ciencias e Ingeniería', 7, 'Aprobada'), equipo(tf, 'Medicina United', 'Ciencias de la Salud', 8, 'Aprobada'),
           equipo(tf, 'Derecho FC', 'Ciencias Jurídicas', 6, 'Aprobada'), equipo(tf, 'Contaduría FC', 'Ciencias Contables, Económicas y Administrativas', 6, 'Aprobada'),
           equipo(tf, 'Psicología FC', 'Ciencias Sociales y Humanas', 3, 'Pendiente')];
partido(tf, f[0], f[1], 1, dia(-6), '10:00', 'Coliseo', 'Jugado', 3, 1);
partido(tf, f[2], f[3], 1, dia(-6), '12:00', 'Coliseo', 'Jugado', 2, 2);
partido(tf, f[0], f[2], 2, dia(-3), '10:00', 'Coliseo', 'Jugado', 4, 0);
partido(tf, f[1], f[3], 2, dia(-3), '12:00', 'Coliseo', 'Jugado', 1, 0);
partido(tf, f[0], f[3], 3, dia(2), '10:00', 'Coliseo', 'Programado');
partido(tf, f[1], f[2], 3, dia(2), '12:00', 'Coliseo', 'Programado');

// --- Voleibol femenino (en juego) ---
const tv = nuevoTorneo('Voleibol Femenino 2026-2', 'Voleibol', 'Femenino', 'En juego');
const v = [equipo(tv, 'Salud Volley', 'Ciencias de la Salud', 7, 'Aprobada'), equipo(tv, 'Sistemas Volley', 'Ciencias e Ingeniería', 6, 'Aprobada'), equipo(tv, 'Derecho Volley', 'Ciencias Jurídicas', 8, 'Aprobada')];
partido(tv, v[0], v[1], 1, dia(-5), '16:00', 'Coliseo', 'Jugado', 3, 2);
partido(tv, v[2], v[0], 2, dia(-2), '16:00', 'Coliseo', 'Jugado', 1, 3);
partido(tv, v[1], v[2], 3, dia(3), '16:00', 'Coliseo', 'Programado');

// --- Baloncesto mixto (inscripciones abiertas) ---
const tb = nuevoTorneo('Baloncesto Mixto 2026-2', 'Baloncesto', 'Mixto', 'Inscripciones abiertas');
equipo(tb, 'Contaduría Hoops', 'Ciencias Contables, Económicas y Administrativas', 6, 'Pendiente');
equipo(tb, 'Sistemas Hoops', 'Ciencias e Ingeniería', 5, 'Aprobada');

console.log('Datos de demo insertados: 3 torneos (Futsal, Voleibol, Baloncesto), 10 equipos, jugadores ficticios y partidos.');
