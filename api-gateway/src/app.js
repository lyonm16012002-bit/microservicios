const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/env');
const logger = require('./middleware/logger');
const apiRoutes = require('./routes/api.routes');
const { errorHandler } = require('./middleware/error');

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/health', (req, res) => res.json({ ok: true, servicio: 'api-gateway' }));

app.use('/api', apiRoutes);

// El Gateway también sirve el panel de administración (front-end)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[api-gateway] escuchando en http://localhost:${PORT}`);
    console.log(`[api-gateway] Panel de la liga: http://localhost:${PORT}/index.html`);
  });
}

module.exports = app;
