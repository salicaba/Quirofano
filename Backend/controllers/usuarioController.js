const Usuario = require('../models/usuarioModel'); // Asumo que el modelo tiene una función para actualizar

exports.subirFotoPerfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No se subió ningún archivo.' });
    }

    const fotoPath = req.file.path; // Multer nos da la ruta del archivo guardado
    const userId = req.usuario.id; // El middleware de auth nos da el ID del usuario

    // Llama a una función en el modelo para actualizar la BD
    await Usuario.updateFotoPerfil(userId, fotoPath);

    res.json({ msg: 'Foto de perfil actualizada con éxito', filePath: fotoPath });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};