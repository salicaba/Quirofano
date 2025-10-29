// horarioRoutes.js
const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horarioController');

router.post('/programar-automatico', horarioController.programarCirugiaAutomatica);
router.post('/emergencia', horarioController.programarEmergencia);
router.get('/semanal', horarioController.obtenerHorarioSemanal);

module.exports = router;