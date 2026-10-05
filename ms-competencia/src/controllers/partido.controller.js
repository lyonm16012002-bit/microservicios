const service = require('../services/partido.service');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const torneoId = typeof req.query.torneo_id === 'string' ? req.query.torneo_id : undefined;
  res.json(service.listar(torneoId));
});
const obtener = asyncHandler(async (req, res) => res.json(service.obtener(req.params.id)));
const crear = asyncHandler(async (req, res) => res.status(201).json(await service.crear(req.body || {}, req.token)));
const actualizar = asyncHandler(async (req, res) => res.json(await service.actualizar(req.params.id, req.body || {}, req.token)));
const eliminar = asyncHandler(async (req, res) => { service.eliminar(req.params.id); res.json({ ok: true }); });
const eliminarPorEquipo = asyncHandler(async (req, res) => res.json({ ok: true, ...service.eliminarPorEquipo(Number(req.params.equipoId)) }));

module.exports = { listar, obtener, crear, actualizar, eliminar, eliminarPorEquipo };
