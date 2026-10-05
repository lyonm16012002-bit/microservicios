// CONTROLLER: solo HTTP.
const service = require('../services/disciplina.service');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => res.json(service.listar()));
const obtener = asyncHandler(async (req, res) => res.json(service.obtener(req.params.id)));
const crear = asyncHandler(async (req, res) => res.status(201).json(service.crear(req.body || {})));
const actualizar = asyncHandler(async (req, res) => res.json(service.actualizar(req.params.id, req.body || {})));
const eliminar = asyncHandler(async (req, res) => { service.eliminar(req.params.id); res.json({ ok: true }); });

module.exports = { listar, obtener, crear, actualizar, eliminar };
