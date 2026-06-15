import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const today = new Date().toISOString().slice(0, 10)

const initialClient = { id: '', Nombre: '', Persona_contacto: '', Email_contacto: '', Numero_contacto: '' }
const initialProject = { Codigo: '', Fecha_entrega: today, Colaboradores: '', Responsable: '', Id_Cliente: '' }
const initialItem = { Nombre: '', Foto: '', Cantidad: 1, Unidad_de_medida: 'ud', Precio: 0, medida_metro_cuadrado: 0, medida_metro_cubico: 0 }
const initialMaterial = { nombre: '', precio_venta: 0, caracteristicas: '', notas: '' }

function App() {
  const [clientes, setClientes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [elementos, setElementos] = useState([])
  const [materiales, setMateriales] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [status, setStatus] = useState('Cargando datos del backend...')
  const [clientDraft, setClientDraft] = useState(initialClient)
  const [projectDraft, setProjectDraft] = useState(initialProject)
  const [itemDraft, setItemDraft] = useState(initialItem)
  const [materialDraft, setMaterialDraft] = useState(initialMaterial)
  const [editingMaterialId, setEditingMaterialId] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')

  const currentUser = useMemo(
    () => usuarios.find((user) => user.id === Number(currentUserId)),
    [usuarios, currentUserId],
  )

  const isAdmin = ['admin', 'administrador'].includes(String(currentUser?.rol || '').toLowerCase())

  const selectedProject = useMemo(
    () => proyectos.find((project) => project.id === Number(selectedProjectId)),
    [proyectos, selectedProjectId],
  )

  const projectItems = useMemo(
    () => elementos.filter((item) => item.Id_proyecto === Number(selectedProjectId)),
    [elementos, selectedProjectId],
  )

  const total = useMemo(
    () => projectItems.reduce((sum, item) => sum + item.Cantidad * item.Precio, 0),
    [projectItems],
  )

  const materialRequestConfig = () => ({ headers: { 'x-user-id': currentUserId } })

  const refreshProjects = async () => {
    const { data } = await axios.get(`${API_URL}/proyectos`)
    setProyectos(data)
    return data
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [clientesRes, usuariosRes, proyectosRes, elementosRes, materialesRes] = await Promise.all([
          axios.get(`${API_URL}/clientes`),
          axios.get(`${API_URL}/usuarios`),
          axios.get(`${API_URL}/proyectos`),
          axios.get(`${API_URL}/elementos`),
          axios.get(`${API_URL}/materiales`),
        ])
        setClientes(clientesRes.data)
        setUsuarios(usuariosRes.data)
        setProyectos(proyectosRes.data)
        setElementos(elementosRes.data)
        setMateriales(materialesRes.data)
        setSelectedProjectId(proyectosRes.data[0]?.id ? String(proyectosRes.data[0].id) : '')
        setCurrentUserId(usuariosRes.data.find((user) => ['admin', 'administrador'].includes(String(user.rol).toLowerCase()))?.id ? String(usuariosRes.data.find((user) => ['admin', 'administrador'].includes(String(user.rol).toLowerCase())).id) : (usuariosRes.data[0]?.id ? String(usuariosRes.data[0].id) : ''))
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

  const saveMaterial = async (event) => {
    event.preventDefault()
    if (!isAdmin) {
      setStatus('Solo los administradores pueden crear o editar materiales.')
      return
    }

    const payload = {
      ...materialDraft,
      precio_venta: Number(materialDraft.precio_venta),
    }

    try {
      if (editingMaterialId) {
        const { data } = await axios.put(`${API_URL}/materiales/${editingMaterialId}`, payload, materialRequestConfig())
        setMateriales((current) => current.map((material) => (material.id === data.id ? data : material)).sort((a, b) => a.nombre.localeCompare(b.nombre)))
        setStatus(`Material ${data.nombre} actualizado.`)
      } else {
        const { data } = await axios.post(`${API_URL}/materiales`, payload, materialRequestConfig())
        setMateriales((current) => [...current, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
        setStatus(`Material ${data.nombre} creado.`)
      }
      setMaterialDraft(initialMaterial)
      setEditingMaterialId('')
    } catch (error) {
      setStatus(`No se pudo guardar el material: ${error.response?.data?.message || error.message}`)
    }
  }

  const editMaterial = (material) => {
    setEditingMaterialId(String(material.id))
    setMaterialDraft({
      nombre: material.nombre,
      precio_venta: material.precio_venta,
      caracteristicas: material.caracteristicas || '',
      notas: material.notas || '',
    })
  }

  const cancelMaterialEdit = () => {
    setMaterialDraft(initialMaterial)
    setEditingMaterialId('')
  }

  const createElemento = async (event) => {
    event.preventDefault()
    if (!selectedProjectId) {
      setStatus('Selecciona o crea un proyecto antes de añadir una partida.')
      return
    }

    const payload = {
      ...itemDraft,
      Id_proyecto: Number(selectedProjectId),
      Id_usuario_creador: selectedProject?.Responsable || usuarios[0]?.id || 1,
      Cantidad: Number(itemDraft.Cantidad),
      Precio: Number(itemDraft.Precio),
      medida_metro_cuadrado: Number(itemDraft.medida_metro_cuadrado),
      medida_metro_cubico: Number(itemDraft.medida_metro_cubico),
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
          <div><strong>{materiales.length}</strong><span>materiales</span></div>
        </div>
      </header>

      <section className="session-bar panel">
        <label className="field">
          <span>Usuario activo para permisos</span>
          <select disabled={!usuarios.length} onChange={(event) => setCurrentUserId(event.target.value)} value={currentUserId}>
            <option value="">Selecciona usuario</option>{usuarios.map((user) => <option key={user.id} value={user.id}>{user.nombre} · {user.rol}</option>)}
          </select>
        </label>
        <p>{isAdmin ? 'Permisos de administrador activos: puedes crear y editar materiales.' : 'Modo consulta: solo los administradores pueden modificar materiales.'}</p>
      </section>

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


      <section className="panel materials-panel">
        <div className="section-title"><span>03</span><h2>Materiales</h2></div>
        <form className="material-form" onSubmit={saveMaterial}>
          <label className="field">
            <span>Nombre del material <em>Obligatorio</em></span>
            <input disabled={!isAdmin} name="nombre" onChange={updateDraft(setMaterialDraft)} placeholder="Ej. Tablero MDF" required value={materialDraft.nombre} />
          </label>
          <label className="field">
            <span>Precio de venta</span>
            <input disabled={!isAdmin} min="0" name="precio_venta" onChange={updateDraft(setMaterialDraft)} step="0.01" type="number" value={materialDraft.precio_venta} />
          </label>
          <label className="field">
            <span>Características</span>
            <textarea disabled={!isAdmin} name="caracteristicas" onChange={updateDraft(setMaterialDraft)} placeholder="Medidas, acabado, proveedor..." value={materialDraft.caracteristicas} />
          </label>
          <label className="field">
            <span>Notas</span>
            <textarea disabled={!isAdmin} name="notas" onChange={updateDraft(setMaterialDraft)} placeholder="Observaciones internas" value={materialDraft.notas} />
          </label>
          <div className="material-actions">
            <button disabled={!isAdmin} type="submit">{editingMaterialId ? 'Guardar cambios' : 'Crear material'}</button>
            {editingMaterialId && <button className="secondary-action" onClick={cancelMaterialEdit} type="button">Cancelar</button>}
          </div>
        </form>
        <div className="materials-list">
          {materiales.map((material) => (
            <article key={material.id}>
              <div>
                <strong>{material.nombre}</strong>
                <small>{material.caracteristicas || 'Sin características'}</small>
                <small>{material.notas || 'Sin notas'}</small>
              </div>
              <strong>{money.format(Number(material.precio_venta || 0))}</strong>
              <button disabled={!isAdmin} onClick={() => editMaterial(material)} type="button">Editar</button>
            </article>
          ))}
          {!materiales.length && <p className="empty-state">Aún no hay materiales registrados.</p>}
        </div>
      </section>

      <section className="workspace">
        <aside className="panel project-list">
          <div className="section-title"><span>04</span><h2>Proyectos</h2></div>
          {proyectos.map((project) => (
            <button className={project.id === Number(selectedProjectId) ? 'project-card active' : 'project-card'} key={project.id} onClick={() => setSelectedProjectId(String(project.id))} type="button">
              <strong>{project.Codigo}</strong><small>{project.Cliente_Nombre || `Cliente #${project.Id_Cliente}`}</small><span>{money.format(Number(project.Total || 0))}</span>
            </button>
          ))}
          {!proyectos.length && <p className="empty-state">Crea tu primer proyecto para empezar.</p>}
        </aside>

        <section className="panel budget-builder">
          <div className="section-title"><span>05</span><h2>Presupuesto</h2></div>
          {selectedProject ? (<>
            <div className="budget-summary"><div><p>Proyecto seleccionado</p><h3>{selectedProject.Codigo}</h3><small>Responsable: {selectedProject.Responsable_Nombre || selectedProject.Responsable}</small></div><strong>{money.format(total)}</strong></div>
            <form className="item-form" onSubmit={createElemento}>
              <div className="item-form-header">
                <div>
                  <span className="form-kicker">Nueva partida</span>
                  <h3>Añadir elemento al presupuesto</h3>
                  <p>Rellena solo lo importante: nombre, cantidad, unidad y precio. La referencia se crea automáticamente.</p>
                </div>
                <div className="selected-project-pill">Proyecto: <strong>{selectedProject.Codigo}</strong></div>
              </div>

              <div className="form-section main-fields">
                <label className="field wide-field">
                  <span>¿Qué vas a presupuestar? <em>Obligatorio</em></span>
                  <input name="Nombre" onChange={updateDraft(setItemDraft)} placeholder="Ej. Suministro e instalación de puerta" required value={itemDraft.Nombre} />
                </label>
                <label className="field">
                  <span>Foto o enlace <small>opcional</small></span>
                  <input name="Foto" onChange={updateDraft(setItemDraft)} placeholder="https://..." value={itemDraft.Foto} />
                </label>
              </div>

              <div className="form-section numbers-grid">
                <label className="field">
                  <span>Cantidad</span>
                  <input min="1" name="Cantidad" onChange={updateDraft(setItemDraft)} type="number" value={itemDraft.Cantidad} />
                </label>
                <label className="field">
                  <span>Unidad</span>
                  <input list="unit-options" name="Unidad_de_medida" onChange={updateDraft(setItemDraft)} placeholder="ud, m, m²..." value={itemDraft.Unidad_de_medida} />
                  <datalist id="unit-options">
                    <option value="ud" />
                    <option value="m" />
                    <option value="m²" />
                    <option value="m³" />
                    <option value="h" />
                  </datalist>
                </label>
                <label className="field price-field">
                  <span>Precio unitario</span>
                  <input min="0" name="Precio" onChange={updateDraft(setItemDraft)} step="0.01" type="number" value={itemDraft.Precio} />
                </label>
                <div className="line-total-card">
                  <span>Total estimado</span>
                  <strong>{money.format(Number(itemDraft.Cantidad || 0) * Number(itemDraft.Precio || 0))}</strong>
                </div>
              </div>

              <details className="optional-measures">
                <summary>Medidas adicionales (si aplican)</summary>
                <div className="optional-grid">
                  <label className="field">
                    <span>Metros cuadrados</span>
                    <input min="0" name="medida_metro_cuadrado" onChange={updateDraft(setItemDraft)} step="0.01" type="number" value={itemDraft.medida_metro_cuadrado} />
                  </label>
                  <label className="field">
                    <span>Metros cúbicos</span>
                    <input min="0" name="medida_metro_cubico" onChange={updateDraft(setItemDraft)} step="0.01" type="number" value={itemDraft.medida_metro_cubico} />
                  </label>
                </div>
              </details>

              <button className="primary-action" type="submit">Añadir elemento al presupuesto</button>
            </form>
            <div className="items-table">{projectItems.map((item) => <article key={item.id}>{item.Foto ? <img alt={item.Nombre} className="item-photo" src={item.Foto} /> : <div className="item-photo placeholder">Sin foto</div>}<div><strong>{item.Nombre}</strong><small>Ref. autocreada: {item.Ref}</small><small>{item.Cantidad} {item.Unidad_de_medida} · {money.format(Number(item.Precio))} unidad</small><small>{Number(item.medida_metro_cuadrado || 0)} m² · {Number(item.medida_metro_cubico || 0)} m³</small></div><strong>{money.format(item.Cantidad * item.Precio)}</strong></article>)}{!projectItems.length && <p className="empty-state">Aún no hay partidas para este proyecto.</p>}</div>
          </>) : <p className="empty-state">Crea o selecciona un proyecto para empezar un presupuesto.</p>}
        </section>
      </section>
      <footer className="status-bar">{status}</footer>
    </main>
  )
}

export default App
