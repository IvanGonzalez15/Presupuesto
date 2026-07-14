import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';
import { tarifaService, tarifaMaterialService, companyService, templateOptionsService } from '../services/api';

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
  setTarifasMateriales,
  companies = [],
  setCompanies,
  templateOptions,
  setTemplateOptions
}) {
  const [clientDraft, setClientDraft] = useState(initialClient);
  const [projectDraft, setProjectDraft] = useState(initialProject);
  const [userDraft, setUserDraft] = useState({ nombre: '', email: '', password: '', rol: 'Admin', proyectoId: '' });
  const [tarifas, setTarifas] = useState(null);

  // Material CRUD states
  const [newMaterial, setNewMaterial] = useState({ categoria: 'porex', nombre: '', precio: '', unidad: 'm3' });
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editMaterialDraft, setEditMaterialDraft] = useState({ categoria: '', nombre: '', precio: '', unidad: '' });

  // Company & IBAN states
  const [localCompanies, setLocalCompanies] = useState([]);
  const [selectedCompIdx, setSelectedCompIdx] = useState(0);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newIban, setNewIban] = useState('');

  // Template options states
  const [optionsDraft, setOptionsDraft] = useState(null);
  const [activeOptTab, setActiveOptTab] = useState('noIncluido');
  const [optInput, setOptInput] = useState('');
  const [selectedImpIdx, setSelectedImpIdx] = useState(0);
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    tarifaService.get()
      .then(res => setTarifas(res.data))
      .catch(err => setStatus(`Error al cargar tarifas: ${err.message}`));
  }, []);

  // Sync props to local states
  useEffect(() => {
    if (companies && companies.length > 0) {
      setLocalCompanies(JSON.parse(JSON.stringify(companies)));
    }
  }, [companies]);

  useEffect(() => {
    if (templateOptions) {
      setOptionsDraft(JSON.parse(JSON.stringify(templateOptions)));
    }
  }, [templateOptions]);

  const currentCompany = localCompanies[selectedCompIdx] || null;

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

  // Company and IBAN handlers
  const updateCompanyField = (field, val) => {
    setLocalCompanies(prev => prev.map((comp, idx) => idx === selectedCompIdx ? { ...comp, [field]: val } : comp));
  };

  const handleCreateCompany = () => {
    if (!newCompanyName.trim()) return;
    if (localCompanies.some(c => c.nombre.toLowerCase() === newCompanyName.trim().toLowerCase())) {
      setStatus('Ya existe una empresa con ese nombre.');
      return;
    }
    const newId = newCompanyName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newComp = {
      id: newId || `empresa-${Date.now()}`,
      nombre: newCompanyName.trim(),
      nif: '',
      direccion1: '',
      direccion2: '',
      telefono: '',
      email: '',
      web: '',
      ibans: []
    };
    setLocalCompanies(prev => {
      const nextList = [...prev, newComp];
      setSelectedCompIdx(nextList.length - 1);
      return nextList;
    });
    setNewCompanyName('');
    setStatus(`Empresa "${newComp.nombre}" agregada temporalmente. Completa sus datos y haz clic en Guardar.`);
  };

  const handleDeleteCompany = () => {
    if (localCompanies.length <= 1) {
      setStatus('Debe haber al menos una empresa registrada.');
      return;
    }
    const compToDelete = localCompanies[selectedCompIdx];
    if (!window.confirm(`⚠️ ¿Estás seguro de que deseas eliminar la empresa "${compToDelete.nombre}"?`)) return;
    setLocalCompanies(prev => {
      const nextList = prev.filter((_, idx) => idx !== selectedCompIdx);
      setSelectedCompIdx(0);
      return nextList;
    });
    setStatus(`Empresa "${compToDelete.nombre}" eliminada temporalmente. Haz clic en Guardar para persistir.`);
  };

  const handleAddIban = () => {
    if (!newIban.trim()) return;
    setLocalCompanies(prev => prev.map((comp, idx) => {
      if (idx === selectedCompIdx) {
        const ibans = [...(comp.ibans || []), newIban.trim()];
        return { ...comp, ibans };
      }
      return comp;
    }));
    setNewIban('');
  };

  const handleRemoveIban = (indexToRemove) => {
    setLocalCompanies(prev => prev.map((comp, idx) => {
      if (idx === selectedCompIdx) {
        const ibans = (comp.ibans || []).filter((_, i) => i !== indexToRemove);
        return { ...comp, ibans };
      }
      return comp;
    }));
  };

  const handleSaveCompanies = async () => {
    try {
      const { data } = await companyService.updateAll(localCompanies);
      setCompanies(data);
      setStatus('Datos de empresas y cuentas bancarias guardados con éxito.');
      if (onTarifasUpdated) {
        await onTarifasUpdated();
      }
    } catch (err) {
      setStatus(`Error al guardar empresas: ${err.response?.data?.message || err.message}`);
    }
  };

  // Template options handlers
  const handleAddSimpleOpt = () => {
    if (!optInput.trim()) return;
    setOptionsDraft(prev => ({
      ...prev,
      [activeOptTab]: [...prev[activeOptTab], optInput.trim()]
    }));
    setOptInput('');
  };

  const handleRemoveSimpleOpt = (indexToRemove) => {
    setOptionsDraft(prev => ({
      ...prev,
      [activeOptTab]: prev[activeOptTab].filter((_, i) => i !== indexToRemove)
    }));
  };

  const handleAddImpGroup = () => {
    setOptionsDraft(prev => {
      const nuevoGrupo = [];
      const importante = [...prev.importante, nuevoGrupo];
      setSelectedImpIdx(importante.length - 1);
      return { ...prev, importante };
    });
  };

  const handleRemoveImpGroup = () => {
    if (optionsDraft.importante.length <= 1) return;
    setOptionsDraft(prev => {
      const importante = prev.importante.filter((_, i) => i !== selectedImpIdx);
      setSelectedImpIdx(0);
      return { ...prev, importante };
    });
  };

  const handleAddImpNote = () => {
    if (!noteInput.trim()) return;
    setOptionsDraft(prev => {
      const importante = prev.importante.map((group, idx) => {
        if (idx === selectedImpIdx) {
          return [...group, noteInput.trim()];
        }
        return group;
      });
      return { ...prev, importante };
    });
    setNoteInput('');
  };

  const handleRemoveImpNote = (indexToRemove) => {
    setOptionsDraft(prev => {
      const importante = prev.importante.map((group, idx) => {
        if (idx === selectedImpIdx) {
          return group.filter((_, i) => i !== indexToRemove);
        }
        return group;
      });
      return { ...prev, importante };
    });
  };

  const handleSaveTemplateOptions = async () => {
    try {
      const { data } = await templateOptionsService.update(optionsDraft);
      setTemplateOptions(data);
      setStatus('Condiciones y cláusulas del PDF guardadas con éxito.');
      if (onTarifasUpdated) {
        await onTarifasUpdated();
      }
    } catch (err) {
      setStatus(`Error al guardar opciones de plantilla: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="setup-grid">
        <form className="panel setup-card" onSubmit={handleClientSubmit} autoComplete="off">
          <div className="section-title"><h2>Crear cliente</h2></div>
          <input name="Nombre" onChange={handleClientChange} placeholder="Nombre fiscal" required value={clientDraft.Nombre} autoComplete="off" />
          <input name="Persona_contacto" onChange={handleClientChange} placeholder="Persona de contacto" value={clientDraft.Persona_contacto} autoComplete="off" />
          <input name="Email_contacto" onChange={handleClientChange} placeholder="Email contacto" type="email" value={clientDraft.Email_contacto} autoComplete="off" />
          <button type="submit">Crear cliente</button>
        </form>

        <form className="panel setup-card" onSubmit={handleProjectSubmit} autoComplete="off">
          <div className="section-title"><h2>Crear proyecto</h2></div>
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



      {tarifas && (
        <div className="panel setup-card" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '24px' }}>
          <div className="section-title"><h2>Costes Operativos y Margen Comercial</h2></div>
          <form onSubmit={handleTarifasSubmit} autoComplete="off">
            <h3 style={{ fontSize: '1rem', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', color: 'var(--color-text-primary)' }}>
              Tarifas por hora de los departamentos y procesos
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { name: 'Oficina', key: 'oficina' },
                { name: 'Programación', key: 'programacion' },
                { name: 'Mecanizado', key: 'mecanizado' },
                { name: 'Pegar / Lijar', key: 'prepost' },
                { name: 'Esculpir', key: 'esculpir' },
                { name: 'Mano obra Line-X', key: 'linex' },
                { name: 'Mano obra Fibra', key: 'fibra' },
                { name: 'Mano obra Mortero', key: 'mortero' },
                { name: 'Mano obra Pintura', key: 'pintura' },
                { name: 'Estructura', key: 'estructura' },
                { name: 'Entrega / Embalaje', key: 'entrega' }
              ].map((proc) => (
                <div key={proc.key} style={{ background: 'var(--color-surface-container-low)', padding: '12px 14px', border: '1px solid var(--color-border-light)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    {proc.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      step="0.01"
                      value={tarifas.manoObra[proc.key] || ''}
                      onChange={(e) => handleManoObraChange(proc.key, e.target.value)}
                      style={{ padding: '6px 8px', width: '100%', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', fontSize: '0.9rem', textAlign: 'right', fontWeight: 'bold' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>€/h</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', maxWidth: '600px' }}>
                <div style={{ minWidth: '160px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Margen de Venta (Coeficiente Z$1)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="1"
                      value={tarifas.coeficientePVP || ''}
                      onChange={(e) => setTarifas(prev => ({ ...prev, coeficientePVP: Number(e.target.value) }))}
                      style={{ padding: '6px 8px', width: '100px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                </div>

              </div>

              <button type="submit" style={{ padding: '12px 24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', borderRadius: '4px', background: 'var(--color-primary)', color: 'white', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                Guardar Tarifas y Margen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials database catalog management */}
      <div className="panel setup-card" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <div className="section-title"><h2>Catálogo de Materiales (Base de Datos)</h2></div>
        <form onSubmit={handleCreateMaterial} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px', padding: '16px', background: 'var(--color-surface-container-low)', borderRadius: '6px', border: '1px solid var(--color-border-light)', alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <CustomDropdown
              label="Categoría"
              placeholder="Seleccionar..."
              value={newMaterial.categoria}
              onChange={(val) => {
                setNewMaterial(prev => ({ ...prev, categoria: val, unidad: val === 'porex' ? 'm3' : 'm2' }));
              }}
              options={[
                { id: 'porex', label: 'Porex' },
                { id: 'linex', label: 'Line-X' },
                { id: 'fibra', label: 'Fibra' },
                { id: 'pintura', label: 'Pintura' },
                { id: 'mortero', label: 'Mortero' }
              ]}
            />
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
                        <button onClick={() => handleDeleteMaterial(m.id)} style={{ padding: '6px 12px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
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

      {/* Section 06: Companies & IBANs */}
      <div className="panel setup-card" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '24px' }}>
        <div className="section-title"><h2>Gestión de Empresas Emisoras e IBANs</h2></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'var(--color-surface-container-low)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Alta de nueva empresa */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px', marginBottom: '4px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Nombre Nueva Empresa</span>
                <input
                  type="text"
                  placeholder="Ej: Nueva Empresa SL"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', width: '100%', fontSize: '0.85rem' }}
                />
              </div>
              <button type="button" onClick={handleCreateCompany} style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', height: '36px' }}>+ Crear</button>
            </div>

            <div>
              <CustomDropdown
                label="Seleccionar Empresa"
                placeholder="Empresa Emisora"
                value={selectedCompIdx}
                onChange={(val) => setSelectedCompIdx(Number(val))}
                options={localCompanies.map((comp, idx) => ({ id: idx, label: comp.nombre }))}
              />
            </div>

            {currentCompany && (
              <div style={{ display: 'grid', gap: '10px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Nombre Fiscal</span>
                  <input type="text" value={currentCompany.nombre || ''} onChange={(e) => updateCompanyField('nombre', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>NIF / CIF</span>
                  <input type="text" value={currentCompany.nif || ''} onChange={(e) => updateCompanyField('nif', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Dirección 1 (Calle, número)</span>
                  <input type="text" value={currentCompany.direccion1 || ''} onChange={(e) => updateCompanyField('direccion1', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Dirección 2 (Población, Provincia)</span>
                  <input type="text" value={currentCompany.direccion2 || ''} onChange={(e) => updateCompanyField('direccion2', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Teléfono</span>
                    <input type="text" value={currentCompany.telefono || ''} onChange={(e) => updateCompanyField('telefono', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Email</span>
                    <input type="text" value={currentCompany.email || ''} onChange={(e) => updateCompanyField('email', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Web corporativa</span>
                  <input type="text" value={currentCompany.web || ''} onChange={(e) => updateCompanyField('web', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                </label>
              </div>
            )}
          </div>

          <div style={{ background: 'var(--color-surface-container-low)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Cuentas Bancarias Vinculadas</span>
            
            {currentCompany && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="ESXX 0000 0000 0000 0000 0000"
                    value={newIban}
                    onChange={(e) => setNewIban(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                  <button type="button" onClick={handleAddIban} style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>Agregar</button>
                </div>

                <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {(currentCompany.ibans || []).map((iban, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      <span>{iban}</span>
                      <button type="button" onClick={() => handleRemoveIban(i)} style={{ padding: '2px 8px', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Quitar</button>
                    </li>
                  ))}
                  {(!currentCompany.ibans || currentCompany.ibans.length === 0) && (
                    <li style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>Sin cuentas bancarias registradas.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentCompany && (
            <button 
              type="button" 
              onClick={handleDeleteCompany} 
              style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '4px' }}
            >
              Eliminar Empresa Seleccionada
            </button>
          )}
          <button onClick={handleSaveCompanies} style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px' }}>
            Guardar Cambios de Empresas e IBANs
          </button>
        </div>
      </div>

      {/* Section 07: Template Options / PDF clauses */}
      {optionsDraft && (
        <div className="panel setup-card" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '24px' }}>
          <div className="section-title"><h2>Cláusulas y Condiciones del Presupuesto (PDF)</h2></div>
          
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '16px', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['noIncluido', 'formaPago', 'importante', 'descripcion'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveOptTab(tab)}
                style={{
                  padding: '8px 16px',
                  background: activeOptTab === tab ? 'var(--color-surface-container-high)' : 'transparent',
                  border: 'none',
                  borderBottom: activeOptTab === tab ? '2px solid var(--color-primary)' : 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  color: activeOptTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab === 'noIncluido' && 'No Incluido'}
                {tab === 'formaPago' && 'Formas de Pago'}
                {tab === 'importante' && 'Notas "Importante"'}
                {tab === 'descripcion' && 'Descripciones / LOPD'}
              </button>
            ))}
          </div>

          <div style={{ background: 'var(--color-surface-container-low)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}>
            
            {/* Simple list editor for: noIncluido, formaPago, descripcion */}
            {activeOptTab !== 'importante' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <textarea
                    placeholder="Introduce el texto aquí..."
                    value={optInput}
                    onChange={(e) => setOptInput(e.target.value)}
                    rows={3}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', flex: 1, resize: 'vertical', fontSize: '0.85rem' }}
                  />
                  <button type="button" onClick={handleAddSimpleOpt} style={{ padding: '8px 16px', cursor: 'pointer', alignSelf: 'flex-end', fontWeight: 'bold' }}>Añadir Opción</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {optionsDraft[activeOptTab].map((text, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--color-surface)', padding: '12px', borderRadius: '4px', border: '1px solid var(--color-border-light)' }}>
                      <span style={{ fontSize: '0.85rem', flex: 1, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{text}</span>
                      <button type="button" onClick={() => handleRemoveSimpleOpt(idx)} style={{ padding: '4px 8px', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Quitar</button>
                    </div>
                  ))}
                  {optionsDraft[activeOptTab].length === 0 && (
                    <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.85rem', textAlign: 'center', margin: '20px 0' }}>No hay opciones registradas.</p>
                  )}
                </div>
              </div>
            )}

            {/* Special structure editor for: importante (array of arrays of strings) */}
            {activeOptTab === 'importante' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px', width: '100%' }}>
                  <div style={{ minWidth: '220px' }}>
                    <CustomDropdown
                      label="Seleccionar Grupo de Notas"
                      placeholder="Seleccionar..."
                      value={selectedImpIdx}
                      onChange={(val) => {
                        setSelectedImpIdx(Number(val));
                        setNoteInput('');
                      }}
                      options={optionsDraft.importante.map((_, i) => ({ id: i, label: `Grupo de Viñetas ${i + 1}` }))}
                    />
                  </div>
                  <button type="button" onClick={handleAddImpGroup} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', alignSelf: 'flex-end', height: '42px', marginTop: '18px' }}>+ Crear Nuevo Grupo</button>
                  {optionsDraft.importante.length > 1 && (
                    <button type="button" onClick={handleRemoveImpGroup} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', background: 'transparent', borderRadius: '4px', fontWeight: 'bold', alignSelf: 'flex-end', height: '42px', marginTop: '18px' }}>Eliminar Grupo Actual</button>
                  )}
                </div>

                {optionsDraft.importante[selectedImpIdx] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Añadir punto de viñeta a este grupo:</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Ej. La fabricación se iniciará a partir de recibir el primer pago."
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', flex: 1 }}
                      />
                      <button type="button" onClick={handleAddImpNote} style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>Añadir</button>
                    </div>

                    <ul style={{ padding: 0, margin: '15px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none' }}>
                      {optionsDraft.importante[selectedImpIdx].map((note, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border-light)', fontSize: '0.85rem', gap: '15px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>•</span>
                            <span>{note}</span>
                          </div>
                          <button type="button" onClick={() => handleRemoveImpNote(idx)} style={{ padding: '2px 8px', background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Quitar</button>
                        </li>
                      ))}
                      {optionsDraft.importante[selectedImpIdx].length === 0 && (
                        <li style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'center', padding: '15px 0' }}>Este grupo de viñetas no tiene notas agregadas aún.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button onClick={handleSaveTemplateOptions} style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px' }}>
              Guardar Cambios de Cláusulas y Condiciones
            </button>
          </div>
        </div>
      )}

      <div className="panel setup-card" style={{ width: '100%', padding: '24px', boxSizing: 'border-box', marginTop: '20px' }}>
        <div className="section-title"><h2>Crear Usuario</h2></div>
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
          
          <label className="field">
            <span>Rol</span>
            <CustomDropdown
              placeholder="Rol"
              value={userDraft.rol}
              onChange={(val) => setUserDraft(prev => ({ ...prev, rol: val, proyectoId: val === 'Colaborador' ? prev.proyectoId : '' }))}
              options={['Admin', 'Colaborador', 'Viewer'].map(r => ({ id: r, label: r }))}
            />
          </label>

          {userDraft.rol === 'Colaborador' && (
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="field">
                <span>Proyecto Asignado</span>
                <CustomDropdown
                  placeholder="Selecciona proyecto"
                  value={userDraft.proyectoId}
                  onChange={(val) => setUserDraft({ ...userDraft, proyectoId: val })}
                  options={proyectos.map(p => ({ id: p.id, label: `${p.Codigo} - ${p.proyecto || 'Sin nombre'}` }))}
                />
              </label>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', opacity: 0 }}>&nbsp;</span>
            <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', height: '38px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Registrar Usuario
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}