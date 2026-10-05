require('./env'); // carga .env antes de leer las URLs

// Directorio de microservicios: a dónde reenviar cada grupo de rutas.
module.exports = {
  usuarios:      { nombre: 'ms-usuarios',      url: process.env.USUARIOS_URL      || 'http://localhost:3001' },
  competencia:   { nombre: 'ms-competencia',   url: process.env.COMPETENCIA_URL   || 'http://localhost:3002' },
  inscripciones: { nombre: 'ms-inscripciones', url: process.env.INSCRIPCIONES_URL || 'http://localhost:3003' }
};
