import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
    
  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setError('');
    setErrorLogin('');
    try {
      const response = await axios.post('http://localhost:4001/api/auth/login', {
        cedula: cedula,
        password: password
      });
      
      console.log('1. Login exitoso. Respuesta completa:', response.data);
      
      // MODIFICACIÓN: Guardar tanto token como información del usuario
      if (response.data.token && response.data.user) {
        // Guardar token en localStorage
        localStorage.setItem('token', response.data.token);
        
        // GUARDAR INFORMACIÓN DEL USUARIO CON SU ROL
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('2. Usuario guardado en localStorage:', response.data.user);
        
        // Pasar los datos al componente padre (App.jsx)
        onLogin(response.data);
      } else {
        setErrorLogin('Error en la respuesta del servidor');
      }
      
    } catch (err) {
      setErrorLogin('Cédula o contraseña incorrectas. Por favor, verifique sus credenciales.');
      console.error('Error de autenticación:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <span className="logo-icon">+</span> 
        </div>
        <h1 className="title">ABMODEL</h1>
        <p className="subtitle">Bienvenido a ABMODEL</p>
       
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="cedula">Cédula Profesional</label>
            <input 
              type="text" 
              id="cedula" 
              name="cedula" 
              value={cedula} 
              onChange={(e) => setCedula(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            INGRESAR
          </button>
        </form>
        
        {/* MOSTRAR ERROR SI FALLAN LAS CREDENCIALES */}
        {errorLogin && (
          <div className="error-alert">
            {errorLogin}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;