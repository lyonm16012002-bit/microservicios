const service = require('../services/torneo.service');
const posiciones = require('../services/posiciones.service');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => res.json(service.listar()));
const obtener = asyncHandler(async (req, res) => res.json(service.obtener(req.params.id)));
const crear = asyncHandler(async (req, res) => res.status(201).json(service.crear(req.body || {})));
const actualizar = asyncHandler(async (req, res) => res.json(service.actualizar(req.params.id, req.body || {})));
const estadisticas = asyncHandler(async (req, res) => res.json(service.estadisticas()));
const tabla = asyncHandler(async (req, res) => res.json(await posiciones.calcular(req.params.id, req.token)));

const eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(req.params.id, req.token);
  res.json({ ok: true });
});

module.exports = { listar, obtener, crear, actualizar, eliminar, estadisticas, tabla };
