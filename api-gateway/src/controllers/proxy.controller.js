// CONTROLLER del Gateway: crea un manejador que reenvía la solicitud al microservicio indicado.
const proxyService = require('../services/proxy.service');
const asyncHandler = require('../utils/asyncHandler');

function proxyA(clave) {
  return asyncHandler(async (req, res) => {
    const { status, data, destino } = await proxyService.reenviar(clave, req);
    res.locals.destino = destino;
    if (data !== null && typeof data === 'object') return res.status(status).json(data);
    return res.status(status).send(data);
  });
}

module.exports = { proxyA };
