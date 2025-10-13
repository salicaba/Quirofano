import React, { useState } from 'react';
import EmergenciaModal from './EmergenciaModal';
import '../styles/Horarios.css';

const Horarios = () => {
  const [showEmergenciaModal, setShowEmergenciaModal] = useState(false);

  const handleEmergenciaConfirm = (datosCirugia) => {
    console.log('Datos de cirugía de emergencia:', datosCirugia);
    alert(`🚨 Cirugía de emergencia registrada para: ${datosCirugia.paciente}`);
  };

  return (
    <div className="horarios-container">
      <div className="horarios-header">
        <h2>Gestión de Horarios</h2>
        <button 
          className="emergency-btn-horarios"
          onClick={() => setShowEmergenciaModal(true)}
        >
          🚨 Cirugía de Emergencia
        </button>
      </div>

      <div className="horarios-content">
        <div className="horarios-info">
          <h3>Horarios de Atención</h3>
          <p>Aquí podrás gestionar los horarios de los especialistas...</p>
          {/* Aquí irá el contenido real de horarios */}
        </div>
      </div>

      <EmergenciaModal
        isOpen={showEmergenciaModal}
        onClose={() => setShowEmergenciaModal(false)}
        onConfirm={handleEmergenciaConfirm}
      />
    </div>
  );
};

export default Horarios;