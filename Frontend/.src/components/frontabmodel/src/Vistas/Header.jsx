import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {
  const location = useLocation();
  const esAdmin = user?.rol === 'admin';

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Hospital ADMODEL</h1>
      </div>
      
      <nav className="header-nav">
        <Link to="/pacientes" className={location.pathname === '/pacientes' ? 'nav-button active' : 'nav-button'}>
          Pacientes
        </Link>
        
        {/* Especialistas - Solo Admin */}
        {esAdmin && (
          <Link to="/especialistas" className={location.pathname === '/especialistas' ? 'nav-button active' : 'nav-button'}>
            Especialistas
          </Link>
        )}
        
        {/* Quirófanos - Solo Admin */}
        {esAdmin && (
          <Link to="/quirofanos" className={location.pathname === '/quirofanos' ? 'nav-button active' : 'nav-button'}>
           Quirófanos
          </Link>
        )}
        
        {/* Equipo Médico - Ambos roles */}
        <Link to="/equipo-medico" className={location.pathname === '/equipo-medico' ? 'nav-button active' : 'nav-button'}>
          Equipo Médico
        </Link>
        
        <Link to="/horarios" className={location.pathname === '/horarios' ? 'nav-button active' : 'nav-button'}>
          Horarios
        </Link>
        <Link to="/cirugias" className={location.pathname === '/cirugias' ? 'nav-button active' : 'nav-button'}>
          Cirugías
        </Link>
      </nav>
    </header>
  );
};

export default Header;