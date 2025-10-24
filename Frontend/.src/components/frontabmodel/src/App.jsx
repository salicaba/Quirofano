import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';
import Login from './Vistas/Login';
import Layout from './Vistas/Layout';
import Pacientes from './Vistas/Pacientes';
import Especialistas from './Vistas/Especialistas';
import EquipoMedico from './Vistas/EquipoMedico';
import Horarios from './Vistas/Horarios';
import Cirugias from './Vistas/Cirugias';
// El import de Quirofanos ha sido eliminado porque no existe.

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const cargarDatosUsuario = async() => {
    const token = localStorage.getItem('token');
    if(token){
      try{
        const response = await axios.get('http://localhost:4001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data); 
      } catch(error) {
        console.error('Token no válido, limpiando...', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const handleLogin = (data) =>{
    localStorage.setItem('token', data.token);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if(authLoading){
    return <div>Cargando aplicación...</div>
  }

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin}/>} />
        </Routes>
      ) : (
        <Routes>
          <Route 
            path="/" 
            element={
              <Layout 
                user={user} 
                onLogout={handleLogout} 
                onProfileUpdate={cargarDatosUsuario}
              />
            }
          >
            <Route 
                index 
                element={<Navigate to="/horarios" replace />} 
            />
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="especialistas" element={<Especialistas />} />
            {/* La ruta de Quirofanos ha sido eliminada */}
            <Route path="equipo-medico" element={<EquipoMedico />} />
            <Route path="horarios" element={<Horarios />} />
            <Route path="cirugias" element={<Cirugias />} />
             <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;