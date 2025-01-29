import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, HeatMap 
} from 'recharts';
import { getAllProjectsData, startAutoUpdate } from '../../services/asanaService';

// Constantes
const COLORS = {
  background: '#1E1E1E',
  cardBg: '#2A2A2A',
  text: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.1)',
  purple: '#9650A9',
  blue: '#4C87CB',
  green: '#9CCB47',
  red: '#E15554'
};

// Componente de Tarjeta de Proyecto
const ProjectCard = ({ project, onClick }) => {
  const isOverdue = project.metrics.upcomingTasks > 0;

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: COLORS.cardBg,
        borderRadius: '12px',
        padding: '24px',
        border: `1px solid ${isOverdue ? COLORS.red : 'rgba(197, 198, 205, 0.6)'}`,
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
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
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            Última actualización: {new Date(project.lastUpdate).toLocaleString()}
          </p>
        </div>
        {isOverdue && (
          <div style={{
            backgroundColor: COLORS.red,
            color: COLORS.text,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {project.metrics.upcomingTasks} tareas próximas
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <MetricBox 
          label="Total Tareas"
          value={project.metrics.totalTasks}
        />
        <MetricBox 
          label="Completadas"
          value={project.metrics.completedTasks}
          color={COLORS.green}
        />
        <MetricBox 
          label="Pendientes"
          value={project.metrics.pendingTasks}
          color={COLORS.blue}
        />
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
};

// Componente de Caja de Métrica
const MetricBox = ({ label, value, color = COLORS.text }) => (
  <div style={{
    textAlign: 'center',
    padding: '16px',
    border: '1px solid rgba(197, 198, 205, 0.6)',
    borderRadius: '8px'
  }}>
    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
      {label}
    </div>
    <div style={{ fontSize: '24px', color }}>
      {value}
    </div>
  </div>
);

// Componente Principal
function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllProjectsData();
        setProjects(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Error al cargar los proyectos');
        setLoading(false);
      }
    };

    fetchData();

    // Iniciar actualización automática
    const cleanup = startAutoUpdate((data) => {
      setProjects(data);
    });

    return () => cleanup();
  }, []);

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: COLORS.text }}>
        Cargando proyectos...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: COLORS.red }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Filtros */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            backgroundColor: filter === 'all' ? COLORS.blue : 'transparent',
            border: `1px solid ${COLORS.blue}`,
            color: COLORS.text,
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('active')}
          style={{
            backgroundColor: filter === 'active' ? COLORS.green : 'transparent',
            border: `1px solid ${COLORS.green}`,
            color: COLORS.text,
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Activos
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          style={{
            backgroundColor: filter === 'upcoming' ? COLORS.red : 'transparent',
            border: `1px solid ${COLORS.red}`,
            color: COLORS.text,
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Próximos
        </button>
      </div>

      {/* Grid de Proyectos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {projects
          .filter(project => {
            if (filter === 'active') return project.metrics.completionRate < 100;
            if (filter === 'upcoming') return project.metrics.upcomingTasks > 0;
            return true;
          })
          .map(project => (
            <ProjectCard
              key={project.gid}
              project={project}
              onClick={() => handleProjectClick(project.gid)}
            />
          ))}
      </div>

      {/* Gráfico Comparativo */}
      <div style={{
        backgroundColor: COLORS.cardBg,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: COLORS.text, marginBottom: '24px' }}>
          Progreso Comparativo
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={projects.map(p => ({
            name: p.name,
            completionRate: p.metrics.completionRate
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: COLORS.cardBg,
                border: '1px solid rgba(197, 198, 205, 0.6)',
                borderRadius: '4px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="completionRate" 
              stroke={COLORS.blue}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard; 