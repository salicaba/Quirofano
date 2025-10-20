const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const pool = require('../config/db'); 

exports.crearMedico = async (req, res) => {
  const { nombre, apellido_paterno, cedula_profecional, id_rol, id_especialidad, password } = req.body;

  if (!nombre || !apellido_paterno || !cedula_profecional || !id_rol || !id_especialidad || !password) {
    return res.status(400).json({ msg: 'Todos los campos obligatorios deben ser completados.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const medicoData = { ...req.body, password: passwordHash };

    const nuevoMedicoBasico = await Usuario.create(medicoData);
    const nuevoMedicoCompleto = await Usuario.findById(nuevoMedicoBasico.id_medicos);

    res.status(201).json({ msg: 'Médico registrado con éxito', medico: nuevoMedicoCompleto });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ msg: 'La cédula profesional ya está registrada.' });
    }
    console.error('Error al crear médico:', error);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

exports.obtenerTodosLosMedicos = async (req, res) => {
  try {
    const medicos = await Usuario.findAll();
    res.json(medicos);
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};


exports.actualizarMedico = async (req, res) => {
  try {
    const medicoActualizado = await Usuario.update(req.params.id, req.body);
    if (!medicoActualizado) {
      return res.status(404).json({ msg: 'Médico no encontrado.' });
    }
    const medicoCompleto = await Usuario.findById(req.params.id);
    res.json({ msg: 'Médico actualizado con éxito', medico: medicoCompleto });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ msg: 'La cédula profesional ya pertenece a otro médico.' });
    }
    console.error('Error al actualizar médico:', error);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};


exports.eliminarMedico = async (req, res) => {
  try {
    const resultado = await Usuario.remove(req.params.id);
    if (resultado === 0) {
      return res.status(404).json({ msg: 'Médico no encontrado.' });
    }
    res.json({ msg: 'Médico eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar médico:', error);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};


exports.subirFotoPerfil = async (req, res) => {
    try {
        if (!req.file) {
          return res.status(400).json({ msg: 'No se subió ningún archivo.' });
        }
        const fotoPath = req.file.path;
        const userId = req.usuario.id;

        await Usuario.updateFotoPerfil(userId, fotoPath);
        
        res.json({ msg: 'Foto de perfil actualizada con éxito', filePath: fotoPath });

      } catch (error) {
        console.error('Error al subir foto de perfil:', error);
        res.status(500).json({ msg: 'Error en el servidor' });
      }
};

exports.obtenerEspecialistas = async (req, res) => {
  try {
    const especialistas = await Usuario.findEspecialistas();
    res.json(especialistas);
  } catch (error) {
    console.error('Error al obtener especialistas:', error);
    res.status(500).json({ msg: 'Error al cargar los especialistas' });
  }

};