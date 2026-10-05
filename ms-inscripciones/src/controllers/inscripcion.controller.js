const service = require('../services/inscripcion.service');
const asyncHandler = require('../utils/asyncHandler');

const inscribir = asyncHandler(async (req, res) => {
  res.status(201).json(await service.inscribir(req.body || {}, req.user, req.token));
});

module.exports = { inscribir };
