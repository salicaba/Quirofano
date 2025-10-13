import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ user, onLogout, onToggle }) => {
  const esAdmin = user?.rol === 'admin';
  const inicial = esAdmin ? 'A' : 'E';
  const rolTexto = esAdmin ? 'Administrador' : 'Especialista';

  return (
    <aside className="app-sidebar">
      <div className="profile">
        <div className="profile-image-container">
          <div className="profile-icon">{inicial}</div>
        </div>
        <h2 className="profile-name">{user?.nombre || 'Usuario'}</h2>
        <p className="profile-role">{rolTexto}</p>
        {user?.especialidad && <p className="profile-detail">{user.especialidad}</p>}
      </div>

      <div style={{flex: 1}}></div>

      {/* Botón para ocultar en la división */}
      <div className="sidebar-divider">
        <button className="toggle-sidebar-btn" onClick={onToggle}>
          ◀
        </button>
      </div>

      <button onClick={onLogout} className="logout-button">
        Cerrar Sesión
      </button>
    </aside>
  );
};

export default Sidebar;