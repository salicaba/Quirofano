import React, { useState } from 'react';
import '../styles/EquipoMedico.css';

const EquipoMedico = () => {
  // Datos mock
  const quirofanosMock = [
    { id: 1, nombre: 'Quirófano 1', estado: 'disponible' },
    { id: 2, nombre: 'Quirófano 2', estado: 'disponible' },
    { id: 3, nombre: 'Quirófano 3', estado: 'ocupado' }
  ];

  // Estados principales
  const [equipos, setEquipos] = useState([
    { 
      id: 1, 
      nombreEquipo: 'Equipo Cardíaco Avanzado', 
      quirofanoAsignado: 'Quirófano 1',
      estado: 'disponible',
      especialistas: [
        { id: 1, nombre: 'Dr. Carlos García', cedula: '12345678' },
        { id: 2, nombre: 'Dra. Ana López', cedula: '87654321' }
      ]
    }
  ]);

  const [formState, setFormState] = useState({
    nombreEquipo: '',
    quirofanoAsignado: '',
    estado: 'disponible'
  });

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [editando, setEditando] = useState(false);
  const [gestionandoEspecialistas, setGestionandoEspecialistas] = useState(false);
  const [especialistasSeleccionados, setEspecialistasSeleccionados] = useState([]);
  const [nuevoEspecialista, setNuevoEspecialista] = useState('');
  const [nuevaCedula, setNuevaCedula] = useState('');

  // 🔄 MANEJADORES PRINCIPALES
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editando) {
      const equiposActualizados = equipos.map(equipo =>
        equipo.id === equipoSeleccionado.id 
          ? { ...formState, id: equipoSeleccionado.id, especialistas: equipo.especialistas || [] }
          : equipo
      );
      setEquipos(equiposActualizados);
    } else {
      const nuevoEquipo = {
        id: Date.now(),
        ...formState,
        especialistas: []
      };
      setEquipos([...equipos, nuevoEquipo]);
    }

    setFormState({
      nombreEquipo: '',
      quirofanoAsignado: '',
      estado: 'disponible'
    });
    setEditando(false);
  };

  const handleVerDetalles = (equipo) => {
    setEquipoSeleccionado(equipo);
    setEspecialistasSeleccionados(equipo.especialistas || []);
  };

  const handleVolverALista = () => {
    setEquipoSeleccionado(null);
    setEditando(false);
    setGestionandoEspecialistas(false);
  };

  const handleEliminar = (id) => {
    setEquipos(equipos.filter(equipo => equipo.id !== id));
    setEquipoSeleccionado(null);
  };

  const handleEditar = () => {
    setFormState({ ...equipoSeleccionado });
    setEditando(true);
  };

  // 🆕 MANEJADORES PARA ESPECIALISTAS (VERSIÓN MEJORADA)
  const handleGestionarEspecialistas = (equipo) => {
    setEquipoSeleccionado(equipo);
    setEspecialistasSeleccionados(equipo.especialistas || []);
    setGestionandoEspecialistas(true);
  };

  const handleAgregarEspecialista = () => {
    if (nuevoEspecialista.trim() && nuevaCedula.trim() && !especialistasSeleccionados.some(esp => esp.nombre === nuevoEspecialista.trim())) {
      const nuevoEspecialistaObj = {
        nombre: nuevoEspecialista.trim(),
        cedula: nuevaCedula.trim(),
        id: Date.now()
      };
      setEspecialistasSeleccionados([...especialistasSeleccionados, nuevoEspecialistaObj]);
      setNuevoEspecialista('');
      setNuevaCedula('');
    }
  };

  const handleEliminarEspecialista = (id) => {
    setEspecialistasSeleccionados(especialistasSeleccionados.filter(esp => esp.id !== id));
  };

  const handleGuardarEspecialistas = () => {
    const equiposActualizados = equipos.map(equipo =>
      equipo.id === equipoSeleccionado.id
        ? { ...equipo, especialistas: especialistasSeleccionados }
        : equipo
    );
    setEquipos(equiposActualizados);
    setGestionandoEspecialistas(false);
  };

  // 🎨 VISTA: GESTIÓN DE ESPECIALISTAS (MEJORADA)
  if (gestionandoEspecialistas && equipoSeleccionado) {
    return (
      <div className="gestion-especialistas-container">
        <div className="detalles-header">
          <button onClick={() => setGestionandoEspecialistas(false)} className="btn-volver">
            ← Volver a detalles
          </button>
          <h2>Gestionar Especialistas: {equipoSeleccionado.nombreEquipo}</h2>
        </div>

        <div className="gestion-mejorada">
          {/* FORMULARIO MEJORADO PARA AGREGAR */}
          <div className="form-agregar-mejorado">
            <h3>🆕 Agregar Nuevo Especialista</h3>
            <div className="campos-especialista">
              <div className="campo-group">
                <label>Nombre Completo *</label>
                <input 
                  type="text"
                  value={nuevoEspecialista}
                  onChange={(e) => setNuevoEspecialista(e.target.value)}
                  placeholder="Ej: Dr. Juan Pérez García"
                  onKeyPress={(e) => e.key === 'Enter' && handleAgregarEspecialista()}
                />
              </div>
              <div className="campo-group">
                <label>Cédula Profesional *</label>
                <input 
                  type="text"
                  value={nuevaCedula}
                  onChange={(e) => setNuevaCedula(e.target.value)}
                  placeholder="Ej: 12345678"
                  onKeyPress={(e) => e.key === 'Enter' && handleAgregarEspecialista()}
                />
              </div>
              <button 
                onClick={handleAgregarEspecialista} 
                className="btn-agregar-especialista"
                disabled={!nuevoEspecialista.trim() || !nuevaCedula.trim()}
              >
                👨‍⚕️ Agregar Especialista
              </button>
            </div>
          </div>

          {/* LISTA MEJORADA DE ESPECIALISTAS */}
          <div className="lista-especialistas-mejorada">
            <div className="header-lista-especialistas">
              <h3>👥 Especialistas del Equipo</h3>
              <span className="contador">{especialistasSeleccionados.length} especialistas</span>
            </div>
            
            {especialistasSeleccionados.length > 0 ? (
              <div className="lista-mejorada">
                {especialistasSeleccionados.map((especialista) => (
                  <div key={especialista.id} className="item-especialista-mejorado">
                    <div className="info-especialista">
                      <div className="avatar-especialista">
                        {especialista.nombre.charAt(0)}
                      </div>
                      <div className="datos-especialista">
                        <h4 className="nombre-especialista">{especialista.nombre}</h4>
                        <p className="cedula-especialista">Cédula: {especialista.cedula}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEliminarEspecialista(especialista.id)}
                      className="btn-eliminar-especialista"
                      title="Eliminar especialista"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sin-especialistas-mejorado">
                <div className="icono-vacio">👨‍⚕️</div>
                <p>No hay especialistas en este equipo</p>
                <small>Agrega especialistas usando el formulario de arriba</small>
              </div>
            )}
          </div>

          <div className="gestion-actions-mejoradas">
            <button onClick={handleGuardarEspecialistas} className="btn-guardar-mejorado">
              💾 Guardar Especialistas
            </button>
            <button onClick={() => setGestionandoEspecialistas(false)} className="btn-cancelar-mejorado">
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🎨 VISTA: DETALLES DEL EQUIPO
  if (equipoSeleccionado && !editando && !gestionandoEspecialistas) {
    return (
      <div className="detalles-paciente-container">
        <div className="detalles-header">
          <button onClick={handleVolverALista} className="btn-volver">
            ← Volver a la lista
          </button>
          <h2>Detalles del Equipo</h2>
        </div>

        <div className="detalles-paciente">
          <div className="paciente-card-detalle">
            <div className="paciente-header">
              <div className="paciente-avatar">🏗️</div>
              <h3>{equipoSeleccionado.nombreEquipo}</h3>
              <span className="paciente-id">ID: {equipoSeleccionado.id}</span>
            </div>
            
            <div className="paciente-datos">
              <div className="dato-item">
                <label>Quirófano Asignado</label>
                <span>{equipoSeleccionado.quirofanoAsignado || 'No asignado'}</span>
              </div>
              <div className="dato-item">
                <label>Estado</label>
                <span className={`estado ${equipoSeleccionado.estado}`}>
                  {equipoSeleccionado.estado === 'disponible' ? '✅ Disponible' : '🛠️ Mantenimiento'}
                </span>
              </div>
              <div className="dato-item">
                <label>Especialistas Asignados</label>
                <div className="especialistas-lista">
                  {equipoSeleccionado.especialistas && equipoSeleccionado.especialistas.length > 0 ? (
                    equipoSeleccionado.especialistas.map((especialista, index) => (
                      <div key={especialista.id} className="especialista-tag-completo">
                        <span className="nombre-tag">{especialista.nombre}</span>
                        <span className="cedula-tag">Cédula: {especialista.cedula}</span>
                      </div>
                    ))
                  ) : (
                    <span>No hay especialistas asignados</span>
                  )}
                </div>
              </div>
            </div>

            <div className="detalles-actions">
              <button onClick={() => handleGestionarEspecialistas(equipoSeleccionado)} className="btn-especialistas">
                👥 Gestionar Especialistas
              </button>
              <button onClick={handleEditar} className="btn-editar">
                ✏️ Editar Equipo
              </button>
              <button 
                onClick={() => handleEliminar(equipoSeleccionado.id)} 
                className="btn-eliminar"
              >
                🗑️ Eliminar Equipo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🎨 VISTA: EDITANDO EQUIPO
  if (editando) {
    return (
      <div className="detalles-paciente-container">
        <div className="detalles-header">
          <button onClick={handleVolverALista} className="btn-volver">
            ← Cancelar Edición
          </button>
          <h2>Editando Equipo</h2>
        </div>

        <div className="detalles-paciente">
          <div className="form-paciente-editar">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Equipo:</label>
                <input 
                  type="text" 
                  name="nombreEquipo" 
                  value={formState.nombreEquipo || ''} 
                  onChange={handleInputChange} 
                  placeholder="Nombre del equipo" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Quirófano Asignado:</label>
                <select 
                  name="quirofanoAsignado" 
                  value={formState.quirofanoAsignado || ''} 
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar quirófano</option>
                  {quirofanosMock.filter(q => q.estado === 'disponible').map(quirofano => (
                    <option key={quirofano.id} value={quirofano.nombre}>
                      {quirofano.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Estado:</label>
                <select 
                  name="estado" 
                  value={formState.estado || ''} 
                  onChange={handleInputChange}
                >
                  <option value="disponible">Disponible</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                </select>
              </div>

              <div className="form-actions-editar">
                <button type="submit" className="btn-guardar">
                  💾 Guardar Cambios
                </button>
                <button type="button" onClick={handleVolverALista} className="btn-cancelar">
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 🎨 VISTA PRINCIPAL: FORMULARIO + LISTA
  return (
    <div className="pacientes-container">
      <h2>Gestión de Equipo Médico</h2>
      
      <div className="pacientes-content-layout">
        {/* FORMULARIO IZQUIERDO */}
        <div className="form-paciente">
          <h3>{editando ? 'Editando Equipo' : 'Crear Nuevo Equipo'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre del Equipo:</label>
              <input 
                type="text" 
                name="nombreEquipo" 
                value={formState.nombreEquipo} 
                onChange={handleInputChange} 
                placeholder="Ej: Equipo Cardíaco Avanzado" 
                required
              />
            </div>

            <div className="form-group">
              <label>Quirófano Asignado:</label>
              <select 
                name="quirofanoAsignado" 
                value={formState.quirofanoAsignado} 
                onChange={handleInputChange}
              >
                <option value="">Seleccionar quirófano</option>
                {quirofanosMock.filter(q => q.estado === 'disponible').map(quirofano => (
                  <option key={quirofano.id} value={quirofano.nombre}>
                    {quirofano.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Estado:</label>
              <select 
                name="estado" 
                value={formState.estado} 
                onChange={handleInputChange}
              >
                <option value="disponible">Disponible</option>
                <option value="mantenimiento">En Mantenimiento</option>
              </select>
            </div>

            <button type="submit" className="btn-agregar">
              {editando ? '💾 Actualizar Equipo' : '➕ Crear Equipo'}
            </button>
          </form>
        </div>
        
        {/* LISTADO DERECHO */}
        <div className="lista-pacientes-container">
          <div className="header-lista">
            <h3>Listado de Equipos</h3>
          </div>
          <div className="lista-pacientes-compacta">
            {equipos.map(equipo => (
              <div 
                key={equipo.id} 
                className="paciente-item-compacto"
                onClick={() => handleVerDetalles(equipo)}
              >
                <div className="paciente-info-compacta">
                  <h4>{equipo.nombreEquipo}</h4>
                  <p><strong>Quirófano:</strong> {equipo.quirofanoAsignado || 'No asignado'}</p>
                  <span className={`estado ${equipo.estado}`}>
                    {equipo.estado === 'disponible' ? '✅ Disponible' : '🛠️ Mantenimiento'}
                  </span>
                </div>
                <div className="flecha-derecha">➡️</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipoMedico;