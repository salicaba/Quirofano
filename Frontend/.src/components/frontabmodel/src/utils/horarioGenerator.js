import axios from 'axios';

/**
 * Función para generar horarios automáticos con fechas individuales y tiempo de limpieza
 * @param {Object} params - Parámetros necesarios para la generación
 * @returns {Object} Resultado de la generación
 */
export const generarHorariosAutomaticos = async (params) => {
  const {
    cirugiasPendientes,
    horarios,
    quirofanos,
    obtenerDuracionProcedimiento,
    encontrarHorarioDisponible,
    validarHorarioSinEmpalmes,
    formatTimeForPostgreSQL,
    obtenerIdQuirofanoReal,
    getConfig,
    API_BASE_CIRUGIAS,
    tiempoLimpieza = 30 // 30 minutos de limpieza entre cirugías
  } = params;

  let cirugiasAsignadasConExito = 0;
  const cirugiasSinHorario = [];
  const horariosSimulados = JSON.parse(JSON.stringify(horarios));
  const promesasDeGuardado = [];

  try {
    // Ordenar por urgencia y luego por fecha solicitada
    const cirugiasOrdenadas = [...cirugiasPendientes].sort((a, b) => {
      const prioridadA = obtenerPrioridadUrgencia(a.urgencia || 'Programada');
      const prioridadB = obtenerPrioridadUrgencia(b.urgencia || 'Programada');
      
      // Si misma urgencia, ordenar por fecha más antigua primero
      if (prioridadA === prioridadB) {
        const fechaA = new Date(a.fecha_solicitud || a.fecha);
        const fechaB = new Date(b.fecha_solicitud || b.fecha);
        return fechaA - fechaB;
      }
      
      return prioridadB - prioridadA;
    });

    console.log(`📅 Procesando ${cirugiasOrdenadas.length} cirugías con fechas individuales`);

    for (const cirugia of cirugiasOrdenadas) {
      // Usar la fecha individual de cada cirugía
      const fechaCirugia = cirugia.fecha_solicitud || cirugia.fecha || cirugia.fecha_programada;
      
      if (!fechaCirugia) {
        console.error(`❌ Cirugía ${cirugia.procedimiento} no tiene fecha asignada`);
        cirugiasSinHorario.push(cirugia.procedimiento + ' (Sin fecha)');
        continue;
      }

      const { duracion } = obtenerDuracionProcedimiento(cirugia.procedimiento, cirugia.urgencia || 'Programada');
      
      // BUSCAR HORARIO CON FECHA INDIVIDUAL Y TIEMPO DE LIMPIEZA
      const horarioDisponible = encontrarHorarioDisponible(
        duracion, 
        cirugia.urgencia, 
        horariosSimulados, 
        quirofanos,
        fechaCirugia,
        tiempoLimpieza
      );

      if (horarioDisponible) {
        // VALIDACIÓN EXTRA ANTES DE ASIGNAR
        const esHorarioValido = validarHorarioSinEmpalmes(
          horarioDisponible.sala, 
          horarioDisponible.horaInicio, 
          horarioDisponible.horaFin, 
          horariosSimulados,
          null,
          fechaCirugia
        );

        if (!esHorarioValido) {
          console.error(`❌ EMPALME DETECTADO para ${cirugia.procedimiento} en ${fechaCirugia}. Buscando nuevo horario...`);
          
          // Intentar encontrar otro horario
          let horarioAlternativo = null;
          let intentos = 0;
          const maxIntentos = 3;
          
          while (!horarioAlternativo && intentos < maxIntentos) {
            // Buscar en otro quirófano o con margen adicional
            horarioAlternativo = encontrarHorarioDisponible(
              duracion, 
              cirugia.urgencia, 
              horariosSimulados, 
              quirofanos,
              fechaCirugia,
              tiempoLimpieza
            );
            intentos++;
          }
          
          if (horarioAlternativo) {
            horarioDisponible = horarioAlternativo;
            console.log(`🔄 Horario alternativo encontrado para ${cirugia.procedimiento}`);
          } else {
            console.error(`❌ No se encontró horario alternativo para ${cirugia.procedimiento} en ${fechaCirugia}`);
            cirugiasSinHorario.push(cirugia.procedimiento + ` (Conflicto ${fechaCirugia})`);
            continue;
          }
        }

        const horaInicioFormatted = formatTimeForPostgreSQL(horarioDisponible.horaInicio);
        const horaFinFormatted = formatTimeForPostgreSQL(horarioDisponible.horaFin);
        const idQuirofanoReal = obtenerIdQuirofanoReal(horarioDisponible.sala);

        if (idQuirofanoReal !== null && horaInicioFormatted && horaFinFormatted) {
          const idCirugia = cirugia.id_cirugia || cirugia.id;
          
          // VERIFICACIÓN FINAL ANTES DE GUARDAR
          const conflictoFinal = horariosSimulados.some(horario => 
            horario.quirofano === horarioDisponible.sala &&
            horario.fecha === fechaCirugia &&
            horario.id !== idCirugia &&
            ((horarioDisponible.horaInicio >= horario.horaInicio && horarioDisponible.horaInicio < horario.horaFin) ||
             (horarioDisponible.horaFin > horario.horaInicio && horarioDisponible.horaFin <= horario.horaFin) ||
             (horarioDisponible.horaInicio <= horario.horaInicio && horarioDisponible.horaFin >= horario.horaFin))
          );

          if (conflictoFinal) {
            console.error(`❌ CONFLICTO FINAL DETECTADO para ${cirugia.procedimiento} en ${fechaCirugia}. Cancelando asignación.`);
            cirugiasSinHorario.push(cirugia.procedimiento + ` (Conflicto final ${fechaCirugia})`);
            continue;
          }

          const horarioData = {
            fecha: fechaCirugia, // Usar fecha individual de la cirugía
            hora_inicio: horaInicioFormatted,
            hora_fin: horaFinFormatted,
            id_quirofano: idQuirofanoReal,
            estado: 'Programada',
            duracion: duracion,
            tiempo_limpieza: tiempoLimpieza
          };

          const nuevoHorarioSimulado = {
            id: idCirugia,
            fecha: fechaCirugia, // Usar fecha individual de la cirugía
            horaInicio: horarioDisponible.horaInicio,
            horaFin: horarioDisponible.horaFin,
            quirofano: horarioDisponible.sala,
            procedimiento: cirugia.procedimiento,
            urgencia: cirugia.urgencia,
            tiempoLimpieza: tiempoLimpieza
          };
          
          horariosSimulados.push(nuevoHorarioSimulado);
          console.log(`➕ Añadido a simulación: ${fechaCirugia} ${nuevoHorarioSimulado.quirofano} ${nuevoHorarioSimulado.horaInicio}-${nuevoHorarioSimulado.horaFin} (Limpieza: ${tiempoLimpieza}min)`);

          promesasDeGuardado.push(
            axios.put(`${API_BASE_CIRUGIAS}/${idCirugia}`, horarioData, getConfig())
              .then(response => ({ 
                idCirugia, 
                success: true, 
                response, 
                horarioAsignado: nuevoHorarioSimulado 
              }))
              .catch(error => ({ idCirugia, success: false, error }))
          );
          console.log(`✅ Preparado para guardar ${idCirugia}: ${fechaCirugia} ${horarioDisponible.sala} ${horarioDisponible.horaInicio}-${horarioDisponible.horaFin}`);

        } else {
          console.error(`❌ Datos inválidos para ${cirugia.procedimiento}. Quirófano: ${idQuirofanoReal}, Inicio: ${horaInicioFormatted}, Fin: ${horaFinFormatted}`);
          cirugiasSinHorario.push(cirugia.procedimiento + ` (Datos inválidos ${fechaCirugia})`);
        }
      } else {
        console.log(`❌ No se encontró horario para ${cirugia.procedimiento} en ${fechaCirugia}`);
        cirugiasSinHorario.push(cirugia.procedimiento + ` (Sin slot ${fechaCirugia})`);
      }
    }

    if (promesasDeGuardado.length > 0) {
      console.log(`⏳ Esperando ${promesasDeGuardado.length} guardados en BD...`);
      const resultados = await Promise.all(promesasDeGuardado);
      
      const exitosas = resultados.filter(r => r.success);
      const fallidas = resultados.filter(r => !r.success);
      cirugiasAsignadasConExito = exitosas.length;

      // Agrupar resultados por fecha
      const resultadosPorFecha = {};
      exitosas.forEach(resultado => {
        const fecha = resultado.horarioAsignado.fecha;
        if (!resultadosPorFecha[fecha]) {
          resultadosPorFecha[fecha] = [];
        }
        resultadosPorFecha[fecha].push(resultado);
      });

      console.log('📊 Resumen por fecha:');
      Object.keys(resultadosPorFecha).forEach(fecha => {
        console.log(`   📅 ${fecha}: ${resultadosPorFecha[fecha].length} cirugías asignadas`);
      });

      return {
        exitosas,
        fallidas,
        cirugiasSinHorario,
        totalAsignadas: exitosas.length,
        resultadosPorFecha
      };
    }

    return {
      exitosas: [],
      fallidas: [],
      cirugiasSinHorario,
      totalAsignadas: 0,
      resultadosPorFecha: {}
    };

  } catch (error) {
    console.error('❌ Error en generación automática:', error);
    throw error;
  }
};

