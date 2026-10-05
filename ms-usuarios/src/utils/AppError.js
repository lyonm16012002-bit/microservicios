// Error "esperado" con código HTTP. Lo lanzan los services y lo traduce el middleware de errores.
class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = AppError;
