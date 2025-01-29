import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { getProjectDetails, getProjectTasks, getSubtasks } from '../../services/asanaService';

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

// Componente de Breadcrumbs
const Breadcrumbs = ({ project }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px'
  }}>
    <a 
      href="/"
      style={{
        color: 'rgba(255,255,255,0.6)',
        textDecoration: 'none'
      }}
    >
      Dashboard
    </a>
    <span style={{ color: 'rgba(255,255,255,0.6)' }}>/</span>
    <span style={{ color: COLORS.text }}>{project?.name || 'Cargando...'}</span>
  </div>
);

// Componente de Lista de Tareas
const TaskList = ({ tasks }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}>
    {tasks.map(task => (
      <div
        key={task.gid}
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid rgba(197, 198, 205, 0.2)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <div>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              color: COLORS.text
            }}>
              {task.name}
            </h4>
            {task.notes && (
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                {task.notes}
              </p>
            )}
          </div>
          <div style={{
            backgroundColor: task.completed ? COLORS.green : COLORS.blue,
            color: COLORS.text,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {task.completed ? 'Completada' : 'En Progreso'}
          </div>
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div style={{ marginLeft: '20px' }}>
            {task.subtasks.map(subtask => (
              <div
                key={subtask.gid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 0'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: subtask.completed ? COLORS.green : COLORS.blue
                }} />
                <span style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px'
                }}>
                  {subtask.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);

// Componente Principal
function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener detalles del proyecto
        const projectDetails = await getProjectDetails(projectId);
        
        // Obtener tareas del proyecto
        const tasks = await getProjectTasks(projectId);
        
        // Obtener subtareas para cada tarea
        const tasksWithSubtasks = await Promise.all(
          tasks.map(async (task) => {
            const subtasks = await getSubtasks(task.gid);
            return {
              ...task,
              subtasks
            };
          })
        );

        // Calcular métricas
        const totalTasks = tasksWithSubtasks.length;
        const completedTasks = tasksWithSubtasks.filter(task => task.completed).length;
        const tasksWithDueDate = tasksWithSubtasks.filter(task => task.due_date);
        const upcomingTasks = tasksWithDueDate.filter(task => {
          const dueDate = new Date(task.due_date);
          const today = new Date();
          const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        });

        // Combinar toda la información
        setProject({
          ...projectDetails,
          tasks: tasksWithSubtasks,
          metrics: {
            totalTasks,
            completedTasks,
            pendingTasks: totalTasks - completedTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            upcomingTasks: upcomingTasks.length,
            tasksWithoutDueDate: totalTasks - tasksWithDueDate.length
          },
          lastUpdate: new Date().toISOString()
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Error al cargar los detalles del proyecto');
        setLoading(false);
      }
    };

    fetchData();

    // Actualización periódica
    const interval = setInterval(async () => {
      try {
        const projectDetails = await getProjectDetails(projectId);
        const tasks = await getProjectTasks(projectId);
        
        setProject(prev => ({
          ...prev,
          ...projectDetails,
          tasks
        }));
      } catch (error) {
        console.error('Error updating project:', error);
      }
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [projectId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: COLORS.text }}>
        Cargando detalles del proyecto...
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
      <Breadcrumbs project={project} />

      {/* Encabezado del Proyecto */}
      <div style={{
        backgroundColor: COLORS.cardBg,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '32px',
              color: COLORS.text
            }}>
              {project.name}
            </h1>
            {project.notes && (
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '16px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                {project.notes}
              </p>
            )}
          </div>
          <div style={{
            backgroundColor: COLORS.blue,
            color: COLORS.text,
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {project.status || 'En Progreso'}
          </div>
        </div>

        {/* Métricas del Proyecto */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '24px', color: COLORS.text }}>
              {project.metrics.totalTasks}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Total Tareas
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '24px', color: COLORS.green }}>
              {project.metrics.completedTasks}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Completadas
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '24px', color: COLORS.blue }}>
              {project.metrics.pendingTasks}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Pendientes
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '24px', color: COLORS.purple }}>
              {project.metrics.upcomingTasks}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Próximas
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            backgroundColor: activeTab === 'overview' ? COLORS.blue : 'transparent',
            border: `1px solid ${COLORS.blue}`,
            color: COLORS.text,
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Vista General
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            backgroundColor: activeTab === 'tasks' ? COLORS.blue : 'transparent',
            border: `1px solid ${COLORS.blue}`,
            color: COLORS.text,
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tareas
        </button>
      </div>

      {/* Contenido según el Tab activo */}
      {activeTab === 'overview' ? (
        <div style={{
          backgroundColor: COLORS.cardBg,
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ color: COLORS.text, marginBottom: '24px' }}>
            Progreso del Proyecto
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={project.tasks.map(task => ({
              name: task.name,
              completed: task.completed ? 1 : 0,
              subtasks: task.subtasks.length,
              completedSubtasks: task.subtasks.filter(st => st.completed).length
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
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completedSubtasks" 
                name="Subtareas Completadas"
                stroke={COLORS.green}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="subtasks" 
                name="Total Subtareas"
                stroke={COLORS.blue}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{
          backgroundColor: COLORS.cardBg,
          borderRadius: '12px',
          padding: '24px'
        }}>
          <TaskList tasks={project.tasks} />
        </div>
      )}
    </div>
  );
}

export default ProjectDetail; 