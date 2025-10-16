const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { protegerRuta } = require('../middleware/authMiddleware');


router.get('/', protegerRuta, rolesController.ObtenerRol);

module.exports = router;