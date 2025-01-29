import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
    navigate('/projects');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1A1A1A',
      padding: '20px'
    }}>
      <div style={{
        width: '960px',
        height: '620px',
        display: 'flex',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Panel izquierdo */}
        <div style={{
          flex: '1',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'rgba(50, 51, 53, 0.95)'
        }}>
          <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
            <h1 style={{ color: '#FFFFFF', fontSize: '32px', marginBottom: '40px' }}>
              Bienvenido
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input
                type="email"
                placeholder="get@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              <button type="submit" style={buttonStyle}>
                Entrar
              </button>
            </form>
          </div>
        </div>

        {/* Panel derecho - Misma imagen que Register */}
        <div style={{
          flex: '1',
          backgroundImage: 'url(https://i.imgur.com/3iq0bRX.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
      </div>
    </div>
  );
}

// Estilos reutilizables (puedes moverlos a un archivo aparte)
const inputStyle = {
  padding: '12px 16px',
  backgroundColor: '#FFFFFF',
  border: 'none',
  borderRadius: '4px',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box'
};

const buttonStyle = {
  padding: '12px',
  backgroundColor: '#323335',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '4px',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
};

export default Login;