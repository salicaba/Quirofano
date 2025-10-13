import React, { useState } from 'react';
import '../styles/Quirofanos.css';

const Quirofanos = () => {
  const [quirofanos, setQuirofanos] = useState([
    { id: 1, nombre: 'Quirófano 1', estado: 'disponible', equipamiento: 'Básico' },
    { id: 2, nombre: 'Quirófano 2', estado: 'ocupado', equipamiento: 'Avanzado' },
    { id: 3, nombre: 'Quirófano 3', estado: 'mantenimiento', equipamiento: 'Básico' }
  ]);

  return (
    <div className="quirofanos-container">
      <h2>Gestión de Quirófanos</h2>
      
      <div className="quirofanos-content">
        <div className="quirofanos-grid">
          {quirofanos.map(quirofano => (
            <div key={quirofano.id} className={`quirofano-card ${quirofano.estado}`}>
              <h3>{quirofano.nombre}</h3>
              <p className={`estado ${quirofano.estado}`}>
                {quirofano.estado === 'disponible' ? '✅ Disponible' : 
                 quirofano.estado === 'ocupado' ? '🔴 Ocupado' : '🛠️ Mantenimiento'}
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
};

export default Quirofanos;