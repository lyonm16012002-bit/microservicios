// SERVICE del Gateway: el resumen mezcla datos de varios microservicios, así que el Gateway
// los consulta en paralelo y arma una sola respuesta (patrón "API composition").
const axios = require('axios');
const servicios = require('../config/services');
const AppError = require('../utils/AppError');

async function consultar(clave, ruta, token) {
  const { nombre, url } = servicios[clave];
  try {
    const r = await axios.get(url + ruta, { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 });
    return r.data;
  } catch (err) {
    throw new AppError(503, `No se pudo armar el resumen: falló ${nombre}`);
  }
}

async function resumen(token) {
  const [competencia, inscripciones] = await Promise.all([
    consultar('competencia', '/torneos/estadisticas', token),
    consultar('inscripciones', '/equipos/estadisticas', token)
  ]);
  return { ...competencia, ...inscripciones };
}

module.exports = { resumen };
