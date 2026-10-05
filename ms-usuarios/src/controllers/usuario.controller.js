const usuarioService = require('../services/usuario.service');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  res.json(usuarioService.listar());
});

const obtener = asyncHandler(async (req, res) => {
  res.json(usuarioService.obtener(req.params.id));
});

const actualizar = asyncHandler(async (req, res) => {
  res.json(usuarioService.actualizar(req.params.id, req.body || {}));
});

const crear = asyncHandler(async (req, res) => {
  res.status(201).json(usuarioService.crear(req.body || {}));
});

const eliminar = asyncHandler(async (req, res) => {
  usuarioService.eliminar(req.params.id, req.user);
  res.json({ ok: true });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
