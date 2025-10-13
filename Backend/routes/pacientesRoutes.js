const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.post('/', pacienteController.crearPaciente);
router.get('/', pacienteController.mostrarPaciente);
router.put('/:id', pacienteController.actualizarPaciente);
router.delete('/:id', pacienteController.eliminarPaciente);

module.exports = router;