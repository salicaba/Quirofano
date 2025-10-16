const Rol = require('../models/rolesModel');


exports.ObtenerRol = async (req, res) => {
  try {

    const roles = await Rol.getAll();


    res.json(roles);
    //console.log('Resultado de la búsqueda de roles en BD:', roles);
  } catch (error) {

    //console.error('Error en el controlador al obtener roles:', error);
    res.status(500).json({ msg: 'Error en el servidor, por favor contacta al administrador.' });
  }
};