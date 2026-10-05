const express = require('express');
const { PORT } = require('./config/env');
require('./config/database');
const seedUsers = require('./config/seed');
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true, servicio: 'ms-usuarios' }));
app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);

app.use(notFound);
app.use(errorHandler);

seedUsers();

if (require.main === module) {
  app.listen(PORT, () => console.log(`[ms-usuarios] escuchando en http://localhost:${PORT}`));
}

module.exports = app;
