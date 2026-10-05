const express = require('express');
const { PORT } = require('./config/env');
require('./config/database');
const seedDisciplinas = require('./config/seed');
const disciplinaRoutes = require('./routes/disciplina.routes');
const torneoRoutes = require('./routes/torneo.routes');
const partidoRoutes = require('./routes/partido.routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true, servicio: 'ms-competencia' }));
app.use('/disciplinas', disciplinaRoutes);
app.use('/torneos', torneoRoutes);
app.use('/partidos', partidoRoutes);

app.use(notFound);
app.use(errorHandler);

seedDisciplinas();

if (require.main === module) {
  app.listen(PORT, () => console.log(`[ms-competencia] escuchando en http://localhost:${PORT}`));
}

module.exports = app;
