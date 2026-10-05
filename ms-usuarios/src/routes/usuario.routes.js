const express = require('express');
const controller = require('../controllers/usuario.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Toda la gestión de usuarios exige JWT válido (autenticación) y rol admin (autorización).
router.use(requireAuth, requireRole('admin'));

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
