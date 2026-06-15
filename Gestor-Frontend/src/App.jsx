import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const ROLES = ['Usuario', 'Moderador', 'Administrador']

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const today = new Date().toISOString().slice(0, 10)

function App() {
  const [clientes, setClientes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [elementos, setElementos] = useState([])
  const [activeUserId, setActiveUserId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [status, setStatus] = useState('Cargando datos del backend...')
  const [userDraft, setUserDraft] = useState({ nombre: '', email: '', password_hash: '', rol: 'Usuario' })
  const [clientDraft, setClientDraft] = useState({ id: '', Nombre: '', Persona_contacto: '', Email_contacto: '', Numero_contacto: '' })
  const [projectDraft, setProjectDraft] = useState({ Codigo: '', Fecha_entrega: today, Id_Cliente: '', Responsable: '' })
  const [draft, setDraft] = useState({
    Nombre: '',
    Ref: '',
    Cantidad: 1,
    Medida: 1,
    Unidad_de_medida: 'ud',
    Precio: 0,
  })

  const activeUser = useMemo(
    () => usuarios.find((usuario) => usuario.id === Number(activeUserId)),
    [usuarios, activeUserId],
  )
  const isAdmin = activeUser?.rol === 'Administrador'

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

  const adminHeaders = useMemo(() => ({ 'x-user-id': activeUserId }), [activeUserId])

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
        setActiveUserId(usuariosRes.data[0]?.id ? String(usuariosRes.data[0].id) : '')
        setSelectedProjectId(proyectosRes.data[0]?.id ? String(proyectosRes.data[0].id) : '')
        setProjectDraft((current) => ({
          ...current,
          Id_Cliente: clientesRes.data[0]?.id ? String(clientesRes.data[0].id) : '',
          Responsable: usuariosRes.data[0]?.id ? String(usuariosRes.data[0].id) : '',
        }))
        setStatus('Datos sincronizados')
      } catch (error) {
        setStatus(`No se pudo conectar con la API: ${error.message}`)
      }
    }

    loadDashboard()
  }, [])

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target
    setter((current) => ({ ...current, [name]: value }))
  }

  const handleDraftChange = updateForm(setDraft)
  const handleUserDraftChange = updateForm(setUserDraft)
  const handleClientDraftChange = updateForm(setClientDraft)
  const handleProjectDraftChange = updateForm(setProjectDraft)

  const createUsuario = async (event) => {
    event.preventDefault()

    try {
      const { data } = await axios.post(`${API_URL}/usuarios`, userDraft)
      setUsuarios((current) => [...current, data])
      setActiveUserId(String(data.id))
      setUserDraft({ nombre: '', email: '', password_hash: '', rol: 'Usuario' })
      setStatus(`Usuario ${data.nombre} creado con rol ${data.rol}`)
    } catch (error) {
      setStatus(`No se pudo crear el usuario: ${error.response?.data?.message || error.message}`)
    }
  }

  const createCliente = async (event) => {
    event.preventDefault()

    try {
      const payload = { ...clientDraft, id: Number(clientDraft.id) }
      const { data } = await axios.post(`${API_URL}/clientes`, payload, { headers: adminHeaders })
      setClientes((current) => [...current, data])
      setProjectDraft((current) => ({ ...current, Id_Cliente: String(data.id) }))
      setClientDraft({ id: '', Nombre: '', Persona_contacto: '', Email_contacto: '', Numero_contacto: '' })
      setStatus(`Cliente ${data.Nombre} creado`)
    } catch (error) {
      setStatus(`No se pudo crear el cliente: ${error.response?.data?.message || error.message}`)
    }
  }

  const createProyecto = async (event) => {
    event.preventDefault()

    try {
      const payload = {
        ...projectDraft,
        Id_Cliente: Number(projectDraft.Id_Cliente),
        Responsable: Number(projectDraft.Responsable),
      }
      const { data } = await axios.post(`${API_URL}/proyectos`, payload, { headers: adminHeaders })
      setProyectos((current) => [{ ...data, Cliente_Nombre: clientes.find((cliente) => cliente.id === data.Id_Cliente)?.Nombre }, ...current])
      setSelectedProjectId(String(data.id))
      setProjectDraft({ Codigo: '', Fecha_entrega: today, Id_Cliente: String(data.Id_Cliente), Responsable: String(data.Responsable) })
      setStatus(`Proyecto ${data.Codigo} creado`)
    } catch (error) {
      setStatus(`No se pudo crear el proyecto: ${error.response?.data?.message || error.message}`)
    }
  }

  const createElemento = async (event) => {
    event.preventDefault()
    if (!selectedProjectId) return

    const payload = {
      ...draft,
      Id_proyecto: Number(selectedProjectId),
      Id_usuario_creador: activeUser?.id || selectedProject?.Responsable || usuarios[0]?.id || 1,
      Cantidad: Number(draft.Cantidad),
      Medida: Number(draft.Medida),
      Precio: Number(draft.Precio),
    }

    try {
      const { data } = await axios.post(`${API_URL}/elementos`, payload)
      setElementos((current) => [data, ...current])
      setDraft({ Nombre: '', Ref: '', Cantidad: 1, Medida: 1, Unidad_de_medida: 'ud', Precio: 0 })
      setStatus('Elemento añadido al presupuesto')
    } catch (error) {
      setStatus(`No se pudo guardar el elemento: ${error.response?.data?.message || error.message}`)
    }
  }

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <span className="eyebrow">Gestor de presupuestos</span>
          <h1>Creador inicial de presupuestos por proyecto</h1>
          <p>Gestiona usuarios con roles, crea clientes/proyectos como administrador y añade partidas al presupuesto.</p>
        </div>
        <div className="hero-stats">
          <strong>{proyectos.length}</strong>
          <span>proyectos</span>
          <strong>{clientes.length}</strong>
          <span>clientes</span>
        </div>
      </header>

      <section className="admin-grid">
        <section className="panel role-panel">
          <div className="section-title"><span>00</span><h2>Usuarios y roles</h2></div>
          <label>
            Usuario activo
            <select value={activeUserId} onChange={(event) => setActiveUserId(event.target.value)}>
              <option value="">Sin usuario activo</option>
              {usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombre} · {usuario.rol}</option>)}
            </select>
          </label>
          <p className={isAdmin ? 'role-badge admin' : 'role-badge'}>
            {activeUser ? `Rol activo: ${activeUser.rol}` : 'Crea o selecciona un usuario para operar'}
          </p>

          <form className="stack-form" onSubmit={createUsuario}>
            <input name="nombre" onChange={handleUserDraftChange} placeholder="Nombre" required value={userDraft.nombre} />
            <input name="email" onChange={handleUserDraftChange} placeholder="Email" type="email" value={userDraft.email} />
            <input name="password_hash" onChange={handleUserDraftChange} placeholder="Password hash inicial" required value={userDraft.password_hash} />
            <select name="rol" onChange={handleUserDraftChange} value={userDraft.rol}>{ROLES.map((rol) => <option key={rol}>{rol}</option>)}</select>
            <button type="submit">Crear usuario</button>
          </form>
        </section>

        <section className="panel admin-panel">
          <div className="section-title"><span>01</span><h2>Altas de administrador</h2></div>
          {!isAdmin && <p className="empty-state compact">Solo un Administrador puede crear clientes y proyectos.</p>}
          <div className="admin-forms">
            <form className="stack-form" onSubmit={createCliente}>
              <h3>Nuevo cliente</h3>
              <input disabled={!isAdmin} min="1" name="id" onChange={handleClientDraftChange} placeholder="ID cliente" required type="number" value={clientDraft.id} />
              <input disabled={!isAdmin} name="Nombre" onChange={handleClientDraftChange} placeholder="Nombre cliente" required value={clientDraft.Nombre} />
              <input disabled={!isAdmin} name="Persona_contacto" onChange={handleClientDraftChange} placeholder="Persona contacto" value={clientDraft.Persona_contacto} />
              <input disabled={!isAdmin} name="Email_contacto" onChange={handleClientDraftChange} placeholder="Email contacto" type="email" value={clientDraft.Email_contacto} />
              <input disabled={!isAdmin} name="Numero_contacto" onChange={handleClientDraftChange} placeholder="Teléfono contacto" value={clientDraft.Numero_contacto} />
              <button disabled={!isAdmin} type="submit">Crear cliente</button>
            </form>

            <form className="stack-form" onSubmit={createProyecto}>
              <h3>Nuevo proyecto</h3>
              <input disabled={!isAdmin} name="Codigo" onChange={handleProjectDraftChange} placeholder="Código" required value={projectDraft.Codigo} />
              <input disabled={!isAdmin} name="Fecha_entrega" onChange={handleProjectDraftChange} required type="date" value={projectDraft.Fecha_entrega} />
              <select disabled={!isAdmin} name="Id_Cliente" onChange={handleProjectDraftChange} required value={projectDraft.Id_Cliente}>
                <option value="">Cliente</option>
                {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.Nombre}</option>)}
              </select>
              <select disabled={!isAdmin} name="Responsable" onChange={handleProjectDraftChange} required value={projectDraft.Responsable}>
                <option value="">Responsable</option>
                {usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>)}
              </select>
              <button disabled={!isAdmin} type="submit">Crear proyecto</button>
            </form>
          </div>
        </section>
      </section>

      <section className="workspace">
        <aside className="panel project-list">
          <div className="section-title"><span>02</span><h2>Proyectos</h2></div>
          {proyectos.map((project) => (
            <button className={project.id === Number(selectedProjectId) ? 'project-card active' : 'project-card'} key={project.id} onClick={() => setSelectedProjectId(String(project.id))} type="button">
              <strong>{project.Codigo}</strong>
              <small>{project.Cliente_Nombre || `Cliente #${project.Id_Cliente}`}</small>
              <span>{money.format(Number(project.Total || 0))}</span>
            </button>
          ))}
          {!proyectos.length && <p className="empty-state compact">No hay proyectos todavía.</p>}
        </aside>

        <section className="panel budget-builder">
          <div className="section-title"><span>03</span><h2>Presupuesto</h2></div>
          {selectedProject ? (
            <>
              <div className="budget-summary">
                <div><p>Proyecto seleccionado</p><h3>{selectedProject.Codigo}</h3><small>Responsable: {selectedProject.Responsable_Nombre || selectedProject.Responsable}</small></div>
                <strong>{money.format(total)}</strong>
              </div>
              <form className="item-form" onSubmit={createElemento}>
                <input name="Nombre" onChange={handleDraftChange} placeholder="Concepto" required value={draft.Nombre} />
                <input name="Ref" onChange={handleDraftChange} placeholder="Referencia" required value={draft.Ref} />
                <input min="1" name="Cantidad" onChange={handleDraftChange} type="number" value={draft.Cantidad} />
                <input min="1" name="Medida" onChange={handleDraftChange} type="number" value={draft.Medida} />
                <input name="Unidad_de_medida" onChange={handleDraftChange} value={draft.Unidad_de_medida} />
                <input min="0" name="Precio" onChange={handleDraftChange} step="0.01" type="number" value={draft.Precio} />
                <button type="submit">Añadir partida</button>
              </form>
              <div className="items-table">
                {projectItems.map((item) => (
                  <article key={item.id}>
                    <div><strong>{item.Nombre}</strong><small>{item.Ref}</small></div>
                    <span>{item.Cantidad} × {item.Medida} {item.Unidad_de_medida}</span>
                    <strong>{money.format(item.Cantidad * item.Medida * item.Precio)}</strong>
                  </article>
                ))}
                {!projectItems.length && <p className="empty-state">Aún no hay partidas para este proyecto.</p>}
              </div>
            </>
          ) : <p className="empty-state">Crea o carga un proyecto para empezar un presupuesto.</p>}
        </section>
      </section>

      <footer className="status-bar">{status}</footer>
    </main>
  )
}

export default App
