import { useState, useEffect, useMemo } from 'react';
import { clientService, userService, projectService, materialService, elementService } from '../services/api';

export default function useDashboardData(token, currentUser, handleLogout) {
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [status, setStatusRaw] = useState('Cargando datos...');
  const setStatus = (msg, duration = 4000) => {
    setStatusRaw(msg);
    if (msg && duration > 0) {
      setTimeout(() => {
        setStatusRaw((current) => (current === msg ? '' : current));
      }, duration);
    }
  };

  const [activeTab, setActiveTab] = useState('presupuestos');
  const [subTab, setSubTab] = useState('00-proyecto');

  const isAdmin = useMemo(
    () => ['admin', 'administrador'].includes(String(currentUser?.rol || '').toLowerCase()),
    [currentUser]
  );

  const isViewer = useMemo(
    () => ['viewer', 'observador', 'lector'].includes(String(currentUser?.rol || '').toLowerCase()),
    [currentUser]
  );

  const [selectedClientIdFilter, setSelectedClientIdFilter] = useState('');

  const filteredProyectos = useMemo(() => {
    if (isAdmin && selectedClientIdFilter) {
      return proyectos.filter((p) => String(p.Id_Cliente) === String(selectedClientIdFilter));
    }
    return proyectos;
  }, [proyectos, isAdmin, selectedClientIdFilter]);

  const selectedProject = useMemo(
    () => proyectos.find((project) => project.id === Number(selectedProjectId)),
    [proyectos, selectedProjectId]
  );

  const projectItems = useMemo(
    () => elementos.filter((item) => item.Id_proyecto === Number(selectedProjectId)),
    [elementos, selectedProjectId]
  );

  const total = useMemo(
    () => projectItems.reduce((sum, item) => sum + item.Cantidad * item.Precio, 0),
    [projectItems]
  );

  const refreshProjects = async () => {
    try {
      const { data } = await projectService.getAll();
      setProyectos(data);
      return data;
    } catch (err) {
      console.error('Error al actualizar proyectos:', err);
    }
  };

  // Load basic entities
  useEffect(() => {
    if (!token) {
      setClientes([]);
      setUsuarios([]);
      setProyectos([]);
      setElementos([]);
      setMateriales([]);
      return;
    }
    async function loadDashboard() {
      try {
        const [clientesRes, usuariosRes, proyectosRes, materialesRes] = await Promise.all([
          clientService.getAll(),
          userService.getAll(),
          projectService.getAll(),
          materialService.getAll(),
        ]);
        setClientes(clientesRes.data);
        setUsuarios(usuariosRes.data);
        setProyectos(proyectosRes.data);
        setMateriales(materialesRes.data);
        setSelectedProjectId(proyectosRes.data[0]?.id ? String(proyectosRes.data[0].id) : '');
        setStatus('Datos sincronizados');
      } catch (error) {
        setStatus(`Error de sincronización: ${error.response?.data?.message || error.message}`);
        if (error.response?.status === 401 || error.response?.status === 403) {
          handleLogout();
        }
      }
    }

    loadDashboard();
  }, [token]);

  // Load elements for the selected project
  useEffect(() => {
    if (!token || !selectedProjectId) {
      setElementos([]);
      return;
    }
    async function loadElements() {
      try {
        const { data } = await elementService.getAll(selectedProjectId);
        setElementos(data);
      } catch (error) {
        console.error('Error al cargar partidas del proyecto:', error);
      }
    }
    loadElements();
  }, [selectedProjectId, token]);

  return {
    clientes,
    setClientes,
    usuarios,
    setUsuarios,
    proyectos,
    setProyectos,
    elementos,
    setElementos,
    materiales,
    setMateriales,
    selectedProjectId,
    setSelectedProjectId,
    status,
    setStatusRaw,
    setStatus,
    activeTab,
    setActiveTab,
    subTab,
    setSubTab,
    isAdmin,
    isViewer,
    selectedClientIdFilter,
    setSelectedClientIdFilter,
    filteredProyectos,
    selectedProject,
    projectItems,
    total,
    refreshProjects
  };
}
