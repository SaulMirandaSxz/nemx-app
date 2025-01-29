import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { getAllTasksWithSubtasks } from './services/asanaService';
import moment from 'moment';
import { useNavigate, Link, useLocation } from 'react-router-dom';

// Nuevos colores según el diseño
const COLORS = {
  background: '#1E1E1E',
  cardBg: '#2A2A2A',
  text: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.1)',
  purple: '#B468FF',
  yellow: '#FFD600',
  green: '#4CAF50',
  blue: '#2196F3'
};

const chartStyles = {
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#FFFFFF',
    textAlign: 'left'
  },
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  axis: {
    fontSize: '10px',
    fill: '#FFFFFF'
  },
  tooltip: {
    fontSize: '12px'
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#FFFFFF',
    textAlign: 'left'
  },
  subtitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#FFFFFF',
    textAlign: 'left'
  },
  text: {
    fontSize: '13px',
    color: '#FFFFFF'
  },
  progressBar: {
    height: '30px',
    borderRadius: '15px',
    marginBottom: '20px',
    display: 'flex'
  }
};

// Estilos responsivos
const mobileBreakpoint = '768px';

const responsiveStyles = {
  dashboard: {
    padding: '25px',
    backgroundColor: COLORS.background,
    minHeight: '100vh',
    [`@media (max-width: ${mobileBreakpoint})`]: {
      padding: '15px'
    }
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
    [`@media (max-width: ${mobileBreakpoint})`]: {
      gridTemplateColumns: '1fr',
      gap: '15px'
    }
  },
  metricsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap', // 👈 Añade esto
    [`@media (max-width: ${mobileBreakpoint})`]: {
      flexDirection: 'row', // o 'column' si prefieres vertical
      gap: '10px',
      justifyContent: 'space-evenly', // Mejor distribución
    }
  },
  metricBox: {
    textAlign: 'center',
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    minWidth: '150px',
    flex: '1 1 30%', // 👈 Permite que crezcan hasta 30% del contenedor
    [`@media (max-width: ${mobileBreakpoint})`]: {
      minWidth: 'unset',
      padding: '10px',
      flex: '1 1 45%', // 2 columnas en móvil
      margin: '5px',
    }
  }
};

// Componente para la barra de progreso
function ProgressBar({ metrics }) {
  const total = metrics.totalSubtasks || 0;
  const completed = metrics.completedSubtasks || 0;
  const inProgress = metrics.inProgressSubtasks || 0;
  const pending = total - completed - inProgress;

  const getWidth = (value) => ((value / total) * 100).toFixed(1) + '%';
  
  return (
    <>
      <div style={chartStyles.progressBar}>
        <div style={{ 
          width: getWidth(completed), 
          backgroundColor: COLORS.green,
          borderRadius: '15px 0 0 15px'
        }} />
        <div style={{ 
          width: getWidth(inProgress),
          backgroundColor: COLORS.yellow
        }} />
        <div style={{ 
          width: getWidth(pending),
          backgroundColor: COLORS.red,
          borderRadius: '0 15px 15px 0'
        }} />
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        color: '#FFFFFF', 
        fontSize: '12px',
        marginTop: '10px'
      }}>
        <span>Total: {total}</span>
        <span style={{ color: COLORS.green }}>Completadas: {completed}</span>
        <span style={{ color: COLORS.yellow }}>En Proceso: {inProgress}</span>
        <span style={{ color: COLORS.red }}>Pendientes: {pending}</span>
      </div>
    </>
  );
}

