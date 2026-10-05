const service = require('../services/jugador.service');
const asyncHandler = require('../utils/asyncHandler');

const str = (v) => (typeof v === 'string' && v !== '' ? v : undefined);

const listar = asyncHandler(async (req, res) => {
  res.json(service.listar({ equipo_id: str(req.query.equipo_id), torneo_id: str(req.query.torneo_id) }, req.user));
});
const obtener = asyncHandler(async (req, res) => res.json(service.obtener(req.params.id, req.user)));
const crear = asyncHandler(async (req, res) => res.status(201).json(await service.crear(req.body || {}, req.user, req.token)));
const actualizar = asyncHandler(async (req, res) => res.json(service.actualizar(req.params.id, req.body || {})));
const eliminar = asyncHandler(async (req, res) => { service.eliminar(req.params.id); res.json({ ok: true }); });

module.exports = { listar, obtener, crear, actualizar, eliminar };
