import React from 'react';
import '../styles/Header.css';

const Header = ({ user }) => {
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

  const nombreCompleto = user.apellido_materno && user.apellido_materno !== 'null' 
    ? `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`
    : `${user.nombre} ${user.apellido_paterno}`;

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Hospital ADMODEL</h1>
      </div>
      
      {/* INFO DEL USUARIO - REEMPLAZA LAS PESTAÑAS */}
      <div className="header-user-info">
        <span className="user-name-header">{nombreCompleto}</span>
        <span className="user-role-header">{user.role}</span>
        {user.especialidad && <span className="user-specialty-header">{user.especialidad}</span>}
      </div>
    </header>
  );
};

export default Header;