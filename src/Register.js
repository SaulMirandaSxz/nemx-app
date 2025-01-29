import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nemxId: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.email && formData.password && formData.nemxId) {
        onLogin();
        navigate('/projects');
      } else {
        alert('Por favor, complete todos los campos');
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      alert('Error al iniciar sesión');
    }
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
          <div style={{
            maxWidth: '360px',
            margin: '0 auto',
            width: '100%'
          }}>
            <h1 style={{
              color: '#FFFFFF',
              fontSize: '32px',
              marginBottom: '40px',
              fontWeight: '500'
            }}>
              Bienvenido
            </h1>

            <form onSubmit={handleSubmit} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px'
            }}>
              <input
                type="email"
                name="email"
                placeholder="get@email.com"
                value={formData.email}
                onChange={handleChange}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="text"
                name="nemxId"
                placeholder="No. de ID NEMX"
                value={formData.nemxId}
                onChange={handleChange}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="button"
                onClick={() => {/* Lógica para recuperar contraseña */}}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  opacity: '0.8',
                  textAlign: 'left',
                  padding: '0',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Olvidé mi contraseña
              </button>

              <button
                type="submit"
                style={{
                  padding: '12px',
                  backgroundColor: '#323335',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  transition: 'background-color 0.3s'
                }}
              >
                Entrar
              </button>
            </form>
          </div>
        </div>

        {/* Panel derecho - Imagen */}
        <div style={{
          flex: '1',
          backgroundImage: 'url(https://i.imgur.com/3iq0bRX.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
      </div>
    </div>
  );
};

export default Register; 