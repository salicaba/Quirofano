const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidadController');
const { protegerRuta } = require('../middleware/authMiddleware');

// Se añade 'protegerRuta' para asegurar que solo usuarios logueados puedan acceder
router.get('/', protegerRuta, especialidadController.obtenerEspecialidades);

module.exports = router;