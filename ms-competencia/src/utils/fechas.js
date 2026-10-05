const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const esFecha = (v) => typeof v === 'string' && REGEX_FECHA.test(v) && !Number.isNaN(Date.parse(v));
const esHora = (v) => typeof v === 'string' && REGEX_HORA.test(v);

const dos = (n) => String(n).padStart(2, '0');
function hoyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

module.exports = { esFecha, esHora, hoyLocal };
