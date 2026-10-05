// ROUTES: conecta cada URL con su controller y decide qué middleware de seguridad aplica.
const express = require('express');
const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', controller.login);            // público: aquí se obtiene el JWT
router.post('/registro', controller.registro);      // público: crea una cuenta de DELEGADO (nunca admin)
router.get('/me', requireAuth, controller.perfil);  // protegido: requiere JWT válido

module.exports = router;
