import React, { useState } from 'react';
import '../styles/Especialistas.css';

const Especialistas = () => {
  // Datos iniciales mock
  const [especialistas, setEspecialistas] = useState([
    { 
      id: 1, 
      nombre: 'Carlos', 
      apellido: 'García', 
      cedula: '12345678', 
      telefono: '555-1234',
      especialidad: 'Cardiología',
      rol: 'Especialista',
      password: 'password123'
    }
  ]);

  // Listas de opciones
  const [roles, setRoles] = useState(['Administrador', 'Especialista', 'Enfermero']);
  const [especialidades, setEspecialidades] = useState(['Cardiología', 'Traumatología', 'Pediatría', 'Cirugía']);

  // Estados para formularios
  const [formState, setFormState] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    especialidad: '',
    rol: '',
    password: ''
  });

  const [isEditing, setIsEditing] = useState(null);
  const [showModalRol, setShowModalRol] = useState(false);
  const [showModalEspecialidad, setShowModalEspecialidad] = useState(false);
  const [nuevoRol, setNuevoRol] = useState('');
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');

  // 🔄 MANEJADORES PRINCIPALES
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Editar especialista existente
      const listaActualizada = especialistas.map(esp => 
        esp.id === isEditing ? { ...formState, id: isEditing } : esp
      );
      setEspecialistas(listaActualizada);
      setIsEditing(null);
    } else {
      // Crear nuevo especialista
      const nuevoEspecialista = { 
        id: Date.now(), 
        ...formState 
      };
      setEspecialistas([...especialistas, nuevoEspecialista]);
    }
    
    // Reset form
    setFormState({
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      especialidad: '',
      rol: '',
      password: ''
    });
  };

  const handleEditar = (idAEditar) => {
    const especialistaAEditar = especialistas.find(esp => esp.id === idAEditar);
    if (especialistaAEditar) {
      setFormState(especialistaAEditar);
      setIsEditing(idAEditar);
    }
  };

  const handleEliminar = (idAEliminar) => {
    const nuevaLista = especialistas.filter(esp => esp.id !== idAEliminar);
    setEspecialistas(nuevaLista);
  };

  const handleCancelar = () => {
    setFormState({
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      especialidad: '',
      rol: '',
      password: ''
    });
    setIsEditing(null);
  };

  // 🆕 MANEJADORES PARA ROLES Y ESPECIALIDADES
  const handleAgregarRol = () => {
    if (nuevoRol.trim() && !roles.includes(nuevoRol.trim())) {
      setRoles([...roles, nuevoRol.trim()]);
      setNuevoRol('');
      setShowModalRol(false);
    }
  };

  const handleAgregarEspecialidad = () => {
    if (nuevaEspecialidad.trim() && !especialidades.includes(nuevaEspecialidad.trim())) {
      setEspecialidades([...especialidades, nuevaEspecialidad.trim()]);
      setNuevaEspecialidad('');
      setShowModalEspecialidad(false);
    }
  };

  return (
    <div className="especialistas-container">
      <h2>Gestión de Especialistas</h2>
      
      <div className="especialistas-content-layout">
        {/* FORMULARIO IZQUIERDO */}
        <div className="form-especialista">
          <h3>{isEditing ? 'Editando Especialista' : 'Registrar Nuevo Especialista'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre *</label>
              <input 
                type="text" 
                name="nombre" 
                value={formState.nombre} 
                onChange={handleInputChange}
                placeholder="Nombre del especialista" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Apellido *</label>
              <input 
                type="text" 
                name="apellido" 
                value={formState.apellido} 
                onChange={handleInputChange}
                placeholder="Apellido del especialista" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Cédula Profesional *</label>
              <input 
                type="text" 
                name="cedula" 
                value={formState.cedula} 
                onChange={handleInputChange}
                placeholder="Número de cédula" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input 
                type="tel" 
                name="telefono" 
                value={formState.telefono} 
                onChange={handleInputChange}
                placeholder="Número de teléfono" 
              />
            </div>

            <div className="form-group-combobox">
              <label>Especialidad *</label>
              <div className="combobox-container">
                <select 
                  name="especialidad" 
                  value={formState.especialidad} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar especialidad</option>
                  {especialidades.map((esp, index) => (
                    <option key={index} value={esp}>{esp}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="btn-agregar-opcion"
                  onClick={() => setShowModalEspecialidad(true)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group-combobox">
              <label>Rol *</label>
              <div className="combobox-container">
                <select 
                  name="rol" 
                  value={formState.rol} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((rol, index) => (
                    <option key={index} value={rol}>{rol}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="btn-agregar-opcion"
                  onClick={() => setShowModalRol(true)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña *</label>
              <input 
                type="password" 
                name="password" 
                value={formState.password} 
                onChange={handleInputChange}
                placeholder="Contraseña para el especialista" 
                required 
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-agregar">
                {isEditing ? '💾 Actualizar' : '➕ Registrar'}
              </button>
              {isEditing && (
                <button type="button" onClick={handleCancelar} className="btn-cancelar">
                  ❌ Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* LISTADO DERECHO */}
        <div className="lista-especialistas-container">
          <div className="header-lista">
            <h3>Listado de Especialistas</h3>
            <span className="contador-especialistas">{especialistas.length} especialistas</span>
          </div>
          
          {especialistas.length > 0 ? (
            <div className="lista-especialistas">
              {especialistas.map(especialista => (
                <div key={especialista.id} className="especialista-card">
                  <div className="especialista-header">
                    <div className="especialista-avatar">
                      {especialista.nombre.charAt(0)}{especialista.apellido.charAt(0)}
                    </div>
                    <div className="especialista-info">
                      <h4>Dr. {especialista.nombre} {especialista.apellido}</h4>
                      <p className="especialista-datos">
                        <strong>Cédula:</strong> {especialista.cedula} | 
                        <strong> Especialidad:</strong> {especialista.especialidad} | 
                        <strong> Rol:</strong> {especialista.rol}
                      </p>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      onClick={() => handleEditar(especialista.id)}
                      className="btn-editar"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleEliminar(especialista.id)}
                      className="btn-eliminar"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lista-vacia">
              <p>No hay especialistas registrados.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA AGREGAR ROL */}
      {showModalRol && (
        <div className="modal-overlay">
          <div className="modal-especialidad">
            <div className="modal-header">
              <h3>🆕 Agregar Nuevo Rol</h3>
              <button 
                className="close-button" 
                onClick={() => setShowModalRol(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Nombre del Rol</label>
                <input 
                  type="text" 
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                  placeholder="Ej: Coordinador, Supervisor, etc."
                  onKeyPress={(e) => e.key === 'Enter' && handleAgregarRol()}
                />
              </div>
              <div className="modal-actions">
                <button onClick={handleAgregarRol} className="btn-agregar">
                  ➕ Agregar Rol
                </button>
                <button 
                  onClick={() => setShowModalRol(false)} 
                  className="btn-cancelar"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR ESPECIALIDAD */}
      {showModalEspecialidad && (
        <div className="modal-overlay">
          <div className="modal-especialidad">
            <div className="modal-header">
              <h3>🆕 Agregar Nueva Especialidad</h3>
              <button 
                className="close-button" 
                onClick={() => setShowModalEspecialidad(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Nombre de la Especialidad</label>
                <input 
                  type="text" 
                  value={nuevaEspecialidad}
                  onChange={(e) => setNuevaEspecialidad(e.target.value)}
                  placeholder="Ej: Neurología, Dermatología, etc."
                  onKeyPress={(e) => e.key === 'Enter' && handleAgregarEspecialidad()}
                />
              </div>
              <div className="modal-actions">
                <button onClick={handleAgregarEspecialidad} className="btn-agregar">
                  ➕ Agregar Especialidad
                </button>
                <button 
                  onClick={() => setShowModalEspecialidad(false)} 
                  className="btn-cancelar"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Especialistas;