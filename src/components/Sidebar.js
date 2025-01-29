import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/financiero', label: 'Financiero' },
  { path: '/tecnico', label: 'Técnico' },
  { path: '/juridico', label: 'Jurídico' },
  { path: '/adaptaciones', label: 'Adaptaciones y Construcciones' },
  { path: '/comercializacion', label: 'Comercialización de predio' },
  { path: '/compraventas', label: 'Compraventas' },
  { path: '/aportacion', label: 'Aportación' },
  { path: '/patrimonial', label: 'Patrimonial' },
  { path: '/asociacion', label: 'Asociación' }
];

function Sidebar() {
  const { isMenuOpen } = useMenu();

  return (
    <aside style={{
      backgroundColor: '#000000',
      width: '240px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      borderRight: '1px solid rgba(255,255,255,0.1)',
      padding: '20px',
      transform: 'translateX(0)',
      zIndex: 1000,
      '@media (max-width: 768px)': {
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 300ms ease-in-out'
      }
    }}>
      <div style={{
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img 
          src="https://imgur.com/z5OuJLY.png" 
          alt="NMX Logo" 
          style={{
            width: '120px',
            height: 'auto'
          }}
        />
      </div>

      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: '#FFFFFF',
                color: '#000000'
              }
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar; 