const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
// Se importa solo la función necesaria
const { protegerRuta } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware');

router.put(
    '/perfil/foto', 
    protegerRuta, // <- Ya no da error
    upload.single('fotoPerfil'),
    usuarioController.subirFotoPerfil
);

module.exports = router;