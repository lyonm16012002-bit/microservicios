// Express 4 no captura errores de funciones async; este envoltorio los manda a next(err).
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
