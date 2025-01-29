import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Legend } from 'recharts';
import { useMenu } from './context/MenuContext';
import Sidebar from './components/Sidebar';
import debounce from 'lodash/debounce';
import { getAllProjectsData } from './services/asanaService';

// Colores consistentes
const COLORS = {
  background: '#1E1E1E',
  cardBg: '#2A2A2A',
  text: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.1)',
  purple: '#9650A9',
  blue: '#4C87CB',
  green: '#9CCB47'
};

// Datos actualizados de proyectos
const projectsData = [
  {
    id: 1,
    title: 'T-MEXPARK',
    type: 'construccion',
    color: COLORS.blue,
    metricaPrincipal: {
      valor: 4000,
      unidad: 'm²',
      meta: 10000,
      progreso: 40
    },
    kpis: [
      { label: 'Construido', value: '40,000', color: COLORS.blue, unidad: 'm²' },
      { label: 'Meta', value: '100,000', color: COLORS.purple, unidad: 'm²' },
      { label: 'Pendiente', value: '60,000', color: COLORS.green, unidad: 'm²' }
    ],
    drillDown: [
      { cliente: 'DHL', area: 2000 },
      { cliente: 'INDITEX', area: 1500 }
    ],
    evolucionMensual: [
      { mes: 'Ene', valor: 500 },
      { mes: 'Feb', valor: 1200 },
      { mes: 'Mar', valor: 2100 },
      { mes: 'Abr', valor: 2800 },
      { mes: 'May', valor: 3500 },
      { mes: 'Jun', valor: 4000 }
    ],
    tareas: {
      completadas: 25,
      proceso: 15,
      pendientes: 10
    }
  },
  {
    id: 2,
    title: 'VYDA - Atocan Sur',
    type: 'parcelas',
    color: COLORS.purple,
    metricaPrincipal: {
      valor: 54,
      unidad: 'parcelas',
      meta: 100,
      progreso: 54
    },
    kpis: [
      { label: 'Compradas', value: '54', color: COLORS.blue, unidad: 'parcelas' },
      { label: 'Meta', value: '100', color: COLORS.purple, unidad: 'parcelas' },
      { label: 'Pendientes', value: '46', color: COLORS.green, unidad: 'parcelas' }
    ],
    historialParcelas: [
      { mes: 'Ene', cantidad: 10, tipo: 'Compradas' },
      { mes: 'Feb', cantidad: 12, tipo: 'Compradas' },
      { mes: 'Mar', cantidad: 13, tipo: 'Compradas' },
      { mes: 'Abr', cantidad: 7, tipo: 'Compradas' },
      { mes: 'May', cantidad: 6, tipo: 'Compradas' },
      { mes: 'Jun', cantidad: 6, tipo: 'Compradas' },
      { mes: 'Ene', cantidad: 20, tipo: 'Meta' },
      { mes: 'Feb', cantidad: 20, tipo: 'Meta' },
      { mes: 'Mar', cantidad: 25, tipo: 'Meta' },
      { mes: 'Abr', cantidad: 10, tipo: 'Meta' },
      { mes: 'May', cantidad: 15, tipo: 'Meta' },
      { mes: 'Jun', cantidad: 15, tipo: 'Meta' }
    ],
    tareas: {
      completadas: 30,
      proceso: 20,
      pendientes: 15
    }
  },
  {
    id: 3,
    title: 'Bodegas AAA',
    type: 'ventas',
    color: COLORS.green,
    metricaPrincipal: {
      valor: 10,
      unidad: 'bodegas',
      meta: 20,
      progreso: 50
    },
    kpis: [
      { label: 'En Venta', value: '10', color: COLORS.blue, unidad: 'bodegas' },
      { label: 'Meta', value: '20', color: COLORS.purple, unidad: 'bodegas' },
      { label: 'Pendientes', value: '10', color: COLORS.green, unidad: 'bodegas' }
    ],
    pipeline: [
      { etapa: 'Prospección', valor: 5 },
      { etapa: 'Negociación', valor: 3 },
      { etapa: 'Cierre', valor: 2 }
    ],
    tareas: {
      completadas: 20,
      proceso: 12,
      pendientes: 8
    }
  },
  {
    id: 4,
    title: 'Ocupación CAT',
    type: 'ocupacion',
    color: COLORS.blue,
    metricaPrincipal: {
      valor: 89,
      unidad: '%',
      meta: 95,
      progreso: 93.7
    },
    kpis: [
      { label: 'Actual', value: '89', color: COLORS.blue, unidad: '%' },
      { label: 'Meta', value: '95', color: COLORS.purple, unidad: '%' },
      { label: 'Gap', value: '6', color: COLORS.green, unidad: '%' }
    ],
    tendencia: [
      { mes: 'Ene', valor: 82 },
      { mes: 'Feb', valor: 84 },
      { mes: 'Mar', valor: 85 },
      { mes: 'Abr', valor: 87 },
      { mes: 'May', valor: 88 },
      { mes: 'Jun', valor: 89 }
    ],
    tareas: {
      completadas: 15,
      proceso: 8,
      pendientes: 5
    }
  }
];

