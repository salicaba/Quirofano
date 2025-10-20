const EquipoMedico = require('../models/equipoMedicoModel');

/**
 * Crea una nueva entrada en la tabla equipo_medico.
 */
exports.crearEquipo = async (req, res) => {
  const { nombre, id_medico } = req.body;

  if (!nombre || !id_medico) {
    return res.status(400).json({ msg: 'El nombre del equipo y el ID del médico son obligatorios.' });
  }

  try {
    const nuevoEquipo = await EquipoMedico.create({ nombre, id_medico });
    res.status(201).json({ msg: 'Miembro agregado al equipo médico con éxito', equipo: nuevoEquipo });
  } catch (error) {
    console.error('Error en el controlador al crear equipo:', error);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * Obtiene los detalles de todos los miembros de un equipo por su nombre.
 */
exports.obtenerEquipoPorNombre = async (req, res) => {
  try {
    // Usamos decodeURIComponent para manejar nombres con espacios o caracteres especiales
    const nombreEquipo = decodeURIComponent(req.params.nombre); 
    const miembros = await EquipoMedico.findByName(nombreEquipo);
    
    if (miembros.length === 0) {
      return res.status(404).json({ msg: 'No se encontró un equipo con ese nombre.' });
    }
    res.json(miembros);
  } catch (error) {
    console.error('Error al obtener equipo por nombre:', error);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * Obtiene la lista de NOMBRES de equipos únicos.
 * Usa la nueva función del modelo: findAllTeamNames.
 */
exports.obtenerTodosLosEquipos = async (req, res) => {
  try {
    // Llama a la función que solo trae los nombres
    const equipos = await EquipoMedico.findAllTeamNames(); 
    // Devolvemos solo un array de strings para que sea más fácil de usar en el frontend
    res.json(equipos.map(e => e.nombre)); 
  } catch (error) {
    console.error('Error al obtener todos los equipos:', error);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * FUNCIÓN NUEVA: Obtiene todas las entradas de la tabla equipo_medico.
 * Perfecta para poblar menús desplegables que necesitan un ID y un nombre.
 */
exports.obtenerTodasLasEntradas = async (req, res) => {
    try {
        const entradas = await EquipoMedico.findAllEntries();
        res.json(entradas);
    } catch (error) {
        console.error('Error al obtener todas las entradas de equipo:', error);
        res.status(500).json({ msg: 'Error en el servidor.' });
    }
};
/**
 * Actualiza el médico asignado a una entrada específica del equipo.
 * Se identifica la entrada por su ID (id_equipomedico).
 */
exports.actualizarMiembroEquipo = async (req, res) => {
  const { id_medico } = req.body;
  
  if (!id_medico) {
    return res.status(400).json({ msg: 'El ID del nuevo médico es obligatorio.' });
  }

  try {
    const equipoActualizado = await EquipoMedico.update(req.params.id, { id_medico });
    if (!equipoActualizado) {
      return res.status(404).json({ msg: 'No se encontró la entrada del equipo médico para actualizar.' });
    }
    res.json({ msg: 'Miembro del equipo actualizado con éxito', equipo: equipoActualizado });
  } catch (error) {
    console.error('Error al actualizar miembro del equipo:', error);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * Elimina todas las entradas asociadas a un nombre de equipo.
 */
exports.eliminarEquipo = async (req, res) => {
  try {
     const nombreEquipo = decodeURIComponent(req.params.nombre);
    const filasEliminadas = await EquipoMedico.removeByName(nombreEquipo);
    if (filasEliminadas === 0) {
      return res.status(404).json({ msg: 'No se encontró un equipo con ese nombre para eliminar.' });
    }
    res.json({ msg: `Equipo "${nombreEquipo}" eliminado con éxito (${filasEliminadas} miembros removidos)` });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * Elimina una entrada específica (un miembro) de un equipo por su ID de entrada.
 */
exports.eliminarMiembroEquipo = async (req, res) => {
  try {
    const resultado = await EquipoMedico.removeMemberById(req.params.id);
    if (resultado === 0) {
      return res.status(404).json({ msg: 'No se encontró la entrada del miembro del equipo.' });
    }
    res.json({ msg: 'Miembro eliminado del equipo con éxito' });
  } catch (error) {
    console.error('Error al eliminar miembro del equipo:', error);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};