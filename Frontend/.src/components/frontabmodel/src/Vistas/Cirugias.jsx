import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Cirugias.css';

const API_BASE_URL = 'http://localhost:4001/api';

// ACTUALIZADO: Agregar "Pendiente de Horario" al array de estados
const statusCirugia = ['Pendiente de Horario', 'Programada', 'En proceso', 'Completada', 'Cancelada'];

const Cirugias = () => {
  // --- Estados de Datos ---
  const [cirugias, setCirugias] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [quirofanos, setQuirofanos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  
  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCirugia, setSelectedCirugia] = useState(null);

  // --- Estado para Formularios ---
  // ACTUALIZADO: Estado inicial ahora es "Pendiente de Horario"
  const initialFormState = {
    id_expediente: '',
    fecha: '',
    diagnostico_pre: '',
    diagnostico_post: '',
    procedimiento: '',
    resultado: '',
    id_quirofano: '',
    id_equipomedico: '',
    estado: 'Pendiente de Horario' // Cambiado de 'Programada' a 'Pendiente de Horario'
  };
  const [formState, setFormState] = useState(initialFormState);

  // --- Carga de Datos Inicial ---
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resCirugias, resPacientes, resQuirofanos, resEquipos] = await Promise.all([
        axios.get(`${API_BASE_URL}/cirugias`, { headers }),
        axios.get(`${API_BASE_URL}/pacientes`, { headers }),
        axios.get(`${API_BASE_URL}/quirofanos`, { headers }),
        axios.get(`${API_BASE_URL}/equipos/entradas`, { headers })
      ]);

      setCirugias(Array.isArray(resCirugias.data.data) ? resCirugias.data.data : Array.isArray(resCirugias.data) ? resCirugias.data : []);
      setPacientes(Array.isArray(resPacientes.data.data) ? resPacientes.data.data : Array.isArray(resPacientes.data) ? resPacientes.data : []);
      setQuirofanos(Array.isArray(resQuirofanos.data.data) ? resQuirofanos.data.data : Array.isArray(resQuirofanos.data) ? resQuirofanos.data : []);
      setEquipos(Array.isArray(resEquipos.data.data) ? resEquipos.data.data : Array.isArray(resEquipos.data) ? resEquipos.data : []);

    } catch (err) {
      setError('Error al cargar los datos. Verifique la conexión y las rutas de la API.');
      console.error(err);
      setCirugias([]);
      setPacientes([]);
      setQuirofanos([]);
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Manejadores de Formularios y Modales ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormState(initialFormState);
    setShowAddModal(true);
  };
  const closeAddModal = () => setShowAddModal(false);

  const openEditModal = (cirugia) => {
    setSelectedCirugia(cirugia);
    const fechaFormato = cirugia.fecha ? new Date(cirugia.fecha).toISOString().split('T')[0] : '';
    
    setFormState({
      id_expediente: cirugia.id_expediente || '',
      fecha: fechaFormato,
      diagnostico_pre: cirugia.diagnostico_pre || '',
      diagnostico_post: cirugia.diagnostico_post || '',
      procedimiento: cirugia.procedimiento || '',
      resultado: cirugia.resultado || '',
      id_quirofano: cirugia.id_quirofano || '',
      id_equipomedico: cirugia.id_equipomedico || '',
      estado: cirugia.estado || 'Pendiente de Horario' // Actualizado
    });
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedCirugia(null);
  };

  const openDetailsModal = (cirugia) => {
    setSelectedCirugia(cirugia);
    setShowDetailsModal(true);
  };
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCirugia(null);
  };

  // --- Lógica CRUD ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/cirugias`, formState, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarDatosIniciales();
      alert('¡Cirugía registrada con éxito!');
      closeAddModal();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al crear la cirugía.');
      console.error(err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setError('');
    try {
      await axios.put(`${API_BASE_URL}/cirugias/${selectedCirugia.id_cirugia}`, formState, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarDatosIniciales();
      alert('¡Cirugía actualizada con éxito!');
      closeEditModal();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al actualizar la cirugía.');
      console.error(err);
    }
  };

  const handleDelete = async (id, pacienteNombre) => {
    if (window.confirm(`¿Eliminar cirugía de "${pacienteNombre}"?`)) {
      const token = localStorage.getItem('token');
      setError('');
      try {
        await axios.delete(`${API_BASE_URL}/cirugias/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCirugias(prev => prev.filter(c => c.id_cirugia !== id));
        alert('Cirugía eliminada');
        if (selectedCirugia && selectedCirugia.id_cirugia === id) {
          closeDetailsModal();
        }
      } catch (err) {
        setError(err.response?.data?.msg || 'Error al eliminar la cirugía.');
        console.error(err);
      }
    }
  };

  // --- Función para obtener el ícono y texto del estado ---
  const getEstadoDisplay = (estado) => {
    switch (estado) {
      case 'Pendiente de Horario':
        return '⏰ Pendiente de Horario';
      case 'Completada':
        return '✅ Completada';
      case 'Programada':
        return '🗓️ Programada';
      case 'En proceso':
        return '⏳ En Proceso';
      case 'Cancelada':
        return '❌ Cancelada';
      default:
        return estado;
    }
  };
  
  if (loading) return <div>Cargando cirugías...</div>;

  return (
    <div className="cirugias-container">
      <div className="cirugias-header">
        <h2>Gestión de Cirugías</h2>
        <button className="btn-add-cirugia" onClick={openAddModal}>
          ➕ Agregar Cirugía
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}

      <div className="cirugias-content">
        {cirugias.length === 0 ? (
          <p className="no-cirugias-message">No hay cirugías registradas.</p>
        ) : (
          <div className="cirugias-list">
            {cirugias.map(cirugia => (
              <div
                key={cirugia.id_cirugia}
                className={`cirugia-card ${cirugia.estado?.toLowerCase().replace(' ', '-')}`}
                onClick={() => openDetailsModal(cirugia)}
                title="Ver detalles"
              >
                <h3>{cirugia.paciente_nombre} {cirugia.paciente_apellido}</h3>
                <p><strong>Procedimiento:</strong> {cirugia.procedimiento || 'N/A'}</p>
                <p><strong>Fecha:</strong> {cirugia.fecha ? new Date(cirugia.fecha).toLocaleDateString() : 'No asignada'}</p>
                <p><strong>Quirófano:</strong> {cirugia.quirofano_sala || 'No asignado'}</p>
                <p className={`estado ${cirugia.estado?.toLowerCase().replace(' ', '-')}`}>
                  {getEstadoDisplay(cirugia.estado)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Agregar Cirugía */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container" id="add-cirugia-modal">
            <div className="modal-header">
              <h3>Registrar Cirugía</h3>
              <button className="close-button" onClick={closeAddModal}>×</button>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label>Paciente (por Expediente)</label>
                <select name="id_expediente" value={formState.id_expediente} onChange={handleInputChange} required>
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p => (
                    <option key={p.id_expediente} value={p.id_expediente}> {p.numero_expediente}( {p.nombre} {p.apellido} ) </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" name="fecha" value={formState.fecha} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Diag. Pre</label>
                <textarea name="diagnostico_pre" value={formState.diagnostico_pre} onChange={handleInputChange} rows="2"></textarea>
              </div>
              <div className="form-group">
                <label>Procedimiento</label>
                <select 
                  name="procedimiento" 
                  value={formState.procedimiento} 
                  onChange={handleInputChange} 
                  required
                >
                  <option value="">Seleccionar procedimiento...</option>
                  <optgroup label="🫀 Cirugías Cardíacas">
                    <option value="Bypass Coronario">Bypass Coronario (6h)</option>
                    <option value="Reemplazo de Válvula">Reemplazo de Válvula (5h)</option>
                    <option value="Cateterismo Cardíaco">Cateterismo Cardíaco (3h)</option>
                    <option value="Marcapasos">Marcapasos (2h)</option>
                  </optgroup>
                  <optgroup label="🧠 Neurocirugías">
                    <option value="Tumor Cerebral">Tumor Cerebral (8h)</option>
                    <option value="Hernia Discal">Hernia Discal (4h)</option>
                    <option value="Aneurisma Cerebral">Aneurisma Cerebral (6h)</option>
                    <option value="Craneotomía">Craneotomía (5h)</option>
                  </optgroup>
                  <optgroup label="🦴 Ortopédicas">
                    <option value="Reemplazo de Cadera">Reemplazo de Cadera (4h)</option>
                    <option value="Reemplazo de Rodilla">Reemplazo de Rodilla (3h)</option>
                    <option value="Artroscopia">Artroscopia (2h)</option>
                    <option value="Fractura de Fémur">Fractura de Fémur (3h)</option>
                  </optgroup>
                  <optgroup label="🔪 Cirugías Generales">
                    <option value="Apéndice">Apéndice (2h)</option>
                    <option value="Vesícula">Vesícula (2h)</option>
                    <option value="Hernia Inguinal">Hernia Inguinal (2h)</option>
                    <option value="Cesárea">Cesárea (2h)</option>
                  </optgroup>
                  <optgroup label="🚨 Emergencias">
                    <option value="Trauma Múltiple">Trauma Múltiple (6h)</option>
                    <option value="Hemoperitoneo">Hemoperitoneo (4h)</option>
                    <option value="Neurotrauma">Neurotrauma (5h)</option>
                  </optgroup>
                </select>
              </div>
              <div className="form-group">
                <label>Quirófano</label>
                <select name="id_quirofano" value={formState.id_quirofano} onChange={handleInputChange}>
                  <option value="">Sel...</option>
                  {quirofanos.map(q => <option key={q.id_quirofano} value={q.id_quirofano}>{q.sala}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Equipo</label>
                <select name="id_equipomedico" value={formState.id_equipomedico} onChange={handleInputChange}>
                  <option value="">Sel...</option>
                  {equipos.map(e => (
                    <option key={e.id_equipomedico} value={e.id_equipomedico}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select name="estado" value={formState.estado} onChange={handleInputChange} required>
                  {statusCirugia.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeAddModal} className="btn-cancelar-modal">Cancelar</button>
                <button type="submit" className="btn-guardar-modal">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Cirugía */}
      {showEditModal && selectedCirugia && (
        <div className="modal-overlay">
          <div className="modal-container" id="edit-cirugia-modal">
            <div className="modal-header">
              <h3>Editar Cirugía (ID: {selectedCirugia.id_cirugia})</h3>
              <button className="close-button" onClick={closeEditModal}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" name="fecha" value={formState.fecha} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Quirófano</label>
                <select name="id_quirofano" value={formState.id_quirofano} onChange={handleInputChange}>
                  <option value="">Sel...</option>
                  {quirofanos.map(q => <option key={q.id_quirofano} value={q.id_quirofano}>{q.sala}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Equipo</label>
                <select name="id_equipomedico" value={formState.id_equipomedico} onChange={handleInputChange}>
                  <option value="">Sel...</option>
                  {equipos.map(e => (
                    <option key={e.id_equipomedico} value={e.id_equipomedico}>
                      {e.nombre} ({e.medico_nombre} {e.apellido_paterno})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select name="estado" value={formState.estado} onChange={handleInputChange}>
                  {statusCirugia.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Diag. Post</label>
                <textarea name="diagnostico_post" value={formState.diagnostico_post} onChange={handleInputChange} rows="2"></textarea>
              </div>
              <div className="form-group">
                <label>Resultado</label>
                <textarea name="resultado" value={formState.resultado} onChange={handleInputChange} rows="2"></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeEditModal} className="btn-cancelar-modal">Cancelar</button>
                <button type="submit" className="btn-guardar-modal">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetailsModal && selectedCirugia && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-container modal-detalles-cirugia" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de Cirugía</h3>
              <button className="close-button" onClick={closeDetailsModal}>×</button>
            </div>
            <div className="modal-details-content">
              <h4>{selectedCirugia.paciente_nombre} {selectedCirugia.paciente_apellido}</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>ID Cirugía:</label>
                  <span>{selectedCirugia.id_cirugia}</span>
                </div>
                <div className="detail-item">
                  <label>Expediente:</label>
                  <span>{selectedCirugia.numero_expediente}</span>
                </div>
                <div className="detail-item">
                  <label>Fecha:</label>
                  <span>{selectedCirugia.fecha ? new Date(selectedCirugia.fecha).toLocaleString() : 'No asignada'}</span>
                </div>
                <div className="detail-item">
                  <label>Estado:</label>
                  <span className={`estado ${selectedCirugia.estado?.toLowerCase()}`}>
                    {getEstadoDisplay(selectedCirugia.estado)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Quirófano:</label>
                  <span>{selectedCirugia.quirofano_sala || 'No asignado'}</span>
                </div>
                <div className="detail-item">
                  <label>Equipo Médico:</label>
                  <span>{selectedCirugia.equipo_nombre || 'No asignado'}</span>
                </div>
                <div className="detail-item detail-full">
                  <label>Procedimiento:</label>
                  <span>{selectedCirugia.procedimiento || 'N/A'}</span>
                </div>
                <div className="detail-item detail-full">
                  <label>Diagnóstico Pre:</label>
                  <span>{selectedCirugia.diagnostico_pre || 'N/A'}</span>
                </div>
                <div className="detail-item detail-full">
                  <label>Diagnóstico Post:</label>
                  <span>{selectedCirugia.diagnostico_post || 'N/A'}</span>
                </div>
                <div className="detail-item detail-full">
                  <label>Resultado:</label>
                  <span>{selectedCirugia.resultado || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-eliminar-modal"
                onClick={() => handleDelete(selectedCirugia.id_cirugia, selectedCirugia.paciente_nombre)}
              >
                🗑️ Eliminar
              </button>
              <button
                className="btn-editar-modal"
                onClick={() => {
                  closeDetailsModal();
                  openEditModal(selectedCirugia);
                }}
              >
                ✏️ Editar
              </button>
              <button type="button" onClick={closeDetailsModal} className="btn-cancelar-modal">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cirugias;