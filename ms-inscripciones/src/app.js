const express = require('express');
const { PORT } = require('./config/env');
require('./config/database');
const inscripcionRoutes = require('./routes/inscripcion.routes');
const equipoRoutes = require('./routes/equipo.routes');
const jugadorRoutes = require('./routes/jugador.routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ ok: true, servicio: 'ms-inscripciones' }));
app.use('/inscripciones', inscripcionRoutes);
app.use('/equipos', equipoRoutes);
app.use('/jugadores', jugadorRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => console.log(`[ms-inscripciones] escuchando en http://localhost:${PORT}`));
}

module.exports = app;
