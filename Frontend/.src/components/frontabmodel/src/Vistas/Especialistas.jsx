import React, { useState } from 'react';
import '../styles/Especialistas.css'; // Importamos el CSS renombrado

const Especialistas = () => {
  // Cambiamos 'medicos' por 'especialistas'
  const [especialistas, setEspecialistas] = useState([
    { id: 1, nombre: 'Dr. Carlos', apellido: 'García', especialidad: 'Cardiología' },
  ]);

  // El resto de la lógica no necesita cambiar...
  const [formState, setFormState] = useState({ nombre: '', apellido: '', especialidad: '' });
  const [isEditing, setIsEditing] = useState(null);

  const handleInputChange = (evento) => {
    const { name, value } = evento.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();
    if (isEditing) {
      const listaActualizada = especialistas.map(esp => 
        esp.id === isEditing ? { ...formState, id: isEditing } : esp
      );
      setEspecialistas(listaActualizada);
      setIsEditing(null);
    } else {
      const nuevoEspecialista = { id: Date.now(), ...formState };
      setEspecialistas([...especialistas, nuevoEspecialista]);
    }
    setFormState({ nombre: '', apellido: '', especialidad: '' });
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
    setFormState({ nombre: '', apellido: '', especialidad: '' });
    setIsEditing(null);
  };

  // --- HTML CON TEXTOS CORREGIDOS ---
  return (
    <div className="especialistas-container">
      <h2>Sección de Especialistas</h2>
      <div className="especialistas-content-layout">
        <div className="form-especialista">
          <h3>{isEditing ? 'Editando Especialista' : 'Registrar Nuevo Especialista'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input type="text" name="nombre" placeholder="Nombre del especialista" value={formState.nombre} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Apellido:</label>
              <input type="text" name="apellido" placeholder="Apellido del especialista" value={formState.apellido} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Especialidad:</label>
              <input type="text" name="especialidad" placeholder="Especialidad" value={formState.especialidad} onChange={handleInputChange} />
            </div>
            <button type="submit" className="btn-agregar">{isEditing ? 'Actualizar' : 'Registrar'}</button>
            <button type="button" className="btn-cancelar" onClick={handleCancelar}>Cancelar</button>
          </form>
        </div>
        
        <div className="lista-especialistas-container">
          <h3>Listado Actual</h3>
          {especialistas.length > 0 ? (
            <div className="lista-especialistas">
              {especialistas.map(especialista => (
                <div key={especialista.id} className="especialista-card">
                  <h3>{especialista.nombre} {especialista.apellido}</h3>
                  <p>Especialidad: {especialista.especialidad}</p>
                  <div className="card-actions">
                    <button onClick={() => handleEditar(especialista.id)}>Editar</button>
                    <button onClick={() => handleEliminar(especialista.id)}>Eliminar</button>
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
    </div>
  );
};

export default Especialistas;