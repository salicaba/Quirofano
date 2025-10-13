import React, { useState } from 'react';
import '../styles/Pacientes.css';
import { exportarPacientesPDF, exportarPacienteIndividualPDF } from '../utils/ExportarPDF';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([
    { 
      id_paciente: 1, 
      nombre: 'Juan', 
      apellido: 'Pérez', 
      sexo: 'masculino',
      fecha_nacimiento: '1980-05-15',
      tipo_sangre: 'O+',
      procedencia: 'Referido por Dr. Rodríguez'
    },
    { 
      id_paciente: 2, 
      nombre: 'Ana', 
      apellido: 'Gómez', 
      sexo: 'femenino',
      fecha_nacimiento: '1992-11-20',
      tipo_sangre: 'A-',
      procedencia: 'Emergencia'
    }
  ]);

  const [formState, setFormState] = useState({ 
    nombre: '', 
    apellido: '', 
    sexo: '', 
    fecha_nacimiento: '', 
    tipo_sangre: '',
    procedencia: ''  // NUEVO CAMPO
  });

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [editando, setEditando] = useState(false);
  const [formEditState, setFormEditState] = useState({});

  const handleInputChange = (evento) => {
    const { name, value } = evento.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleEditInputChange = (evento) => {
    const { name, value } = evento.target;
    setFormEditState({ ...formEditState, [name]: value });
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();
    const nuevoPaciente = { 
      id_paciente: Date.now(), 
      nombre: formState.nombre,
      apellido: formState.apellido,
      sexo: formState.sexo,
      fecha_nacimiento: formState.fecha_nacimiento,
      tipo_sangre: formState.tipo_sangre,
      procedencia: formState.procedencia  // NUEVO CAMPO
    };
    setPacientes([...pacientes, nuevoPaciente]);
    setFormState({ 
      nombre: '', 
      apellido: '', 
      sexo: '', 
      fecha_nacimiento: '', 
      tipo_sangre: '',
      procedencia: ''  // NUEVO CAMPO
    });
  };

  const handleVerDetalles = (paciente) => {
    setPacienteSeleccionado(paciente);
    setEditando(false);
  };

  const handleVolverALista = () => {
    setPacienteSeleccionado(null);
    setEditando(false);
  };

  const handleEliminar = (idAEliminar) => {
    const nuevaLista = pacientes.filter(pac => pac.id_paciente !== idAEliminar);
    setPacientes(nuevaLista);
    setPacienteSeleccionado(null);
    setEditando(false);
  };

  const handleEditar = () => {
    setFormEditState({ ...pacienteSeleccionado });
    setEditando(true);
  };

  const handleGuardarEdicion = (evento) => {
    evento.preventDefault();
    const pacientesActualizados = pacientes.map(pac => 
      pac.id_paciente === pacienteSeleccionado.id_paciente 
        ? { ...formEditState, id_paciente: pacienteSeleccionado.id_paciente }
        : pac
    );
    setPacientes(pacientesActualizados);
    setPacienteSeleccionado(formEditState);
    setEditando(false);
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
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de Sangre:</label>
                <select name="tipo_sangre" value={formEditState.tipo_sangre || ''} onChange={handleEditInputChange}>
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
              {/* NUEVO CAMPO - PROCEDENCIA */}
              <div className="form-group">
                <label>Procedencia:</label>
                <input 
                  type="text" 
                  name="procedencia" 
                  value={formEditState.procedencia || ''} 
                  onChange={handleEditInputChange} 
                  placeholder="Ej: Referido por Dr. García, Emergencia, etc." 
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
                {pacienteSeleccionado.nombre.charAt(0)}
              </div>
              <h3>{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</h3>
              <span className="paciente-id">ID: {pacienteSeleccionado.id_paciente}</span>
            </div>
            
            <div className="paciente-datos">
              <div className="dato-item">
                <label>Fecha de Nacimiento</label>
                <span>{pacienteSeleccionado.fecha_nacimiento}</span>
              </div>
              <div className="dato-item">
                <label>Sexo</label>
                <span>{pacienteSeleccionado.sexo}</span>
              </div>
              <div className="dato-item">
                <label>Tipo de Sangre</label>
                <span>{pacienteSeleccionado.tipo_sangre}</span>
              </div>
              {/* NUEVO CAMPO EN DETALLES */}
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

  // VISTA: FORMULARIO + LISTA COMPACTA
  return (
    <div className="pacientes-container">
      <h2>Gestión de Pacientes</h2>
      
      <div className="pacientes-content-layout">
        <div className="form-paciente">
          <h3>Registrar Nuevo Paciente</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input type="text" name="nombre" value={formState.nombre} onChange={handleInputChange} placeholder="Nombre" />
            </div>
            <div className="form-group">
              <label>Apellido:</label>
              <input type="text" name="apellido" value={formState.apellido} onChange={handleInputChange} placeholder="Apellido" />
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento:</label>
              <input type="date" name="fecha_nacimiento" value={formState.fecha_nacimiento} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Sexo:</label>
              <select name="sexo" value={formState.sexo} onChange={handleInputChange}>
                <option value="">Seleccionar sexo</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Sangre:</label>
              <select name="tipo_sangre" value={formState.tipo_sangre} onChange={handleInputChange}>
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
            {/* NUEVO CAMPO - PROCEDENCIA */}
            <div className="form-group">
              <label>Procedencia:</label>
              <input 
                type="text" 
                name="procedencia" 
                value={formState.procedencia} 
                onChange={handleInputChange} 
                placeholder="Ej: Referido por Dr. García, Emergencia, etc." 
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
            {pacientes.map(paciente => (
              <div 
                key={paciente.id_paciente} 
                className="paciente-item-compacto"
                onClick={() => handleVerDetalles(paciente)}
              >
                <div className="paciente-info-compacta">
                  <h4>{paciente.nombre} {paciente.apellido}</h4>
                  <span className="paciente-id">ID: {paciente.id_paciente}</span>
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

export default Pacientes;