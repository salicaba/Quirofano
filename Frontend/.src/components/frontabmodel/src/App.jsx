import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Layout from './Vistas/Layout';
import Pacientes from './Vistas/Pacientes';
import Especialistas from './Vistas/Especialistas';
import Quirofanos from './Vistas/Quirofanos';
import EquipoMedico from './Vistas/EquipoMedico';
import Horarios from './Vistas/Horarios';
import Cirugias from './Vistas/Cirugias';

function App() {
  const [user, setUser] = useState({ 
    nombre: "Admin", 
    rol: "admin"
  });

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      {!user ? (
        <div>Login (por ahora estamos saltándolo)</div>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
              <Route index element={<Pacientes />} />
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="especialistas" element={<Especialistas />} />
              <Route path="quirofanos" element={<Quirofanos />} />
              <Route path="equipo-medico" element={<EquipoMedico />} />
              <Route path="horarios" element={<Horarios />} />
              <Route path="cirugias" element={<Cirugias />} />
            </Route>
          </Routes>

          {/* Botones para cambiar rol - Temporal */}
          <div style={{
            position: 'fixed', 
            bottom: '10px', 
            right: '10px', 
            background: 'white', 
            padding: '15px', 
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            zIndex: 1000,
            border: '2px solid #3498db'
          }}>
            <h4>🔧 Cambio Rápido de Rol</h4>
            <p>Actual: <strong>{user.rol}</strong></p>
            <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
              <button 
                onClick={() => setUser({ 
                  nombre: "Admin", 
                  rol: "admin" 
                })}
                style={{
                  padding: '8px 15px', 
                  background: user.rol === 'admin' ? '#3498db' : 'white',
                  color: user.rol === 'admin' ? 'white' : '#3498db',
                  border: '2px solid #3498db',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                👨‍💼 Cambiar a Admin
              </button>
              <button 
                onClick={() => setUser({ 
                  nombre: "Dr. Especialista", 
                  rol: "especialista",
                  especialidad: "Cardiología"
                })}
                style={{
                  padding: '8px 15px', 
                  background: user.rol === 'especialista' ? '#e74c3c' : 'white',
                  color: user.rol === 'especialista' ? 'white' : '#e74c3c',
                  border: '2px solid #e74c3c',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                👨‍⚕️ Cambiar a Especialista
              </button>
            </div>
          </div>
        </>
      )}
    </BrowserRouter>
  );
}

export default App;