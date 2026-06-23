import { useEffect, useMemo, useState, useRef } from 'react';
import './App.css';

import Login from './components/Login';
import Setup from './components/Setup';
import Materiales from './components/Materiales';
import Presupuestos from './components/Presupuestos';
import { parseElementExtraData, serializeElementExtraData } from './utils/elementHelpers';
import { exportToExcel as exportToExcelHelper, handleImportExcel as handleImportExcelHelper } from './utils/excelHelper';
import {
  authService,
  clientService,
  projectService,
  elementService,
  materialService,
  userService
} from './services/api';

const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('lx_theme_preference') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lx_theme_preference', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [token, setToken] = useState(localStorage.getItem('lx_token') || '');
  const currentUser = useMemo(() => decodeJWT(token), [token]);
  const [loginError, setLoginError] = useState('');

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

  const totalManufacturingCost = useMemo(() => total, [total]);

  const refreshProjects = async () => {
    try {
      const { data } = await projectService.getAll();
      setProyectos(data);
      return data;
    } catch (err) {
      console.error('Error al actualizar proyectos:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
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

  const handleLogin = async (nombre, password) => {
    try {
      setLoginError('');
      const { data } = await authService.login(nombre, password);
      localStorage.setItem('lx_token', data.token);
      setToken(data.token);
      setStatus(`¡Bienvenido, ${data.user.nombre}!`);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Error de red al conectar al servidor');
    }
  };

  const handleLogout = () => {
    Object.values(pendingUpdates.current).forEach(clearTimeout);
    pendingUpdates.current = {};
    localStorage.removeItem('lx_token');
    setToken('');
    setClientes([]);
    setUsuarios([]);
    setProyectos([]);
    setElementos([]);
    setMateriales([]);
  };

  const handleUserCreate = async (newUser) => {
    try {
      await authService.register(newUser);
      const [usersRes, projectsRes] = await Promise.all([
        userService.getAll(),
        projectService.getAll()
      ]);
      setUsuarios(usersRes.data);
      setProyectos(projectsRes.data);
      setStatus(`Usuario ${newUser.nombre} registrado correctamente.`);
    } catch (error) {
      setStatus(`No se pudo crear el usuario: ${error.response?.data?.message || error.message}`);
    }
  };

  const createCliente = async (clientDraft) => {
    try {
      const { data } = await clientService.create(clientDraft);
      setClientes((current) => [...current, data].sort((a, b) => a.Nombre.localeCompare(b.Nombre)));
      setStatus(`Cliente ${data.Nombre} creado.`);
    } catch (error) {
      setStatus(`No se pudo crear el cliente: ${error.response?.data?.message || error.message}`);
    }
  };

  const createProyecto = async (projectDraft) => {
    try {
      const payload = {
        ...projectDraft,
        Colaboradores: projectDraft.Colaboradores ? Number(projectDraft.Colaboradores) : null,
        Responsable: Number(projectDraft.Responsable),
        Id_Cliente: Number(projectDraft.Id_Cliente),
      };
      const { data } = await projectService.create(payload);
      const refreshed = await refreshProjects();
      setSelectedProjectId(String(data.id));
      setStatus(`Proyecto ${refreshed.find((project) => project.id === data.id)?.Codigo || data.Codigo} creado.`);
    } catch (error) {
      setStatus(`No se pudo crear el proyecto: ${error.response?.data?.message || error.message}`);
    }
  };

  const saveMaterial = async (materialDraft, editingMaterialId) => {
    if (!isAdmin) {
      setStatus('Solo los administradores pueden crear o editar materiales.');
      return;
    }

    const payload = {
      ...materialDraft,
      precio_venta: Number(materialDraft.precio_venta),
    };

    try {
      if (editingMaterialId) {
        const { data } = await materialService.update(editingMaterialId, payload);
        setMateriales((current) => current.map((material) => (material.id === data.id ? data : material)).sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setStatus(`Material ${data.nombre} actualizado.`);
      } else {
        const { data } = await materialService.create(payload);
        setMateriales((current) => [...current, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setStatus(`Material ${data.nombre} creado.`);
      }
    } catch (error) {
      setStatus(`No se pudo guardar el material: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteMaterial = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('¿Seguro que quieres eliminar este material?')) return;
    try {
      await materialService.delete(id);
      setMateriales((current) => current.filter((m) => m.id !== id));
      setStatus('Material eliminado.');
    } catch (error) {
      setStatus(`No se pudo eliminar el material: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteProject = async (id) => {
    if (!isAdmin) {
      setStatus('Solo los administradores pueden eliminar proyectos.');
      return;
    }
    if (!window.confirm('¿Seguro que quieres eliminar este proyecto y todos sus elementos?')) return;
    try {
      await projectService.delete(id);
      setProyectos((current) => current.filter((p) => p.id !== id));
      setElementos((current) => current.filter((e) => e.Id_proyecto !== id));
      if (String(selectedProjectId) === String(id)) setSelectedProjectId('');
      setStatus('Proyecto eliminado.');
    } catch (error) {
      setStatus(`No se pudo eliminar el proyecto: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteElemento = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta partida?')) return;
    try {
      await elementService.delete(id);
      setElementos((current) => current.filter((e) => e.id !== id));
      await refreshProjects();
      setStatus('Partida eliminada.');
    } catch (error) {
      setStatus(`No se pudo eliminar la partida: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUploadPhoto = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result;
          const { data } = await elementService.uploadPhoto(base64Data, file.name);
          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const updateElementPhoto = async (item, photoUrl) => {
    try {
      const extra = parseElementExtraData(item);
      extra.fotoUrl = photoUrl;
      const serialized = serializeElementExtraData(extra);
      const payload = { ...item, Foto: serialized };
      await elementService.update(item.id, payload);
      setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Foto: serialized } : e));
      setStatus('Foto de la partida actualizada.');
    } catch (err) {
      setStatus(`Error al actualizar la foto: ${err.message}`);
    }
  };

  const exportToExcel = () => {
    exportToExcelHelper(selectedProject, projectItems, setStatus, money);
  };

  const handleImportExcel = (event) => {
    handleImportExcelHelper(event, selectedProjectId, currentUser, refreshProjects, setElementos, setStatus);
  };

  const pendingUpdates = useRef({});

  const queueElementUpdate = (itemId, updateFn) => {
    if (pendingUpdates.current[itemId]) {
      clearTimeout(pendingUpdates.current[itemId]);
    }
    pendingUpdates.current[itemId] = setTimeout(async () => {
      await updateFn();
      delete pendingUpdates.current[itemId];
    }, 800);
  };

  const updateElementExtraValue = (item, fieldGroup, key, val) => {
    const extra = parseElementExtraData(item);
    if (fieldGroup === 'materials') {
      extra.materials[key] = val;
    } else if (fieldGroup === 'hours') {
      extra.hours[key] = val;
    } else {
      extra[key] = val;
    }

    if (key === 'largo' || key === 'ancho' || key === 'alto') {
      extra[key] = Number(val || 0);
    }

    const updatedFoto = serializeElementExtraData(extra);
    
    setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Foto: updatedFoto } : e));

    queueElementUpdate(item.id, async () => {
      try {
        const payload = {
          ...item,
          Foto: updatedFoto
        };
        const { data } = await elementService.update(item.id, payload);
        
        setElementos((current) => current.map((e) => e.id === item.id ? { 
          ...e, 
          Foto: data.Foto, 
          Precio: data.Precio, 
          medida_metro_cuadrado: data.medida_metro_cuadrado, 
          medida_metro_cubico: data.medida_metro_cubico 
        } : e));
        await refreshProjects();
      } catch (err) {
        setStatus(`Error al actualizar partida: ${err.message}`);
      }
    });
  };

  const updateElementQuantity = (item, qty) => {
    const numericQty = Number(qty);
    setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Cantidad: numericQty } : e));

    queueElementUpdate(item.id, async () => {
      try {
        const payload = { ...item, Cantidad: numericQty };
        await elementService.update(item.id, payload);
        await refreshProjects();
      } catch (err) {
        setStatus(`Error al actualizar cantidad: ${err.message}`);
      }
    });
  };

  const updateElementPrice = (item, price) => {
    const numericPrice = Number(price);
    setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Precio: numericPrice } : e));

    queueElementUpdate(item.id, async () => {
      try {
        const payload = { ...item, Precio: numericPrice };
        await elementService.update(item.id, payload);
        await refreshProjects();
      } catch (err) {
        setStatus(`Error al actualizar precio unitario: ${err.message}`);
      }
    });
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        Codigo: selectedProject.Codigo,
        Fecha_entrega: selectedProject.Fecha_entrega,
        Responsable: Number(selectedProject.Responsable),
        Id_Cliente: Number(selectedProject.Id_Cliente),
        Colaboradores: selectedProject.Colaboradores ? Number(selectedProject.Colaboradores) : null
      };
      await projectService.update(selectedProject.id, payload);
      await refreshProjects();
      setStatus('Datos del proyecto actualizados.');
    } catch (err) {
      setStatus(`Error al actualizar proyecto: ${err.message}`);
    }
  };

  const handleProjectFieldChange = (field, value) => {
    setProyectos((current) => current.map((p) => p.id === selectedProject.id ? { ...p, [field]: value } : p));
  };

  const createElemento = async (itemDraft) => {
    if (!selectedProjectId) {
      setStatus('Selecciona o crea un proyecto antes de añadir una partida.');
      return;
    }

    const payload = {
      ...itemDraft,
      Id_proyecto: Number(selectedProjectId),
      Id_usuario_creador: currentUser?.id || 1,
      Cantidad: Number(itemDraft.Cantidad),
      Precio: Number(itemDraft.Precio),
      medida_metro_cuadrado: Number(itemDraft.medida_metro_cuadrado),
      medida_metro_cubico: Number(itemDraft.medida_metro_cubico),
    };

    try {
      const { data } = await elementService.create(payload);
      setElementos((current) => [data, ...current]);
      await refreshProjects();
      setStatus('Partida añadida al presupuesto');
    } catch (error) {
      setStatus(`No se pudo guardar la partida: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!token) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>GESTOR LXH</h2>
        </div>
        
        <div className="user-profile-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-sidebar-text-secondary)' }}>Usuario Conectado</span>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-sidebar-text)', marginTop: '2px' }}>{currentUser?.nombre}</strong>
          </div>
          <span className={`user-badge ${isAdmin ? 'admin' : 'viewer'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {currentUser?.rol}
          </span>
          
          <button 
            onClick={toggleTheme} 
            type="button"
            style={{
              marginTop: '4px',
              padding: '6px 12px',
              background: 'var(--color-surface-bright)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {theme === 'light' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                Modo Oscuro
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                Modo Claro
              </>
            )}
          </button>

          <button onClick={handleLogout} className="logout-btn" style={{
            marginTop: '4px',
            padding: '6px 12px',
            background: 'var(--color-surface-bright)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            transition: 'all 0.15s ease'
          }}>
            Cerrar Sesión
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === 'presupuestos' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('presupuestos')} type="button">
            Presupuestos
          </button>
          <button className={activeTab === 'materiales' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('materiales')} type="button">
            Base de Materiales
          </button>
          {isAdmin && (
            <button className={activeTab === 'registro' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('registro')} type="button">
              Clientes y Setup
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">Sincronizado</div>
        </div>
      </aside>

      <main className="main-content-area">
        <header className="hero-panel">
          <div>
            <span className="eyebrow">Gestor de presupuestos</span>
            <h1>{isAdmin ? 'Panel operativo para presupuestos' : 'Visualización de presupuestos'}</h1>
            <p>{isAdmin ? 'Gestiona clientes y proyectos desde la interfaz para preparar presupuestos usando los usuarios ya registrados.' : 'Consulta presupuestos, listados de medidas y tarifas base de coste.'}</p>
          </div>
          {isAdmin && (
            <div className="hero-stats">
              <div><strong>{usuarios.length}</strong><span>usuarios</span></div>
              <div><strong>{clientes.length}</strong><span>clientes</span></div>
              <div><strong>{proyectos.length}</strong><span>proyectos</span></div>
              <div><strong>{materiales.length}</strong><span>materiales</span></div>
            </div>
          )}
        </header>

        {activeTab === 'registro' && isAdmin && (
          <Setup
            clientes={clientes}
            usuarios={usuarios}
            proyectos={proyectos}
            createCliente={createCliente}
            createProyecto={createProyecto}
            onUserCreate={handleUserCreate}
            statusMessage={status}
          />
        )}

        {activeTab === 'materiales' && (
          <Materiales
            materiales={materiales}
            isAdmin={isAdmin}
            money={money}
            saveMaterial={saveMaterial}
            deleteMaterial={deleteMaterial}
          />
        )}

        {activeTab === 'presupuestos' && (
          <Presupuestos
            proyectos={filteredProyectos}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            deleteProject={deleteProject}
            money={money}
            subTab={subTab}
            setSubTab={setSubTab}
            selectedProject={selectedProject}
            exportToExcel={exportToExcel}
            handleImportExcel={handleImportExcel}
            handleUpdateProject={handleUpdateProject}
            clientes={clientes}
            usuarios={usuarios}
            handleProjectFieldChange={handleProjectFieldChange}
            total={total}
            totalManufacturingCost={totalManufacturingCost}
            createElemento={createElemento}
            projectItems={projectItems}
            updateElementQuantity={updateElementQuantity}
            updateElementPrice={updateElementPrice}
            deleteElemento={deleteElemento}
            updateElementExtraValue={updateElementExtraValue}
            parseElementExtraData={parseElementExtraData}
            isAdmin={isAdmin}
            isViewer={isViewer}
            selectedClientIdFilter={selectedClientIdFilter}
            setSelectedClientIdFilter={setSelectedClientIdFilter}
            handleUploadPhoto={handleUploadPhoto}
            updateElementPhoto={updateElementPhoto}
          />
        )}
      </main>
      {status && <footer className="status-bar" onClick={() => setStatusRaw('')} title="Haga clic para cerrar">{status}</footer>}
    </div>
  );
}

export default App;
