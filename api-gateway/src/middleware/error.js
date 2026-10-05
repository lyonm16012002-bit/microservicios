const AppError = require('../utils/AppError');

function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

// Middleware final: convierte cualquier error en una respuesta JSON coherente.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido en el cuerpo de la solicitud' });
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
  if (err.code && String(err.code).startsWith('SQLITE_CONSTRAINT')) {
    return res.status(409).json({ error: 'El dato entra en conflicto con una restricción de la base de datos' });
  }
  if (err.message && err.message.includes('SQLite3 can only bind')) {
    return res.status(400).json({ error: 'Alguno de los campos tiene un tipo de dato inválido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { notFound, errorHandler };
