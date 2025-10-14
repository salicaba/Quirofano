import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Pacientes.css';
import { exportarPacientesPDF, exportarPacienteIndividualPDF } from '../utils/ExportarPDF';

const Pacientes = () => { 
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    sexo: '',
    tipo_sangre: '',
    procedencia: '',
    numero_expediente: ''
  });
  
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [editando, setEditando] = useState(false);
  const [formEditState, setFormEditState] = useState({});

  const API_URL = 'http://localhost:4001/api/pacientes';

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      
      console.log('🔍 DEBUG - Datos recibidos del backend:', response.data);
      
      const listaPacientes = Array.isArray(response.data) ? response.data : [];
      setPacientes(listaPacientes);
      setError(null);
    } catch (err) {
      setError('Error al cargar los pacientes.');
      console.error('Error en GET /pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoPaciente(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setFormEditState({ ...formEditState, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nuevoPaciente.nombre || !nuevoPaciente.tipo_sangre) {
      setError('El Nombre y Tipo de sangre son obligatorios');
      return;
    }

    try {
      await axios.post(API_URL, nuevoPaciente);

      alert('¡Paciente registrado con éxito!');
      setNuevoPaciente({
        nombre: '', apellido: '', fecha_nacimiento: '',
        sexo: '', tipo_sangre: '', procedencia: '', numero_expediente: ''
      });

      cargarPacientes();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrar el paciente.');
      console.error('Error en POST /pacientes:', err);
    }
  };


  const handleVerDetalles = (paciente) => {
    setPacienteSeleccionado(paciente);
    setEditando(false);
  };

  const handleVolverALista = () => {
    setPacienteSeleccionado(null);
    setEditando(false);
  };

  const handleEliminar = async (idAEliminar) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      try {
        await axios.delete(`${API_URL}/${idAEliminar}`);
        alert('Paciente eliminado correctamente');
        cargarPacientes();
        setPacienteSeleccionado(null);
      } catch (err) {
        setError('Error al eliminar el paciente.');
        console.error('Error en DELETE /pacientes:', err);
      }
    }
  };

  const handleEditar = () => {
    setFormEditState({ ...pacienteSeleccionado });
    setEditando(true);
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${pacienteSeleccionado.id_paciente}`, formEditState);
      alert('¡Paciente actualizado con éxito!');
      setPacienteSeleccionado(formEditState);
      setEditando(false);
      cargarPacientes();
    } catch (err) {
      setError('Error al actualizar el paciente.');
      console.error('Error en PUT /pacientes:', err);
    }
  };

  const handleCancelarEdicion = () => {
    setEditando(false);
    setFormEditState({});
  };

  // VISTA: EDITANDO PACIENTE
  if (pacienteSeleccionado && editando) {
    return (
      <div className="detalles-paciente-container">
        <div className="detalles-header">
          <button onClick={handleCancelarEdicion} className="btn-volver">
            ← Cancelar Edición
          </button>
          <h2>Editando Paciente</h2>
        </div>

        <div className="detalles-paciente">
          <div className="form-paciente-editar">
            <form onSubmit={handleGuardarEdicion}>
              <div className="form-group">
                <label>Nombre:</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={formEditState.nombre || ''} 
                  onChange={handleEditInputChange} 
                  placeholder="Nombre" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido:</label>
                <input 
                  type="text" 
                  name="apellido" 
                  value={formEditState.apellido || ''} 
                  onChange={handleEditInputChange} 
                  placeholder="Apellido" 
                />
              </div>
              <div className="form-group">
                <label>Fecha de Nacimiento:</label>
                <input 
                  type="date" 
                  name="fecha_nacimiento" 
                  value={formEditState.fecha_nacimiento || ''} 
                  onChange={handleEditInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Sexo:</label>
                <select name="sexo" value={formEditState.sexo || ''} onChange={handleEditInputChange}>
                  <option value="">Seleccionar sexo</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de Sangre:</label>
                <select name="tipo_sangre" value={formEditState.tipo_sangre || ''} onChange={handleEditInputChange} required>
                  <option value="">Seleccionar tipo</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="form-group">
                <label>N° de Expediente:</label>
                <input 
                  type="text" 
                  name="numero_expediente" 
                  value={formEditState.numero_expediente || ''} 
                  onChange={handleEditInputChange} 
                  placeholder="Ej: EXP-2025-001" 
                />
              </div>
              <div className="form-group">
                <label>Procedencia:</label>
                <input 
                  type="text" 
                  name="procedencia" 
                  value={formEditState.procedencia || ''} 
                  onChange={handleEditInputChange} 
                  placeholder="Ej: Departamento Cardiología" 
                />
              </div>
              <div className="form-actions-editar">
                <button type="submit" className="btn-guardar">
                  💾 Guardar Cambios
                </button>
                <button type="button" onClick={handleCancelarEdicion} className="btn-cancelar">
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // VISTA: DETALLES DEL PACIENTE
  if (pacienteSeleccionado && !editando) {
    return (
      <div className="detalles-paciente-container">
        <div className="detalles-header">
          <button onClick={handleVolverALista} className="btn-volver">
            ← Volver a la lista
          </button>
          <h2>Expediente Médico</h2>
        </div>

        <div className="detalles-paciente">
          <div className="paciente-card-detalle">
            <div className="paciente-header">
              <div className="paciente-avatar">
                {pacienteSeleccionado.nombre?.charAt(0)}
              </div>
              <h3>{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</h3>
              <span className="paciente-id">ID: {pacienteSeleccionado.id_paciente}</span>
            </div>
            
            <div className="paciente-datos">
              <div className="dato-item">
                <label>Fecha de Nacimiento</label>
                <span>{pacienteSeleccionado.fecha_nacimiento || 'No especificada'}</span>
              </div>
              <div className="dato-item">
                <label>Sexo</label>
                <span>{pacienteSeleccionado.sexo || 'No especificado'}</span>
              </div>
              <div className="dato-item">
                <label>Tipo de Sangre</label>
                <span>{pacienteSeleccionado.tipo_sangre || 'No especificado'}</span>
              </div>
              <div className="dato-item">
                <label>N° de Expediente</label>
                <span>{pacienteSeleccionado.numero_expediente || 'No especificado'}</span>
              </div>
              <div className="dato-item">
                <label>Procedencia</label>
                <span>{pacienteSeleccionado.procedencia || 'No especificada'}</span>
              </div>
              <div className="dato-item">
                <label>Estado</label>
                <span className="estado-activo">● Activo</span>
              </div>
            </div>

            <div className="detalles-actions">
              <button onClick={handleEditar} className="btn-editar">
                ✏️ Editar Expediente
              </button>
              <button 
                onClick={() => exportarPacienteIndividualPDF(pacienteSeleccionado)} 
                className="btn-exportar-individual"
              >
                📄 Exportar Expediente
              </button>
              <button 
                onClick={() => handleEliminar(pacienteSeleccionado.id_paciente)} 
                className="btn-eliminar"
              >
                🗑️ Eliminar Paciente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Cargando Pacientes...</div>;

  // VISTA PRINCIPAL: FORMULARIO + LISTA COMPACTA
  return (
    <div className="pacientes-container">
      <h2>Gestión de Pacientes</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="pacientes-content-layout">
        <div className="form-paciente">
          <h3>Registrar Nuevo Paciente</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input 
                type="text" 
                name="nombre" 
                value={nuevoPaciente.nombre} 
                onChange={handleInputChange} 
                placeholder="Nombre" 
                required
              />
            </div>
            <div className="form-group">
              <label>Apellido:</label>
              <input 
                type="text" 
                name="apellido" 
                value={nuevoPaciente.apellido} 
                onChange={handleInputChange} 
                placeholder="Apellido" 
              />
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento:</label>
              <input 
                type="date" 
                name="fecha_nacimiento" 
                value={nuevoPaciente.fecha_nacimiento} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Sexo:</label>
              <select name="sexo" value={nuevoPaciente.sexo} onChange={handleInputChange}>
                <option value="">Seleccionar sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Sangre:</label>
              <select name="tipo_sangre" value={nuevoPaciente.tipo_sangre} onChange={handleInputChange} required>
                <option value="">Seleccionar tipo</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="form-group">
              <label>N° de Expediente:</label>
              <input 
                type="text" 
                name="numero_expediente" 
                value={nuevoPaciente.numero_expediente}
                onChange={handleInputChange} 
                placeholder="Ej: EXP-2025-001" 
              />
            </div>
            <div className="form-group">
              <label>Procedencia:</label>
              <input 
                type="text" 
                name="procedencia" 
                value={nuevoPaciente.procedencia}
                onChange={handleInputChange} 
                placeholder="Ej: Departamento Cardiología" 
              />
            </div>
            
            <button type="submit" className="btn-agregar">Registrar Paciente</button>
          </form>
        </div>
        
        <div className="lista-pacientes-container">
          <div className="header-lista">
            <h3>Listado de Pacientes</h3>
            <button 
              className="btn-exportar" 
              onClick={() => exportarPacientesPDF(pacientes)}
              disabled={pacientes.length === 0}
            >
              📥 Exportar a PDF
            </button>
          </div>
          
          <div className="lista-pacientes-compacta">
            {pacientes.length === 0 ? (
              <div className="no-pacientes">
                <p>No hay pacientes registrados</p>
              </div>
            ) : (
              pacientes.map((paciente, index) => (
                <div 
                  key={paciente.id_paciente} 
                  className="paciente-item-compacto"
                  onClick={() => handleVerDetalles(paciente)}
                >
                  <div className="paciente-info-compacta">
                    <h4>{paciente.nombre} {paciente.apellido}</h4>
                    <div className="paciente-detalles-compactos">
                      <span className="paciente-sexo">| {paciente.sexo} |</span>
                      <span className="paciente-tipo-sangre"> {paciente.tipo_sangre} |</span>
                      {paciente.numero_expediente && (
                        <span className="paciente-expediente"> {paciente.numero_expediente} |</span>
                      )}
                      {paciente.procedencia && paciente.procedencia.trim() !== '' ? (
                        <span className="paciente-procedencia"> {paciente.procedencia} |</span>
                         ) : (
                        <span className="paciente-procedencia"> No especificada |</span>
                       )}
                    </div>
                  </div>
                  <div className="flecha-derecha">➡️</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pacientes;