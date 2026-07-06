import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';
import { tarifaService } from '../services/api';

const today = new Date().toISOString().slice(0, 10);
const initialClient = { Nombre: '', Persona_contacto: '', Email_contacto: '', Numero_contacto: '' };
const initialProject = { Codigo: '', Fecha_entrega: today, Colaboradores: [], Responsable: '', Id_Cliente: '' };

export default function Setup({
  clientes,
  usuarios,
  proyectos = [],
  createCliente,
  createProyecto,
  onUserCreate,
  statusMessage,
  setStatus,
  onTarifasUpdated
}) {
  const [clientDraft, setClientDraft] = useState(initialClient);
  const [projectDraft, setProjectDraft] = useState(initialProject);
  const [userDraft, setUserDraft] = useState({ nombre: '', email: '', password: '', rol: 'Admin', proyectoId: '' });
  const [tarifas, setTarifas] = useState(null);

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

  const handleMaterialesChange = (field, val) => {
    setTarifas(prev => ({
      ...prev,
      materiales: {
        ...prev.materiales,
        [field]: Number(val)
      }
    }));
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
        <div className="section-title"><span>03</span><h2>Crear Usuario (Bcrypt)</h2></div>
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
          <div className="section-title"><span>04</span><h2>Tarifas y Costes Base</h2></div>
          <form onSubmit={handleTarifasSubmit} autoComplete="off">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', color: 'var(--color-text-primary)' }}>Coste Materiales</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Porex (€/m³)</span>
                    <input type="number" step="0.01" value={tarifas.materiales.porex} onChange={(e) => handleMaterialesChange('porex', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Line-X (€/m²)</span>
                    <input type="number" step="0.01" value={tarifas.materiales.linex} onChange={(e) => handleMaterialesChange('linex', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Fibra (€/m²)</span>
                    <input type="number" step="0.01" value={tarifas.materiales.fibra} onChange={(e) => handleMaterialesChange('fibra', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Pintura (€/m²)</span>
                    <input type="number" step="0.01" value={tarifas.materiales.pintura} onChange={(e) => handleMaterialesChange('pintura', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                  <label className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Mortero (€/m²)</span>
                    <input type="number" step="0.01" value={tarifas.materiales.mortero} onChange={(e) => handleMaterialesChange('mortero', e.target.value)} style={{ padding: '6px', width: '120px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} />
                  </label>
                </div>
              </div>

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
              Guardar Tarifas y Costes
            </button>
          </form>
        </div>
      )}
    </section>
  );
}