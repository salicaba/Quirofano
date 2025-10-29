// horarioController.js
// --- IMPORTANTE: Asegúrate que el nombre del archivo sea el correcto ---
// Si tu modelo se llama 'cirugiaModel.js', cámbialo aquí.
const Cirugia = require('../models/cringableModel'); 

const { query } = require('../config/db'); // Importa 'query' si lo usas directamente aquí

const duracionesConfig = {
  porTipo: {
    'General': 2,
    'Neurocirugía': 8,
    'Cardíaca': 6,
    'Ortopedia': 3,
    'Plástica': 4,
    'Pediatría': 3
  },
  porUrgencia: {
    'Alta': 6,
    'Media': 4,
    'Baja': 3
  }
};

class HorarioController {

  // --- Función programarCirugiaAutomatica (ÚNICA Y CORREGIDA) ---
  async programarCirugiaAutomatica(req, res) {
    try {
      const cirugiaData = req.body;
      const { fecha, tipo_cirugia, urgencia, nombre_paciente } = cirugiaData;

      console.log(`Programando cirugía para: ${nombre_paciente}, tipo: ${tipo_cirugia}, urgencia: ${urgencia}`);

      // Calcular duración
      const duracionTipo = duracionesConfig.porTipo[tipo_cirugia] || 3;
      const duracionUrgencia = duracionesConfig.porUrgencia[urgencia] || 3;
      const duracionFinal = Math.max(duracionTipo, duracionUrgencia);
      console.log(`Duración calculada: ${duracionFinal} horas`);

      // Buscar horario disponible
      let horarioDisponible;
      if (cirugiaData.id_quirofano) {
        console.log(`Buscando en quirófano específico: ${cirugiaData.id_quirofano}`);
        // Asegúrate que tu modelo espere 'fecha' como string 'YYYY-MM-DD'
        horarioDisponible = await Cirugia.findAvailableSlot(fecha, cirugiaData.id_quirofano, duracionFinal); 
      } else {
        console.log('Buscando en cualquier quirófano');
        horarioDisponible = await Cirugia.findFirstAvailableSlot(fecha, duracionFinal);
        if (horarioDisponible) {
          cirugiaData.id_quirofano = horarioDisponible.id_quirofano;
          console.log(`Quirófano asignado: ${horarioDisponible.id_quirofano}`);
        }
      }

      if (!horarioDisponible || !horarioDisponible.hora_inicio || !horarioDisponible.hora_fin) {
        console.log('No se encontró horario disponible o datos de hora inválidos');
        return res.status(400).json({
          success: false,
          message: 'No hay horarios disponibles o datos inválidos para la fecha seleccionada'
        });
      }

      console.log(`Horario encontrado: ${horarioDisponible.hora_inicio.toISOString()} - ${horarioDisponible.hora_fin.toISOString()}`);

      // --- CORRECCIÓN CLAVE ---
      // Convertir timestamps a formato 'HH:MM:SS' ANTES de pasarlo al modelo
      // (Idealmente, esta conversión debería hacerse DENTRO del modelo)
      const horaInicioTime = new Date(horarioDisponible.hora_inicio).toISOString().substr(11, 8); // "HH:MM:SS"
      const horaFinTime = new Date(horarioDisponible.hora_fin).toISOString().substr(11, 8); // "HH:MM:SS"
      // ------------------------

      // Crear cirugía con horario
      const resultado = await Cirugia.createWithHorario({
        ...cirugiaData,
        hora_inicio: horaInicioTime, // Usamos el valor convertido
        hora_fin: horaFinTime,     // Usamos el valor convertido
        duracion: duracionFinal,
        duracion_estimada: duracionFinal,
        estado: 'Programada'
      });

      console.log('Cirugía guardada exitosamente en BD (modelo)');

      res.status(201).json({
        success: true,
        message: 'Cirugía programada exitosamente y horario guardado',
        data: resultado
      });

    } catch (error) {
      console.error('Error en programarCirugiaAutomatica:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // --- Función programarEmergencia (CORREGIDA) ---
  async programarEmergencia(req, res) {
    try {
      const cirugiaData = req.body;
      cirugiaData.urgencia = 'Alta'; // Forzar urgencia alta
      cirugiaData.estado = 'Emergencia'; // Forzar estado emergencia

      // Calcular duración
      const duracionTipo = duracionesConfig.porTipo[cirugiaData.tipo_cirugia] || 3;
      const duracionFinal = Math.max(duracionTipo, duracionesConfig.porUrgencia['Alta']);

      // Buscar horario disponible (asegúrate que 'fecha' sea YYYY-MM-DD)
      const horarioDisponible = await Cirugia.findFirstAvailableSlot(cirugiaData.fecha, duracionFinal);

      if (!horarioDisponible || !horarioDisponible.hora_inicio || !horarioDisponible.hora_fin) {
        return res.status(400).json({
          success: false,
          message: 'No hay quirófanos disponibles o datos inválidos para la emergencia'
        });
      }

      // --- CORRECCIÓN CLAVE ---
      // Convertir timestamps a formato 'HH:MM:SS'
      const horaInicioTime = new Date(horarioDisponible.hora_inicio).toISOString().substr(11, 8);
      const horaFinTime = new Date(horarioDisponible.hora_fin).toISOString().substr(11, 8);
      // ------------------------

      // Crear cirugía y horario
      const resultado = await Cirugia.createWithHorario({
        ...cirugiaData,
        id_quirofano: horarioDisponible.id_quirofano, // Asignar el quirófano encontrado
        hora_inicio: horaInicioTime, // Usar valor convertido
        hora_fin: horaFinTime,     // Usar valor convertido
        duracion: duracionFinal,
        duracion_estimada: duracionFinal
      });

      res.status(201).json({
        success: true,
        message: 'Cirugía de emergencia programada y horario guardado',
        data: resultado
      });

    } catch (error) {
       console.error('Error en programarEmergencia:', error); // Añadir log
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // --- Función obtenerHorarioSemanal (SIN CAMBIOS NECESARIOS AQUÍ) ---
  async obtenerHorarioSemanal(req, res) {
    try {
      const { fecha } = req.query; // Espera fecha como 'YYYY-MM-DD'
      if (!fecha) {
        return res.status(400).json({ success: false, message: 'Falta el parámetro fecha (YYYY-MM-DD)' });
      }

      const fechaInicio = new Date(fecha + 'T00:00:00Z'); // Asegurar UTC para evitar problemas de zona
      const fechaFin = new Date(fechaInicio);
      fechaFin.setUTCDate(fechaFin.getUTCDate() + 6); // Usar UTC date
      fechaFin.setUTCHours(23, 59, 59, 999); // Fin del día UTC

      // Ahora usamos la función que junta ambas tablas
      // Asegúrate que tu modelo entienda las fechas UTC
      const horarios = await Cirugia.getHorariosConCirugias(fechaInicio, fechaFin);

      const horarioSemanal = {};
      horarios.forEach(horario => {
        // Asumimos que horario.fecha ya es un objeto Date o string ISO
        const fechaLocal = new Date(horario.fecha);
        // Formatear a YYYY-MM-DD localmente
        const fechaStr = fechaLocal.getFullYear() + '-' + 
                       (fechaLocal.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                       fechaLocal.getDate().toString().padStart(2, '0');
        
        // Formatear hora_inicio y hora_fin a HH:MM local
        const horaInicioStr = horario.hora_inicio ? new Date(horario.hora_inicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A';
        const horaFinStr = horario.hora_fin ? new Date(horario.hora_fin).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A';

        if (!horarioSemanal[fechaStr]) {
          horarioSemanal[fechaStr] = {};
        }
        // Usar ID de quirófano que viene del JOIN
        const idQuirofano = horario.id_quirofano || 'desconocido'; 
        if (!horarioSemanal[fechaStr][idQuirofano]) {
          horarioSemanal[fechaStr][idQuirofano] = [];
        }
        
        // Añadir las horas formateadas
        horarioSemanal[fechaStr][idQuirofano].push({
          ...horario,
          hora_inicio_formato: horaInicioStr,
          hora_fin_formato: horaFinStr
        });
      });

      res.json({
        success: true,
        data: horarioSemanal
      });

    } catch (error) {
       console.error('Error en obtenerHorarioSemanal:', error); // Añadir log
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new HorarioController();