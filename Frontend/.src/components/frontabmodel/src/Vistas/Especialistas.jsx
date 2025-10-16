import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Especialistas.css';
import { useEffect } from 'react';

const Especialistas = () => {

  // --- ESTADOS ---
  const [medicos, setMedicos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formState, setFormState] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    cedula_profecional: '',
    telefono: '',
    id_rol: '',
    id_especialidad: '',
    password: ''
  });

  const API_BASE_URL = 'http://localhost:4001/api';

  // --- VALIDACIONES ---
  const validaciones = {
    // Solo letras y espacios, entre 2 y 50 caracteres
    nombre: (valor) => {
      const regex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/;
      if (!valor.trim()) return 'El nombre es requerido';
      if (!regex.test(valor)) return 'El nombre solo puede contener letras y espacios (2-50 caracteres)';
      return null;
    },

    apellido_paterno: (valor) => {
      const regex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,30}$/;
      if (!valor.trim()) return 'El apellido paterno es requerido';
      if (!regex.test(valor)) return 'El apellido paterno solo puede contener letras y espacios (2-30 caracteres)';
      return null;
    },

    apellido_materno: (valor) => {
      const regex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{0,30}$/;
      if (valor && !regex.test(valor)) return 'El apellido materno solo puede contener letras y espacios (máximo 30 caracteres)';
      return null;
    },

    // Formato: Med-012-ABC (3 letras, 3 números, 3 letras)
    cedula_profecional: (valor) => {
      const regex = /^[A-Za-z]{3}-\d{3}-[A-Za-z]{3}$/;
      if (!valor.trim()) return 'La cédula profesional es requerida';
      if (!regex.test(valor)) return 'Formato inválido. Use: XXX-123-XXX (ej: Med-012-ABC)';
      return null;
    },

    // Formato: (+52)961-123-4567
    telefono: (valor) => {
      const regex = /^\(\+52\)\d{3}-\d{3}-\d{4}$/;
      if (valor && !regex.test(valor)) return 'Formato inválido. Use: (+52)961-123-4567';
      return null;
    },

    password: (valor, isEditing) => {
      if (!isEditing && !valor.trim()) return 'La contraseña es requerida';
      if (valor && valor.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
      return null;
    }
  };

  // --- MÉTODOS DE FORMATEO ---
  const formatearCedula = (valor) => {
    // Eliminar todo excepto letras y números
    let cleaned = valor.replace(/[^A-Za-z0-9]/g, '');
    
    if (cleaned.length <= 3) {
      return cleaned.toUpperCase();
    } else if (cleaned.length <= 6) {
      return cleaned.slice(0, 3).toUpperCase() + '-' + cleaned.slice(3, 6);
    } else {
      return cleaned.slice(0, 3).toUpperCase() + '-' + cleaned.slice(3, 6) + '-' + cleaned.slice(6, 9).toUpperCase();
    }
  };

  const formatearTelefono = (valor) => {
    // Eliminar todo excepto números
    let cleaned = valor.replace(/\D/g, '');
    
    if (cleaned.startsWith('52')) {
      cleaned = cleaned.slice(2);
    }
    
    if (cleaned.length === 0) {
      return '(+52)';
    } else if (cleaned.length <= 3) {
      return `(+52)${cleaned}`;
    } else if (cleaned.length <= 6) {
      return `(+52)${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      return `(+52)${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  // --- CARGA DE DATOS INICIAL ---
  const cargarDatos = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resMedicos, resRoles, resEspecialidades] = await Promise.all([
        axios.get(`${API_BASE_URL}/usuarios`, { headers }),
        axios.get(`${API_BASE_URL}/roles`, { headers }),
        axios.get(`${API_BASE_URL}/especialidades`, { headers })
      ]);
      setMedicos(resMedicos.data);
      setRoles(resRoles.data);
      setEspecialidades(resEspecialidades.data);
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- MANEJADORES DE FORMULARIO ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;

    // Aplicar formato según el campo
    if (name === 'cedula_profecional') {
      valorFormateado = formatearCedula(value);
    } else if (name === 'telefono') {
      valorFormateado = formatearTelefono(value);
    } else if (['nombre', 'apellido_paterno', 'apellido_materno'].includes(name)) {
      // Solo permitir letras y espacios en nombres
      valorFormateado = value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '');
    }

    setFormState(prev => ({ ...prev, [name]: valorFormateado }));

    // Validar en tiempo real y limpiar error si existe
    if (fieldErrors[name]) {
      const error = validarCampo(name, valorFormateado);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validarCampo = (name, value) => {
    if (name === 'password') {
      return validaciones.password(value, isEditing);
    }
    return validaciones[name] ? validaciones[name](value) : null;
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar todos los campos
    Object.keys(formState).forEach(key => {
      if (key !== 'password' || !isEditing) {
        const error = validarCampo(key, formState[key]);
        if (error) {
          nuevosErrores[key] = error;
        }
      }
    });

    // Validar campos select
    if (!formState.id_rol) nuevosErrores.id_rol = 'El rol es requerido';
    if (!formState.id_especialidad) nuevosErrores.id_especialidad = 'La especialidad es requerida';

    setFieldErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormState({
      nombre: '', 
      apellido_paterno: '', 
      apellido_materno: '',
      cedula_profecional: '',
      telefono: '', 
      id_rol: '', 
      id_especialidad: '', 
      password: ''
    });
    setFieldErrors({});
  };

  const handleCancelar = () => {
    resetForm();
  };

  // --- LÓGICA CRUD ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    if (!validarFormulario()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const dataToSend = { ...formState };
    if (isEditing && !dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      if (isEditing) {
        const response = await axios.put(`${API_BASE_URL}/usuarios/${isEditing}`, dataToSend, { headers });
        
        if (response.data.medico) {
          setMedicos(medicos.map(medico => 
            medico.id_medicos === isEditing ? response.data.medico : medico
          ));
        } else {
          await cargarDatos();
        }
        
        alert('¡Especialista actualizado con éxito!');
        resetForm();
      } else {
        const response = await axios.post(`${API_BASE_URL}/usuarios`, dataToSend, { headers });
        
        if (response.data.medico) {
          setMedicos([...medicos, response.data.medico]);
        } else {
          await cargarDatos();
        }
        
        alert('¡Especialista registrado con éxito!');
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar el especialista.');
    }
  };

  const handleEditar = (medico) => {
    setIsEditing(medico.id_medicos);
    setFormState({
      nombre: medico.nombre || '',
      apellido_paterno: medico.apellido_paterno || '',
      apellido_materno: medico.apellido_materno || '',
      cedula_profecional: medico.cedula_profecional || '',
      telefono: medico.telefono || '',
      id_rol: medico.id_rol,
      id_especialidad: medico.id_especialidad,
      password: ''
    });
    setFieldErrors({});
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar a este especialista?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/usuarios/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setMedicos(medicos.filter(esp => esp.id_medicos !== id));
        alert('Especialista eliminado con éxito.');
      } catch (err) {
        setError(err.response?.data?.msg || 'Error al eliminar el especialista.');
      }
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  if (loading) return <div>Cargando gestión de especialistas...</div>;

  return (
    <div className="especialistas-container">
      <h2>Gestión de Especialistas</h2>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="btn-cerrar-error">×</button>
        </div>
      )}
      
      <div className="especialistas-content-layout">
        {/* FORMULARIO PARA REGISTRAR */}
        <div className="form-especialista">
          <h3>{isEditing ? 'Editando Especialista' : 'Registrar Nuevo Especialista'}</h3>
          
          <form onSubmit={handleSubmit}>
            {/* Nombre */}
            <div className="form-group">
              <label>Nombre *</label>
              <input 
                type="text" 
                name="nombre" 
                value={formState.nombre} 
                onChange={handleInputChange}
                onBlur={() => {
                  const error = validaciones.nombre(formState.nombre);
                  setFieldErrors(prev => ({ ...prev, nombre: error }));
                }}
                placeholder="Ej: Juan Carlos" 
                required 
                className={fieldErrors.nombre ? 'input-error' : ''}
              />
              {fieldErrors.nombre && <span className="error-text">{fieldErrors.nombre}</span>}
            </div>

            {/* Apellido Paterno */}
            <div className="form-group">
              <label>Apellido Paterno *</label>
              <input 
                type="text" 
                name="apellido_paterno" 
                value={formState.apellido_paterno} 
                onChange={handleInputChange}
                onBlur={() => {
                  const error = validaciones.apellido_paterno(formState.apellido_paterno);
                  setFieldErrors(prev => ({ ...prev, apellido_paterno: error }));
                }}
                placeholder="Ej: Pérez" 
                required 
                className={fieldErrors.apellido_paterno ? 'input-error' : ''}
              />
              {fieldErrors.apellido_paterno && <span className="error-text">{fieldErrors.apellido_paterno}</span>}
            </div>

            {/* Apellido Materno */}
            <div className="form-group">
              <label>Apellido Materno</label>
              <input 
                type="text" 
                name="apellido_materno" 
                value={formState.apellido_materno} 
                onChange={handleInputChange}
                onBlur={() => {
                  const error = validaciones.apellido_materno(formState.apellido_materno);
                  setFieldErrors(prev => ({ ...prev, apellido_materno: error }));
                }}
                placeholder="Ej: García" 
                className={fieldErrors.apellido_materno ? 'input-error' : ''}
              />
              {fieldErrors.apellido_materno && <span className="error-text">{fieldErrors.apellido_materno}</span>}
            </div>

            {/* Cédula Profesional */}
            <div className="form-group">
              <label>Cédula Profesional *</label>
              <input 
                type="text" 
                name="cedula_profecional" 
                value={formState.cedula_profecional} 
                onChange={handleInputChange}
                onBlur={() => {
                  const error = validaciones.cedula_profecional(formState.cedula_profecional);
                  setFieldErrors(prev => ({ ...prev, cedula_profecional: error }));
                }}
                placeholder="Ej: Med-012-ABC" 
                required 
                className={fieldErrors.cedula_profecional ? 'input-error' : ''}
              />
              {fieldErrors.cedula_profecional && <span className="error-text">{fieldErrors.cedula_profecional}</span>}
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label>Teléfono</label>
              <input 
                type="text" 
                name="telefono" 
                value={formState.telefono} 
                onChange={handleInputChange}
                onBlur={() => {
                  const error = validaciones.telefono(formState.telefono);
                  setFieldErrors(prev => ({ ...prev, telefono: error }));
                }}
                placeholder="Ej: (+52)961-123-4567" 
                className={fieldErrors.telefono ? 'input-error' : ''}
              />
              {fieldErrors.telefono && <span className="error-text">{fieldErrors.telefono}</span>}
            </div>
            
            {/* Especialidad */}
            <div className="form-group-combobox">
              <label>Especialidad *</label>
              <div className="combobox-container">
                <select 
                  name="id_especialidad" 
                  value={formState.id_especialidad} 
                  onChange={handleInputChange}
                  required
                  className={fieldErrors.id_especialidad ? 'input-error' : ''}
                >
                  <option value="">Seleccionar especialidad</option>
                  {especialidades.map(especialidad => (
                    <option key={especialidad.id_especialidad} value={especialidad.id_especialidad}>
                      {especialidad.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.id_especialidad && <span className="error-text">{fieldErrors.id_especialidad}</span>}
            </div>
            
            {/* Rol */}
            <div className="form-group-combobox">
              <label>Rol *</label>
              <div className="combobox-container">
                <select 
                  name="id_rol" 
                  value={formState.id_rol} 
                  onChange={handleInputChange}
                  required
                  className={fieldErrors.id_rol ? 'input-error' : ''}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(rol => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.id_rol && <span className="error-text">{fieldErrors.id_rol}</span>}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label>Contraseña {!isEditing && '*'}</label>
              <input 
                type="password" 
                name="password" 
                value={formState.password} 
                onChange={handleInputChange}
                onBlur={() => {
                  const error = validaciones.password(formState.password, isEditing);
                  setFieldErrors(prev => ({ ...prev, password: error }));
                }}
                required={!isEditing}
                placeholder={isEditing ? "Dejar vacío para mantener la actual" : "Mínimo 6 caracteres"}
                className={fieldErrors.password ? 'input-error' : ''}
              />
              {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-agregar">
                {isEditing ? '💾 Actualizar' : '➕ Registrar'}
              </button>
              {isEditing && (
                <button type="button" onClick={handleCancelar} className="btn-cancelar">
                  ❌ Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTADO DERECHO */}
        <div className="lista-especialistas-container">
          <div className="header-lista">
            <h3>Listado de Especialistas</h3>
            <span className="contador-especialistas">{medicos.length} especialistas</span>
          </div>

          {medicos.length > 0 ? (
            <div className="lista-especialistas">
              {medicos.map(medico => (
                <div key={medico.id_medicos} className="especialista-card">
                  <div className="especialista-header">
                    <div className="especialista-avatar">
                      {(medico.nombre?.charAt(0) || '')}
                      {(medico.apellido_paterno?.charAt(0) || '')}
                    </div>
                    <div className="especialista-info">
                      <h4>{medico.nombre} {medico.apellido_paterno}</h4>
                      <p className="especialista-datos">
                        <strong>Id:</strong> {medico.id_medicos} |
                        <strong>Cédula:</strong> {medico.cedula_profecional} | 
                        <strong>Especialidad:</strong> {medico.especialidad} | 
                        <strong>Teléfono:</strong> {medico.telefono}
                      </p>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      onClick={() => handleEditar(medico)}
                      className="btn-editar"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleEliminar(medico.id_medicos)}
                      className="btn-eliminar"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lista-vacia">
              <p>No hay especialistas registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Especialistas;