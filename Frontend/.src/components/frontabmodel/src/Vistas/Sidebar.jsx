import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ user, onProfileUpdate, onToggle }) => {
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  // Lógica de Roles para Navegación
  const userRole = user?.role?.toLowerCase() || '';
  const isAdmin = userRole === 'administrador';
  const isEspecialista = userRole === 'especialista' || userRole === 'espacialista'; // Revisa si 'espacialista' es correcto

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!archivo) {
      alert('Por favor, selecciona un archivo primero.');
      return;
    }
    setSubiendo(true);
    const formData = new FormData();
    formData.append('fotoPerfil', archivo);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:4001/api/usuarios/perfil/foto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      alert('¡Foto de perfil actualizada!');
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error('Error al subir la foto:', error.response?.data || error.message);
      alert('Error al subir la foto. Verifica la consola.');
    } finally {
      setSubiendo(false);
      setArchivo(null);
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    }
  };

  if (!user) {
    return <aside className="app-sidebar"></aside>;
  }

  const imageUrl = user.foto_perfil
    ? `http://localhost:4001/${user.foto_perfil.replace(/\\/g, '/')}`
    : null; // Considera una imagen placeholder aquí

  const inicial = user.nombre ? user.nombre.charAt(0).toUpperCase() : '?';

  return (
    <aside className="app-sidebar">
      {/* Perfil */}
      <div className="profile">
        {/* Contenedor Imagen y Botón Subir */}
        <div className="profile-image-container">
          {imageUrl ? (
            <img src={imageUrl} alt="Foto de perfil" className="profile-image" onError={(e) => { e.target.onerror = null; e.target.src = '/path/to/default/avatar.png'; }} /> // Añade una imagen por defecto si falla
          ) : (
            <div className="profile-icon">{inicial}</div>
          )}
          <label htmlFor="file-upload" className="upload-icon-label" title="Cambiar foto">📷</label>
          <input
            id="file-upload" type="file" className="hidden-file-input"
            onChange={handleFileChange} accept="image/*"
          />
        </div>
        {/* Botón confirmar foto */}
        {archivo && (
          <button onClick={handleImageUpload} className="upload-button" disabled={subiendo}>
            {subiendo ? 'Subiendo...' : 'Confirmar Foto'}
          </button>
        )}

        {/* ----- MENSAJE AÑADIDO AQUÍ ----- */}
        <h2 className="sidebar-welcome-message">BIENVENIDO</h2>

      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
       {isAdmin && (
         <>
           <NavLink to="/pacientes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Pacientes</NavLink>
           <NavLink to="/especialistas" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Especialistas</NavLink>
           <NavLink to="/equipo-medico" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Equipo Médico</NavLink>
           <NavLink to="/horarios" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Horarios</NavLink>
           <NavLink to="/cirugias" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Cirugías</NavLink>
         </>
       )}
       {isEspecialista && (
         <>
           <NavLink to="/pacientes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Pacientes</NavLink>
           <NavLink to="/citas" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Citas</NavLink> {/* Asegúrate que esta ruta existe */}
           <NavLink to="/horarios" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Mis Horarios</NavLink>
         </>
       )}
     </nav>


      {/* Divisor y Botón de Ocultar */}
      {/* Usamos flex: 1 en la navegación o un div vacío para empujar esto hacia abajo */}
      <div style={{ flex: 1 }}></div> {/* Empuja el divisor hacia abajo */}
      <div className="sidebar-divider">
        {onToggle && (
          <button className="toggle-sidebar-btn" onClick={onToggle} title="Ocultar menú">
            ◀
          </button>
        )}
      </div>

      {/* Botón Cerrar Sesión ELIMINADO de aquí */}

    </aside>
  );
};

export default Sidebar;