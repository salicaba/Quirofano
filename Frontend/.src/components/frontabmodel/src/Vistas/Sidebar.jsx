import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Sidebar.css';

const Sidebar = ({ user, onLogout, onProfileUpdate, onToggle }) => {
  // --- ESTADOS Y FUNCIONES PARA SUBIR FOTO ---
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

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
      if (onProfileUpdate) {
        onProfileUpdate(); // Llama a la función de App.jsx para recargar los datos
      }
    } catch (error) {
      console.error('Error al subir la foto:', error);
      alert('Error al subir la foto.');
    } finally {
      setSubiendo(false);
      setArchivo(null);
    }
  };
  
  // --- LÓGICA PARA MOSTRAR DATOS ---
  if (!user) {
    return <aside className="app-sidebar"></aside>; 
  }


  const imageUrl = user.foto_perfil 
    ? `http://localhost:4001/${user.foto_perfil.replace(/\\/g, '/')}`
    : null;
    const nombreCompleto = user.apellido_materno && user.apellido_materno !== 'null' 
    ? `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`
    : `${user.nombre} ${user.apellido_paterno}`;

  const inicial = user.nombre ? user.nombre.charAt(0).toUpperCase() : '?';

  return (
    <aside className="app-sidebar">
      <div className="profile">
        

        <div className="profile-image-container">
          {imageUrl ? (
            <img src={imageUrl} alt="Foto de perfil" className="profile-image" />
          ) : (
            <div className="profile-icon">{inicial}</div>
          )}
          <label htmlFor="file-upload" className="upload-icon-label">📷</label>
          <input 
            id="file-upload" 
            type="file" 
            className="hidden-file-input" 
            onChange={handleFileChange} 
            accept="image/*"
          />
        </div>

        {archivo && (
          <button onClick={handleImageUpload} className="upload-button" disabled={subiendo}>
            {subiendo ? 'Subiendo...' : 'Confirmar Foto'}
          </button>
        )}
        
        {/* --- INFORMACIÓN DEL PERFIL --- */}
        <h2>BIENVENIDO</h2>
        <h2 className="profile-name">{nombreCompleto}</h2>
        <p className="profile-role">{user.role}</p>
        {user.especialidad && <p className="profile-detail">{user.especialidad}</p>}
      </div>

      <div style={{flex: 1}}></div> 

      <div className="sidebar-divider">
        {onToggle && (
            <button className="toggle-sidebar-btn" onClick={onToggle}>
                ◀
            </button>
        )}
      </div>

      <button onClick={onLogout} className="logout-button">
        Cerrar Sesión
      </button>
    </aside>
  );
};

export default Sidebar;

