// Validación y normalización de los datos de un jugador (se usa en el formulario de inscripción y al agregar jugadores).
const AppError = require('./AppError');

const REGEX_DOC = /^[A-Z0-9.-]{5,20}$/;
const REGEX_NOMBRE = /^[\p{L}\s'.-]{2,60}$/u;
const REGEX_TEL = /^[0-9+()\s-]{7,20}$/;

const texto = (v) => (v === undefined || v === null ? '' : String(v).trim());
const entero = (v) => (v === '' || v === undefined || v === null ? null : Number(v));

function validarJugador(j = {}, etiqueta = 'Jugador') {
  const e = (msg) => new AppError(400, `${etiqueta}: ${msg}`);
  const d = {
    documento: texto(j.documento).toUpperCase(),
    nombre: texto(j.nombre),
    apellido: texto(j.apellido),
    carrera: texto(j.carrera),
    facultad: texto(j.facultad),
    eps: texto(j.eps),
    semestre: entero(j.semestre),
    dorsal: entero(j.dorsal),
    posicion: texto(j.posicion) || null,
    telefono: texto(j.telefono) || null
  };

  if (!REGEX_DOC.test(d.documento)) throw e('el documento es requerido (5 a 20 caracteres, solo letras, números, punto o guion)');
  if (!REGEX_NOMBRE.test(d.nombre)) throw e('el nombre es requerido (solo letras)');
  if (!REGEX_NOMBRE.test(d.apellido)) throw e('el apellido es requerido (solo letras)');
  if (d.carrera.length < 2 || d.carrera.length > 80) throw e('la carrera es requerida');
  if (d.facultad.length < 2 || d.facultad.length > 80) throw e('la facultad es requerida');
  if (d.eps.length < 2 || d.eps.length > 60) throw e('la EPS es requerida');
  if (d.semestre !== null && (!Number.isInteger(d.semestre) || d.semestre < 1 || d.semestre > 14)) throw e('el semestre debe ser un número entre 1 y 14');
  if (d.dorsal !== null && (!Number.isInteger(d.dorsal) || d.dorsal < 0 || d.dorsal > 99)) throw e('el dorsal debe ser un número entre 0 y 99');
  if (d.posicion && d.posicion.length > 30) throw e('la posición no puede superar 30 caracteres');
  if (d.telefono && !REGEX_TEL.test(d.telefono)) throw e('el teléfono no es válido');
  return d;
}

module.exports = { validarJugador };
