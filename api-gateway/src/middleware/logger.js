// Registra cada solicitud que pasa por el Gateway (útil para mostrar el flujo en la demo).
function logger(req, res, next) {
  const inicio = Date.now();
  res.on('finish', () => {
    if (!req.originalUrl.startsWith('/api')) return; // no registrar archivos estáticos
    const destino = res.locals.destino ? ` -> ${res.locals.destino}` : '';
    console.log(`[gateway] ${req.method} ${req.originalUrl.split('?')[0]} ${res.statusCode} (${Date.now() - inicio} ms)${destino}`);
  });
  next();
}

module.exports = logger;
