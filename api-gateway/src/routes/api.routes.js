// ROUTES del Gateway: tabla de enrutamiento URL pública -> microservicio.
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { proxyA } = require('../controllers/proxy.controller');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

// ---- Rutas PÚBLICAS: login (aquí ms-usuarios emite el JWT) y registro de delegados ----
router.post('/auth/login', proxyA('usuarios'));
router.post('/auth/registro', proxyA('usuarios'));

// ---- Desde aquí TODO exige un JWT válido; si no, el Gateway responde 401 ----
router.use(requireAuth);

router.get('/dashboard', dashboardController.resumen);

router.use('/auth', proxyA('usuarios'));              // /api/auth/me
router.use('/usuarios', proxyA('usuarios'));          // gestión de usuarios (solo admin, lo decide ms-usuarios)

router.use('/disciplinas', proxyA('competencia'));    // deportes y sus reglas
router.use('/torneos', proxyA('competencia'));        // torneos y tabla de posiciones
router.use('/partidos', proxyA('competencia'));       // calendario y resultados

router.use('/inscripciones', proxyA('inscripciones')); // formulario de inscripción (equipo + jugadores)
router.use('/equipos', proxyA('inscripciones'));
router.use('/jugadores', proxyA('inscripciones'));

router.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

module.exports = router;
