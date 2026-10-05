const express = require('express');
const controller = require('../controllers/partido.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', requireRole('admin'), controller.crear);          // solo el admin programa partidos y registra resultados
router.put('/:id', requireRole('admin'), controller.actualizar);
router.delete('/equipo/:equipoId', requireRole('admin'), controller.eliminarPorEquipo); // uso interno (ms-inscripciones)
router.delete('/:id', requireRole('admin'), controller.eliminar);

module.exports = router;
