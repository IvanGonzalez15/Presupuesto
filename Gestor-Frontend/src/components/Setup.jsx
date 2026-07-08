import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';
import { tarifaService, tarifaMaterialService } from '../services/api';

const today = new Date().toISOString().slice(0, 10);
const initialClient = { Nombre: '', Persona_contacto: '', Email_contacto: '', Numero_contacto: '' };
const initialProject = { Codigo: '', Fecha_entrega: today, Colaboradores: [], Responsable: '', Id_Cliente: '' };
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

export default function Setup({
  clientes,
  usuarios,
  proyectos = [],
  createCliente,
  createProyecto,
  onUserCreate,
  statusMessage,
  setStatus,
  onTarifasUpdated,
  tarifasMateriales = [],
  setTarifasMateriales
}) {
  const [clientDraft, setClientDraft] = useState(initialClient);
  const [projectDraft, setProjectDraft] = useState(initialProject);
  const [userDraft, setUserDraft] = useState({ nombre: '', email: '', password: '', rol: 'Admin', proyectoId: '' });
  const [tarifas, setTarifas] = useState(null);

  // Material CRUD states
  const [newMaterial, setNewMaterial] = useState({ categoria: 'porex', nombre: '', precio: '', unidad: 'm3' });
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editMaterialDraft, setEditMaterialDraft] = useState({ categoria: '', nombre: '', precio: '', unidad: '' });

  useEffect(() => {
    tarifaService.get()
      .then(res => setTarifas(res.data))
      .catch(err => setStatus(`Error al cargar tarifas: ${err.message}`));
  }, []);

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientSubmit = (e) => {
    e.preventDefault();
    createCliente(clientDraft);
    setClientDraft(initialClient);
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (!projectDraft.Responsable) {
      setStatus('Por favor, selecciona un responsable para el proyecto.');
      return;
    }
    if (!projectDraft.Id_Cliente) {
      setStatus('Por favor, selecciona un cliente para el proyecto.');
      return;
    }
    createProyecto(projectDraft);
    setProjectDraft({
      ...initialProject,
      Responsable: projectDraft.Responsable,
      Id_Cliente: projectDraft.Id_Cliente
    });
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (userDraft.nombre.trim() && userDraft.password.trim() && userDraft.rol) {
      if (userDraft.rol === 'Colaborador' && !userDraft.proyectoId) {
        setStatus('Por favor, selecciona un proyecto para el colaborador.');
        return;
      }
      onUserCreate(userDraft);
      setUserDraft({ nombre: '', email: '', password: '', rol: 'Admin', proyectoId: '' });
    }
  };

  const handleManoObraChange = (field, val) => {
    setTarifas(prev => ({
      ...prev,
      manoObra: {
        ...prev.manoObra,
        [field]: Number(val)
      }
    }));
  };

  const handleTarifasSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await tarifaService.update(tarifas);
      setTarifas(data);
      setStatus('Tarifas y costes actualizados correctamente.');
      if (onTarifasUpdated) {
        await onTarifasUpdated();
      }
    } catch (err) {
      setStatus(`Error al guardar tarifas: ${err.response?.data?.message || err.message}`);
    }
  };

  // Material CRUD handlers
  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      const { data } = await tarifaMaterialService.create(newMaterial);
      setTarifasMateriales(prev => [...prev, data]);
      setNewMaterial({ categoria: newMaterial.categoria, nombre: '', precio: '', unidad: newMaterial.unidad });
      setStatus('Material creado y agregado al catálogo correctamente.');
      if (onTarifasUpdated) {
        await onTarifasUpdated();
      }
    } catch (err) {
      setStatus(`Error al crear material: ${err.response?.data?.message || err.message}`);
    }
  };

  const startEditMaterial = (m) => {
    setEditingMaterialId(m.id);
    setEditMaterialDraft({ ...m });
  };

  const handleSaveEditMaterial = async () => {
    try {
      const { data } = await tarifaMaterialService.update(editingMaterialId, editMaterialDraft);
      setTarifasMateriales(prev => prev.map(m => m.id === editingMaterialId ? data : m));
      setEditingMaterialId(null);
      setStatus('Material actualizado correctamente.');
      if (onTarifasUpdated) {
        await onTarifasUpdated();
      }
    } catch (err) {
      setStatus(`Error al actualizar material: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este material?')) return;
    try {
      await tarifaMaterialService.delete(id);
      setTarifasMateriales(prev => prev.filter(m => m.id !== id));
      setStatus('Material eliminado correctamente.');
      if (onTarifasUpdated) {
        await onTarifasUpdated();
      }
    } catch (err) {
      setStatus(`Error al eliminar material: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="setup-grid">
        <form className="panel setup-card" onSubmit={handleClientSubmit} autoComplete="off">
          <div className="section-title"><span>01</span><h2>Crear cliente</h2></div>
          <input name="Nombre" onChange={handleClientChange} placeholder="Nombre fiscal" required value={clientDraft.Nombre} autoComplete="off" />
          <input name="Persona_contacto" onChange={handleClientChange} placeholder="Persona de contacto" value={clientDraft.Persona_contacto} autoComplete="off" />
          <input name="Email_contacto" onChange={handleClientChange} placeholder="Email contacto" type="email" value={clientDraft.Email_contacto} autoComplete="off" />
          <button type="submit">Crear cliente</button>
        </form>

        <form className="panel setup-card" onSubmit={handleProjectSubmit} autoComplete="off">
          <div className="section-title"><span>02</span><h2>Crear proyecto</h2></div>
          <input name="Codigo" onChange={handleProjectChange} placeholder="Nombre del proyecto" required value={projectDraft.Codigo} autoComplete="off" />
          <input name="Fecha_entrega" onChange={handleProjectChange} required type="date" value={projectDraft.Fecha_entrega} autoComplete="off" />
          
          <CustomDropdown
            label="Responsable:"
            placeholder="Responsable"
            value={projectDraft.Responsable}
            onChange={(val) => setProjectDraft(prev => ({ ...prev, Responsable: String(val) }))}
            options={usuarios.map(u => ({ id: u.id, label: u.nombre }))}
            disabled={!usuarios.length}
          />

          <CustomDropdown
            label="Colaboradores:"
            placeholder="Sin colaboradores"
            isMulti={true}
            value={projectDraft.Colaboradores}
            onChange={(ids) => setProjectDraft(prev => ({ ...prev, Colaboradores: ids }))}
            options={usuarios.map(u => ({ id: u.id, label: u.nombre }))}
            disabled={!usuarios.length}
          />

          <CustomDropdown
            label="Cliente:"
            placeholder="Cliente"
            value={projectDraft.Id_Cliente}
            onChange={(val) => setProjectDraft(prev => ({ ...prev, Id_Cliente: String(val) }))}
            options={clientes.map(c => ({ id: c.id, label: c.Nombre }))}
            disabled={!clientes.length}
          />

          <button disabled={!usuarios.length || !clientes.length} type="submit">Crear proyecto</button>
        </form>
      </div>

      <div className="panel setup-card" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <div className="section-title"><span>03</span><h2>Crear Usuario</h2></div>
        <form onSubmit={handleUserSubmit} autoComplete="off" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <label className="field">
            <span>Nombre de usuario</span>
            <input
              type="text"
              required
              value={userDraft.nombre}  
              onChange={(e) => setUserDraft({ ...userDraft, nombre: e.target.value })}
              placeholder="Ej. Pedro"
              autoComplete="off"
              style={{ padding: '8px' }}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={userDraft.email}
              onChange={(e) => setUserDraft({ ...userDraft, email: e.target.value })}
              placeholder="pedro@lxh.es"
              autoComplete="off"
              style={{ padding: '8px' }}
            />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              required
              value={userDraft.password}
              onChange={(e) => setUserDraft({ ...userDraft, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="new-password"
              style={{ padding: '8px' }}
            />
          </label>
          
          <CustomDropdown
            label="Rol"
            placeholder="Rol"
            value={userDraft.rol}
            onChange={(val) => setUserDraft(prev => ({ ...prev, rol: val, proyectoId: val === 'Colaborador' ? prev.proyectoId : '' }))}
            options={['Admin', 'Colaborador', 'Viewer'].map(r => ({ id: r, label: r }))}
          />

          {userDraft.rol === 'Colaborador' && (
            <label className="field">
              <span>Proyecto Asignado</span>
              <select
                value={userDraft.proyectoId}
                onChange={(e) => setUserDraft({ ...userDraft, proyectoId: e.target.value })}
                style={{ padding: '8px' }}
                required
              >
                <option value="">Selecciona proyecto</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.Codigo} - {p.proyecto || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>
            Registrar Usuario
          </button>
        </form>
      </div>

      {tarifas && (
        <div className="panel setup-card" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '20px' }}>
          <div className="section-title"><span>04</span><h2>Configuración de Costes Operativos y Margen</h2></div>
          <form onSubmit={handleTarifasSubmit} autoComplete="off">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', color: 'var(--color-text-primary)' }}>Coste de Mano de Obra</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Oficina (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.oficina} onChange={(e) => handleManoObraChange('oficina', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Programación (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.programacion} onChange={(e) => handleManoObraChange('programacion', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Mecanizado (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.mecanizado} onChange={(e) => handleManoObraChange('mecanizado', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Pegar/Lijar (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.prepost} onChange={(e) => handleManoObraChange('prepost', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Esculpir (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.esculpir} onChange={(e) => handleManoObraChange('esculpir', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Mano obra Line-X (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.linex} onChange={(e) => handleManoObraChange('linex', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Mano obra Fibra (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.fibra} onChange={(e) => handleManoObraChange('fibra', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Mano obra Mortero (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.mortero} onChange={(e) => handleManoObraChange('mortero', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Mano obra Pintura (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.pintura} onChange={(e) => handleManoObraChange('pintura', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Estructura (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.estructura} onChange={(e) => handleManoObraChange('estructura', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Entrega (€/h)</span>
                    <input type="number" step="0.01" value={tarifas.manoObra.entrega} onChange={(e) => handleManoObraChange('entrega', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', color: 'var(--color-text-primary)' }}>Margen de Venta</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Coeficiente (Z$1)</span>
                    <input type="number" step="0.01" min="0.01" max="1" value={tarifas.coeficientePVP} onChange={(e) => setTarifas(prev => ({ ...prev, coeficientePVP: Number(e.target.value) }))} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: '1.4', margin: '4px 0 0 0' }}>
                    Por defecto es 0.5. Al dividir el coste entre este coeficiente se calcula el PVP (ej. dividir por 0.5 multiplica el coste por 2).
                  </p>
                </div>
              </div>
            </div>
            <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>
              Guardar Tarifas y Margen
            </button>
          </form>
        </div>
      )}

      {/* Materials database catalog management */}
      <div className="panel setup-card" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <div className="section-title"><span>05</span><h2>Catálogo de Materiales (Base de Datos)</h2></div>
        
        {/* Create material form */}
        <form onSubmit={handleCreateMaterial} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px', padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: '6px', border: '1px solid var(--color-border-light)', alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Categoría</span>
            <select value={newMaterial.categoria} onChange={(e) => {
              const cat = e.target.value;
              setNewMaterial(prev => ({
                ...prev,
                categoria: cat,
                unidad: cat === 'porex' ? 'm3' : 'm2'
              }));
            }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
              <option value="porex">Porex</option>
              <option value="linex">Line-X</option>
              <option value="fibra">Fibra</option>
              <option value="pintura">Pintura</option>
              <option value="mortero">Mortero</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Nombre de la variedad</span>
            <input type="text" placeholder="Ej: Porex Gris EPS 20" required value={newMaterial.nombre} onChange={(e) => setNewMaterial(prev => ({ ...prev, nombre: e.target.value }))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Precio Coste (€)</span>
            <input type="number" step="0.01" min="0" placeholder="Ej: 90.00" required value={newMaterial.precio} onChange={(e) => setNewMaterial(prev => ({ ...prev, precio: e.target.value }))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Unidad</span>
            <input type="text" disabled value={newMaterial.unidad} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface-container-high)', color: 'var(--color-text-secondary)', textAlign: 'center' }} />
          </div>

          <button type="submit" style={{ padding: '10px 15px', fontWeight: 'bold', cursor: 'pointer' }}>Agregar Material</button>
        </form>

        {/* List of materials with edit/delete actions */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', background: 'var(--color-surface-container-low)' }}>
                <th style={{ padding: '10px' }}>Categoría</th>
                <th style={{ padding: '10px' }}>Variedad de Material</th>
                <th style={{ padding: '10px' }}>Precio Coste</th>
                <th style={{ padding: '10px' }}>Unidad</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarifasMateriales.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '10px', textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--color-primary)' }}>{m.categoria}</td>
                  <td style={{ padding: '10px' }}>
                    {editingMaterialId === m.id ? (
                      <input type="text" value={editMaterialDraft.nombre} onChange={(e) => setEditMaterialDraft(prev => ({ ...prev, nombre: e.target.value }))} style={{ padding: '6px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                    ) : (
                      m.nombre
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {editingMaterialId === m.id ? (
                      <input type="number" step="0.01" value={editMaterialDraft.precio} onChange={(e) => setEditMaterialDraft(prev => ({ ...prev, precio: e.target.value }))} style={{ padding: '6px', width: '100px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                    ) : (
                      money.format(m.precio)
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>{m.unidad}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {editingMaterialId === m.id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={handleSaveEditMaterial} style={{ padding: '6px 12px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
                        <button onClick={() => setEditingMaterialId(null)} style={{ padding: '6px 12px', background: 'var(--color-border)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => startEditMaterial(m)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleDeleteMaterial(m.id)} style={{ padding: '6px 12px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {tarifasMateriales.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No hay materiales registrados en el catálogo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}