function TaskPieChart({ task }) {
  const completedTasks = task.subtasksMetrics.completed ?? 0;
  const pendingTasks = task.subtasksMetrics.pending ?? 0;
  const totalTasks = task.subtasksMetrics.total ?? (completedTasks + pendingTasks);
  
  const progressPercentage = totalTasks > 0 
    ? ((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <div style={chartStyles.container}>
      <h4 style={chartStyles.subtitle}>{task.name || 'Tarea sin nombre'}</h4>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px'
      }}>
        <div style={{
          height: '8px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: progressPercentage > 66 ? COLORS.green : 
                           progressPercentage > 33 ? COLORS.yellow : 
                           COLORS.red,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          color: '#FFFFFF',
          fontSize: '12px'
        }}>
          <span>Completadas: {completedTasks}</span>
          <span>{progressPercentage.toFixed(1)}%</span>
          <span>Total: {totalTasks}</span>
        </div>
      </div>
    </div>
  );
}

function ProjectSummary({ metrics }) {
  const totalTasks = metrics.totalSubtasks || 0;
  const completedTasks = metrics.completedSubtasks || 0;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div style={chartStyles.container}>
      <h2 style={{
        ...chartStyles.mainTitle,
        margin: '0 0 20px 0',
        fontSize: window.innerWidth <= 768 ? '24px' : '28px',
        color: '#FFFFFF',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        width: '100%',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '15px'
      }}>
        Temex Parc
      </h2>
      <div style={responsiveStyles.metricsContainer}>
        <div style={responsiveStyles.metricBox}>
          <div style={{ fontSize: window.innerWidth <= 768 ? '20px' : '24px', fontWeight: 'bold', color: COLORS.blue }}>
            {totalTasks}
          </div>
          <div style={{ fontSize: '12px', color: '#FFFFFF' }}>Total Tareas</div>
        </div>
        <div style={responsiveStyles.metricBox}>
          <div style={{ fontSize: window.innerWidth <= 768 ? '20px' : '24px', fontWeight: 'bold', color: COLORS.green }}>
            {completedTasks}
          </div>
          <div style={{ fontSize: '12px', color: '#FFFFFF' }}>Completadas</div>
        </div>
        <div style={responsiveStyles.metricBox}>
          <div style={{ fontSize: window.innerWidth <= 768 ? '20px' : '24px', fontWeight: 'bold', color: COLORS.red }}>
            {pendingTasks}
          </div>
          <div style={{ fontSize: '12px', color: '#FFFFFF' }}>Pendientes</div>
        </div>
      </div>
      <div style={responsiveStyles.grid}>
        {Object.entries(metrics.categoryCounts || {}).map(([category, count]) => (
          <div key={category} style={{
            padding: '15px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#FFFFFF', fontSize: '14px' }}>{category}</span>
            <span style={{ color: COLORS.yellow, fontSize: '18px', fontWeight: 'bold' }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaCard({ area }) {
  const { total, completed, pending, completionRate } = area.subtasksMetrics;
  
  return (
    <div style={{
      ...chartStyles.container,
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{
          ...chartStyles.subtitle,
          margin: 0
        }}>{area.name}</h4>
        <span style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: COLORS.yellow
        }}>{completionRate.toFixed(0)}%</span>
      </div>

      <div style={{
        height: '8px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${completionRate}%`,
          height: '100%',
          backgroundColor: completionRate === 100 ? COLORS.green : 
                         completionRate > 50 ? COLORS.yellow : 
                         COLORS.red,
          transition: 'width 0.3s ease'
        }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#FFFFFF'
      }}>
        <div>
          <div style={{ color: COLORS.green }}>✓ {completed} completadas</div>
          <div style={{ color: COLORS.red }}>○ {pending} pendientes</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: COLORS.blue }}>Total: {total}</div>
        </div>
      </div>
    </div>
  );
}

const MobileVersion = ({ tasksData, onBack }) => {
  return (
    <div style={responsiveStyles.dashboard}>
      <ProjectSummary metrics={tasksData.totalMetrics} />
      
      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <div style={chartStyles.container}>
          <h3 style={chartStyles.subtitle}>Estado General</h3>
          <ProgressBar metrics={tasksData.totalMetrics} />
        </div>
      </div>

      <div style={chartStyles.container}>
        <h3 style={chartStyles.subtitle}>Áreas del Proyecto</h3>
        <div style={responsiveStyles.grid}>
          {tasksData.tasks.map(area => (
            <AreaCard key={area.gid} area={area} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <div style={chartStyles.container}>
          <h3 style={chartStyles.subtitle}>Tendencia por Área</h3>
          
          {/* Leyenda de métricas */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            justifyContent: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: COLORS.green
              }} />
              <span style={{ color: '#FFFFFF', fontSize: '12px' }}>Completadas</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: COLORS.red
              }} />
              <span style={{ color: '#FFFFFF', fontSize: '12px' }}>Pendientes</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={tasksData.tasks}
              margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#FFFFFF"
                tick={{ fill: '#FFFFFF', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis 
                stroke="#FFFFFF"
                tick={{ fill: '#FFFFFF', fontSize: 10 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(50, 51, 53, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  color: '#FFFFFF',
                  fontSize: '10px'
                }}
                formatter={(value, name) => [value, name === 'completed' ? 'Completadas' : 'Pendientes']}
                labelStyle={{
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}
              />
              <Line 
                type="monotone"
                dataKey="subtasksMetrics.completed"
                name="completed"
                stroke={COLORS.green}
                strokeWidth={2}
                dot={{ 
                  fill: COLORS.green,
                  r: 4,
                  strokeWidth: 1,
                  stroke: '#FFFFFF'
                }}
                activeDot={{ 
                  r: 6,
                  stroke: '#FFFFFF',
                  strokeWidth: 1
                }}
              />
              <Line 
                type="monotone"
                dataKey="subtasksMetrics.pending"
                name="pending"
                stroke={COLORS.red}
                strokeWidth={2}
                dot={{ 
                  fill: COLORS.red,
                  r: 4,
                  strokeWidth: 1,
                  stroke: '#FFFFFF'
                }}
                activeDot={{ 
                  r: 6,
                  stroke: '#FFFFFF',
                  strokeWidth: 1
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Componente para los iconos de la barra superior
const IconButton = ({ icon, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      color: COLORS.text,
      padding: '8px',
      cursor: 'pointer',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: 'rgba(255,255,255,0.1)'
      }
    }}
  >
    {icon}
  </button>
);

const DesktopVersion = ({ tasksData }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/financiero', label: 'Financiero' },
    { path: '/dashboard/tecnico', label: 'Técnico' },
    { path: '/dashboard/juridico', label: 'Jurídico' },
    { path: '/dashboard/adaptaciones', label: 'Adaptaciones y Construcciones' },
    { path: '/dashboard/comercializacion', label: 'Comercialización' },
    { path: '/dashboard/aportacion', label: 'Aportación' },
    { path: '/dashboard/patrimonial', label: 'Patrimonial' }
  ];

  return (
    <div style={{
      backgroundColor: COLORS.background,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Barra superior */}
      <div style={{
        backgroundColor: COLORS.cardBg,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${COLORS.border}`,
        zIndex: 10
      }}>
        {/* Logo o título */}
        <div style={{
          color: COLORS.text,
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          NMX
        </div>

        {/* Barra de búsqueda */}
        <div style={{
          flex: '0 1 400px',
          margin: '0 20px'
        }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '14px',
              backgroundColor: '#FFFFFF',
              border: 'none',
              borderRadius: '20px',
              color: '#000000',
              outline: 'none'
            }}
          />
        </div>

        {/* Iconos de la derecha */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <IconButton
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            }
            onClick={() => {}}
          />
          <IconButton
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            }
            onClick={() => {}}
          />
          <IconButton
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            }
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Contenido existente del Dashboard */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: '240px',
          backgroundColor: COLORS.cardBg,
          borderRight: `1px solid ${COLORS.border}`,
          padding: '20px'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <Link to="/dashboard" style={{ 
              textDecoration: 'none',
              color: COLORS.text
            }}>
              <h1 style={{ fontSize: '24px', margin: '0' }}>NMX</h1>
            </Link>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: 'none',
                  backgroundColor: currentPath === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 16px',
                  color: currentPath === item.path ? COLORS.text : 'rgba(255,255,255,0.6)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ marginLeft: '260px', padding: '20px' }}>
          {/* Header */}
          <div style={{
            backgroundColor: COLORS.cardBg,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <h2 style={{ margin: '0', fontSize: '20px' }}>¡Es bueno verte, Usuario00!</h2>
                <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                  Última conexión: Miércoles, 11.12.24, 06:18 pm
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '24px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '100%',
                margin: '0 auto'
              }}>
                <div style={{ 
                  textAlign: 'center',
                  minWidth: '130px',
                  flex: '1 1 auto',
                  maxWidth: 'calc(33.333% - 16px)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: COLORS.blue
                  }}>36</div>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}>Total Tareas</div>
                </div>
                <div style={{ 
                  textAlign: 'center',
                  minWidth: '130px',
                  flex: '1 1 auto',
                  maxWidth: 'calc(33.333% - 16px)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: COLORS.green
                  }}>25</div>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}>Completadas</div>
                </div>
                <div style={{ 
                  textAlign: 'center',
                  minWidth: '130px',
                  flex: '1 1 auto',
                  maxWidth: 'calc(33.333% - 16px)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}>11</div>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}>Pendientes</div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Section */}
          <div style={{
            backgroundColor: COLORS.cardBg,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0', fontSize: '18px' }}>¿Cuál KPI quieres consultar?</h3>
                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                  Elige el KPI que deseas consultar.
                </p>
              </div>
              <input
                type="text"
                placeholder="Buscar KPI"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  color: COLORS.text,
                  width: '200px'
                }}
              />
            </div>

            {tasksData && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tasksData.tasks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#FFFFFF"
                    tick={{ fill: '#FFFFFF', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: COLORS.cardBg,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px'
                    }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="subtasksMetrics.completed"
                    name="Modelo financiero"
                    stroke={COLORS.purple}
                    dot={false}
                  />
                  <Line 
                    type="monotone"
                    dataKey="subtasksMetrics.total"
                    name="Legal"
                    stroke={COLORS.yellow}
                    dot={false}
                  />
                  <Line 
                    type="monotone"
                    dataKey="subtasksMetrics.pending"
                    name="Técnico"
                    stroke={COLORS.green}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Progress Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Financiero */}
            <div style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>01</span>
                <h4 style={{ margin: '8px 0', fontSize: '16px' }}>Financiero</h4>
              </div>
              <div style={{
                width: '120px',
                height: '120px',
                border: `2px solid ${COLORS.blue}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                25%
              </div>
              <button style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: COLORS.text,
                marginTop: '16px',
                cursor: 'pointer',
                padding: '0'
              }}>
                Ver resumen
              </button>
            </div>
            {/* Agregar más tarjetas según la imagen */}
          </div>
        </div>
      </div>
    </div>
  );
};

function Dashboard({ onBack, section }) {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [tasksData, setTasksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllTasksWithSubtasks();
        console.log('Datos recibidos:', data);
        setTasksData(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [section]);

  const handleLogout = () => {
    onBack();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#FFFFFF' }}>
        <h2>Cargando datos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: COLORS.red }}>
        <h2>Error al cargar los datos</h2>
        <p>{error}</p>
        <button onClick={handleLogout} style={{ fontSize: '12px' }}>← Volver</button>
      </div>
    );
  }

  if (!tasksData || !tasksData.tasks.length) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#FFFFFF' }}>
        <h2>No hay datos disponibles</h2>
        <p>No se encontraron tareas para mostrar.</p>
        <button onClick={handleLogout} style={{ fontSize: '12px' }}>← Volver</button>
      </div>
    );
  }

  const isMobile = windowWidth <= 765;

  return isMobile ? (
    <MobileVersion tasksData={tasksData} onBack={handleLogout} />
  ) : (
    <DesktopVersion tasksData={tasksData} />
  );
}

export default Dashboard; 