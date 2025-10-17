import React, { useState } from 'react';
import EmergenciaModal from './EmergenciaModal';
import '../styles/Horarios.css';

const Horarios = ({ user }) => {
  const [showEmergenciaModal, setShowEmergenciaModal] = useState(false);
  const [showQuirofanos, setShowQuirofanos] = useState(false);
  const [showRegistrarHorario, setShowRegistrarHorario] = useState(false);
  
  // DEBUG - Verificar en consola
  console.log("🛠️ DEBUG HORARIOS - INICIO");
  console.log("User:", user);
  console.log("User role:", user?.role);
  console.log("User role lowercase:", user?.role?.toLowerCase());
  console.log("Is admin?", user?.role?.toLowerCase() === "administrador");
  console.log("🛠️ DEBUG HORARIOS - FIN");

  // ESTADO VACÍO - SIN DATOS POR DEFECTO
  const [calendario, setCalendario] = useState({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: []
  });

  const [quirofanos, setQuirofanos] = useState([
    { id: 1, nombre: 'Quirófano 1', estado: 'disponible', equipamiento: 'Avanzado' },
    { id: 2, nombre: 'Quirófano 2', estado: 'disponible', equipamiento: 'Básico' },
    { id: 3, nombre: 'Quirófano 3', estado: 'disponible', equipamiento: 'Especializado' }
  ]);

  const [nuevoHorario, setNuevoHorario] = useState({
    dia: 'lunes',
    hora: '',
    quirofano: '',
    cirugia: '',
    especialista: '',
    duracion: '1'
  });

  // LÓGICA DE ROLES
  const userRole = user?.role?.toLowerCase() || '';
  const isAdmin = userRole === 'administrador' || userRole === 'admin';

  const handleEmergenciaConfirm = (datosCirugia) => {
    console.log('Datos de cirugía de emergencia:', datosCirugia);
    alert(`🚨 Cirugía de emergencia registrada para: ${datosCirugia.paciente}`);
  };

  // FUNCIÓN PARA REGISTRAR HORARIOS
  const handleRegistrarHorario = (e) => {
    e.preventDefault();
    
    if (!nuevoHorario.hora || !nuevoHorario.quirofano || !nuevoHorario.cirugia || !nuevoHorario.especialista) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const nuevoHorarioObj = {
      id: Date.now(),
      hora: nuevoHorario.hora,
      quirofano: nuevoHorario.quirofano,
      cirugia: nuevoHorario.cirugia,
      especialista: nuevoHorario.especialista,
      duracion: nuevoHorario.duracion,
      estado: 'asignada'
    };

    // AGREGAR AL CALENDARIO
    setCalendario(prev => ({
      ...prev,
      [nuevoHorario.dia]: [...prev[nuevoHorario.dia], nuevoHorarioObj].sort((a, b) => a.hora.localeCompare(b.hora))
    }));

    alert('✅ Horario registrado exitosamente');
    setShowRegistrarHorario(false);
    setNuevoHorario({
      dia: 'lunes',
      hora: '',
      quirofano: '',
      cirugia: '',
      especialista: '',
      duracion: '1'
    });
  };

  // FUNCIÓN PARA ELIMINAR HORARIO
  const handleEliminarHorario = (dia, id) => {
    if (window.confirm('¿Estás seguro de eliminar este horario?')) {
      setCalendario(prev => ({
        ...prev,
        [dia]: prev[dia].filter(horario => horario.id !== id)
      }));
      alert('Horario eliminado');
    }
  };

  // VISTA DE QUIROFANOS
  if (showQuirofanos) {
    return (
      <div className="quirofanos-container">
        <div className="quirofanos-header">
          <button onClick={() => setShowQuirofanos(false)} className="btn-volver">
            ← Volver a Horarios
          </button>
          <h2>Gestión de Quirófanos</h2>
        </div>

        <div className="quirofanos-content">
          <div className="quirofanos-grid">
            {quirofanos.map(quirofano => (
              <div key={quirofano.id} className={`quirofano-card ${quirofano.estado}`}>
                <h3>{quirofano.nombre}</h3>
                <p className={`estado ${quirofano.estado}`}>
                  {quirofano.estado === 'disponible' ? '✅ Disponible' : '🔴 Ocupado'}
                </p>
                <p className="equipamiento">Equipamiento: {quirofano.equipamiento}</p>
                <div className="quirofano-actions">
                  <button>Editar</button>
                  <button>Ver Detalles</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL - ESTILO TABLA
  return (
    <div className="horarios-container">
      <div className="horarios-header">
        <h2>Gestión de Horarios</h2>
        <div className="header-actions">
          <button 
            className="quirofanos-btn"
            onClick={() => setShowQuirofanos(true)}
          >
            🏥 Quirófanos
          </button>
          
          {/* BOTÓN TEMPORAL - SIEMPRE VISIBLE PARA DEBUG */}
          <button 
            className="registrar-horario-btn"
            onClick={() => setShowRegistrarHorario(true)}
          >
            ➕ Agregar Horario
          </button>
          
          {/* BOTÓN REAL - SOLO PARA ADMIN */}
          {isAdmin && (
            <button 
              className="registrar-horario-btn"
              onClick={() => setShowRegistrarHorario(true)}
            >
              ➕ Agregar Horario
            </button>
          )}
          
          <button 
            className="emergency-btn-horarios"
            onClick={() => setShowEmergenciaModal(true)}
          >
            🚨 Cirugía de Emergencia
          </button>
        </div>
      </div>

      {/* TABLA DE HORARIOS */}
      <div className="tabla-horarios-container">
        <div className="tabla-header">
          <h3>Horarios Programados</h3>
          <div className="tabla-stats">
            <span className="total-cirugias">
              Total: {Object.values(calendario).flat().length} cirugías
            </span>
          </div>
        </div>

        <div className="tabla-horarios">
          <table className="horarios-table">
            <thead>
              <tr>
                <th>Día</th>
                <th>Hora</th>
                <th>Quirófano</th>
                <th>Cirugía</th>
                <th>Especialista</th>
                <th>Duración</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {Object.entries(calendario).map(([dia, horarios]) =>
                horarios.map(horario => (
                  <tr key={horario.id} className="fila-horario">
                    <td className="dia-cell">{dia.charAt(0).toUpperCase() + dia.slice(1)}</td>
                    <td className="hora-cell">{horario.hora}</td>
                    <td className="quirofano-cell">{horario.quirofano}</td>
                    <td className="cirugia-cell">{horario.cirugia}</td>
                    <td className="especialista-cell">{horario.especialista}</td>
                    <td className="duracion-cell">{horario.duracion}h</td>
                    {isAdmin && (
                      <td className="acciones-cell">
                        <button 
                          className="btn-eliminar"
                          onClick={() => handleEliminarHorario(dia, horario.id)}
                          title="Eliminar horario"
                        >
                          🗑️
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
              
              {Object.values(calendario).flat().length === 0 && (
                <tr className="fila-vacia">
                  <td colSpan={isAdmin ? "7" : "6"} className="mensaje-vacio">
                    <div className="contenido-vacio">
                      <span>📅</span>
                      <p>No hay horarios programados</p>
                      {isAdmin && (
                        <button 
                          className="btn-agregar-primero"
                          onClick={() => setShowRegistrarHorario(true)}
                        >
                          ➕ Agregar primer horario
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* BOTÓN EDITAR HORARIOS - DEBAJO DE LA TABLA - SOLO PARA ADMIN */}
        {isAdmin && (
          <div className="tabla-actions">
            <button 
              className="editar-horarios-btn"
              onClick={() => alert('Funcionalidad de edición en desarrollo')}
            >
              ✏️ Editar Horarios
            </button>
          </div>
        )}
      </div>

      {/* MODAL AGREGAR HORARIO */}
      {showRegistrarHorario && (
        <div className="modal-overlay">
          <div className="modal-horario">
            <div className="modal-header">
              <h3>Agregar Nuevo Horario</h3>
              <button className="close-button" onClick={() => setShowRegistrarHorario(false)}>×</button>
            </div>
            
            <form onSubmit={handleRegistrarHorario} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Día de la Semana</label>
                  <select 
                    name="dia" 
                    value={nuevoHorario.dia} 
                    onChange={(e) => setNuevoHorario({...nuevoHorario, dia: e.target.value})}
                    required
                  >
                    <option value="lunes">Lunes</option>
                    <option value="martes">Martes</option>
                    <option value="miercoles">Miércoles</option>
                    <option value="jueves">Jueves</option>
                    <option value="viernes">Viernes</option>
                    <option value="sabado">Sábado</option>
                    <option value="domingo">Domingo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Hora de Inicio</label>
                  <input 
                    type="time" 
                    name="hora" 
                    value={nuevoHorario.hora} 
                    onChange={(e) => setNuevoHorario({...nuevoHorario, hora: e.target.value})} 
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quirófano</label>
                  <select 
                    name="quirofano" 
                    value={nuevoHorario.quirofano} 
                    onChange={(e) => setNuevoHorario({...nuevoHorario, quirofano: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar quirófano</option>
                    {quirofanos.filter(q => q.estado === 'disponible').map(quirofano => (
                      <option key={quirofano.id} value={quirofano.nombre}>
                        {quirofano.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Duración (horas)</label>
                  <select 
                    name="duracion" 
                    value={nuevoHorario.duracion} 
                    onChange={(e) => setNuevoHorario({...nuevoHorario, duracion: e.target.value})}
                  >
                    <option value="1">1 hora</option>
                    <option value="2">2 horas</option>
                    <option value="3">3 horas</option>
                    <option value="4">4 horas</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de Cirugía</label>
                <input 
                  type="text" 
                  name="cirugia" 
                  value={nuevoHorario.cirugia} 
                  onChange={(e) => setNuevoHorario({...nuevoHorario, cirugia: e.target.value})} 
                  placeholder="Ej: Cirugía Cardíaca, Abdominal, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label>Especialista Asignado</label>
                <input 
                  type="text" 
                  name="especialista" 
                  value={nuevoHorario.especialista} 
                  onChange={(e) => setNuevoHorario({...nuevoHorario, especialista: e.target.value})} 
                  placeholder="Nombre del especialista"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowRegistrarHorario(false)} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-confirmar">
                  Guardar Horario
                </button>
              </div>
            </form>
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