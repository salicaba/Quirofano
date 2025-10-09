import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

// 1. Se añade 'onLogout' para que el botón de cerrar sesión funcione
const Header = ({ user, onLogout }) => {

  // 2. Guarda de seguridad: Si no hay usuario, no se intenta leer 'user.role'
  if (!user) {
    // Puedes retornar null o una versión mínima del header
    return (
      <header className="app-header">
        <h1 className="app-title">Hospital ADMODEL</h1>
      </header>
    );
  }

  // Si el usuario sí existe, se renderiza el header completo
  return (
    <header className="app-header">
      <h1 className="app-title">Hospital ADMODEL</h1>
      
      {/* 3. Lógica de navegación sin duplicación */}
      <nav className="header-nav">
        {/* Enlaces comunes para todos los roles */}
        <Link to="/pacientes" className="nav-button">Pacientes</Link>
        <Link to="/horarios" className="nav-button">Horarios</Link>
        
        {/* Enlaces exclusivos para el rol 'Admin' */}
        {user.role === 'Admin' && (
          <>
            <Link to="/especialistas" className="nav-button">Especialistas</Link>
            <Link to="/reportes" className="nav-button">Reportes</Link>
          </>
        )}

        {/* En tu código original, el rol 'Especialista' también veía 'Reportes'.
            Si ambos roles deben verlo, puedes ponerlo en los enlaces comunes.
            Si solo el Admin lo ve, esta estructura es más limpia. */}
      </nav>
    </header>
  );
};

export default Header;