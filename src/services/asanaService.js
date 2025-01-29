import axios from 'axios';

// Configuración
const ASANA_API_TOKEN = process.env.REACT_APP_ASANA_API_TOKEN;
const PROJECT_IDS = ['1209145611805182', '1209272969514236'];
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

// Configuración de Axios
const asanaApi = axios.create({
  baseURL: 'https://app.asana.com/api/1.0',
  headers: {
    'Authorization': `Bearer ${ASANA_API_TOKEN}`,
    'Accept': 'application/json'
  }
});

// Cache local
let projectsCache = {
  data: null,
  timestamp: null
};

// Función para verificar si el cache es válido
const isCacheValid = () => {
  return projectsCache.data && 
         projectsCache.timestamp && 
         (Date.now() - projectsCache.timestamp) < CACHE_DURATION;
};

// Función para obtener detalles de un proyecto
export const getProjectDetails = async (projectId) => {
  try {
    const response = await asanaApi.get(`/projects/${projectId}`, {
      params: {
        opt_fields: 'name,notes,due_date,start_date,created_at,modified_at,owner,status,public,workspace,team,color,current_status,custom_field_settings'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener detalles del proyecto ${projectId}:`, error);
    throw new Error('No se pudieron obtener los detalles del proyecto');
  }
};

// Función para obtener tareas de un proyecto
export const getProjectTasks = async (projectId) => {
  try {
    const response = await asanaApi.get(`/tasks`, {
      params: {
        project: projectId,
        opt_fields: 'name,notes,due_date,completed,assignee,tags,start_date,custom_fields,dependencies,dependents,parent,subtasks',
        completed_since: 'now'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener tareas del proyecto ${projectId}:`, error);
    throw new Error('No se pudieron obtener las tareas del proyecto');
  }
};

// Función para obtener subtareas
export const getSubtasks = async (taskId) => {
  try {
    const response = await asanaApi.get(`/tasks/${taskId}/subtasks`, {
      params: {
        opt_fields: 'name,completed,due_date,assignee,notes'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener subtareas de la tarea ${taskId}:`, error);
    return [];
  }
};

// Función principal para obtener todos los datos de los proyectos
export const getAllProjectsData = async (forceRefresh = false) => {
  try {
    // Verificar cache
    if (!forceRefresh && isCacheValid()) {
      return projectsCache.data;
    }

    // Obtener datos de todos los proyectos
    const projectsData = await Promise.all(
      PROJECT_IDS.map(async (projectId) => {
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

          return {
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
          };
        } catch (error) {
          console.error(`Error procesando proyecto ${projectId}:`, error);
          return null;
        }
      })
    );

    // Filtrar proyectos nulos y actualizar cache
    const validProjects = projectsData.filter(project => project !== null);
    projectsCache = {
      data: validProjects,
      timestamp: Date.now()
    };

    return validProjects;
  } catch (error) {
    console.error('Error en getAllProjectsData:', error);
    throw new Error('No se pudieron obtener los datos de los proyectos');
  }
};

// Función para obtener datos actualizados de un proyecto específico
export const getProjectUpdates = async (projectId) => {
  try {
    const projectDetails = await getProjectDetails(projectId);
    const tasks = await getProjectTasks(projectId);
    
    return {
      ...projectDetails,
      tasks,
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error al obtener actualizaciones del proyecto ${projectId}:`, error);
    throw new Error('No se pudieron obtener las actualizaciones del proyecto');
  }
};

// Función para iniciar actualización automática
export const startAutoUpdate = (callback, interval = 300000) => {
  const intervalId = setInterval(async () => {
    try {
      const data = await getAllProjectsData(true);
      callback(data);
    } catch (error) {
      console.error('Error en la actualización automática:', error);
    }
  }, interval);

  return () => clearInterval(intervalId);
}; 