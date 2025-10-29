import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmergenciaModal from './EmergenciaModal';
import { generarHorariosAutomaticos } from '../utils/horarioGenerator';
import '../styles/Horarios.css';

const Horarios = () => {
  const API_BASE_QUIROFANOS = 'http://localhost:4001/api/quirofanos';
  const API_BASE_HORARIOS = 'http://localhost:4001/api/horario';
  const API_BASE_CIRUGIAS = 'http://localhost:4001/api/cirugias';

  // --- LISTA DE PROCEDIMIENTOS CON DURACIONES ESPECÍFICAS ---
  const procedimientosConfig = {
    // Cirugías Cardíacas
    'Bypass Coronario': { duracion: 6, categoria: 'Cardíaca', urgencia: 4 },
    'Reemplazo de Válvula': { duracion: 5, categoria: 'Cardíaca', urgencia: 4 },
    'Cateterismo Cardíaco': { duracion: 3, categoria: 'Cardíaca', urgencia: 3 },
    'Marcapasos': { duracion: 2, categoria: 'Cardíaca', urgencia: 3 },
    
    // Neurocirugías
    'Tumor Cerebral': { duracion: 8, categoria: 'Neurológica', urgencia: 4 },
    'Hernia Discal': { duracion: 4, categoria: 'Neurológica', urgencia: 3 },
    'Aneurisma Cerebral': { duracion: 6, categoria: 'Neurológica', urgencia: 5 },
    'Craneotomía': { duracion: 5, categoria: 'Neurológica', urgencia: 4 },
    
    // Ortopédicas
    'Reemplazo de Cadera': { duracion: 4, categoria: 'Ortopédica', urgencia: 3 },
    'Reemplazo de Rodilla': { duracion: 3, categoria: 'Ortopédica', urgencia: 3 },
    'Artroscopia': { duracion: 2, categoria: 'Ortopédica', urgencia: 2 },
    'Fractura de Fémur': { duracion: 3, categoria: 'Ortopédica', urgencia: 4 },
    
    // Generales
    'Apéndice': { duracion: 2, categoria: 'General', urgencia: 4 },
    'Vesícula': { duracion: 2, categoria: 'General', urgencia: 3 },
    'Hernia Inguinal': { duracion: 2, categoria: 'General', urgencia: 2 },
    'Cesárea': { duracion: 2, categoria: 'Obstetricia', urgencia: 4 },
    
    // Emergencias
    'Trauma Múltiple': { duracion: 6, categoria: 'Emergencia', urgencia: 5 },
    'Hemoperitoneo': { duracion: 4, categoria: 'Emergencia', urgencia: 5 },
    'Neurotrauma': { duracion: 5, categoria: 'Emergencia', urgencia: 5 }
  };

  // --- OBTENER DURACIÓN BASADA EN PROCEDIMIENTO ---
  const obtenerDuracionProcedimiento = (procedimiento, urgencia = 'Programada') => {
    const config = procedimientosConfig[procedimiento] || { duracion: 2, categoria: 'General', urgencia: 2 };
    
    // Ajustar por tipo de urgencia
    const ajustesUrgencia = {
      'Emergencia': 1.0,    // Sin ajuste (máxima prioridad)
      'Media Urgencia': 1.1, // +10%
      'Baja Urgencia': 1.2,  // +20%
      'Programada': 1.0      // Sin ajuste
    };
    
    const factor = ajustesUrgencia[urgencia] || 1.0;
    const duracionFinal = Math.max(1, Math.ceil(config.duracion * factor));
    
    console.log(`⏱️ ${procedimiento} (${urgencia}): ${config.duracion}h * ${factor} = ${duracionFinal}h`);
    
    return {
      duracion: duracionFinal,
      categoria: config.categoria,
      prioridad: config.urgencia
    };
  };

  // --- FUNCIÓN CORREGIDA PARA VALIDAR HORARIOS SIN EMPALMES ---
  const validarHorarioSinEmpalmes = (sala, horaInicio, horaFin, horariosRef, ignorarId = null) => {
    const inicioIndexNuevo = horarios30Minutos.indexOf(horaInicio);
    const finIndexNuevo = horarios30Minutos.indexOf(horaFin);

    if (inicioIndexNuevo === -1 || finIndexNuevo === -1 || finIndexNuevo <= inicioIndexNuevo) {
      console.warn('❌ Horarios inválidos para validación:', { sala, horaInicio, horaFin });
      return false; // Horario nuevo inválido
    }

    // Verificar cada horario existente en la misma sala from the provided reference array
    for (const horarioExistente of horariosRef) {
      // Solo comparar con horarios de la misma sala y diferente ID (si se proporciona)
      if (horarioExistente.quirofano === sala && horarioExistente.id !== ignorarId) {
        const inicioExistenteIndex = horarios30Minutos.indexOf(horarioExistente.horaInicio);
        const finExistenteIndex = horarios30Minutos.indexOf(horarioExistente.horaFin);

        // Si el horario existente es inválido, saltarlo
        if (inicioExistenteIndex === -1 || finExistenteIndex === -1 || finExistenteIndex <= inicioExistenteIndex) continue;

        // Lógica de empalme: [A, B) y [C, D) se empalman si A < D y C < B
        const empalma = inicioIndexNuevo < finExistenteIndex && inicioExistenteIndex < finIndexNuevo;

        if (empalma) {
          console.log('❌ EMPALME DETECTADO en validación:', {
            sala,
            nuevo: `${horaInicio}-${horaFin} [${inicioIndexNuevo}-${finIndexNuevo})`,
            existente: `${horarioExistente.horaInicio}-${horarioExistente.horaFin} [${inicioExistenteIndex}-${finExistenteIndex}) (ID: ${horarioExistente.id})`,
          });
          return false; // Empalme encontrado
        }
      }
    }

    // console.log('✅ Horario válido sin empalmes (validación):', { sala, horaInicio, horaFin });
    return true; // No se encontraron empalmes
  };

  // --- ALGORITMO ANTI-EMPALMES MEJORADO (Usa una referencia de horarios) ---
  const encontrarHorarioDisponible = (duracionHoras, urgencia = 'Programada', horariosActuales) => {
    const slotsNecesarios = duracionHoras * 2; // 30 mins por slot
    console.log(`🔍 Buscando slot de ${slotsNecesarios} slots (${duracionHoras}h) para urgencia: ${urgencia}`);

    if (quirofanos.length === 0) {
      console.error("❌ No hay quirófanos cargados.");
      return null;
    }

    // Preparar datos de ocupación usando los horariosActuales proporcionados
    const ocupacionQuirofanos = quirofanos
      .filter(q => q.estado === 'disponible')
      .map(q => {
        const sala = q.sala || `Q?${q.id_quirofano}`;
        // Filtrar los horariosActuales por esta sala
        const horariosSala = horariosActuales.filter(h => h.quirofano === sala); 
        const slotsOcupados = horariosSala
          .map(h => ({
            inicio: horarios30Minutos.indexOf(h.horaInicio),
            fin: horarios30Minutos.indexOf(h.horaFin)
          }))
          .filter(s => s.inicio !== -1 && s.fin !== -1 && s.fin > s.inicio)
          .sort((a, b) => a.inicio - b.inicio);

        const ultimoSlot = slotsOcupados.length > 0 ? slotsOcupados[slotsOcupados.length - 1].fin : 0;
        return { sala, slotsOcupados, ultimoSlot, numHorarios: slotsOcupados.length };
      })
      .sort((a, b) => a.numHorarios - b.numHorarios || a.ultimoSlot - b.ultimoSlot);

    const MAX_SLOT_INDEX = 48; // Índice del último slot (23:30)

    for (const q of ocupacionQuirofanos) {
      // console.log(`🔍 Analizando ${q.sala}`);
      // Empezar búsqueda desde las 00:00
      for (let slotInicio = 0; slotInicio <= MAX_SLOT_INDEX - slotsNecesarios; slotInicio++) {
        const slotFin = slotInicio + slotsNecesarios;
        let hayEmpalme = false;

        for (const ocupado of q.slotsOcupados) {
          // Empalme si: [slotInicio, slotFin) intersecta con [ocupado.inicio, ocupado.fin)
          if (slotInicio < ocupado.fin && ocupado.inicio < slotFin) {
            hayEmpalme = true;
            // Optimizar: Saltar al final del bloque ocupado para la próxima iteración
            slotInicio = ocupado.fin - 1; // -1 porque el loop hará ++
            break;
          }
        }

        if (!hayEmpalme) {
          const horaInicio = horarios30Minutos[slotInicio];
          const horaFin = horarios30Minutos[slotFin];
          console.log(`✅ HORARIO ENCONTRADO en ${q.sala}: ${horaInicio}-${horaFin}`);
          return {
            sala: q.sala,
            horaInicio,
            horaFin,
            slots: slotsNecesarios,
            horaSlotInicio: slotInicio
          };
        }
      }
    }

    console.log('❌ NO HAY HORARIOS DISPONIBLES.');
    return null;
  };

  // --- FUNCIÓN MEJORADA PARA GENERAR HORARIOS AUTOMÁTICOS ---
  const handleGenerarHorario = async () => {
    if (!esAdministrador()) {
      alert('🚨 Solo los administradores pueden generar horarios automáticos.');
      return;
    }
    
    if (cirugiasPendientes.length === 0) {
      alert('ℹ️ No hay cirugías pendientes de horario.');
      return;
    }

    if (quirofanos.length === 0) {
      alert('❌ No hay quirófanos disponibles. Por favor, agregue quirófanos primero.');
      return;
    }

    setGenerando(true);
    
    try {
      const resultado = await generarHorariosAutomaticos({
        cirugiasPendientes,
        horarios,
        quirofanos,
        fechaSeleccionada,
        obtenerDuracionProcedimiento,
        encontrarHorarioDisponible,
        validarHorarioSinEmpalmes,
        formatTimeForPostgreSQL,
        obtenerIdQuirofanoReal,
        getConfig,
        API_BASE_CIRUGIAS
      });

      // Procesar resultados
      if (resultado.exitosas && resultado.exitosas.length > 0) {
        const idsExitosos = resultado.exitosas.map(e => e.idCirugia);
        const horariosExitosos = resultado.exitosas.map(e => e.horarioAsignado);

        setCirugiasPendientes(prev => prev.filter(c => !idsExitosos.includes(c.id_cirugia || c.id)));
        setHorarios(prev => [...prev, ...horariosExitosos]);

        let mensaje = `✅ ${resultado.exitosas.length} horarios generados y guardados.`;
        if (resultado.fallidas && resultado.fallidas.length > 0) {
          mensaje += `\n❌ ${resultado.fallidas.length} errores al guardar.`;
          resultado.fallidas.forEach(f => console.error(`Error al guardar ID ${f.idCirugia}:`, f.error));
        }
        if (resultado.cirugiasSinHorario && resultado.cirugiasSinHorario.length > 0) {
          mensaje += `\n⚠️ No se pudieron asignar ${resultado.cirugiasSinHorario.length} horarios.`;
        }
        alert(mensaje);
      } else if (resultado.cirugiasSinHorario && resultado.cirugiasSinHorario.length > 0) {
        alert(`❌ No se pudo asignar horario a ninguna cirugía: ${resultado.cirugiasSinHorario.join(', ')}`);
      } else {
        alert('ℹ️ No había cirugías válidas para procesar.');
      }

    } catch (error) {
      console.error('❌ Error crítico en generación automática:', error);
      alert('❌ Error crítico al generar horarios: ' + (error.message || 'Error desconocido'));
    } finally {
      setGenerando(false);
    }
  };

  // --- FUNCIÓN MEJORADA PARA ASIGNAR HORARIOS INDIVIDUAL ---
  const handleAsignarHorarioCirugia = async (cirugia) => {
     // ... (Código existente, pero asegúrate que llame a la versión de encontrarHorarioDisponible que recibe horariosActuales)
     if (!cirugia || !cirugia.procedimiento) {
         alert('❌ Datos de cirugía inválidos.');
         return;
     }
     console.log(`⚙️ Asignando horario individual para: ${cirugia.procedimiento} (ID: ${cirugia.id_cirugia})`);
     try {
       const { duracion } = obtenerDuracionProcedimiento(cirugia.procedimiento, cirugia.urgencia || 'Programada');
       
       // PASAR el estado actual de horarios a la función
       const horarioDisponible = encontrarHorarioDisponible(duracion, cirugia.urgencia, horarios); 

       if (!horarioDisponible) {
         alert(`❌ No hay horarios disponibles para "${cirugia.procedimiento}" (${duracion}h).`);
         return;
       }

       // Validar usando el estado actual de horarios
       if (!validarHorarioSinEmpalmes(horarioDisponible.sala, horarioDisponible.horaInicio, horarioDisponible.horaFin, horarios)) {
         alert('❌ Error: Conflicto de horario detectado durante la asignación final.');
         return;
       }

       const horaInicioFormatted = formatTimeForPostgreSQL(horarioDisponible.horaInicio);
       const horaFinFormatted = formatTimeForPostgreSQL(horarioDisponible.horaFin);
       const idQuirofanoReal = obtenerIdQuirofanoReal(horarioDisponible.sala);

       if (idQuirofanoReal === null) {
         alert(`❌ No se pudo encontrar el ID para el quirófano "${horarioDisponible.sala}".`);
         return;
       }

       const horarioData = {
         fecha: fechaSeleccionada,
         hora_inicio: horaInicioFormatted,
         hora_fin: horaFinFormatted,
         id_quirofano: idQuirofanoReal,
         estado: 'Programada',
         duracion: duracion
       };

       console.log('💾 Guardando horario individual:', horarioData);
       const idCirugia = cirugia.id_cirugia || cirugia.id;

       const response = await axios.put(`${API_BASE_CIRUGIAS}/${idCirugia}`, horarioData, getConfig());

       if (response.data && response.data.success) {
         alert(`✅ Horario asignado a "${cirugia.procedimiento}": ${horarioDisponible.horaInicio} - ${horarioDisponible.horaFin} en ${horarioDisponible.sala}`);
         
         // Actualizar UI
         setCirugiasPendientes(prev => prev.filter(c => (c.id_cirugia || c.id) !== idCirugia));
         const nuevoHorarioVisual = {
             id: idCirugia,
             fecha: fechaSeleccionada,
             horaInicio: horarioDisponible.horaInicio,
             horaFin: horarioDisponible.horaFin,
             quirofano: horarioDisponible.sala,
             cirugia: cirugia.procedimiento,
             especialista: cirugia.especialista || 'Asignado',
             paciente: cirugia.nombre_paciente || 'Paciente',
             duracion: duracion,
             tipo: 'Programada',
             color: statusMap['Programada'].color,
             clase: statusMap['Programada'].clase,
             diagnostico_pre: cirugia.diagnostico_pre,
             // ...otros datos relevantes
          };
          setHorarios(prev => [...prev, nuevoHorarioVisual]); // Añadir al estado visual

       } else {
         alert('❌ Error al guardar el horario en la base de datos (respuesta API)');
       }

     } catch (error) {
       console.error('Error al asignar horario individual:', error);
       alert('❌ Error al asignar horario: ' + (error.response?.data?.message || error.message));
     }
  };

  // --- ALGORITMO DE ASIGNACIÓN 24/7 SIN EMPALMES ---
  const encontrarHorarioDisponible24_7 = (duracionHoras, procedimiento, tipoUrgencia = 'Programada') => {
    console.log(`🔍 Buscando horario 24/7 para: ${procedimiento} (${duracionHoras}h, ${tipoUrgencia})`);
    
    const slotsNecesarios = duracionHoras * 2; // 30 minutos por slot
    
    // Ordenar quirófanos por ocupación (menos ocupados primero)
    const quirofanosDisponibles = quirofanos
      .filter(q => q.estado === 'disponible')
      .map(q => {
        const sala = q.sala || q.nombre || 'Q1';
        const horariosSala = horarios.filter(h => h.quirofano === sala);
        
        // Convertir horarios existentes a slots ocupados
        const slotsOcupados = horariosSala.map(horario => {
          const inicio = horarios30Minutos.indexOf(horario.horaInicio);
          const fin = horarios30Minutos.indexOf(horario.horaFin);
          return { inicio, fin, valido: inicio !== -1 && fin !== -1 };
        }).filter(slot => slot.valido);
        
        return {
          sala,
          slotsOcupados,
          ocupacion: slotsOcupados.length,
          // Calcular próximo horario disponible
          ultimoHorario: Math.max(0, ...slotsOcupados.map(s => s.fin))
        };
      })
      .sort((a, b) => a.ocupacion - b.ocupacion || a.ultimoHorario - b.ultimoHorario);

    console.log('🏥 Quirófanos analizados:', quirofanosDisponibles.map(q => 
      `${q.sala}: ${q.ocupacion} ocupados, último: ${horarios30Minutos[q.ultimoHorario] || '00:00'}`
    ));

    // ESTRATEGIA 1: Buscar desde el último horario de cada quirófano
    for (const quirofano of quirofanosDisponibles) {
      const { sala, slotsOcupados, ultimoHorario } = quirofano;
      
      // Comenzar desde el último horario + 30 minutos o desde 00:00
      const inicioBusqueda = Math.max(0, ultimoHorario);
      
      for (let slotInicio = inicioBusqueda; slotInicio <= 48 - slotsNecesarios; slotInicio++) {
        const slotFin = slotInicio + slotsNecesarios;
        
        // Verificar que no empalme con ningún horario existente
        let hayEmpalme = false;
        for (const ocupado of slotsOcupados) {
          if ((slotInicio >= ocupado.inicio && slotInicio < ocupado.fin) ||
              (slotFin > ocupado.inicio && slotFin <= ocupado.fin) ||
              (slotInicio <= ocupado.inicio && slotFin >= ocupado.fin)) {
            hayEmpalme = true;
            break;
          }
        }
        
        if (!hayEmpalme) {
          const horaInicio = horarios30Minutos[slotInicio];
          const horaFin = horarios30Minutos[slotFin];
          
          console.log(`✅ HORARIO ASIGNADO: ${sala} ${horaInicio}-${horaFin} para ${procedimiento}`);
          return { 
            sala, 
            horaInicio, 
            horaFin,
            slots: slotsNecesarios,
            horaSlotInicio: slotInicio
          };
        }
      }
    }
    
    // ESTRATEGIA 2: Si no hay espacio, buscar desde el inicio del día
    for (const quirofano of quirofanosDisponibles) {
      const { sala, slotsOcupados } = quirofano;
      
      for (let slotInicio = 0; slotInicio <= 48 - slotsNecesarios; slotInicio++) {
        const slotFin = slotInicio + slotsNecesarios;
        
        let hayEmpalme = false;
        for (const ocupado of slotsOcupados) {
          if ((slotInicio >= ocupado.inicio && slotInicio < ocupado.fin) ||
              (slotFin > ocupado.inicio && slotFin <= ocupado.fin) ||
              (slotInicio <= ocupado.inicio && slotFin >= ocupado.fin)) {
            hayEmpalme = true;
            break;
          }
        }
        
        if (!hayEmpalme) {
          const horaInicio = horarios30Minutos[slotInicio];
          const horaFin = horarios30Minutos[slotFin];
          
          console.log(`✅ HORARIO ASIGNADO (Estrategia 2): ${sala} ${horaInicio}-${horaFin}`);
          return { 
            sala, 
            horaInicio, 
            horaFin,
            slots: slotsNecesarios,
            horaSlotInicio: slotInicio
          };
        }
      }
    }
    
    console.log('❌ NO HAY HORARIOS DISPONIBLES EN NINGÚN QUIROFANO');
    return null;
  };

  // --- VERIFICAR ORGANIZACIÓN DE HORARIOS ---
  const verificarOrganizacionHorarios = () => {
    console.log('📊 VERIFICANDO ORGANIZACIÓN DE HORARIOS');
    
    const horariosPorQuirofano = {};
    
    // Agrupar por quirófano
    horarios.forEach(horario => {
      if (!horariosPorQuirofano[horario.quirofano]) {
        horariosPorQuirofano[horario.quirofano] = [];
      }
      horariosPorQuirofano[horario.quirofano].push(horario);
    });
    
    // Verificar cada quirófano
    Object.entries(horariosPorQuirofano).forEach(([quirofano, horariosSala]) => {
      console.log(`\n🏥 ${quirofano}:`);
      
      // Ordenar por hora de inicio
      const horariosOrdenados = horariosSala.sort((a, b) => 
        horarios30Minutos.indexOf(a.horaInicio) - horarios30Minutos.indexOf(b.horaInicio)
      );
      
      horariosOrdenados.forEach((horario, index) => {
        const inicio = horarios30Minutos.indexOf(horario.horaInicio);
        const fin = horarios30Minutos.indexOf(horario.horaFin);
        console.log(`   ${index + 1}. ${horario.horaInicio}-${horario.horaFin} | ${horario.cirugia} | ${horario.duracion || 2}h`);
      });
      
      // Verificar continuidad
      for (let i = 0; i < horariosOrdenados.length - 1; i++) {
        const current = horariosOrdenados[i];
        const next = horariosOrdenados[i + 1];
        
        const finCurrent = horarios30Minutos.indexOf(current.horaFin);
        const inicioNext = horarios30Minutos.indexOf(next.horaInicio);
        
        if (finCurrent > inicioNext) {
          console.log(`❌ EMPALME: ${current.cirugia} (termina ${current.horaFin}) vs ${next.cirugia} (empieza ${next.horaInicio})`);
        }
      }
    });
    
    alert('Verificación completada. Revisa la consola para detalles.');
  };

  // --- ESTADOS ---
  const [userRole, setUserRole] = useState(null);
  const [showEmergenciaModal, setShowEmergenciaModal] = useState(false);
  const [showGestionQuirofanos, setShowGestionQuirofanos] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showGestionCirugias, setShowGestionCirugias] = useState(false);
  const [detalleHorario, setDetalleHorario] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [cirugiasPendientes, setCirugiasPendientes] = useState([]);
  const [cirugiasProgramadas, setCirugiasProgramadas] = useState([]);
  const [quirofanos, setQuirofanos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [nuevoQuirofano, setNuevoQuirofano] = useState({
    sala: '',    
    estado: 'disponible'
  });

  // HORARIOS 24/7 CON INTERVALOS DE 30 MINUTOS - Comienza a las 00:00
  const generarHorarios30Minutos = () => {
    const horarios = [];
    for (let hora = 0; hora < 24; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
      horarios.push(`${hora.toString().padStart(2, '0')}:30`);
    }
    return horarios;
  };

  const horarios30Minutos = generarHorarios30Minutos();

  // Generar fechas de la semana actual
  const generarFechasSemana = () => {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - diaSemana + 1);
    
    const fechas = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + i);
      fechas.push({
        fecha: fecha.toISOString().split('T')[0],
        dia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()],
        fechaFormateada: fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      });
    }
    return fechas;
  };

  const [fechasSemana, setFechasSemana] = useState(generarFechasSemana());

  // --- MAPA DE ESTADOS ---
  const statusMap = {
    Programada: { texto: 'Programada', color: '#3498db', clase: 'programada', duracion: 2 },
    'Baja Urgencia': { texto: 'Baja Urgencia', color: '#27ae60', clase: 'baja', duracion: 3 },
    'Media Urgencia': { texto: 'Media Urgencia', color: '#f39c12', clase: 'medio', duracion: 4 },
    Emergencia: { texto: 'Emergencia', color: '#e74c3c', clase: 'emergencia', duracion: 6 },
    Completada: { texto: 'Completada', color: '#6c757d', clase: 'completada', duracion: 0 },
    'Pendiente de Horario': { texto: 'Pendiente de Horario', color: '#95a5a6', clase: 'pendiente', duracion: 0 },
    'En Proceso': { texto: 'En Proceso', color: '#9b59b6', clase: 'en-proceso', duracion: 0 },
    Cancelada: { texto: 'Cancelada', color: '#e67e22', clase: 'cancelada', duracion: 0 }
  };

  // --- CONFIGURACIÓN AXIOS ---
  const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // --- EFFECTS ---
  useEffect(() => {
    obtenerRolUsuario();
    cargarQuirofanos();
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (showGestionCirugias) {
      cargarCirugiasProgramadas();
    }
  }, [showGestionCirugias]);

  useEffect(() => {
    cargarHorariosPorFecha();
  }, [fechaSeleccionada]);

  // --- FUNCIONES DE CARGA DE DATOS ---
  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarCirugiasPendientes(),
        cargarHorariosPorFecha()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerRolUsuario = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const rol = user.role || user.rol || 'Especialista';
        setUserRole(rol);
      } catch (error) {
        setUserRole('Especialista');
      }
    } else {
      setUserRole('Especialista');
    }
  };

  const esAdministrador = () => {
    return userRole === 'admin' || userRole === 'Administrador';
  };

  const cargarQuirofanos = async () => {
    try {
      console.log('🔄 Cargando quirófanos desde:', API_BASE_QUIROFANOS);
      const response = await axios.get(API_BASE_QUIROFANOS, getConfig());
      
      let datosQuirofanos = [];
      if (Array.isArray(response.data)) {
        datosQuirofanos = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        datosQuirofanos = response.data.data;
      } else if (response.data && Array.isArray(response.data.quirofanos)) {
        datosQuirofanos = response.data.quirofanos;
      }
      
      console.log('🏥 Quirófanos cargados desde BD:', datosQuirofanos);
      
      // Verificar la estructura de los datos
      if (datosQuirofanos.length > 0) {
        console.log('📋 Estructura del primer quirófano:', datosQuirofanos[0]);
      }
      
      setQuirofanos(datosQuirofanos);
    } catch (err) {
      console.error('❌ Error al cargar quirófanos:', err);
      console.error('Detalles del error:', err.response?.data);
      setQuirofanos([]);
    }
  };

  const cargarCirugiasPendientes = async () => {
    try {
      const response = await axios.get(`${API_BASE_CIRUGIAS}/pendientes`, getConfig());
      
      let cirugiasData = [];
      
      if (response.data && response.data.success) {
        cirugiasData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        cirugiasData = response.data;
      }
      
      console.log('📋 Cirugías pendientes cargadas:', cirugiasData);
      setCirugiasPendientes(cirugiasData);
      
    } catch (error) {
      console.error('Error al cargar cirugías pendientes:', error);
      setCirugiasPendientes([]);
    }
  };

  const cargarCirugiasProgramadas = async () => {
    try {
      const response = await axios.get(API_BASE_CIRUGIAS, getConfig());
      
      let cirugiasData = [];
      if (response.data && response.data.success) {
        cirugiasData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        cirugiasData = response.data;
      }
      
      setCirugiasProgramadas(cirugiasData);
    } catch (error) {
      console.error('Error al cargar cirugías programadas:', error);
      setCirugiasProgramadas([]);
    }
  };

  // --- FUNCIÓN MEJORADA PARA EXTRAER Y FORMATEAR HORAS ---
  const extraerHoraFormateada = (horaString) => {
    if (!horaString) return '07:00'; // Hora por defecto
    
    const str = horaString.toString().trim();
    
    // Caso 1: Formato HH:MM:SS
    const matchTime = str.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (matchTime) {
      const horas = matchTime[1].padStart(2, '0');
      const minutos = matchTime[2];
      return `${horas}:${minutos}`;
    }
    
    // Caso 2: Formato ISO "2024-01-01T07:00:00.000Z"
    const matchISO = str.match(/T(\d{1,2}):(\d{2}):/);
    if (matchISO) {
      const horas = matchISO[1].padStart(2, '0');
      const minutos = matchISO[2];
      return `${horas}:${minutos}`;
    }
    
    // Caso 3: Ya está en formato HH:MM
    const matchSimple = str.match(/^(\d{1,2}):(\d{2})$/);
    if (matchSimple) {
      const horas = matchSimple[1].padStart(2, '0');
      const minutos = matchSimple[2];
      return `${horas}:${minutos}`;
    }
    
    console.warn('⚠️ Formato de hora no reconocido:', horaString);
    return '07:00'; // Valor por defecto
  };

  // --- FUNCIÓN MEJORADA PARA CARGAR HORARIOS ---
  const cargarHorariosPorFecha = async () => {
    try {
      console.log('📅 Cargando horarios para fecha:', fechaSeleccionada);
      
      // LIMPIAR HORARIOS ANTES DE CARGAR
      setHorarios([]);
      
      const response = await axios.get(API_BASE_CIRUGIAS, getConfig());
      
      let todasLasCirugias = [];
      if (response.data && response.data.success) {
        todasLasCirugias = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        todasLasCirugias = response.data;
      } else if (response.data && Array.isArray(response.data.cirugias)) {
        todasLasCirugias = response.data.cirugias;
      }

      console.log('📊 Total de cirugías obtenidas:', todasLasCirugias.length);
      
      // FILTRADO ROBUSTO POR FECHA
      const cirugiasDeLaFecha = todasLasCirugias.filter(cirugia => {
        if (!cirugia.fecha) {
          console.log('⚠️ Cirugía sin fecha:', cirugia.id_cirugia);
          return false;
        }
        
        try {
          const fechaCirugia = new Date(cirugia.fecha);
          const fechaSeleccionadaObj = new Date(fechaSeleccionada);
          
          if (isNaN(fechaCirugia.getTime())) {
            console.log('❌ Fecha de cirugía inválida:', cirugia.fecha);
            return false;
          }
          
          // Normalizar a fecha sin hora para comparación
          const fechaCirugiaNormalizada = new Date(fechaCirugia.getFullYear(), fechaCirugia.getMonth(), fechaCirugia.getDate());
          const fechaSeleccionadaNormalizada = new Date(fechaSeleccionadaObj.getFullYear(), fechaSeleccionadaObj.getMonth(), fechaSeleccionadaObj.getDate());
          
          return fechaCirugiaNormalizada.getTime() === fechaSeleccionadaNormalizada.getTime();
          
        } catch (error) {
          console.warn('❌ Error al procesar fecha:', cirugia.fecha, error);
          return false;
        }
      });

      console.log('🎯 Cirugías para la fecha seleccionada:', cirugiasDeLaFecha.length);
      
      // FORMATEAR HORARIOS CON EXTRACCIÓN MEJORADA
      const horariosFormateados = cirugiasDeLaFecha.map(cirugia => {
        try {
          const quirofanoInfo = quirofanos.find(q => 
            q.id_quirofano === cirugia.id_quirofano || 
            q.id === cirugia.id_quirofano
          );
          
          const nombreQuirofano = quirofanoInfo ? 
            (quirofanoInfo.sala || quirofanoInfo.nombre || `Q${quirofanoInfo.id_quirofano || quirofanoInfo.id}`) : 
            `Q${cirugia.id_quirofano || '1'}`;

          // USAR LA FUNCIÓN MEJORADA DE EXTRACCIÓN
          let horaInicio = extraerHoraFormateada(cirugia.hora_inicio);
          let horaFin = extraerHoraFormateada(cirugia.hora_fin);

          // VALIDAR QUE LAS HORAS EXISTAN EN EL ARRAY
          if (!horarios30Minutos.includes(horaInicio)) {
            console.warn('❌ Hora inicio no válida, ajustando:', horaInicio);
            // Encontrar la hora más cercana válida
            const horaCercana = horarios30Minutos.find(h => h >= horaInicio) || '07:00';
            horaInicio = horaCercana;
          }
          
          if (!horarios30Minutos.includes(horaFin)) {
            console.warn('❌ Hora fin no válida, ajustando:', horaFin);
            const horaCercana = horarios30Minutos.find(h => h >= horaFin) || '09:00';
            horaFin = horaCercana;
          }

          // VALIDAR QUE HORA FIN SEA MAYOR QUE HORA INICIO
          const inicioIndex = horarios30Minutos.indexOf(horaInicio);
          const finIndex = horarios30Minutos.indexOf(horaFin);
          
          if (finIndex <= inicioIndex) {
            console.warn('❌ Hora fin menor que hora inicio, ajustando:', horaInicio, horaFin);
            horaFin = horarios30Minutos[inicioIndex + 4]; // 2 horas por defecto
          }

          const horarioFormateado = {
            id: cirugia.id_cirugia || cirugia.id,
            fecha: cirugia.fecha,
            horaInicio: horaInicio,
            horaFin: horaFin,
            quirofano: nombreQuirofano,
            cirugia: cirugia.procedimiento || 'Cirugía',
            especialista: cirugia.especialista || 'Especialista Asignado',
            paciente: cirugia.nombre_paciente || cirugia.paciente || 'Paciente',
            duracion: cirugia.duracion || 2,
            tipo: cirugia.estado || 'Programada',
            color: statusMap[cirugia.estado]?.color || '#3498db',
            clase: statusMap[cirugia.estado]?.clase || 'programada',
            diagnostico_pre: cirugia.diagnostico_pre,
            datosOriginales: { // Para debug
              hora_inicio_original: cirugia.hora_inicio,
              hora_fin_original: cirugia.hora_fin
            }
          };

          console.log('✅ Horario formateado:', {
            paciente: horarioFormateado.paciente,
            quirofano: horarioFormateado.quirofano,
            horario: `${horarioFormateado.horaInicio}-${horarioFormateado.horaFin}`,
            original: cirugia.hora_inicio + ' -> ' + cirugia.hora_fin
          });

          return horarioFormateado;

        } catch (error) {
          console.error('❌ Error al formatear cirugía:', cirugia.id_cirugia, error);
          return null;
        }
      }).filter(horario => horario !== null); // Filtrar nulos

      console.log('✅ Horarios formateados exitosamente:', horariosFormateados.length);
      setHorarios(horariosFormateados);
      
    } catch (error) {
      console.error('❌ Error crítico al cargar horarios:', error);
      setHorarios([]);
    }
  };

  // --- FUNCIÓN NUEVA: Formatear hora para PostgreSQL ---
  const formatTimeForPostgreSQL = (isoString) => {
    if (!isoString) return null;
    
    try {
      // Si ya es formato HH:MM:SS, devolverlo tal cual
      if (typeof isoString === 'string' && isoString.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return isoString;
      }
      
      // Si es formato ISO, extraer solo la parte de tiempo
      if (typeof isoString === 'string' && isoString.includes('T')) {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
          console.warn('⚠️ Fecha ISO inválida:', isoString);
          return '08:00:00'; // Valor por defecto
        }
        return date.toTimeString().split(' ')[0]; // Devuelve "HH:MM:SS"
      }
      
      // Si es solo hora (HH:MM), agregar segundos
      if (typeof isoString === 'string' && isoString.match(/^\d{2}:\d{2}$/)) {
        return isoString + ':00';
      }
      
      console.warn('⚠️ Formato de hora no reconocido:', isoString);
      return '08:00:00'; // Valor por defecto
    } catch (error) {
      console.error('❌ Error al formatear hora:', error, isoString);
      return '08:00:00'; // Valor por defecto
    }
  };

  // --- FUNCIÓN PARA OBTENER ID REAL DEL QUIROFANO ---
  const obtenerIdQuirofanoReal = (nombreQuirofano) => {
    console.log(`🔍 Buscando ID para quirófano: ${nombreQuirofano}`);
    
    // Buscar el quirófano en la lista cargada desde la BD
    const quirofanoEncontrado = quirofanos.find(q => {
      const camposPosibles = ['sala', 'nombre', 'quirofano'];
      for (const campo of camposPosibles) {
        if (q[campo] && q[campo].toString().toLowerCase() === nombreQuirofano.toLowerCase()) {
          return true;
        }
      }
      return false;
    });
    
    if (quirofanoEncontrado) {
      const id = quirofanoEncontrado.id_quirofano || quirofanoEncontrado.id;
      if (id) {
        console.log(`✅ ID encontrado: ${id}`);
        return parseInt(id);
      }
    }
    
    console.warn(`⚠️ Quirófano '${nombreQuirofano}' no encontrado, usando ID 1`);
    return 1;
  };

  // --- FUNCIÓN PARA OBTENER DURACIÓN SEGÚN PROCEDIMIENTO ---
  const obtenerDuracionPorProcedimiento = (procedimiento, urgencia) => {
    // Mapeo de duraciones por tipo de procedimiento (en horas)
    const duracionesProcedimiento = {
      // Cirugías generales
      'Apéndice': 2,
      'Vesícula': 2,
      'Hernia': 2,
      'Cesárea': 2,
      'Cirugía General': 2,
      
      // Cirugías ortopédicas
      'Fractura': 3,
      'Reemplazo Cadera': 4,
      'Artroscopia': 3,
      'Columna': 5,
      
      // Cirugías cardíacas
      'Bypass': 6,
      'Válvula Cardíaca': 5,
      'Cateterismo': 3,
      
      // Neurocirugías
      'Tumor Cerebral': 8,
      'Hernia Discal': 4,
      
      // Por defecto
      'default': 2
    };
    
    // Ajustar por urgencia
    const duracionBase = duracionesProcedimiento[procedimiento] || duracionesProcedimiento.default;
    
    const ajustesUrgencia = {
      'Emergencia': 1.2,    // +20% por emergencia
      'Media Urgencia': 1.1, // +10% 
      'Baja Urgencia': 1.05, // +5%
      'Programada': 1.0      // Sin ajuste
    };
    
    const factorUrgencia = ajustesUrgencia[urgencia] || 1.0;
    const duracionFinal = Math.max(1, Math.ceil(duracionBase * factorUrgencia));
    
    console.log(`⏱️ Duración calculada para "${procedimiento}" (${urgencia}): ${duracionBase} * ${factorUrgencia} = ${duracionFinal}h`);
    
    return duracionFinal;
  };

  // --- DEBUG COMPLETO DE EMPALMES ---
  const debugEmpalmesCompleto = () => {
    console.log('🔍 INICIANDO DEBUG COMPLETO DE EMPALMES');
    
    const empalmes = [];
    
    // Agrupar horarios por quirófano
    const horariosPorQuirofano = {};
    horarios.forEach(horario => {
      if (!horariosPorQuirofano[horario.quirofano]) {
        horariosPorQuirofano[horario.quirofano] = [];
      }
      horariosPorQuirofano[horario.quirofano].push(horario);
    });
    
    // Verificar empalmes en cada quirófano
    Object.entries(horariosPorQuirofano).forEach(([quirofano, horariosSala]) => {
      console.log(`\n📋 ${quirofano}: ${horariosSala.length} horarios`);
      
      // Mostrar todos los horarios de esta sala
      horariosSala.forEach((horario, index) => {
        const inicio = horarios30Minutos.indexOf(horario.horaInicio);
        const fin = horarios30Minutos.indexOf(horario.horaFin);
        console.log(`   ${index + 1}. ${horario.horaInicio}-${horario.horaFin} [${inicio}-${fin}] - ${horario.cirugia}`);
      });
      
      // Verificar empalmes
      for (let i = 0; i < horariosSala.length; i++) {
        for (let j = i + 1; j < horariosSala.length; j++) {
          const h1 = horariosSala[i];
          const h2 = horariosSala[j];
          
          const inicio1 = horarios30Minutos.indexOf(h1.horaInicio);
          const fin1 = horarios30Minutos.indexOf(h1.horaFin);
          const inicio2 = horarios30Minutos.indexOf(h2.horaInicio);
          const fin2 = horarios30Minutos.indexOf(h2.horaFin);
          
          if (inicio1 === -1 || fin1 === -1 || inicio2 === -1 || fin2 === -1) {
            console.warn(`❌ HORARIOS INVÁLIDOS EN ${quirofano}`);
            continue;
          }
          
          const empalma = (
            (inicio1 >= inicio2 && inicio1 < fin2) ||
            (fin1 > inicio2 && fin1 <= fin2) ||
            (inicio1 <= inicio2 && fin1 >= fin2)
          );
          
          if (empalma) {
            const empalmeInfo = {
              quirofano: quirofano,
              conflicto: `"${h1.cirugia}" (${h1.horaInicio}-${h1.horaFin}) vs "${h2.cirugia}" (${h2.horaInicio}-${h2.horaFin})`,
              indices: `${inicio1}-${fin1} vs ${inicio2}-${fin2}`
            };
            empalmes.push(empalmeInfo);
            console.log(`❌ EMPALME DETECTADO:`, empalmeInfo);
          }
        }
      }
    });
    
    // RESULTADO FINAL
    if (empalmes.length > 0) {
      console.log(`\n🚨 SE ENCONTRARON ${empalmes.length} EMPALMES:`);
      empalmes.forEach(e => console.log(`   - ${e.quirofano}: ${e.conflicto}`));
      
      alert(`🚨 EMPALMES ENCONTRADOS (${empalmes.length}):\n\n${
        empalmes.map(e => `• ${e.quirofano}: ${e.conflicto}`).join('\n')
      }`);
    } else {
      console.log('\n✅ NO SE ENCONTRARON EMPALMES');
      alert('✅ No hay empalmes de horario');
    }
    
    return empalmes;
  };

  // --- FUNCIONES DE GESTIÓN DE ESTADOS ---
  const handleCambiarEstadoCirugia = async (idCirugia, nuevoEstado) => {
    try {
      const response = await axios.put(
        `${API_BASE_CIRUGIAS}/${idCirugia}`, 
        { estado: nuevoEstado },
        getConfig()
      );

      if (response.data && response.data.success) {
        alert(`✅ Estado actualizado correctamente a: ${statusMap[nuevoEstado]?.texto || nuevoEstado}`);
        setCirugiasProgramadas(prev => 
          prev.map(c => c.id_cirugia === idCirugia ? { ...c, estado: nuevoEstado } : c)
        );
        setHorarios(prev =>
          prev.map(h => h.id === idCirugia ? { 
            ...h, 
            tipo: nuevoEstado, 
            color: statusMap[nuevoEstado]?.color,
            clase: statusMap[nuevoEstado]?.clase 
          } : h)
        );
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('❌ Error al cambiar el estado de la cirugía.');
    }
  };

  // --- FUNCIONES DE GESTIÓN DE QUIROFANOS ---
  const handleQuirofanoFormChange = (e) => { 
    const { name, value } = e.target;
    setNuevoQuirofano(prev => ({ ...prev, [name]: value })); 
  };

  const handleAgregarQuirofano = async (e) => {
    e.preventDefault();
    if (!esAdministrador()) return;
    
    if (!nuevoQuirofano.sala || !nuevoQuirofano.estado) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      const response = await axios.post(API_BASE_QUIROFANOS, nuevoQuirofano, getConfig());
      setQuirofanos(prev => [...prev, response.data]);
      setNuevoQuirofano({ sala: '', estado: 'disponible' });
      alert('✅ Quirófano agregado correctamente');
    } catch (err) {
      console.error('Error al agregar quirófano:', err);
      alert('Error al agregar quirófano: ' + (err.response?.data?.msg || err.message));
    }
  };

  const handleToggleQuirofanoEstado = async (sala, estadoActual) => { 
    if (!esAdministrador()) return;
    
    let nuevoEstado;
    
    if (estadoActual === 'disponible') {
      nuevoEstado = 'ocupado';
    } else if (estadoActual === 'ocupado') {
      if (tieneCirugiasAsignadas(sala)) { 
        alert(`"${sala}" tiene cirugías asignadas. No se puede poner en mantenimiento.`); 
        return; 
      }
      nuevoEstado = 'mantenimiento';
    } else {
      nuevoEstado = 'disponible';
    }
    
    try {
      await axios.put(`${API_BASE_QUIROFANOS}/${sala}`, { estado: nuevoEstado }, getConfig());
      setQuirofanos(prevQuirofanos => 
        prevQuirofanos.map(q => 
          q.sala === sala ? { ...q, estado: nuevoEstado } : q
        )
      );
      alert(`✅ Estado de ${sala} cambiado a ${nuevoEstado}`);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al actualizar estado: ' + (err.response?.data?.msg || err.message));
    }
  };

  const handleEliminarQuirofano = async (sala) => { 
    if (!esAdministrador()) return;
    
    if (tieneCirugiasAsignadas(sala)) { 
      alert(`"${sala}" tiene cirugías asignadas. No se puede eliminar.`); 
      return; 
    } 
    
    if (window.confirm(`¿Estás seguro de eliminar el quirófano "${sala}"?`)) { 
      try {
        await axios.delete(`${API_BASE_QUIROFANOS}/${sala}`, getConfig());
        setQuirofanos(quirofanos.filter(q => q.sala !== sala));
        alert('✅ Quirófano eliminado correctamente');
      } catch (err) {
        console.error('Error al eliminar quirófano:', err);
        alert('Error al eliminar quirófano: ' + (err.response?.data?.msg || err.message));
      }
    } 
  };

  // --- FUNCIONES HELPER ---
  const tieneCirugiasAsignadas = (salaQuirofano) => 
    Array.isArray(horarios) && horarios.some(h => h.quirofano === salaQuirofano);

  const getHorarioPosicion = (ini, fin) => { 
    const i = horarios30Minutos.indexOf(ini); 
    const f = horarios30Minutos.indexOf(fin); 
    
    if (i === -1 || f === -1 || f <= i) { 
      return { inicio: 0, duracion: 4, altura: 112 };
    } 
    const slots = f - i; 
    return { inicio: i, duracion: slots, altura: slots * 29 - 2 };
  };

  const getHorariosPorQuirofano = (qNom) => {
    return Array.isArray(horarios) ? horarios.filter(h => h.quirofano === qNom) : [];
  };

  // --- EMERGENCIA MEJORADA ---
  const handleEmergenciaConfirm = async (datos) => { 
    try {
      // Calcular duración basada en procedimiento para emergencias también
      const duracion = obtenerDuracionPorProcedimiento(
        datos.tipoCirugia || 'Cirugía General', 
        datos.urgencia || 'Emergencia'
      );
      
      const horarioDisponible = encontrarHorarioDisponible(duracion, datos.urgencia, horarios);
      
      if (!horarioDisponible) {
        alert('❌ No hay horarios disponibles para la emergencia. Todos los quirófanos están ocupados.');
        return;
      }
      
      // USAR LA FUNCIÓN DE FORMATEO
      const horaInicioFormatted = formatTimeForPostgreSQL(horarioDisponible.horaInicio);
      const horaFinFormatted = formatTimeForPostgreSQL(horarioDisponible.horaFin);
      
      // CONVERTIR A ID NUMÉRICO PARA EMERGENCIAS TAMBIÉN
      const idQuirofanoReal = obtenerIdQuirofanoReal(horarioDisponible.sala);
      
      const emergenciaData = {
        procedimiento: datos.tipoCirugia || 'Emergencia',
        nombre_paciente: datos.paciente || 'N/A',
        especialista: datos.especialista || 'Emergencias',
        diagnostico_pre: datos.diagnostico || 'Emergencia',
        fecha: fechaSeleccionada,
        hora_inicio: horaInicioFormatted, // Formato HH:MM:SS
        hora_fin: horaFinFormatted,       // Formato HH:MM:SS
        id_quirofano: idQuirofanoReal,
        estado: 'Emergencia',
        duracion: duracion,
        urgencia: datos.urgencia || 'Emergencia',
        creado_por: 'sistema'
      };
      
      const response = await axios.post(API_BASE_CIRUGIAS, emergenciaData, getConfig());
      
      if (response.data && response.data.success) {
        await cargarHorariosPorFecha();
        alert(`🚨 Emergencia registrada en ${horarioDisponible.sala} de ${horarioDisponible.horaInicio} a ${horarioDisponible.horaFin} (${duracion}h)`);
        setShowEmergenciaModal(false);
      } else {
        alert('❌ Error al registrar la emergencia en la base de datos');
      }
      
    } catch (error) {
      console.error('Error al registrar emergencia:', error);
      alert('❌ Error al registrar emergencia: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleVerDetalleClick = (h) => { 
    setDetalleHorario(h); 
    setShowDetalleModal(true); 
  };

  // --- VARIABLES PARA RENDER ---
  const quirofanoNombres = Array.isArray(quirofanos) ? 
    quirofanos.map(q => q.sala || q.nombre || `Q${q.id_quirofano || q.id}`) : [];
  
  const gridColumnStyle = { 
    gridTemplateColumns: `120px repeat(${quirofanos.length > 0 ? quirofanos.length : 1}, 1fr)` 
  };

  const fechaActual = fechasSemana.find(f => f.fecha === fechaSeleccionada);
  const tituloFecha = fechaActual ? fechaActual.fechaFormateada : '';


  return (
    <div className="horarios-container">
      {/* Header */}
      <div className="horarios-header">
        <h2>Gestión de Horarios - {tituloFecha}</h2>
        
        <div className="header-actions">
          {/* BOTONES SOLO PARA ADMIN */}
          {esAdministrador() && (
            <>
              <button className="btn-quirofanos" onClick={() => setShowGestionQuirofanos(true)}>
                🏥 Gestionar Quirófanos
              </button>
              
              <button 
                className="btn-agregar-horario" 
                onClick={handleGenerarHorario}
                disabled={generando || cirugiasPendientes.length === 0}
              >
                {generando ? '⏳ Generando...' : `⏰ Generar Horarios (${cirugiasPendientes.length})`}
              </button>
              
              <button className="btn-tabla-horarios" onClick={() => setShowGestionCirugias(true)}>
                📋 Gestionar Cirugías
              </button>

              <div style={{display: 'flex', gap: '10px'}}>
                <button 
                  onClick={debugEmpalmesCompleto}
                  style={{background: '#ff6b6b', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer'}}
                >
                  🔍 Debug Empalmes
                </button>
                <button 
                  onClick={verificarOrganizacionHorarios}
                  style={{background: '#3498db', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer'}}
                >
                  📊 Verificar Organización
                </button>
              </div>
            </>
          )}
          
          {/* BOTÓN EMERGENCIA PARA TODOS */}
          <button className="emergency-btn-horarios" onClick={() => setShowEmergenciaModal(true)}>
            🚨 Registrar Emergencia
          </button>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="dias-semana-tabs">
        {fechasSemana.map(({fecha, dia, fechaFormateada}) => (
          <button 
            key={fecha} 
            className={`dia-tab ${fechaSeleccionada === fecha ? 'active' : ''}`} 
            onClick={() => setFechaSeleccionada(fecha)}
          >
            {dia}<br />
            <small>{fecha.split('-')[2]}/{fecha.split('-')[1]}</small>
          </button>
        ))}
      </div>

      {/* Leyenda */}
      <div className="leyenda-horarios">
        <h4>Leyenda de Estado/Urgencia:</h4>
        <div className="leyenda-items">
          {Object.entries(statusMap).map(([key, value]) => (
            <div key={key} className="leyenda-item">
              <div className={`color-box ${value.clase}`}></div>
              <span>{value.texto}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{textAlign: 'center', padding: '20px'}}>
          <p>Cargando datos...</p>
        </div>
      )}

      {/* Info de cirugías pendientes */}
      {esAdministrador() && cirugiasPendientes.length > 0 && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>📋 {cirugiasPendientes.length} cirugías pendientes de horario</strong>
          <div style={{marginTop: '10px'}}>
            {cirugiasPendientes.slice(0, 3).map(cirugia => (
              <button
                key={cirugia.id_cirugia}
                onClick={() => handleAsignarHorarioCirugia(cirugia)}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  margin: '0 5px',
                  cursor: 'pointer'
                }}
              >
                {cirugia.procedimiento}
              </button>
            ))}
            {cirugiasPendientes.length > 3 && <span>... y {cirugiasPendientes.length - 3} más</span>}
          </div>
        </div>
      )}

      {/* Calendar Grid 24/7 con intervalos de 30 minutos - INICIA 00:00 */}
      <div className="calendario-horarios">
        <div className="calendario-header" style={gridColumnStyle}>
          <div className="hora-header">Horas</div>
          {quirofanos.map(q => {
            let estadoTexto = '✅ Disponible'; 
            if (q.estado === 'ocupado') estadoTexto = '🔴 Ocupado'; 
            if (q.estado === 'mantenimiento') estadoTexto = '🛠️ Mantenimiento';
            
            return (
              <div key={q.sala} className="quirofano-header">
                <span className="quirofano-nombre" translate="no">{q.sala}</span>
                <span className={`quirofano-estado estado-${q.estado}`}>
                  {estadoTexto}
                </span>
              </div>
            );
          })}
          {quirofanos.length === 0 && <div className="quirofano-header">-</div>}
        </div>

        <div className="calendario-body" style={gridColumnStyle}>
          <div className="horas-columna">
            {horarios30Minutos.map(hora => (
              <div key={hora} className="hora-slot">
                <span className="hora-texto">{hora}</span>
                <div className="linea-hora"></div>
              </div>
            ))}
          </div>

          {quirofanoNombres.map(nombreQuirofano => (
            <div key={nombreQuirofano} className="quirofano-columna">
              {horarios30Minutos.map((hora) => (
                <div key={`${nombreQuirofano}-${hora}`} className="celda-horario">
                  <div className="linea-hora-interna"></div>
                </div>
              ))}
              {getHorariosPorQuirofano(nombreQuirofano).map(horario => {
                const posicion = getHorarioPosicion(horario.horaInicio, horario.horaFin);
                return (
                  <div
                    key={horario.id}
                    className={`cirugia-block ${horario.clase}`}
                    style={{ 
                      top: `${posicion.inicio * 29 + 1}px`,
                      height: `${posicion.altura}px`
                    }}
                    onClick={() => handleVerDetalleClick(horario)}
                    title="Ver Detalles"
                  >
                    <div className="cirugia-content">
                      <div className="cirugia-titulo">{horario.cirugia}</div>
                      <div className="cirugia-especialista">{horario.especialista}</div>
                      <div className="cirugia-paciente">{horario.paciente}</div>
                      <div className="cirugia-horario">{horario.horaInicio} - {horario.horaFin}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {quirofanos.length === 0 && <div className="quirofano-columna"></div>}
        </div>
      </div>

      {/* MODALES (se mantienen igual que en tu código original) */}
      {showGestionQuirofanos && esAdministrador() && ( 
        <div className="modal-overlay">
          <div className="modal-quirofanos">
            <div className="modal-header">
              <h2>🏥 Gestión de Quirófanos</h2>
              <button className="close-button" onClick={() => setShowGestionQuirofanos(false)}>×</button>
            </div>

            <form className="form-agregar-quirofano" onSubmit={handleAgregarQuirofano}>
              <h3>➕ Agregar Nuevo Quirófano</h3>
              <div className="form-agregar-inputs">
                <input 
                  type="text" 
                  name="sala" 
                  placeholder="Nombre (ej: Q1)" 
                  value={nuevoQuirofano.sala} 
                  onChange={handleQuirofanoFormChange} 
                  required 
                />
                <select 
                  name="estado" 
                  value={nuevoQuirofano.estado} 
                  onChange={handleQuirofanoFormChange}
                >
                  <option value="disponible">Disponible</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
                <button type="submit" className="btn-guardar-quirofano">+</button>
              </div>
            </form>

            <div className="quirofanos-grid-modal">
              {quirofanos.length === 0 ? (
                <p style={{textAlign: 'center', color: '#7f8c8d', padding: '20px', gridColumn: '1/-1'}}>
                  No hay quirófanos registrados
                </p>
              ) : (
                quirofanos.map(quirofano => (
                  <div key={quirofano.sala} className={`quirofano-card-modal ${quirofano.estado}`}>
                    <h3>{quirofano.sala}</h3>
                    <div className={`estado ${quirofano.estado}`}>
                      {quirofano.estado === 'disponible' && '✅ Disponible'}
                      {quirofano.estado === 'ocupado' && '🔴 Ocupado'}
                      {quirofano.estado === 'mantenimiento' && '🛠️ Mantenimiento'}
                    </div>
                    <div className="equipamiento">
                      {tieneCirugiasAsignadas(quirofano.sala) 
                        ? '📋 Tiene cirugías asignadas' 
                        : '📭 Sin cirugías asignadas'}
                    </div>
                    <div className="quirofano-actions-modal">
                      <button 
                        className="btn-editar-quirofano"
                        onClick={() => handleToggleQuirofanoEstado(quirofano.sala, quirofano.estado)}
                      >
                        🔄 Cambiar Estado
                      </button>
                      <button 
                        className="btn-eliminar-quirofano"
                        onClick={() => handleEliminarQuirofano(quirofano.sala)}
                        disabled={tieneCirugiasAsignadas(quirofano.sala)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              className="btn-cerrar-quirofanos" 
              onClick={() => setShowGestionQuirofanos(false)}
            >
              Cerrar Gestión
            </button>
          </div>
        </div>
      )}

      {/* MODAL GESTIÓN DE CIRUGÍAS */}
      {showGestionCirugias && esAdministrador() && (
        <div className="modal-overlay">
          <div className="modal-agregar-horario" style={{maxWidth: '900px'}}>
            <div className="modal-header">
              <h2>📋 Gestión Completa de Cirugías</h2>
              <button className="close-button" onClick={() => setShowGestionCirugias(false)}>×</button>
            </div>
            
            <div className="horario-form">
              <div className="form-group">
                <h4>Cirugías Programadas ({cirugiasProgramadas.length})</h4>
                <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                  {cirugiasProgramadas.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#7f8c8d', padding: '20px'}}>
                      No hay cirugías programadas
                    </p>
                  ) : (
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                      <thead>
                        <tr style={{backgroundColor: '#f8f9fa'}}>
                          <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'left'}}>Paciente</th>
                          <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'left'}}>Procedimiento</th>
                          <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'left'}}>Fecha</th>
                          <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'left'}}>Estado</th>
                          <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'left'}}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cirugiasProgramadas.map(cirugia => (
                          <tr key={cirugia.id_cirugia}>
                            <td style={{padding: '10px', border: '1px solid #ddd'}}>
                              {cirugia.nombre_paciente || 'N/A'}
                            </td>
                            <td style={{padding: '10px', border: '1px solid #ddd'}}>
                              {cirugia.procedimiento}
                            </td>
                            <td style={{padding: '10px', border: '1px solid #ddd'}}>
                              {cirugia.fecha ? new Date(cirugia.fecha).toLocaleDateString() : 'No asignada'}
                            </td>
                            <td style={{padding: '10px', border: '1px solid #ddd'}}>
                              <select 
                                value={cirugia.estado || 'Programada'}
                                onChange={(e) => handleCambiarEstadoCirugia(cirugia.id_cirugia, e.target.value)}
                                style={{
                                  padding: '5px',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd',
                                  backgroundColor: statusMap[cirugia.estado]?.color || '#3498db',
                                  color: 'white',
                                  width: '100%'
                                }}
                              >
                                {Object.entries(statusMap).map(([key, value]) => (
                                  <option key={key} value={key} style={{backgroundColor: 'white', color: 'black'}}>
                                    {value.texto}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{padding: '10px', border: '1px solid #ddd'}}>
                              <button
                                onClick={() => {
                                  setDetalleHorario(cirugia);
                                  setShowDetalleModal(true);
                                }}
                                style={{
                                  background: '#3498db',
                                  color: 'white',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                👁️ Ver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowGestionCirugias(false)} className="btn-cancelar">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {showDetalleModal && detalleHorario && (
        <div className="modal-overlay">
          <div className="modal-detalle-horario">
            <div className="modal-header" style={{backgroundColor: statusMap[detalleHorario.estado]?.color || '#3498db'}}>
              <h2>Detalles de la Cirugía</h2>
              <button className="close-button" onClick={() => setShowDetalleModal(false)}>×</button>
            </div>
            <div className="detalle-content">
              <div className="detalle-item full-width" style={{borderLeftColor: statusMap[detalleHorario.estado]?.color || '#3498db'}}>
                <label>Paciente</label>
                <span>{detalleHorario.nombre_paciente || detalleHorario.paciente || 'N/A'}</span>
              </div>
              <div className="detalle-item" style={{borderLeftColor: statusMap[detalleHorario.estado]?.color || '#3498db'}}>
                <label>Procedimiento</label>
                <span>{detalleHorario.procedimiento || detalleHorario.cirugia}</span>
              </div>
              <div className="detalle-item" style={{borderLeftColor: statusMap[detalleHorario.estado]?.color || '#3498db'}}>
                <label>Fecha</label>
                <span>{detalleHorario.fecha ? new Date(detalleHorario.fecha).toLocaleDateString() : 'No asignada'}</span>
              </div>
              <div className="detalle-item" style={{borderLeftColor: statusMap[detalleHorario.estado]?.color || '#3498db'}}>
                <label>Horario</label>
                <span>{detalleHorario.horaInicio ? `${detalleHorario.horaInicio} - ${detalleHorario.horaFin}` : 'No asignado'}</span>
              </div>
              <div className="detalle-item" style={{borderLeftColor: statusMap[detalleHorario.estado]?.color || '#3498db'}}>
                <label>Estado</label>
                <span style={{color: statusMap[detalleHorario.estado]?.color || '#3498db', fontWeight:'bold'}}>
                  {statusMap[detalleHorario.estado]?.texto || detalleHorario.estado}
                </span>
              </div>
              <div className="detalle-item full-width" style={{borderLeftColor: statusMap[detalleHorario.estado]?.color || '#3498db'}}>
                <label>Diagnóstico</label>
                <span>{detalleHorario.diagnostico_pre || 'No especificado'}</span>
              </div>
            </div>
            <div className="modal-actions-detalle">
              <button onClick={() => setShowDetalleModal(false)} className="btn-cancelar">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <EmergenciaModal 
        isOpen={showEmergenciaModal} 
        onClose={() => setShowEmergenciaModal(false)} 
        onConfirm={handleEmergenciaConfirm} 
      />
    </div>
  );
};

export default Horarios;