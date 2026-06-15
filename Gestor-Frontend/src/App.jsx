import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

function App() {
  const [clientes, setClientes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [elementos, setElementos] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [status, setStatus] = useState('Cargando datos del backend...')
  const [draft, setDraft] = useState({
    Nombre: '',
    Ref: '',
    Cantidad: 1,
    Medida: 1,
    Unidad_de_medida: 'ud',
    Precio: 0,
  })

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
        setStatus('Datos sincronizados')
      } catch (error) {
        setStatus(`No se pudo conectar con la API: ${error.message}`)
      }
    }

    loadDashboard()
  }, [])

  const handleDraftChange = (event) => {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  const createElemento = async (event) => {
    event.preventDefault()
    if (!selectedProjectId) return

    const payload = {
      ...draft,
      Id_proyecto: Number(selectedProjectId),
      Id_usuario_creador: selectedProject?.Responsable || usuarios[0]?.id || 1,
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
      setStatus(`No se pudo guardar el elemento: ${error.message}`)
    }
  }

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <span className="eyebrow">Gestor de presupuestos</span>
          <h1>Creador inicial de presupuestos por proyecto</h1>
          <p>
            Conecta clientes, responsables y partidas para validar la idea mínima del flujo de
            presupuesto antes de añadir herramientas avanzadas.
          </p>
        </div>
        <div className="hero-stats">
          <strong>{proyectos.length}</strong>
          <span>proyectos</span>
          <strong>{clientes.length}</strong>
          <span>clientes</span>
        </div>
      </header>

      <section className="workspace">
        <aside className="panel project-list">
          <div className="section-title">
            <span>01</span>
            <h2>Proyectos</h2>
          </div>
          {proyectos.map((project) => (
            <button
              className={project.id === Number(selectedProjectId) ? 'project-card active' : 'project-card'}
              key={project.id}
              onClick={() => setSelectedProjectId(String(project.id))}
              type="button"
            >
              <strong>{project.Codigo}</strong>
              <small>{project.Cliente_Nombre || `Cliente #${project.Id_Cliente}`}</small>
              <span>{money.format(Number(project.Total || 0))}</span>
            </button>
          ))}
        </aside>

        <section className="panel budget-builder">
          <div className="section-title">
            <span>02</span>
            <h2>Presupuesto</h2>
          </div>

          {selectedProject ? (
            <>
              <div className="budget-summary">
                <div>
                  <p>Proyecto seleccionado</p>
                  <h3>{selectedProject.Codigo}</h3>
                  <small>Responsable: {selectedProject.Responsable_Nombre || selectedProject.Responsable}</small>
                </div>
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
                    <div>
                      <strong>{item.Nombre}</strong>
                      <small>{item.Ref}</small>
                    </div>
                    <span>{item.Cantidad} × {item.Medida} {item.Unidad_de_medida}</span>
                    <strong>{money.format(item.Cantidad * item.Medida * item.Precio)}</strong>
                  </article>
                ))}
                {!projectItems.length && <p className="empty-state">Aún no hay partidas para este proyecto.</p>}
              </div>
            </>
          ) : (
            <p className="empty-state">Crea o carga un proyecto para empezar un presupuesto.</p>
          )}
        </section>
      </section>

      <footer className="status-bar">{status}</footer>
    </main>
  )
}

export default App
