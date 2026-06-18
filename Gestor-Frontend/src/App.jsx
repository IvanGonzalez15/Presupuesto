import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './App.css';

import Login from './components/Login';
import Setup from './components/Setup';
import Materiales from './components/Materiales';
import Presupuestos from './components/Presupuestos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const today = new Date().toISOString().slice(0, 10);

const initialClient = { id: '', Nombre: '', Persona_contacto: '', Email_contacto: '', Numero_contacto: '' };
const initialProject = { Codigo: '', Fecha_entrega: today, Colaboradores: '', Responsable: '', Id_Cliente: '' };
const initialItem = { Nombre: '', Foto: '', Cantidad: 1, Unidad_de_medida: 'ud', Precio: 0, medida_metro_cuadrado: 0, medida_metro_cubico: 0 };
const initialMaterial = { nombre: '', precio_venta: 0, caracteristicas: '', notas: '' };

const parseElementExtraData = (item) => {
  try {
    if (item && item.Foto && item.Foto.trim().startsWith('{')) {
      return JSON.parse(item.Foto);
    }
  } catch (e) {
    console.error(e);
  }
  return {
    fotoUrl: (item && item.Foto && !item.Foto.trim().startsWith('{')) ? item.Foto : '',
    largo: 0,
    ancho: 0,
    alto: 0,
    materials: { porex: false, linex: false, fibra: false, pintura: false, mortero: false },
    hours: { oficina: 0, programacion: 0, mecanizado: 0, prepost: 0, esculpir: 0, linex: 0, fibra: 0 }
  };
};

