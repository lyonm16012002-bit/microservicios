const express = require('express');
const controller = require('../controllers/equipo.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/estadisticas', controller.estadisticas); // antes de '/:id'
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.put('/:id', requireRole('admin'), controller.actualizar);    // solo admin edita / aprueba / rechaza
router.delete('/:id', requireRole('admin'), controller.eliminar);   // solo admin elimina

module.exports = router;
