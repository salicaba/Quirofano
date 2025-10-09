import React, { useState } from 'react'; // AÑADIDO: useState
import axios from 'axios'; // AÑADIDO: axios
import '../styles/Sidebar.css';

const Sidebar = ({ user, onLogout, onProfileUpdate }) => { // AÑADIDO: onProfileUpdate
  // --- INICIO DE LO AÑADIDO: ESTADOS Y FUNCIONES ---

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
        onProfileUpdate(); // Llama a la función para recargar los datos del usuario
      }
    } catch (error) {
      console.error('Error al subir la foto:', error);
      alert('Error al subir la foto.');
    } finally {
      setSubiendo(false);
      setArchivo(null);
    }
  };

  const imageUrl = user.foto_perfil 
    ? `http://localhost:4001/${user.foto_perfil.replace(/\\/g, '/')}`
    : null;

  // --- FIN DE LO AÑADIDO ---

  console.log('Datos del usuario en Sidebar:', user);

  if (!user) {
    return <aside className="app-sidebar"></aside>;
  }

  const nombreCompleto = `${user.nombre} ${user.apellido_paterno}`;

  return (
    <aside className="app-sidebar">
      <div className="profile">
        
        {/* --- INICIO DE LO AÑADIDO: SECCIÓN PARA MOSTRAR/SUBIR IMAGEN --- */}
        <div className="profile-image-container">
          {imageUrl ? (
            <img src={imageUrl} alt="Foto de perfil" className="profile-image" />
          ) : (
            <div className="profile-icon"></div>
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
        {/* --- FIN DE LO AÑADIDO --- */}

        {/* Tu código existente para mostrar la información */}
        <h2 className="profile-name">{nombreCompleto}</h2>
        <p className="profile-role">{user.role}</p> {/* Asegúrate de que esta propiedad sea 'role' en singular */}
        
        {user.cedula_profecional && <p className="profile-detail">Cédula: {user.cedula_profecional}</p>}
        {user.especialidades && <p className="profile-detail">Especialidad: {user.especialidades}</p>}
      </div>

      <button onClick={onLogout} className="logout-button">
        Cerrar Sesión
      </button>
    </aside>
  );
};

export default Sidebar;