const serializeElementExtraData = (extraData) => {
  return JSON.stringify(extraData);
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('lx_token') || '');
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('lx_user') || 'null'));
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

  const [clientDraft, setClientDraft] = useState(initialClient);
  const [projectDraft, setProjectDraft] = useState(initialProject);
  const [itemDraft, setItemDraft] = useState(initialItem);
  const [materialDraft, setMaterialDraft] = useState(initialMaterial);
  const [editingMaterialId, setEditingMaterialId] = useState('');
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

  const requestConfig = useMemo(() => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }), [token]);

  const refreshProjects = async () => {
    const { data } = await axios.get(`${API_URL}/proyectos`, requestConfig);
    setProyectos(data);
    return data;
  };

  useEffect(() => {
    if (!token) return;
    async function loadDashboard() {
      try {
        const [clientesRes, usuariosRes, proyectosRes, elementosRes, materialesRes] = await Promise.all([
          axios.get(`${API_URL}/clientes`, requestConfig),
          axios.get(`${API_URL}/usuarios`, requestConfig),
          axios.get(`${API_URL}/proyectos`, requestConfig),
          axios.get(`${API_URL}/elementos`, requestConfig),
          axios.get(`${API_URL}/materiales`, requestConfig),
        ]);
        setClientes(clientesRes.data);
        setUsuarios(usuariosRes.data);
        setProyectos(proyectosRes.data);
        setElementos(elementosRes.data);
        setMateriales(materialesRes.data);
        setSelectedProjectId(proyectosRes.data[0]?.id ? String(proyectosRes.data[0].id) : '');
        setProjectDraft((current) => ({
          ...current,
          Responsable: usuariosRes.data[0]?.id ? String(usuariosRes.data[0].id) : '',
          Id_Cliente: clientesRes.data[0]?.id ? String(clientesRes.data[0].id) : '',
        }));
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

  const handleLogin = async (nombre, password) => {
    try {
      setLoginError('');
      const { data } = await axios.post(`${API_URL}/auth/login`, { nombre, password });
      localStorage.setItem('lx_token', data.token);
      localStorage.setItem('lx_user', JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      setStatus(`¡Bienvenido, ${data.user.nombre}!`);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Error de red al conectar al servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lx_token');
    localStorage.removeItem('lx_user');
    setToken('');
    setCurrentUser(null);
    setClientes([]);
    setUsuarios([]);
    setProyectos([]);
    setElementos([]);
    setMateriales([]);
  };

  const handleUserCreate = async (newUser) => {
    try {
      await axios.post(`${API_URL}/auth/register`, newUser, requestConfig);
      const [usersRes, projectsRes] = await Promise.all([
        axios.get(`${API_URL}/usuarios`, requestConfig),
        axios.get(`${API_URL}/proyectos`, requestConfig)
      ]);
      setUsuarios(usersRes.data);
      setProyectos(projectsRes.data);
      setStatus(`Usuario ${newUser.nombre} registrado correctamente.`);
    } catch (error) {
      setStatus(`No se pudo crear el usuario: ${error.response?.data?.message || error.message}`);
    }
  };

  const updateDraft = (setter) => (event) => {
    const { name, value } = event.target;
    setter((current) => ({ ...current, [name]: value }));
  };

  const createCliente = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/clientes`, clientDraft, requestConfig);
      setClientes((current) => [...current, data].sort((a, b) => a.Nombre.localeCompare(b.Nombre)));
      setProjectDraft((current) => ({ ...current, Id_Cliente: current.Id_Cliente || String(data.id) }));
      setClientDraft(initialClient);
      setStatus(`Cliente ${data.Nombre} creado.`);
    } catch (error) {
      setStatus(`No se pudo crear el cliente: ${error.response?.data?.message || error.message}`);
    }
  };

  const createProyecto = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...projectDraft,
        Colaboradores: projectDraft.Colaboradores ? Number(projectDraft.Colaboradores) : null,
        Responsable: Number(projectDraft.Responsable),
        Id_Cliente: Number(projectDraft.Id_Cliente),
      };
      const { data } = await axios.post(`${API_URL}/proyectos`, payload, requestConfig);
      const refreshed = await refreshProjects();
      setSelectedProjectId(String(data.id));
      setProjectDraft({
        ...initialProject,
        Responsable: payload.Responsable ? String(payload.Responsable) : '',
        Id_Cliente: payload.Id_Cliente ? String(payload.Id_Cliente) : '',
      });
      setStatus(`Proyecto ${refreshed.find((project) => project.id === data.id)?.Codigo || data.Codigo} creado.`);
    } catch (error) {
      setStatus(`No se pudo crear el proyecto: ${error.response?.data?.message || error.message}`);
    }
  };

  const saveMaterial = async (event) => {
    event.preventDefault();
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
        const { data } = await axios.put(`${API_URL}/materiales/${editingMaterialId}`, payload, requestConfig);
        setMateriales((current) => current.map((material) => (material.id === data.id ? data : material)).sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setStatus(`Material ${data.nombre} actualizado.`);
      } else {
        const { data } = await axios.post(`${API_URL}/materiales`, payload, requestConfig);
        setMateriales((current) => [...current, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setStatus(`Material ${data.nombre} creado.`);
      }
      setMaterialDraft(initialMaterial);
      setEditingMaterialId('');
    } catch (error) {
      setStatus(`No se pudo guardar el material: ${error.response?.data?.message || error.message}`);
    }
  };

  const editMaterial = (material) => {
    setEditingMaterialId(String(material.id));
    setMaterialDraft({
      nombre: material.nombre,
      precio_venta: material.precio_venta,
      caracteristicas: material.caracteristicas || '',
      notes: material.notas || '',
    });
  };

  const cancelMaterialEdit = () => {
    setMaterialDraft(initialMaterial);
    setEditingMaterialId('');
  };

  const deleteMaterial = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('¿Seguro que quieres eliminar este material?')) return;
    try {
      await axios.delete(`${API_URL}/materiales/${id}`, requestConfig);
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
      await axios.delete(`${API_URL}/proyectos/${id}`, requestConfig);
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
      await axios.delete(`${API_URL}/elementos/${id}`, requestConfig);
      setElementos((current) => current.filter((e) => e.id !== id));
      await refreshProjects();
      setStatus('Partida eliminada.');
    } catch (error) {
      setStatus(`No se pudo eliminar la partida: ${error.response?.data?.message || error.message}`);
    }
  };

  const exportToExcel = () => {
    if (!selectedProject || !projectItems.length) {
      setStatus('No hay elementos en este proyecto para exportar.');
      return;
    }
    
    const data = projectItems.map((item) => ({
      'Referencia': item.Ref,
      'Concepto': item.Nombre,
      'Cantidad': item.Cantidad,
      'Unidad': item.Unidad_de_medida,
      'Precio Unitario (€)': item.Precio,
      'Total (€)': item.Cantidad * item.Precio,
      'Medida m²': item.medida_metro_cuadrado,
      'Medida m³': item.medida_metro_cubico
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Presupuesto');
    XLSX.writeFile(workbook, `Presupuesto_${selectedProject.Codigo}.xlsx`);
    setStatus('Presupuesto exportado a Excel.');
  };

  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!selectedProjectId) {
      setStatus('Selecciona un proyecto antes de importar partidas.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const bstr = e.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        let count = 0;
        for (const row of rawData) {
          const nombre = row['Concepto'] || row['Concepto/Nombre'] || row['Nombre'] || row['nombre'] || row['Referencia'];
          const cantidad = Number(row['Cantidad'] || row['cantidad'] || 1);
          const unidad = row['Unidad'] || row['unidad'] || 'ud';
          const precio = Number(row['Precio Unitario (€)'] || row['Precio Unitario'] || row['precio'] || row['Precio'] || 0);
          const m2 = Number(row['Medida m²'] || row['m²'] || 0);
          const m3 = Number(row['Medida m³'] || row['m³'] || 0);

          if (nombre) {
            const payload = {
              Nombre: nombre,
              Foto: '',
              Cantidad: cantidad,
              Unidad_de_medida: unidad,
              Precio: precio,
              medida_metro_cuadrado: m2,
              medida_metro_cubico: m3,
              Id_proyecto: Number(selectedProjectId),
              Id_usuario_creador: currentUser?.id || 1,
            };
            await axios.post(`${API_URL}/elementos`, payload, requestConfig);
            count++;
          }
        }
        
        await refreshProjects();
        const elementsRes = await axios.get(`${API_URL}/elementos`, requestConfig);
        setElementos(elementsRes.data);
        setStatus(`Importadas ${count} partidas desde Excel.`);
      } catch (err) {
        setStatus(`Error al importar Excel: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
    event.target.value = '';
  };

  const updateElementExtraValue = async (item, fieldGroup, key, val) => {
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
    
    try {
      const payload = {
        ...item,
        Foto: updatedFoto
      };
      const { data } = await axios.put(`${API_URL}/elementos/${item.id}`, payload, requestConfig);
      
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
  };

  const updateElementQuantity = async (item, qty) => {
    try {
      const payload = { ...item, Cantidad: Number(qty) };
      await axios.put(`${API_URL}/elementos/${item.id}`, payload, requestConfig);
      setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Cantidad: Number(qty) } : e));
      await refreshProjects();
    } catch (err) {
      setStatus(`Error al actualizar cantidad: ${err.message}`);
    }
  };

  const updateElementPrice = async (item, price) => {
    try {
      const payload = { ...item, Precio: Number(price) };
      await axios.put(`${API_URL}/elementos/${item.id}`, payload, requestConfig);
      setElementos((current) => current.map((e) => e.id === item.id ? { ...e, Precio: Number(price) } : e));
      await refreshProjects();
    } catch (err) {
      setStatus(`Error al actualizar precio unitario: ${err.message}`);
    }
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
      await axios.put(`${API_URL}/proyectos/${selectedProject.id}`, payload, requestConfig);
      await refreshProjects();
      setStatus('Datos del proyecto actualizados.');
    } catch (err) {
      setStatus(`Error al actualizar proyecto: ${err.message}`);
    }
  };

  const handleProjectFieldChange = (field, value) => {
    setProyectos((current) => current.map((p) => p.id === selectedProject.id ? { ...p, [field]: value } : p));
  };

  const createElemento = async (event) => {
    event.preventDefault();
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
      const { data } = await axios.post(`${API_URL}/elementos`, payload, requestConfig);
      setElementos((current) => [data, ...current]);
      await refreshProjects();
      setItemDraft(initialItem);
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
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8' }}>Usuario Conectado</span>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#ffffff', marginTop: '2px' }}>{currentUser?.nombre}</strong>
          </div>
          <span className="user-badge admin" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {currentUser?.rol}
          </span>
          <button onClick={handleLogout} style={{
            marginTop: '8px',
            padding: '6px 12px',
            background: '#e11d48',
            color: 'white',
            border: 0,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 'bold'
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
            <h1>Panel operativo para presupuestos</h1>
            <p>Gestiona clientes y proyectos desde la interfaz para preparar presupuestos usando los usuarios ya registrados.</p>
          </div>
          <div className="hero-stats">
            <div><strong>{usuarios.length}</strong><span>usuarios</span></div>
            <div><strong>{clientes.length}</strong><span>clientes</span></div>
            <div><strong>{proyectos.length}</strong><span>proyectos</span></div>
            <div><strong>{materiales.length}</strong><span>materiales</span></div>
          </div>
        </header>

        {activeTab === 'registro' && isAdmin && (
          <Setup
            clientes={clientes}
            usuarios={usuarios}
            proyectos={proyectos}
            clientDraft={clientDraft}
            projectDraft={projectDraft}
            updateDraft={updateDraft}
            setClientDraft={setClientDraft}
            setProjectDraft={setProjectDraft}
            createCliente={createCliente}
            createProyecto={createProyecto}
            onUserCreate={handleUserCreate}
            statusMessage={status}
          />
        )}

        {activeTab === 'materiales' && (
          <Materiales
            materiales={materiales}
            materialDraft={materialDraft}
            editingMaterialId={editingMaterialId}
            isAdmin={isAdmin}
            money={money}
            updateDraft={updateDraft}
            setMaterialDraft={setMaterialDraft}
            saveMaterial={saveMaterial}
            editMaterial={editMaterial}
            cancelMaterialEdit={cancelMaterialEdit}
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
            updateDraft={updateDraft}
            setItemDraft={setItemDraft}
            itemDraft={itemDraft}
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
          />
        )}
      </main>
      {status && <footer className="status-bar" onClick={() => setStatusRaw('')} title="Haga clic para cerrar">{status}</footer>}
    </div>
  );
}

export default App;