// Componente WhatsApp
const WhatsAppButton = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      color: COLORS.text
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  </button>
);

// Componente de Barra de Progreso
const ProgressBar = ({ progress, color }) => (
  <div style={{
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px'
  }}>
    <div style={{
      width: `${progress}%`,
      height: '100%',
      backgroundColor: color,
      transition: 'width 0.3s ease'
    }} />
  </div>
);

// Componente de Tarjeta de Proyecto actualizado
function ProjectCard({ project }) {
  const [showDetails, setShowDetails] = useState(false);

  const renderGraph = () => {
    switch(project.type) {
      case 'construccion':
        return (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={project.evolucionMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke={project.color} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'parcelas':
        return (
          <div>
            <h3 style={{ 
              color: COLORS.text, 
              fontSize: '16px', 
              marginBottom: '16px',
              marginTop: '24px'
            }}>
              Historial de Adquisición de Parcelas
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={project.historialParcelas}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="mes" 
                  stroke="rgba(255,255,255,0.6)"
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  label={{ 
                    value: 'Parcelas', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'rgba(255,255,255,0.6)' }
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: COLORS.cardBg,
                    border: '1px solid rgba(197, 198, 205, 0.6)',
                    borderRadius: '4px'
                  }}
                  formatter={(value, name) => [`${value} parcelas`, name]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{
                    color: 'rgba(255,255,255,0.6)'
                  }}
                />
                <Bar 
                  dataKey="cantidad" 
                  name="Compradas" 
                  fill={COLORS.blue} 
                  stackId="a"
                  minPointSize={5}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="cantidad" 
                  name="Meta" 
                  fill={COLORS.purple} 
                  stackId="b"
                  minPointSize={5}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'ventas':
        return (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={project.pipeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="etapa" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip />
              <Bar dataKey="valor" fill={project.color} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'ocupacion':
        return (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={project.tendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke={project.color} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      backgroundColor: COLORS.cardBg,
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(197, 198, 205, 0.6)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: COLORS.text
          }}>
            {project.title}
          </h2>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '16px'
          }}>
            {project.metricaPrincipal.valor.toLocaleString()} {project.metricaPrincipal.unidad}
            <ProgressBar progress={project.metricaPrincipal.progreso} color={project.color} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <WhatsAppButton onClick={() => {}} />
          <button
            style={{
              backgroundColor: '#416381',
              border: 'none',
              color: '#FFFFFF',
              padding: '0',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '4px',
              width: '132px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowDetails(!showDetails)}
          >
            Ver detalles
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {project.kpis.map((kpi, index) => (
          <div 
            key={index}
            style={{
              textAlign: 'center',
              border: '1px solid rgba(197, 198, 205, 0.6)',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <div style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '8px'
            }}>
              {kpi.label}
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#CBDDF8'
            }}>
              {kpi.value}
              <span style={{ fontSize: '14px', marginLeft: '4px' }}>{kpi.unidad}</span>
            </div>
          </div>
        ))}
      </div>

      {renderGraph()}

      {showDetails && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          border: '1px solid rgba(197, 198, 205, 0.6)',
          borderRadius: '8px'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            color: COLORS.text
          }}>
            Tareas Relacionadas
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: COLORS.blue }}>{project.tareas.completadas}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Completadas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: COLORS.purple }}>{project.tareas.proceso}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>En Proceso</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: COLORS.green }}>{project.tareas.pendientes}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Pendientes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Projects() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleMenu } = useMenu();
  const [asanaProjects, setAsanaProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAsanaData = async () => {
      try {
        const data = await getAllProjectsData();
        setAsanaProjects(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Asana data:', err);
        setError('Error al cargar los proyectos de Asana');
        setLoading(false);
      }
    };

    fetchAsanaData();
  }, []);

  const debouncedFilter = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  const handleSearchChange = (e) => {
    debouncedFilter(e.target.value);
  };

  const filteredProjects = projectsData.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Componente para mostrar un proyecto de Asana
  const AsanaProjectCard = ({ project }) => (
    <div style={{
      backgroundColor: COLORS.cardBg,
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(197, 198, 205, 0.6)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            color: COLORS.text
          }}>
            {project.name}
          </h3>
          {project.notes && (
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)'
            }}>
              {project.notes}
            </p>
          )}
        </div>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <Link
            to={`/project/${project.gid}`}
            style={{
              backgroundColor: '#416381',
              border: 'none',
              color: '#FFFFFF',
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            Ver detalles
          </Link>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '16px',
          border: '1px solid rgba(197, 198, 205, 0.6)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
            Total Tareas
          </div>
          <div style={{ fontSize: '24px', color: '#CBDDF8' }}>
            {project.metrics.totalTasks}
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '16px',
          border: '1px solid rgba(197, 198, 205, 0.6)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
            Completadas
          </div>
          <div style={{ fontSize: '24px', color: '#CBDDF8' }}>
            {project.metrics.completedTasks}
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '16px',
          border: '1px solid rgba(197, 198, 205, 0.6)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
            Pendientes
          </div>
          <div style={{ fontSize: '24px', color: '#CBDDF8' }}>
            {project.metrics.pendingTasks}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '2px'
          }}>
            <div style={{
              width: `${project.metrics.completionRate}%`,
              height: '100%',
              backgroundColor: COLORS.blue,
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        <div style={{ color: COLORS.text, fontSize: '14px' }}>
          {project.metrics.completionRate.toFixed(0)}% completado
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      backgroundColor: COLORS.background,
      minHeight: '100vh'
    }}>
      <Sidebar />
      
      {/* Contenido Principal */}
      <div style={{
        flex: 1,
        marginLeft: '240px',
        width: 'calc(100% - 240px)',
        '@media (max-width: 768px)': {
          marginLeft: 0,
          width: '100%'
        }
      }}>
        {/* Barra superior */}
        <div style={{
          backgroundColor: COLORS.cardBg,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${COLORS.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          {/* Hamburger menu - solo visible en mobile */}
          <button
            onClick={toggleMenu}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              display: 'none',
              '@media (max-width: 768px)': {
                display: 'block'
              }
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>

          {/* Barra de búsqueda */}
          <div style={{
            flex: '1',
            maxWidth: '600px',
            margin: '0 20px'
          }}>
            <input
              type="text"
              placeholder="Buscar proyecto..."
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '14px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '12px',
                color: '#FFFFFF',
                outline: 'none',
                '::placeholder': {
                  color: 'rgba(255,255,255,0.5)'
                }
              }}
            />
          </div>

          {/* Iconos de la derecha */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Icono de notificaciones */}
            <button style={iconButtonStyle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>

            {/* Icono de ajustes */}
            <button style={iconButtonStyle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            {/* Icono de perfil */}
            <button style={iconButtonStyle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenedor del contenido */}
        <div style={{
          padding: '40px',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Sección de Cards de Proyectos */}
          <section style={{
            marginBottom: '48px'
          }}>
            <h2 style={{
              color: COLORS.text,
              fontSize: '24px',
              marginBottom: '24px'
            }}>
              Proyectos Principales
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              '@media (max-width: 1200px)': {
                gridTemplateColumns: '1fr'
              }
            }}>
              {filteredProjects.slice(0, 4).map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>

          {/* Sección de Todos los Proyectos */}
          <section style={{
            backgroundColor: COLORS.cardBg,
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(197, 198, 205, 0.6)'
          }}>
            <h2 style={{
              color: COLORS.text,
              fontSize: '24px',
              marginBottom: '24px'
            }}>
              Tareas de Asana por area
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: COLORS.text }}>
                Cargando proyectos...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#ff4444' }}>
                {error}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px',
                '@media (max-width: 1200px)': {
                  gridTemplateColumns: '1fr'
                }
              }}>
                {asanaProjects.map(project => (
                  <AsanaProjectCard key={project.gid} project={project} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  padding: '8px',
  cursor: 'pointer',
  color: '#FFFFFF',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: 'rgba(255,255,255,0.1)'
  }
};

export default Projects; 