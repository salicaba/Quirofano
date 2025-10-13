const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Se importan ambas funciones del middleware
const { protegerRuta, verificarRol } = require('../middleware/authMiddleware');

router.post('/login', authController.login);

// Corregimos 'Especialista' a 'Espacialista' para que coincida con tus datos
router.get('/me', protegerRuta, verificarRol(['Admin', 'Espacialista']), authController.obtenerPerfil);
module.exports = router;