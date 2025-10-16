import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {
  


  if (!user) {
    return (
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Hospital ADMODEL</h1>
        </div>
      </header>
    );
  }

 
  const userRole = user.role ? user.role.toLowerCase() : '';

  const isAdmin = userRole === 'administrador';

  const isEspecialista = userRole === 'especialista' || userRole === 'espacialista';

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Hospital ADMODEL</h1>
      </div>
      
      <nav className="header-nav">
        {/* ENLACES PARA ADMIN */}
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
        
        {/* ENLACES PARA ESPECIALISTA */}
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

