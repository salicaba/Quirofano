const express = require('express');
const router = express.Router();
const cirugiaController = require('../controllers/cirugiaController');

// Rutas existentes
router.get('/', cirugiaController.getCirugias);
router.get('/pendientes', cirugiaController.getCirugiasPendientes);
router.post('/', cirugiaController.crearCirugia);
router.put('/:id', cirugiaController.actualizarCirugia);
router.delete('/:id', cirugiaController.eliminarCirugia);

// Nuevas rutas para horarios - VERIFICAR QUE LOS MÉTODOS EXISTAN EN EL CONTROLADOR
router.put('/:id/asignar-horario', cirugiaController.asignarHorarioCompleto);
router.post('/generar-horarios', cirugiaController.generarHorariosAutomaticos);

module.exports = router;