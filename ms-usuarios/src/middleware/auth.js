const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * AUTENTICACIÓN: ¿quién eres? Verifica que la solicitud traiga un JWT válido
 * (firma correcta y no expirado). Si es válido, deja los datos en req.user.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado: falta el token JWT' });

  try {
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }); // { sub, username, role, iat, exp }
    req.token = token; // se conserva para reenviarlo a otros microservicios
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(401).json({ error: msg });
  }
}

/**
 * AUTORIZACIÓN: ¿qué puedes hacer? Deja pasar solo si el rol del token está permitido.
 * Debe usarse DESPUÉS de requireAuth.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Acción no permitida para tu rol (se requiere: ${roles.join(' o ')})` });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
