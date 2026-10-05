const express = require('express');
const controller = require('../controllers/torneo.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/estadisticas', controller.estadisticas); // estas dos antes de '/:id'
router.get('/', controller.listar);
router.get('/:id/posiciones', controller.tabla);       // tabla de posiciones: cualquier usuario autenticado
router.get('/:id', controller.obtener);
router.post('/', requireRole('admin'), controller.crear);
router.put('/:id', requireRole('admin'), controller.actualizar);
router.delete('/:id', requireRole('admin'), controller.eliminar);

module.exports = router;
