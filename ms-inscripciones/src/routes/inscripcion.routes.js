const express = require('express');
const controller = require('../controllers/inscripcion.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Formulario de inscripción: cualquier usuario autenticado (admin o delegado) puede inscribir un equipo.
router.post('/', requireAuth, controller.inscribir);

module.exports = router;
