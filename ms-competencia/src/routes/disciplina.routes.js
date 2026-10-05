const express = require('express');
const controller = require('../controllers/disciplina.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth); // todo requiere JWT válido

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', requireRole('admin'), controller.crear);        // solo admin crea, edita y elimina
router.put('/:id', requireRole('admin'), controller.actualizar);
router.delete('/:id', requireRole('admin'), controller.eliminar);

module.exports = router;
