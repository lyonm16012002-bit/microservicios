const express = require('express');
const controller = require('../controllers/jugador.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);                                   // el delegado agrega jugadores a SU equipo
router.put('/:id', requireRole('admin'), controller.actualizar);       // solo admin edita
router.delete('/:id', requireRole('admin'), controller.eliminar);      // solo admin elimina

module.exports = router;
