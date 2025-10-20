const express = require('express');
const router = express.Router();
const quirofanoController = require('../controllers/quirofanoController');

router.get('/', quirofanoController.mostrarquirofano);
router.post('/', quirofanoController.nuevoquirofano);
router.put('/:sala', quirofanoController.actualizarquirofano);
router.delete('/:sala', quirofanoController.eliminarquirofano);

module.exports = router;