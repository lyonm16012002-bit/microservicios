// Rutas de las bases de datos de cada microservicio (las mismas que usan los servicios por defecto).
const path = require('path');
const raiz = path.join(__dirname, '..');

module.exports = {
  usuarios: path.join(raiz, 'ms-usuarios', 'data', 'usuarios.db'),
  competencia: path.join(raiz, 'ms-competencia', 'data', 'competencia.db'),
  inscripciones: path.join(raiz, 'ms-inscripciones', 'data', 'inscripciones.db')
};
