import React, { useState } from 'react'; // CORRECCIÓN: Se agrega 'React' para seguir buenas prácticas.
import axios from 'axios';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
    
  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setError('');

    if(!cedula || !password){
      setError('Por favor, ingrese la cédula y contraseña.');
      return;
    }

    try {
      // CORRECCIÓN 2: La URL tenía 'htttp' y '/3000'. Se corrigió a 'http' y ':3000'.
      const response = await axios.post('http://localhost:4001/api/auth/login', {
        cedula: cedula,
        password: password
      });

      // CORRECCIÓN 3: La variable estaba mal escrita como 'respose'. Se corrigió a 'response'.
      onLogin(response.data);

    } catch (err) {
      setError('Cédula o contraseña incorrectas. Por favor, intenta de nuevo.');
      console.error('Error de autenticación:', err);
    }
  }; // <-- La función handleSubmit se cierra aquí.

  // CORRECCIÓN 1: Se eliminó la llave de cierre '};' que estaba aquí y rompía el componente.

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <span className="logo-icon">+</span> 
        </div>
        <h1 className="title">ADMODEL</h1>
        <p className="subtitle">HOSPITAL PRIVADO</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            {/* CORRECCIÓN 4 (Sugerencia): Cambiado para mayor claridad */}
            <label htmlFor="cedula">Cédula Profesional</label>
            <input 
              type="text" 
              id="cedula" 
              name="cedula" 
              value={cedula} 
              onChange={(e) => setCedula(e.target.value)}
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
            />
          </div>
          <button type="submit" className="login-button">
            INGRESAR
          </button>
        </form>
      </div>
    </div>
  );
}; // <-- La llave que cierra el componente DEBE estar aquí, al final.

export default Login;