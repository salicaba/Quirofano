const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

exports.login = async (req, res) => {
  const { cedula, password } = req.body;

  try {
    const user = await Usuario.findByCedula(cedula);
    
    if (!user) {
      return res.status(401).json({ msg: 'Cédula o contraseña incorrectas' });      
    }

    const passCorrecto = await bcrypt.compare(password, user.password);

    if (!passCorrecto) {
      return res.status(401).json({ msg: 'Cédula o contraseña incorrectas' });
    }

    
    const payload = {
      usuario: {
        id: user.id_rol,
        role: user.rol_nombre 
      }
    };

    // Firma el token con tu palabra secreta y establece una expiración
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
      (error, token) => {
        if (error) throw error;
        
     
        res.status(200).json({ token });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

exports.obtenerPerfil = async (req, res) => {
  try {
    
    const user = await Usuario.findById(req.usuario.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};