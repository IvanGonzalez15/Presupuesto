import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lx_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (nombre, password) => api.post('/auth/login', { nombre, password }),
  register: (newUser) => api.post('/auth/register', newUser),
};

export const clientService = {
  getAll: () => api.get('/clientes'),
  create: (clientData) => api.post('/clientes', clientData),
};

export const projectService = {
  getAll: () => api.get('/proyectos'),
  getOne: (id) => api.get(`/proyectos/${id}`),
  create: (projectData) => api.post('/proyectos', projectData),
  update: (id, projectData) => api.put(`/proyectos/${id}`, projectData),
  delete: (id) => api.delete(`/proyectos/${id}`),
};

export const elementService = {
  getAll: (proyectoId) => api.get('/elementos', { params: proyectoId ? { proyectoId } : {} }),
  getOne: (id) => api.get(`/elementos/${id}`),
  create: (elementData) => api.post('/elementos', elementData),
  update: (id, elementData) => api.put(`/elementos/${id}`, elementData),
  delete: (id) => api.delete(`/elementos/${id}`),
  uploadPhoto: (fileData, filename) => api.post('/elementos/upload', { fileData, filename }),
};

export const userService = {
  getAll: () => api.get('/usuarios'),
};

export const tarifaService = {
  get: () => api.get('/tarifas'),
  update: (tarifasData) => api.put('/tarifas', tarifasData),
};

export const tarifaMaterialService = {
  getAll: () => api.get('/tarifas-materiales'),
  create: (data) => api.post('/tarifas-materiales', data),
  update: (id, data) => api.put(`/tarifas-materiales/${id}`, data),
  delete: (id) => api.delete(`/tarifas-materiales/${id}`),
};

export default api;
