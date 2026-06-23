import React, { useState } from 'react';

const today = new Date().toISOString().slice(0, 10);
const initialClient = { Nombre: '', Persona_contacto: '', Email_contacto: '', Numero_contacto: '' };
const initialProject = { Codigo: '', Fecha_entrega: today, Colaboradores: '', Responsable: '', Id_Cliente: '' };

export default function Setup({
  clientes,
  usuarios,
  proyectos = [],
  createCliente,
  createProyecto,
  onUserCreate,
  statusMessage
}) {
  const [clientDraft, setClientDraft] = useState(initialClient);
  const [projectDraft, setProjectDraft] = useState(initialProject);
  const [userDraft, setUserDraft] = useState({ nombre: '', email: '', password: '', rol: 'Admin', proyectoId: '' });

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
        alert('Por favor, selecciona un proyecto para el colaborador.');
        return;
      }
      onUserCreate(userDraft);
      setUserDraft({ nombre: '', email: '', password: '', rol: 'Admin', proyectoId: '' });
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
          <select disabled={!usuarios.length} name="Responsable" onChange={handleProjectChange} required value={projectDraft.Responsable}>
            <option value="">Responsable</option>
            {usuarios.map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}
          </select>
          <select disabled={!clientes.length} name="Id_Cliente" onChange={handleProjectChange} required value={projectDraft.Id_Cliente}>
            <option value="">Cliente</option>
            {clientes.map((client) => <option key={client.id} value={client.id}>{client.Nombre}</option>)}
          </select>
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
          <label className="field">
            <span>Rol</span>
            <select
              value={userDraft.rol}
              onChange={(e) => setUserDraft({ ...userDraft, rol: e.target.value, proyectoId: e.target.value === 'Colaborador' ? userDraft.proyectoId : '' })}
              style={{ padding: '8px' }}
            >
              <option value="Admin">Admin</option>
              <option value="Colaborador">Colaborador</option>
              <option value="Viewer">Viewer</option>
            </select>
          </label>
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
    </section>
  );
}
