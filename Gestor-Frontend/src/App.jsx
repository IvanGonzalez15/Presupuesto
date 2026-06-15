import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const today = new Date().toISOString().slice(0, 10)

const initialClient = { id: '', Nombre: '', Persona_contacto: '', Email_contacto: '', Numero_contacto: '' }
const initialProject = { Codigo: '', Fecha_entrega: today, Colaboradores: '', Responsable: '', Id_Cliente: '' }
const initialItem = { Nombre: '', Ref: '', Cantidad: 1, Medida: 1, Unidad_de_medida: 'ud', Precio: 0 }

function App() {
  const [clientes, setClientes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [elementos, setElementos] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [status, setStatus] = useState('Cargando datos del backend...')
  const [clientDraft, setClientDraft] = useState(initialClient)
  const [projectDraft, setProjectDraft] = useState(initialProject)
  const [itemDraft, setItemDraft] = useState(initialItem)

  const selectedProject = useMemo(
    () => proyectos.find((project) => project.id === Number(selectedProjectId)),
    [proyectos, selectedProjectId],
  )

  const projectItems = useMemo(
    () => elementos.filter((item) => item.Id_proyecto === Number(selectedProjectId)),
    [elementos, selectedProjectId],
  )

  const total = useMemo(
    () => projectItems.reduce((sum, item) => sum + item.Cantidad * item.Medida * item.Precio, 0),
    [projectItems],
  )

  const refreshProjects = async () => {
    const { data } = await axios.get(`${API_URL}/proyectos`)
    setProyectos(data)
    return data
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [clientesRes, usuariosRes, proyectosRes, elementosRes] = await Promise.all([
          axios.get(`${API_URL}/clientes`),
          axios.get(`${API_URL}/usuarios`),
          axios.get(`${API_URL}/proyectos`),
          axios.get(`${API_URL}/elementos`),
        ])
        setClientes(clientesRes.data)
        setUsuarios(usuariosRes.data)
        setProyectos(proyectosRes.data)
        setElementos(elementosRes.data)
        setSelectedProjectId(proyectosRes.data[0]?.id ? String(proyectosRes.data[0].id) : '')
        setProjectDraft((current) => ({
          ...current,
          Responsable: usuariosRes.data[0]?.id ? String(usuariosRes.data[0].id) : '',
          Id_Cliente: clientesRes.data[0]?.id ? String(clientesRes.data[0].id) : '',
        }))
        setStatus('Datos sincronizados')
      } catch (error) {
        setStatus(`No se pudo conectar con la API: ${error.message}`)
      }
    }

    loadDashboard()
  }, [])

  const updateDraft = (setter) => (event) => {
    const { name, value } = event.target
    setter((current) => ({ ...current, [name]: value }))
  }

  const createCliente = async (event) => {
    event.preventDefault()
    try {
      const { data } = await axios.post(`${API_URL}/clientes`, clientDraft)
      setClientes((current) => [...current, data].sort((a, b) => a.Nombre.localeCompare(b.Nombre)))
      setProjectDraft((current) => ({ ...current, Id_Cliente: current.Id_Cliente || String(data.id) }))
      setClientDraft(initialClient)
      setStatus(`Cliente ${data.Nombre} creado.`)
    } catch (error) {
      setStatus(`No se pudo crear el cliente: ${error.response?.data?.message || error.message}`)
    }
  }

  const createProyecto = async (event) => {
    event.preventDefault()
    try {
      const payload = {
        ...projectDraft,
        Colaboradores: projectDraft.Colaboradores ? Number(projectDraft.Colaboradores) : null,
        Responsable: Number(projectDraft.Responsable),
        Id_Cliente: Number(projectDraft.Id_Cliente),
      }
      const { data } = await axios.post(`${API_URL}/proyectos`, payload)
      const refreshed = await refreshProjects()
      setSelectedProjectId(String(data.id))
      setProjectDraft({
        ...initialProject,
        Responsable: payload.Responsable ? String(payload.Responsable) : '',
        Id_Cliente: payload.Id_Cliente ? String(payload.Id_Cliente) : '',
      })
      setStatus(`Proyecto ${refreshed.find((project) => project.id === data.id)?.Codigo || data.Codigo} creado.`)
    } catch (error) {
      setStatus(`No se pudo crear el proyecto: ${error.response?.data?.message || error.message}`)
    }
  }

  const createElemento = async (event) => {
    event.preventDefault()
    if (!selectedProjectId) return

    const payload = {
      ...itemDraft,
      Id_proyecto: Number(selectedProjectId),
      Id_usuario_creador: selectedProject?.Responsable || usuarios[0]?.id || 1,
      Cantidad: Number(itemDraft.Cantidad),
      Medida: Number(itemDraft.Medida),
      Precio: Number(itemDraft.Precio),
    }

    try {
      const { data } = await axios.post(`${API_URL}/elementos`, payload)
      setElementos((current) => [data, ...current])
      await refreshProjects()
      setItemDraft(initialItem)
      setStatus('Partida añadida al presupuesto')
    } catch (error) {
      setStatus(`No se pudo guardar la partida: ${error.response?.data?.message || error.message}`)
    }
  }

  return (
    <main className="app-shell">
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
        </div>
      </header>

      <section className="setup-grid">
        <form className="panel setup-card" onSubmit={createCliente}>
          <div className="section-title"><span>01</span><h2>Crear cliente</h2></div>
          <input name="id" onChange={updateDraft(setClientDraft)} placeholder="ID cliente" required value={clientDraft.id} />
          <input name="Nombre" onChange={updateDraft(setClientDraft)} placeholder="Nombre fiscal" required value={clientDraft.Nombre} />
          <input name="Persona_contacto" onChange={updateDraft(setClientDraft)} placeholder="Persona de contacto" value={clientDraft.Persona_contacto} />
          <input name="Email_contacto" onChange={updateDraft(setClientDraft)} placeholder="Email contacto" type="email" value={clientDraft.Email_contacto} />
          <button type="submit">Crear cliente</button>
        </form>

        <form className="panel setup-card" onSubmit={createProyecto}>
          <div className="section-title"><span>02</span><h2>Crear proyecto</h2></div>
          <input name="Codigo" onChange={updateDraft(setProjectDraft)} placeholder="Código proyecto" required value={projectDraft.Codigo} />
          <input name="Fecha_entrega" onChange={updateDraft(setProjectDraft)} required type="date" value={projectDraft.Fecha_entrega} />
          <select disabled={!usuarios.length} name="Responsable" onChange={updateDraft(setProjectDraft)} required value={projectDraft.Responsable}>
            <option value="">Responsable</option>{usuarios.map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}
          </select>
          <select disabled={!clientes.length} name="Id_Cliente" onChange={updateDraft(setProjectDraft)} required value={projectDraft.Id_Cliente}>
            <option value="">Cliente</option>{clientes.map((client) => <option key={client.id} value={client.id}>{client.Nombre}</option>)}
          </select>
          <button disabled={!usuarios.length || !clientes.length} type="submit">Crear proyecto</button>
        </form>
      </section>

      <section className="workspace">
        <aside className="panel project-list">
          <div className="section-title"><span>03</span><h2>Proyectos</h2></div>
          {proyectos.map((project) => (
            <button className={project.id === Number(selectedProjectId) ? 'project-card active' : 'project-card'} key={project.id} onClick={() => setSelectedProjectId(String(project.id))} type="button">
              <strong>{project.Codigo}</strong><small>{project.Cliente_Nombre || `Cliente #${project.Id_Cliente}`}</small><span>{money.format(Number(project.Total || 0))}</span>
            </button>
          ))}
          {!proyectos.length && <p className="empty-state">Crea tu primer proyecto para empezar.</p>}
        </aside>

        <section className="panel budget-builder">
          <div className="section-title"><span>04</span><h2>Presupuesto</h2></div>
          {selectedProject ? (<>
            <div className="budget-summary"><div><p>Proyecto seleccionado</p><h3>{selectedProject.Codigo}</h3><small>Responsable: {selectedProject.Responsable_Nombre || selectedProject.Responsable}</small></div><strong>{money.format(total)}</strong></div>
            <form className="item-form" onSubmit={createElemento}>
              <input name="Nombre" onChange={updateDraft(setItemDraft)} placeholder="Concepto" required value={itemDraft.Nombre} />
              <input name="Ref" onChange={updateDraft(setItemDraft)} placeholder="Referencia" required value={itemDraft.Ref} />
              <input min="1" name="Cantidad" onChange={updateDraft(setItemDraft)} type="number" value={itemDraft.Cantidad} />
              <input min="1" name="Medida" onChange={updateDraft(setItemDraft)} type="number" value={itemDraft.Medida} />
              <input name="Unidad_de_medida" onChange={updateDraft(setItemDraft)} value={itemDraft.Unidad_de_medida} />
              <input min="0" name="Precio" onChange={updateDraft(setItemDraft)} step="0.01" type="number" value={itemDraft.Precio} />
              <button type="submit">Añadir partida</button>
            </form>
            <div className="items-table">{projectItems.map((item) => <article key={item.id}><div><strong>{item.Nombre}</strong><small>{item.Ref}</small></div><span>{item.Cantidad} × {item.Medida} {item.Unidad_de_medida}</span><strong>{money.format(item.Cantidad * item.Medida * item.Precio)}</strong></article>)}{!projectItems.length && <p className="empty-state">Aún no hay partidas para este proyecto.</p>}</div>
          </>) : <p className="empty-state">Crea o selecciona un proyecto para empezar un presupuesto.</p>}
        </section>
      </section>
      <footer className="status-bar">{status}</footer>
    </main>
  )
}

export default App
