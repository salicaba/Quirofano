const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { protegerRuta, verificarRol } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Rutas para la gestión de médicos/usuarios ---

// GET -> Obtener la lista de todos los médicos (solo Admins)
router.get('/', protegerRuta, verificarRol(['Administrador']), usuarioController.obtenerTodosLosMedicos);

// POST -> Crear un nuevo médico (solo Admins)
router.post('/', protegerRuta, verificarRol(['Administrador']), usuarioController.crearMedico);

// PUT -> Actualizar la información de un médico por ID (solo Admins)
router.put('/:id', protegerRuta, verificarRol(['Administrador']), usuarioController.actualizarMedico);

// DELETE -> Eliminar un médico por ID (solo Admins)
router.delete('/:id', protegerRuta, verificarRol(['Administrador']), usuarioController.eliminarMedico);

// --- Rutas de perfil (para el usuario logueado) ---

// PUT -> Actualizar foto de perfil (cualquier usuario logueado puede cambiar la suya)
router.put(
    '/perfil/foto', 
    protegerRuta, 
    upload.single('fotoPerfil'),
    usuarioController.subirFotoPerfil
);

module.exports = router;