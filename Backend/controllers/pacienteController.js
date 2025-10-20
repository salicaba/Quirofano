const Paciente = require('../models/pacienteModel');

exports.crearPaciente = async (req, res) => {
  try {
    const { 
      nombre, 
      apellido, 
      sexo, 
      fecha_nacimiento, 
      tipo_sangre,
      numero_expediente,
      procedencia 
    } = req.body;

    if (!nombre || !apellido || !tipo_sangre || !numero_expediente) {
       return res.status(400).json({ 
        msg: 'Nombre, apellido, tipo de sangre y número de expediente son obligatorios' 
      });
    }

    const resultado = await Paciente.insertPacienteConExpediente(
      nombre, apellido, sexo, fecha_nacimiento, tipo_sangre, numero_expediente, procedencia
    );

    res.json({ 
      msg: 'Paciente y expediente registrados con éxito',
      paciente_id: resultado.paciente_id
    });

  } catch (error) {
    console.error('Error en controller:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

exports.mostrarPaciente = async(req, res) => {
  try {
    const pacientes = await Paciente.findPacientes();
    res.json(pacientes);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ msg: 'Error al cargar los pacientes' });
  }
};

exports.actualizarPaciente = async(req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    await Paciente.updatePaciente(id, datos);
    res.json({ msg: 'Paciente actualizado con éxito' });

  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ msg: 'Error al actualizar el paciente' });
  }
};


exports.eliminarPaciente = async(req, res) => {
  try {
    const { id } = req.params;

    const resultado = await Paciente.deletePaciente(id);
    
    if (resultado.deleted) {
      res.json({ msg: 'Paciente eliminado con éxito' });
    } else {
      res.status(404).json({ msg: 'Paciente no encontrado' });
    }

  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ msg: 'Error al eliminar el paciente' });
  }
};