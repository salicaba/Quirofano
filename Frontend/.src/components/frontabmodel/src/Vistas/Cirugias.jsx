import React, { useState } from 'react';
import '../styles/Cirugias.css';

// --- Datos Mock Temporales ---
const pacientesMock = [ {id: 1, nombre: 'Juan Pérez', expediente: 'EXP-2024-001'}, {id: 2, nombre: 'Ana Gómez', expediente: 'EXP-2024-002'} ];
const quirofanosMock = [ {id: 1, nombre: 'Quirófano 1'}, {id: 2, nombre: 'Quirófano 2'} ];
const equiposMock = [ {id: 1, nombre: 'Equipo Cardíaco A'}, {id: 2, nombre: 'Equipo General B'} ];
const statusCirugia = ['programada', 'en-proceso', 'completada', 'cancelada'];

const Cirugias = () => {
  const [cirugias, setCirugias] = useState([
    { id: 1, paciente: 'Juan Pérez', id_expediente: 1, tipo: 'Cardíaca', especialista: 'Dr. Carlos García', fecha: '2024-01-15', estado: 'completada', quirofano: 'Quirófano 1', id_quirofano: 1, diagnostico_pre: 'Bloqueo AV', diagnostico_post: 'Estable', procedimiento: 'Marcapasos', resultado: 'Exitoso', id_equipomedico: 1 },
    { id: 2, paciente: 'Ana Gómez', id_expediente: 2, tipo: 'Abdominal', especialista: 'Dr. María López', fecha: '2024-01-16', estado: 'programada', quirofano: 'Quirófano 2', id_quirofano: 2, diagnostico_pre: 'Apendicitis', diagnostico_post: '', procedimiento: 'Apendicectomía', resultado: '', id_equipomedico: 2 }
  ]);

  // --- Estados Modales ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCirugia, setEditingCirugia] = useState(null);
  // --- NUEVOS ESTADOS PARA MODAL DETALLES ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCirugia, setSelectedCirugia] = useState(null); // Guarda la cirugía seleccionada para detalles


  // --- Estado Formularios ---
  const initialFormState = {
    id_expediente: '', fecha_date: '', diagnostico_pre: '', diagnostico_post: '',
    procedimiento: '', resultado: '', id_quirofano: '', id_equipomedico: '', estado: 'programada'
  };
  const [newCirugia, setNewCirugia] = useState(initialFormState);
  const [editCirugia, setEditCirugia] = useState(initialFormState);

  // --- MANEJADORES MODAL AGREGAR ---
  const openAddModal = () => { setNewCirugia(initialFormState); setShowAddModal(true); };
  const closeAddModal = () => { setShowAddModal(false); };
  const handleAddChange = (e) => { const { name, value } = e.target; setNewCirugia(prev => ({ ...prev, [name]: value })); };
  const handleAddSubmit = (e) => {
    e.preventDefault(); /* ... */
    const cirugiaToAdd = { id: Date.now(), paciente: `Paciente ID ${newCirugia.id_expediente}`, tipo: 'Desconocido', especialista: 'Por asignar', fecha: newCirugia.fecha_date, estado: newCirugia.estado, quirofano: `Quirófano ID ${newCirugia.id_quirofano}`, ...newCirugia };
    setCirugias(prev => [...prev, cirugiaToAdd]); alert('Cirugía agregada localmente'); closeAddModal();
  };

  // --- MANEJADORES MODAL EDITAR ---
  const openEditModal = (cirugia) => { setEditingCirugia(cirugia); setEditCirugia({ id_expediente: cirugia.id_expediente || '', fecha_date: cirugia.fecha || '', diagnostico_pre: cirugia.diagnostico_pre || '', diagnostico_post: cirugia.diagnostico_post || '', procedimiento: cirugia.procedimiento || '', resultado: cirugia.resultado || '', id_quirofano: cirugia.id_quirofano || '', id_equipomedico: cirugia.id_equipomedico || '', estado: cirugia.estado || 'programada' }); setShowEditModal(true); };
  const closeEditModal = () => { setShowEditModal(false); setEditingCirugia(null); };
  const handleEditChange = (e) => { const { name, value } = e.target; setEditCirugia(prev => ({ ...prev, [name]: value })); };
  const handleEditSubmit = (e) => {
    e.preventDefault(); /* ... */
    const cirugiaActualizada = { ...editingCirugia, ...editCirugia, paciente: `Paciente ID ${editCirugia.id_expediente}`, quirofano: `Quirófano ID ${editCirugia.id_quirofano}`, fecha: editCirugia.fecha_date };
    setCirugias(prev => prev.map(c => c.id === editingCirugia.id ? cirugiaActualizada : c)); alert('Cirugía actualizada localmente'); closeEditModal();
  };

  // --- MANEJADORES MODAL DETALLES ---
  const openDetailsModal = (cirugia) => {
    setSelectedCirugia(cirugia); // Guarda la cirugía seleccionada
    setShowDetailsModal(true);  // Abre el modal
  };
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCirugia(null); // Limpia la selección al cerrar
  };

  // --- MANEJADOR ELIMINAR ---
  const handleDelete = (id, pacienteNombre) => {
    if (window.confirm(`¿Eliminar cirugía de "${pacienteNombre}"?`)) {
        setCirugias(prev => prev.filter(c => c.id !== id));
        alert('Cirugía eliminada localmente');
        // Si el modal de detalles estaba abierto para esta cirugía, ciérralo
        if (selectedCirugia && selectedCirugia.id === id) {
            closeDetailsModal();
        }
         // Si el modal de edición estaba abierto para esta cirugía, ciérralo
         if (editingCirugia && editingCirugia.id === id) {
            closeEditModal();
        }
    }
  };


  return (
    <div className="cirugias-container">
      <div className="cirugias-header">
        <h2>Gestión de Cirugías</h2>
        <button className="btn-add-cirugia" onClick={openAddModal}>
          ➕ Agregar Cirugía
        </button>
      </div>

      <div className="cirugias-content">
        {cirugias.length === 0 ? (
          <p className="no-cirugias-message">No hay cirugías registradas.</p>
        ) : (
          <div className="cirugias-list">
            {cirugias.map(cirugia => (
              // --- DIV DE LA TARJETA AHORA ES CLICKABLE ---
              <div
                key={cirugia.id}
                className={`cirugia-card ${cirugia.estado}`}
                onClick={() => openDetailsModal(cirugia)} // <-- Llama a abrir detalles
                title="Ver detalles" // Tooltip opcional
              >
                <h3>{cirugia.paciente}</h3>
                <p><strong>Procedimiento:</strong> {cirugia.procedimiento || cirugia.tipo || 'N/A'}</p>
                <p><strong>Especialista:</strong> {cirugia.especialista}</p>
                <p><strong>Fecha:</strong> {cirugia.fecha}</p>
                <p><strong>Quirófano:</strong> {cirugia.quirofano}</p>
                <p className={`estado ${cirugia.estado}`}>
                  { cirugia.estado === 'completada' ? '✅ Completada' :
                    cirugia.estado === 'programada' ? '🗓️ Programada' :
                    cirugia.estado === 'en-proceso' ? '⏳ En Proceso' :
                    cirugia.estado === 'cancelada' ? '❌ Cancelada' :
                    cirugia.estado.charAt(0).toUpperCase() + cirugia.estado.slice(1) }
                </p>
                {/* --- BOTONES EDITAR/ELIMINAR ELIMINADOS DE AQUÍ --- */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL AGREGAR CIRUGÍA --- */}
      {showAddModal && ( <div className="modal-overlay"> <div className="modal-container" id="add-cirugia-modal"> {/* ... (contenido sin cambios) ... */} </div> </div> )}

      {/* --- MODAL EDITAR CIRUGÍA --- */}
      {showEditModal && editingCirugia && ( <div className="modal-overlay"> <div className="modal-container" id="edit-cirugia-modal"> {/* ... (contenido sin cambios) ... */} </div> </div> )}

      {/* --- NUEVO MODAL DE DETALLES --- */}
      {showDetailsModal && selectedCirugia && (
        <div className="modal-overlay">
          <div className="modal-container modal-detalles-cirugia"> {/* Nueva clase opcional para estilos específicos */}
            <div className="modal-header">
              <h3>Detalles de Cirugía</h3>
              <button className="close-button" onClick={closeDetailsModal}>×</button>
            </div>
            <div className="modal-details-content"> {/* Contenedor para scroll si es necesario */}
              <h4>{selectedCirugia.paciente}</h4>
              <div className="detail-grid"> {/* Grid para organizar datos */}
                <div className="detail-item"><label>ID Cirugía:</label><span>{selectedCirugia.id}</span></div>
                <div className="detail-item"><label>ID Expediente:</label><span>{selectedCirugia.id_expediente}</span></div>
                <div className="detail-item"><label>Fecha:</label><span>{selectedCirugia.fecha}</span></div>
                <div className="detail-item"><label>Estado:</label><span className={`estado ${selectedCirugia.estado}`}>{selectedCirugia.estado.charAt(0).toUpperCase() + selectedCirugia.estado.slice(1)}</span></div>
                <div className="detail-item"><label>Quirófano:</label><span>{selectedCirugia.quirofano} (ID: {selectedCirugia.id_quirofano})</span></div>
                <div className="detail-item"><label>Equipo Médico:</label><span>ID: {selectedCirugia.id_equipomedico}</span></div>
                <div className="detail-item detail-full"><label>Procedimiento:</label><span>{selectedCirugia.procedimiento || 'N/A'}</span></div>
                <div className="detail-item detail-full"><label>Diagnóstico Pre:</label><span>{selectedCirugia.diagnostico_pre || 'N/A'}</span></div>
                <div className="detail-item detail-full"><label>Diagnóstico Post:</label><span>{selectedCirugia.diagnostico_post || 'N/A'}</span></div>
                <div className="detail-item detail-full"><label>Resultado:</label><span>{selectedCirugia.resultado || 'N/A'}</span></div>
              </div>
            </div>
            {/* Botones de acción dentro del modal de detalles */}
            <div className="modal-actions">
              <button
                className="btn-eliminar-modal" // Reutiliza o crea nuevo estilo
                onClick={() => handleDelete(selectedCirugia.id, selectedCirugia.paciente)}
              >
                🗑️ Eliminar
              </button>
              <button
                className="btn-editar-modal" // Reutiliza o crea nuevo estilo
                onClick={() => {
                    closeDetailsModal(); // Cierra detalles
                    openEditModal(selectedCirugia); // Abre edición
                }}
              >
                ✏️ Editar
              </button>
              <button type="button" onClick={closeDetailsModal} className="btn-cancelar-modal">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {/* --- FIN MODAL DETALLES --- */}

       {/* ----- CONTENIDO DETALLADO DE MODALES AGREGAR/EDITAR (para brevedad) ----- */}
       {showAddModal && ( <div className="modal-overlay"><div className="modal-container" id="add-cirugia-modal"><div className="modal-header"><h3>Registrar Cirugía</h3><button className="close-button" onClick={closeAddModal}>×</button></div><form onSubmit={handleAddSubmit} className="modal-form">{/* Campos... */}<div className="form-group"><label>ID Exp.</label><input type="number" name="id_expediente" value={newCirugia.id_expediente} onChange={handleAddChange} required /></div><div className="form-group"><label>Fecha</label><input type="date" name="fecha_date" value={newCirugia.fecha_date} onChange={handleAddChange} required /></div><div className="form-group"><label>Diag. Pre</label><textarea name="diagnostico_pre" value={newCirugia.diagnostico_pre} onChange={handleAddChange} rows="2"></textarea></div><div className="form-group"><label>Procedimiento</label><textarea name="procedimiento" value={newCirugia.procedimiento} onChange={handleAddChange} rows="3" required></textarea></div><div className="form-group"><label>Quirófano</label><select name="id_quirofano" value={newCirugia.id_quirofano} onChange={handleAddChange} required><option value="">Sel...</option>{quirofanosMock.map(q => <option key={q.id} value={q.id}>{q.nombre}</option>)}</select></div><div className="form-group"><label>Equipo</label><select name="id_equipomedico" value={newCirugia.id_equipomedico} onChange={handleAddChange} required><option value="">Sel...</option>{equiposMock.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select></div><div className="form-group"><label>Estado</label><select name="estado" value={newCirugia.estado} onChange={handleAddChange} required>{statusCirugia.map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}</select></div><div className="form-group"><label>Diag. Post</label><textarea name="diagnostico_post" value={newCirugia.diagnostico_post} onChange={handleAddChange} rows="2"></textarea></div><div className="form-group"><label>Resultado</label><textarea name="resultado" value={newCirugia.resultado} onChange={handleAddChange} rows="2"></textarea></div><div className="modal-actions"><button type="button" onClick={closeAddModal} className="btn-cancelar-modal">Cancelar</button><button type="submit" className="btn-guardar-modal">Registrar</button></div></form></div></div>)}
       {showEditModal && editingCirugia && ( <div className="modal-overlay"><div className="modal-container" id="edit-cirugia-modal"><div className="modal-header"><h3>Editar Cirugía</h3><button className="close-button" onClick={closeEditModal}>×</button></div><form onSubmit={handleEditSubmit} className="modal-form">{/* Campos similares a agregar, usando editCirugia y handleEditChange */}<div className="form-group"><label>ID Exp.</label><input type="number" name="id_expediente" value={editCirugia.id_expediente} onChange={handleEditChange} required /></div><div className="form-group"><label>Fecha</label><input type="date" name="fecha_date" value={editCirugia.fecha_date} onChange={handleEditChange} required /></div><div className="form-group"><label>Diag. Pre</label><textarea name="diagnostico_pre" value={editCirugia.diagnostico_pre} onChange={handleEditChange} rows="2"></textarea></div><div className="form-group"><label>Procedimiento</label><textarea name="procedimiento" value={editCirugia.procedimiento} onChange={handleEditChange} rows="3" required></textarea></div><div className="form-group"><label>Quirófano</label><select name="id_quirofano" value={editCirugia.id_quirofano} onChange={handleEditChange} required><option value="">Sel...</option>{quirofanosMock.map(q => <option key={q.id} value={q.id}>{q.nombre}</option>)}</select></div><div className="form-group"><label>Equipo</label><select name="id_equipomedico" value={editCirugia.id_equipomedico} onChange={handleEditChange} required><option value="">Sel...</option>{equiposMock.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select></div><div className="form-group"><label>Estado</label><select name="estado" value={editCirugia.estado} onChange={handleEditChange} required>{statusCirugia.map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}</select></div><div className="form-group"><label>Diag. Post</label><textarea name="diagnostico_post" value={editCirugia.diagnostico_post} onChange={handleEditChange} rows="2"></textarea></div><div className="form-group"><label>Resultado</label><textarea name="resultado" value={editCirugia.resultado} onChange={handleEditChange} rows="2"></textarea></div><div className="modal-actions"><button type="button" onClick={closeEditModal} className="btn-cancelar-modal">Cancelar</button><button type="submit" className="btn-guardar-modal">Guardar Cambios</button></div></form></div></div>)}

    </div>
  );
};

export default Cirugias;