/**
 * Función mejorada para encontrar horarios disponibles con fecha específica y tiempo de limpieza
 */
export const encontrarHorarioDisponible = (duracion, urgencia, horariosExistentes, quirofanos, fechaEspecifica, tiempoLimpieza = 30) => {
  const horarioLaboral = {
    inicio: '07:00',
    fin: '19:00'
  };
  
  // Ordenar quirófanos por prioridad
  const quirofanosOrdenados = [...quirofanos].sort((a, b) => {
    const esEmergenciaA = a.tipo === 'Emergencia';
    const esEmergenciaB = b.tipo === 'Emergencia';
    return esEmergenciaB - esEmergenciaA;
  });

  for (const quirofano of quirofanosOrdenados) {
    let horaActual = new Date(`2000-01-01T${horarioLaboral.inicio}`);
    const horarioFin = new Date(`2000-01-01T${horarioLaboral.fin}`);
    
    // Obtener horarios existentes para este quirófano en la fecha específica
    const horariosQuirofano = horariosExistentes
      .filter(h => h.quirofano === quirofano.nombre && h.fecha === fechaEspecifica)
      .sort((a, b) => new Date(`2000-01-01T${a.horaInicio}`) - new Date(`2000-01-01T${b.horaInicio}`));
    
    console.log(`🔍 Buscando en ${quirofano.nombre} para ${fechaEspecifica}: ${horariosQuirofano.length} cirugías existentes`);

    // Si no hay horarios existentes, usar el inicio del día
    if (horariosQuirofano.length === 0) {
      const slotInicio = horaActual;
      const slotFin = new Date(slotInicio.getTime() + duracion * 60000);
      
      if (slotFin <= horarioFin) {
        return {
          sala: quirofano.nombre,
          horaInicio: formatTime(slotInicio),
          horaFin: formatTime(slotFin),
          fecha: fechaEspecifica
        };
      }
      continue;
    }

    // Buscar slot antes del primer horario existente
    const primerHorario = new Date(`2000-01-01T${horariosQuirofano[0].horaInicio}`);
    const slotInicioInicial = horaActual;
    const slotFinInicial = new Date(slotInicioInicial.getTime() + duracion * 60000);
    
    // Verificar que hay tiempo suficiente incluyendo limpieza
    const tiempoDisponible = (primerHorario - slotInicioInicial) / 60000; // en minutos
    if (tiempoDisponible >= duracion + tiempoLimpieza) {
      if (validarHorarioSinEmpalmes(quirofano.nombre, 
          formatTime(slotInicioInicial), 
          formatTime(slotFinInicial), 
          horariosExistentes,
          null,
          fechaEspecifica)) {
        return {
          sala: quirofano.nombre,
          horaInicio: formatTime(slotInicioInicial),
          horaFin: formatTime(slotFinInicial),
          fecha: fechaEspecifica
        };
      }
    }
    
    // Buscar slots entre horarios existentes
    for (let i = 0; i < horariosQuirofano.length; i++) {
      const horarioActual = horariosQuirofano[i];
      const horarioSiguiente = horariosQuirofano[i + 1];
      
      const finActual = new Date(`2000-01-01T${horarioActual.horaFin}`);
      const inicioSiguiente = horarioSiguiente ? 
        new Date(`2000-01-01T${horarioSiguiente.horaInicio}`) : horarioFin;
      
      // Calcular slot considerando tiempo de limpieza
      const slotInicio = new Date(finActual.getTime() + tiempoLimpieza * 60000);
      const slotFin = new Date(slotInicio.getTime() + duracion * 60000);
      
      // Verificar que hay suficiente tiempo entre cirugías (incluyendo limpieza)
      const tiempoEntreCirugias = (inicioSiguiente - finActual) / 60000;
      if (tiempoEntreCirugias >= duracion + tiempoLimpieza) {
        if (slotFin <= inicioSiguiente && 
            validarHorarioSinEmpalmes(quirofano.nombre, 
              formatTime(slotInicio), 
              formatTime(slotFin), 
              horariosExistentes,
              null,
              fechaEspecifica)) {
          return {
            sala: quirofano.nombre,
            horaInicio: formatTime(slotInicio),
            horaFin: formatTime(slotFin),
            fecha: fechaEspecifica
          };
        }
      }
    }
    
    // Buscar slot después del último horario
    const ultimoHorario = new Date(`2000-01-01T${horariosQuirofano[horariosQuirofano.length - 1].horaFin}`);
    const slotInicioFinal = new Date(ultimoHorario.getTime() + tiempoLimpieza * 60000);
    const slotFinFinal = new Date(slotInicioFinal.getTime() + duracion * 60000);
    
    if (slotFinFinal <= horarioFin && 
        validarHorarioSinEmpalmes(quirofano.nombre, 
          formatTime(slotInicioFinal), 
          formatTime(slotFinFinal), 
          horariosExistentes,
          null,
          fechaEspecifica)) {
      return {
        sala: quirofano.nombre,
        horaInicio: formatTime(slotInicioFinal),
        horaFin: formatTime(slotFinFinal),
        fecha: fechaEspecifica
      };
    }
  }
  
  return null;
};

