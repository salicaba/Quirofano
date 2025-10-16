const Especialidad = require('../models/especilidadesModel');

exports.obtenerEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.getAll();

    //console.log('MEPP');
    //console.log('Resultado:', especialidades);

    res.json(especialidades);

  } catch (error) {
    //console.error('LAVM', error);
    res.status(500).json({ msg: 'Error al obtener especialidades' });
  }
};
