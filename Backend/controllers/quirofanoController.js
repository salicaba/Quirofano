const Quirofano = require('../models/quirofanoModel');

exports.mostrarquirofano = async (req, res) => {
    try{ 
        const quirofano = await Quirofano.allquirofanos();
        res.json(quirofano) ;
    }catch (error) {
    console.error('Error al obtener quirofano:', error);
    res.status(500).json({ msg: 'Error al cargar los quirofanos' });
    }
}

exports.nuevoquirofano = async (req, res) => {
    const { sala, estado } = req.body;
    
    try {
        // ✅ PRIMERO validar, LUEGO ejecutar
        if(!sala || !estado){
            return res.status(400).json({ 
                msg: 'El nombre de la sala y su estado son obligatorios' 
            });
        }

        // ✅ Solo UNA llamada a la función
        const resultado = await Quirofano.newquirofano(sala, estado);

        res.json({ 
            msg: 'Quirófano registrado con éxito',
            sala: resultado.sala
        });
    }
    catch (error) {
        console.error('Error en controller:', error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
}

exports.eliminarquirofano = async(req, res) => {
    try{
        const resultado = await Quirofano.deletequirofano(req.params.sala);
        if(resultado === 0)
        {
            return res.status(404).json({msg: 'Quirofano no encontrado. '});
        }

    }catch(error){
        console.error('Error al eliminar quirofano:', error);
        res.status(500).json({msg: 'Error en el Sevidor LAVM'})    
    }
}

exports.actualizarquirofano = async(req, res) => {
    try {
        const { sala } = req.params; // ✅ Obtener sala de los parámetros de la URL
        const { estado } = req.body; // ✅ Obtener estado del body
        


        // Validar que vengan los datos
        if (!sala || !estado) {
            return res.status(400).json({ 
                msg: 'La sala y el estado son obligatorios' 
            });
        }

        // Validar que el estado sea válido
        const estadosValidos = ['disponible', 'ocupado', 'mantenimiento'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ 
                msg: 'Estado inválido. Debe ser: disponible, ocupado o mantenimiento' 
            });
        }

        const resultado = await Quirofano.updatequirofano(sala, estado);
        
        if (!resultado) {
            return res.status(404).json({ msg: 'Quirófano no encontrado' });
        }

        res.json({ 
            msg: 'Quirófano actualizado con éxito',
            data: resultado
        });  

    } catch (error) {
        console.error('Error al actualizar quirofano:', error);
        res.status(500).json({ msg: 'Error al actualizar el quirófano' });
    }
}