/**
 * Función mejorada de validación que considera fecha y tiempo de limpieza
 */
export const validarHorarioSinEmpalmes = (quirofano, horaInicio, horaFin, horariosExistentes, idCirugiaActual = null, fechaEspecifica = null) => {
  const inicioPropuesto = new Date(`2000-01-01T${horaInicio}`);
  const finPropuesto = new Date(`2000-01-01T${horaFin}`);
  
  if (inicioPropuesto >= finPropuesto) {
    console.error(`❌ Hora de inicio (${horaInicio}) debe ser anterior a hora fin (${horaFin})`);
    return false;
  }

  for (const horario of horariosExistentes) {
    // Excluir la cirugía actual si se está actualizando
    if (idCirugiaActual && horario.id === idCirugiaActual) {
      continue;
    }
    
    // Verificar mismo quirófano y misma fecha
    if (horario.quirofano === quirofano && 
        (fechaEspecifica === null || horario.fecha === fechaEspecifica)) {
      
      const inicioExistente = new Date(`2000-01-01T${horario.horaInicio}`);
      const finExistente = new Date(`2000-01-01T${horario.horaFin}`);
      
      // Detectar solapamientos
      const haySolapamiento = 
        (inicioPropuesto >= inicioExistente && inicioPropuesto < finExistente) ||
        (finPropuesto > inicioExistente && finPropuesto <= finExistente) ||
        (inicioPropuesto <= inicioExistente && finPropuesto >= finExistente);
      
      if (haySolapamiento) {
        console.warn(`⚠️ Conflicto detectado en ${quirofano} (${horario.fecha}): ${horaInicio}-${horaFin} vs ${horario.horaInicio}-${horario.horaFin}`);
        return false;
      }

      // Validar margen de limpieza (30 minutos) entre cirugías
      const margenLimpieza = 30 * 60000; // 30 minutos en milisegundos
      const tiempoEntreFinEInicio = inicioPropuesto.getTime() - finExistente.getTime();
      const tiempoEntreFinEInicioInverso = inicioExistente.getTime() - finPropuesto.getTime();
      
      if (tiempoEntreFinEInicio > 0 && tiempoEntreFinEInicio < margenLimpieza) {
        console.warn(`⚠️ Margen de limpieza insuficiente después de cirugía existente en ${quirofano}`);
        return false;
      }
      
      if (tiempoEntreFinEInicioInverso > 0 && tiempoEntreFinEInicioInverso < margenLimpieza) {
        console.warn(`⚠️ Margen de limpieza insuficiente antes de cirugía existente en ${quirofano}`);
        return false;
      }
    }
  }
  
  return true;
};

// Funciones auxiliares (mantienen igual)
const formatTime = (date) => {
  return date.toTimeString().slice(0, 5);
};

const obtenerPrioridadUrgencia = (urgencia) => {
  const prioridades = {
    'Emergencia': 4,
    'Media Urgencia': 3,
    'Baja Urgencia': 2,
    'Programada': 1
  };
  return prioridades[urgencia] || 1;
};