// Cliente HTTP (Axios) para consultar a ms-inscripciones. Reenvía el JWT del usuario original,
// así ms-inscripciones también valida la sesión (los servicios no confían ciegamente entre sí).
const axios = require('axios');
const { INSCRIPCIONES_URL } = require('../config/env');
const AppError = require('../utils/AppError');

async function pedir(ruta, token) {
  try {
    const r = await axios.get(INSCRIPCIONES_URL + ruta, { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 });
    return r.data;
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    if (err.response) throw new AppError(502, `ms-inscripciones respondió con error (HTTP ${err.response.status})`);
    throw new AppError(503, 'ms-inscripciones no está disponible en este momento');
  }
}

const obtenerEquipo = (id, token) => pedir(`/equipos/${encodeURIComponent(id)}`, token);
const equiposAprobadosDeTorneo = (torneoId, token) => pedir(`/equipos?torneo_id=${encodeURIComponent(torneoId)}&estado=Aprobada`, token);
const equiposDeTorneo = (torneoId, token) => pedir(`/equipos?torneo_id=${encodeURIComponent(torneoId)}`, token);

module.exports = { obtenerEquipo, equiposAprobadosDeTorneo, equiposDeTorneo };
