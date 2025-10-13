import React from 'react';
// 1. Importa NavLink en lugar de Link y quita useLocation
import { NavLink } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {

  // 2. Guarda de seguridad para evitar errores si 'user' es nulo
  // Si no hay usuario, muestra una versión mínima del header.
  if (!user) {
    return (
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Hospital ADMODEL</h1>
        </div>
      </header>
    );
  }

  // 3. Variables claras para verificar los roles (insensible a mayúsculas)
  const userRole = user.roles ? user.roles.toLowerCase() : '';
  const isAdmin = userRole === 'admin';
  const isEspecialista = userRole === 'especialista'; // O 'espacialista' si tienes un typo en la BD

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Hospital ADMODEL</h1>
      </div>
      
      <nav className="header-nav">
        {/* --- ENLACES PARA EL ROL DE ADMIN --- */}
        {isAdmin && (
          <>
            <NavLink to="/pacientes" className="nav-button">Pacientes</NavLink>
            <NavLink to="/especialistas" className="nav-button">Especialistas</NavLink>
            <NavLink to="/quirofanos" className="nav-button">Quirófanos</NavLink>
            <NavLink to="/equipo-medico" className="nav-button">Equipo Médico</NavLink>
            <NavLink to="/horarios" className="nav-button">Horarios</NavLink>
            <NavLink to="/cirugias" className="nav-button">Cirugías</NavLink>
          </>
        )}
        
        {/* --- ENLACES PARA EL ROL DE ESPECIALISTA --- */}
        {isEspecialista && (
          <>
            <NavLink to="/pacientes" className="nav-button">Pacientes</NavLink>
            <NavLink to="/citas" className="nav-button">Citas</NavLink>
            <NavLink to="/horarios" className="nav-button">Mis Horarios</NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;