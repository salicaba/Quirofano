import React, { useState, useEffect } from 'react'; // 1. Se añade useEffect
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import axios from 'axios';
import Login from './Vistas/Login';
import Layout from './Vistas/Layout';
import Pacientes from './Vistas/Pacientes';
import Especialistas from './Vistas/Especialistas';
import Citas from './Vistas/Citas';
import Horarios from './Vistas/Horarios';
import Reportes from './Vistas/Reportes';

function App() {
  const [user, setUser] = useState(null);
  // 2. Estado para saber si estamos verificando el token inicial
  const [authLoading, setAuthLoading] = useState(true);

  // 3. Función para obtener los datos del usuario usando el token
  const cargarDatosUsuario = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('http://localhost:4001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data); // Guarda los datos completos del usuario
      } catch (error) {
        console.error('Token no válido, limpiando...', error);
        localStorage.removeItem('token');
      }
    }
    setAuthLoading(false);
  };

  // 4. Al cargar la app, intenta obtener los datos del usuario si hay un token guardado
  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  // 5. handleLogin ahora recibe el TOKEN, no los datos del usuario
  const handleLogin = (data) => {
    localStorage.setItem('token', data.token); // Guarda el token en el almacenamiento local
    cargarDatosUsuario(); // Carga los datos completos del usuario usando el nuevo token
  };

  // 6. handleLogout ahora también limpia el token del almacenamiento
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // 7. Muestra "Cargando..." mientras se verifica el token para evitar parpadeos
  if (authLoading) {
    return <div>Cargando aplicación...</div>;
  }

  return (
    <BrowserRouter>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Routes>
          <Route path="/" element={<Layout user={user} onLogout={handleLogout} onProfileUpdate={cargarDatosUsuario} />}>
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="especialistas" element={<Especialistas />} />
            <Route path="citas" element={<Citas />} />
            <Route path="horarios" element={<Horarios />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;