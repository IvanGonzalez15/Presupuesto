import React, { useState } from 'react';

export default function Setup({
  clientes,
  usuarios,
  clientDraft,
  projectDraft,
  updateDraft,
  setClientDraft,
  setProjectDraft,
  createCliente,
  createProyecto,
  onUserCreate,
  statusMessage
}) {
  const [userDraft, setUserDraft] = useState({ nombre: '', email: '', password: '', rol: 'Admin' });

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (userDraft.nombre.trim() && userDraft.password.trim() && userDraft.rol) {
      onUserCreate(userDraft);
      setUserDraft({ nombre: '', email: '', password: '', rol: 'Admin' });
    }
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="setup-grid">
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
            <option value="">Responsable</option>
            {usuarios.map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}
          </select>
          <select disabled={!clientes.length} name="Id_Cliente" onChange={updateDraft(setProjectDraft)} required value={projectDraft.Id_Cliente}>
            <option value="">Cliente</option>
            {clientes.map((client) => <option key={client.id} value={client.id}>{client.Nombre}</option>)}
          </select>
          <button disabled={!usuarios.length || !clientes.length} type="submit">Crear proyecto</button>
        </form>
      </div>

      <div className="panel setup-card" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <div className="section-title"><span>03</span><h2>Crear Usuario (Bcrypt)</h2></div>
        <form onSubmit={handleUserSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <label className="field">
            <span>Nombre de usuario</span>
            <input
              type="text"
              required
              value={userDraft.nombre}
              onChange={(e) => setUserDraft({ ...userDraft, nombre: e.target.value })}
              placeholder="Ej. Pedro"
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
              style={{ padding: '8px' }}
            />
          </label>
          <label className="field">
            <span>Rol</span>
            <select
              value={userDraft.rol}
              onChange={(e) => setUserDraft({ ...userDraft, rol: e.target.value })}
              style={{ padding: '8px' }}
            >
              <option value="Admin">Admin</option>
              <option value="Colaborador">Colaborador</option>
              <option value="Viewer">Viewer</option>
            </select>
          </label>
          <button type="submit" style={{ padding: '10px', background: '#0f172a', color: 'white', border: 0, borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Registrar Usuario
          </button>
        </form>
      </div>
    </section>
  );
}
