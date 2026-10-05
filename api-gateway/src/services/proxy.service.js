// SERVICE del Gateway: reenvía la solicitud al microservicio destino usando Axios.
const axios = require('axios');
const servicios = require('../config/services');
const AppError = require('../utils/AppError');

async function reenviar(clave, req) {
  const destino = servicios[clave];
  const ruta = req.originalUrl.replace(/^\/api/, ''); // /api/clientes/CL0001 -> /clientes/CL0001
  const conCuerpo = ['POST', 'PUT', 'PATCH'].includes(req.method);

  try {
    const respuesta = await axios({
      method: req.method,
      baseURL: destino.url,
      url: ruta,
      data: conCuerpo ? req.body : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}) // se reenvía el JWT
      },
      timeout: 8000,
      validateStatus: () => true // los errores del microservicio (400, 403, 404...) se devuelven tal cual
    });
    return { status: respuesta.status, data: respuesta.data, destino: destino.nombre };
  } catch (err) {
    if (err.code === 'ECONNABORTED') throw new AppError(504, `${destino.nombre} tardó demasiado en responder`);
    throw new AppError(503, `${destino.nombre} no está disponible en este momento`);
  }
}

module.exports = { reenviar };
