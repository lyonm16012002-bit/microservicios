const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * El Gateway VALIDA el JWT antes de dejar pasar cualquier solicitud hacia los microservicios.
 * Si no hay token, la firma no coincide o expiró -> 401 y la petición ni siquiera llega al servicio.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado: falta el token JWT' });

  try {
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.token = token;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(401).json({ error: msg });
  }
}

module.exports = { requireAuth };
