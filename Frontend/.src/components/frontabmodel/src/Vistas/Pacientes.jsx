import React, { useState } from 'react';
import '../styles/Pacientes.css'; // RUTA CORREGIDA

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([
    { id: 1, nombre: 'Juan Pérez', edad: 45, diagnostico: 'Hipertensión' },
    { id: 2, nombre: 'Ana Gómez', edad: 32, diagnostico: 'Diabetes Tipo 2' },
  ]);

  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', edad: '', diagnostico: '' });

  const handleInputChange = (evento) => {
    const { name, value } = evento.target;
    setNuevoPaciente({ ...nuevoPaciente, [name]: value });
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();
    const pacienteParaAgregar = { ...nuevoPaciente, id: Date.now() };
    setPacientes([...pacientes, pacienteParaAgregar]);
    setNuevoPaciente({ nombre: '', edad: '', diagnostico: '' });
  };

  return (
    <div className="pacientes-container">
      <h2>Sección de Pacientes</h2>
      <div className="pacientes-content-layout">
        <div className="form-paciente">
          <h3>Agregar Nuevo Paciente</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input type="text" name="nombre" placeholder="Nombre completo" value={nuevoPaciente.nombre} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Edad:</label>
              <input type="number" name="edad" placeholder="Edad" value={nuevoPaciente.edad} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Diagnóstico:</label>
              <input type="text" name="diagnostico" placeholder="Diagnóstico principal" value={nuevoPaciente.diagnostico} onChange={handleInputChange} />
            </div>
            <button type="submit" className="btn-agregar">Agregar</button>
          </form>
        </div>
        <div className="lista-pacientes-container">
          <h3>Listado Actual</h3>
          <div className="lista-pacientes">
            {pacientes.map(paciente => (
              <div key={paciente.id} className="paciente-card">
                <h3>{paciente.nombre}</h3>
                <p>Edad: {paciente.edad}</p>
                <p>Diagnóstico: {paciente.diagnostico}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pacientes;