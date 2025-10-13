import React, { useState } from 'react';
import '../styles/Cirugias.css';

const Cirugias = () => {
  const [cirugias, setCirugias] = useState([
    { 
      id: 1, 
      paciente: 'Juan Pérez', 
      tipo: 'Cardíaca', 
      especialista: 'Dr. Carlos García',
      fecha: '2024-01-15',
      estado: 'completada',
      quirofano: 'Quirófano 1'
    },
    { 
      id: 2, 
      paciente: 'Ana Gómez', 
      tipo: 'Abdominal', 
      especialista: 'Dr. María López',
      fecha: '2024-01-16', 
      estado: 'programada',
      quirofano: 'Quirófano 2'
    }
  ]);

  return (
    <div className="cirugias-container">
      <h2>Gestión de Cirugías</h2>
      
      <div className="cirugias-content">
        <div className="cirugias-list">
          {cirugias.map(cirugia => (
            <div key={cirugia.id} className={`cirugia-card ${cirugia.estado}`}>
              <h3>{cirugia.paciente}</h3>
              <p><strong>Tipo:</strong> {cirugia.tipo}</p>
              <p><strong>Especialista:</strong> {cirugia.especialista}</p>
              <p><strong>Fecha:</strong> {cirugia.fecha}</p>
              <p><strong>Quirófano:</strong> {cirugia.quirofano}</p>
              <p className={`estado ${cirugia.estado}`}>
                {cirugia.estado === 'completada' ? '✅ Completada' : 
                 cirugia.estado === 'programada' ? '🟡 Programada' : '🔴 En Proceso'}
              </p>
              <div className="cirugia-actions">
                <button>Editar</button>
                <button>Ver Detalles</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cirugias;