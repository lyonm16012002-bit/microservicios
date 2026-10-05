// Cliente HTTP (Axios) para hablar con ms-competencia. Reenvía el JWT del usuario.
const axios = require('axios');
const { COMPETENCIA_URL } = require('../config/env');
const AppError = require('../utils/AppError');

async function obtenerTorneo(id, token) {
  try {
    const r = await axios.get(`${COMPETENCIA_URL}/torneos/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 });
    return r.data; // incluye disciplina, jugadores_min, jugadores_max, estado, cupo_equipos...
  } catch (err) {
    if (err.response && err.response.status === 404) throw new AppError(400, 'El torneo no existe');
    if (err.response) throw new AppError(502, `ms-competencia respondió con error (HTTP ${err.response.status})`);
    throw new AppError(503, 'ms-competencia no está disponible; no se pudo verificar el torneo');
  }
}

async function eliminarPartidosDeEquipo(equipoId, token) {
  try {
    await axios.delete(`${COMPETENCIA_URL}/partidos/equipo/${encodeURIComponent(equipoId)}`, { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 });
  } catch (err) {
    if (err.response) throw new AppError(502, `ms-competencia rechazó la limpieza (HTTP ${err.response.status})`);
    throw new AppError(503, 'ms-competencia no está disponible; no se eliminó el equipo para no dejar partidos huérfanos');
  }
}

module.exports = { obtenerTorneo, eliminarPartidosDeEquipo };
