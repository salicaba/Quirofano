const Cirugia = require('../models/cirugiaModel');

/**
 * Crea una nueva cirugía.
 */
exports.crearCirugia = async (req, res) => {
  // Validación básica basada en tu formulario y consulta INSERT
  const { id_expediente, fecha, diagnostico_pre, procedimiento, id_quirófano, id_equipomedico, estado } = req.body;

  if (!id_expediente || !fecha || !procedimiento || !id_quirófano || !id_equipomedico) {
    return res.status(400).json({ msg: 'Faltan campos obligatorios para registrar la cirugía (expediente, fecha, procedimiento, quirófano, equipo).' });
  }

  try {
    // Podrías añadir lógica aquí para verificar disponibilidad de quirófano/equipo si fuera necesario

    // Pasamos el usuario que crea (viene del middleware)
    const datosCirugia = { ...req.body, creado_por: req.usuario?.id || 'sistema' }; 
    const nuevaCirugia = await Cirugia.create(datosCirugia);
    
    // Devolvemos la cirugía recién creada
    res.status(201).json({ msg: 'Cirugía registrada con éxito', cirugia: nuevaCirugia });

  } catch (error) {
    console.error('Error en el controlador al crear cirugía:', error);
    res.status(500).json({ msg: 'Error en el servidor al registrar la cirugía.' });
  }
};

/**
 * Obtiene todas las cirugías con detalles.
 */
exports.obtenerTodasLasCirugias = async (req, res) => {
  try {
    const cirugias = await Cirugia.findAllDetailed();
    res.json(cirugias);
  } catch (error) {
    console.error('Error al obtener todas las cirugías:', error);
    res.status(500).json({ msg: 'Error en el servidor al obtener cirugías.' });
  }
};

/**
 * Obtiene una cirugía específica por ID.
 */
exports.obtenerCirugiaPorId = async (req, res) => {
    try {
        const cirugia = await Cirugia.findById(req.params.id);
        if (!cirugia) {
            return res.status(404).json({ msg: 'Cirugía no encontrada.' });
        }
        res.json(cirugia);
    } catch (error) {
        console.error(`Error al obtener cirugía ${req.params.id}:`, error);
        res.status(500).json({ msg: 'Error en el servidor.' });
    }
};

/**
 * Actualiza una cirugía existente.
 */
exports.actualizarCirugia = async (req, res) => {
  try {
    const cirugiaActualizada = await Cirugia.update(req.params.id, req.body);
    if (!cirugiaActualizada) {
      return res.status(404).json({ msg: 'Cirugía no encontrada para actualizar.' });
    }
    res.json({ msg: 'Cirugía actualizada con éxito', cirugia: cirugiaActualizada });
  } catch (error) {
    console.error('Error al actualizar cirugía:', error);
    res.status(500).json({ msg: 'Error en el servidor al actualizar la cirugía.' });
  }
};

/**
 * Elimina una cirugía.
 */
exports.eliminarCirugia = async (req, res) => {
  try {
    const resultado = await Cirugia.remove(req.params.id);
    if (resultado === 0) {
      return res.status(404).json({ msg: 'Cirugía no encontrada para eliminar.' });
    }
    res.json({ msg: 'Cirugía eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar cirugía:', error);
    res.status(500).json({ msg: 'Error en el servidor al eliminar la cirugía.' });
  }
};