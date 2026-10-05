// CONTROLLER: solo HTTP.
const service = require('../services/equipo.service');
const asyncHandler = require('../utils/asyncHandler');

const str = (v) => (typeof v === 'string' && v !== '' ? v : undefined);

const listar = asyncHandler(async (req, res) => {
  res.json(service.listar({ torneo_id: str(req.query.torneo_id), estado: str(req.query.estado) }, req.user));
});
const obtener = asyncHandler(async (req, res) => res.json(service.obtener(req.params.id, req.user)));
const actualizar = asyncHandler(async (req, res) => res.json(await service.actualizar(req.params.id, req.body || {}, req.token)));
const estadisticas = asyncHandler(async (req, res) => res.json(service.estadisticas()));

const eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(req.params.id, req.token);
  res.json({ ok: true });
});

module.exports = { listar, obtener, actualizar, eliminar, estadisticas };
