const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const protegerConRol = require('../middleware/authMiddleware');

// Esta ruta solo será accesible para usuarios con un token válido
// cuyo rol sea 'Admin'.
router.get('/', protegerConRol(['Admin']), reportesController.obtenerReportes);

// Esta ruta podría ser para especialistas y administradores
// router.get('/vista_general', protegerConRol(['Admin', 'Especialista']), reportesController.obtenerVistaGeneral);

module.exports = router;