const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { cedula, password } = req.body;

  try {
    const user = await Usuario.findByCedula(cedula);
    console.log('2. Resultado de la búsqueda en BD:', user);

    if (!user || !user.password) {
      return res.status(401).json({ msg: 'Cédula o contraseña incorrectas' });
    }

    const passCorrecto = await bcrypt.compare(password, user.password);
    console.log('3. ¿Contraseña correcta?:', passCorrecto);

    if (!passCorrecto) {
      return res.status(401).json({ msg: 'Cédula o contraseña incorrectas' });
    }
    
    const payload = {
      usuario: {
        id: user.id_medicos,
        role: user.rol_nombre
      }
    };
    console.log('4. Payload para el token creado:', payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    console.log('5. Token generado con éxito.');
    
    res.status(200).json({ token });
    console.log('✅ Respuesta 200 OK enviada al frontend.');

  } catch (error) {
    console.error('💥 ERROR INESPERADO EN EL LOGIN:', error);
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

    res.status(500).json({ msg: 'Error en el servidor' });
  }
};