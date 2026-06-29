import React, { useState, useEffect, useRef } from 'react';

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
  statusMessage
}) {
  const [clientDraft, setClientDraft] = useState(initialClient);
  const [projectDraft, setProjectDraft] = useState(initialProject);
  const [userDraft, setUserDraft] = useState({ nombre: '', email: '', password: '', rol: 'Admin', proyectoId: '' });

  const [isCollabDropdownOpen, setIsCollabDropdownOpen] = useState(false);
  const [isRespDropdownOpen, setIsRespDropdownOpen] = useState(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const collabRef = useRef(null);
  const respRef = useRef(null);
  const clientRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (collabRef.current && !collabRef.current.contains(event.target)) {
        setIsCollabDropdownOpen(false);
      }
      if (respRef.current && !respRef.current.contains(event.target)) {
        setIsRespDropdownOpen(false);
      }
      if (clientRef.current && !clientRef.current.contains(event.target)) {
        setIsClientDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleCollaboratorCheckboxChange = (userId, checked) => {
    setProjectDraft((prev) => {
      const currentList = prev.Colaboradores || [];
      const updatedList = checked
        ? [...currentList, userId]
        : currentList.filter((id) => id !== userId);
      return { ...prev, Colaboradores: updatedList };
    });
  };

  const handleClientSubmit = (e) => {
    e.preventDefault();
    createCliente(clientDraft);
    setClientDraft(initialClient);
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (!projectDraft.Responsable) {
      alert('Por favor, selecciona un responsable para el proyecto.');
      return;
    }
    if (!projectDraft.Id_Cliente) {
      alert('Por favor, selecciona un cliente para el proyecto.');
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
          
          <div className="collaborators-selector-container" ref={respRef} style={{ position: 'relative' }}>
            <span className="collaborators-title">Responsable:</span>
            
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (usuarios.length) setIsRespDropdownOpen(!isRespDropdownOpen);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (usuarios.length) setIsRespDropdownOpen(!isRespDropdownOpen);
                }
              }}
              className="multiselect-toggle-btn"
              style={{
                width: '100%',
                height: '42px',
                textAlign: 'left',
                padding: '10px 14px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--rounded-lg)',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: projectDraft.Responsable ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                cursor: usuarios.length ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                outline: 'none',
                opacity: usuarios.length ? 1 : 0.6,
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '90%' }}>
                {projectDraft.Responsable
                  ? usuarios.find(u => u.id === Number(projectDraft.Responsable))?.nombre
                  : 'Responsable'}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isRespDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: 'var(--color-text-secondary)',
                  flexShrink: 0
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {isRespDropdownOpen && (
              <div
                className="collaborators-list-box"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 100,
                  marginTop: '4px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
                  background: 'var(--color-surface-container-high)',
                  border: '2px solid var(--color-border)'
                }}
              >
                {usuarios.map((user) => {
                  const isSelected = Number(projectDraft.Responsable) === user.id;
                  return (
                    <div
                      key={user.id}
                      className={`collaborator-label ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setProjectDraft((prev) => ({ ...prev, Responsable: String(user.id) }));
                        setIsRespDropdownOpen(false);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>{user.nombre}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="collaborators-selector-container" ref={collabRef} style={{ position: 'relative' }}>
            <span className="collaborators-title">Colaboradores:</span>
            
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsCollabDropdownOpen(!isCollabDropdownOpen)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsCollabDropdownOpen(!isCollabDropdownOpen); } }}
              className="multiselect-toggle-btn"
              style={{
                width: '100%',
                height: '42px',
                textAlign: 'left',
                padding: '10px 14px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--rounded-lg)',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '90%' }}>
                {projectDraft.Colaboradores && projectDraft.Colaboradores.length > 0
                  ? projectDraft.Colaboradores.map(id => usuarios.find(u => u.id === id)?.nombre).filter(Boolean).join(', ')
                  : 'Sin colaboradores'}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isCollabDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: 'var(--color-text-secondary)',
                  flexShrink: 0
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {isCollabDropdownOpen && (
              <div
                className="collaborators-list-box"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 100,
                  marginTop: '4px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
                  background: 'var(--color-surface-container-high)',
                  border: '2px solid var(--color-border)'
                }}
              >
                {usuarios.map((user) => {
                  const isSelected = (projectDraft.Colaboradores || []).includes(user.id);
                  return (
                    <label key={user.id} className={`collaborator-label ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleCollaboratorCheckboxChange(user.id, e.target.checked)}
                        className="collaborator-checkbox"
                      />
                      <span>{user.nombre}</span>
                    </label>
                  );
                })}
                {!usuarios.length && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>No hay usuarios registrados</span>}
              </div>
            )}
          </div>

          <div className="collaborators-selector-container" ref={clientRef} style={{ position: 'relative' }}>
            <span className="collaborators-title">Cliente:</span>
            
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (clientes.length) setIsClientDropdownOpen(!isClientDropdownOpen);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (clientes.length) setIsClientDropdownOpen(!isClientDropdownOpen);
                }
              }}
              className="multiselect-toggle-btn"
              style={{
                width: '100%',
                height: '42px',
                textAlign: 'left',
                padding: '10px 14px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--rounded-lg)',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: projectDraft.Id_Cliente ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                outline: 'none',
                opacity: clientes.length ? 1 : 0.6,
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '90%' }}>
                {projectDraft.Id_Cliente
                  ? clientes.find(c => c.id === Number(projectDraft.Id_Cliente))?.Nombre
                  : 'Cliente'}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isClientDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: 'var(--color-text-secondary)',
                  flexShrink: 0
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {isClientDropdownOpen && (
              <div
                className="collaborators-list-box"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 100,
                  marginTop: '4px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
                  background: 'var(--color-surface-container-high)',
                  border: '2px solid var(--color-border)'
                }}
              >
                {clientes.map((client) => {
                  const isSelected = Number(projectDraft.Id_Cliente) === client.id;
                  return (
                    <div
                      key={client.id}
                      className={`collaborator-label ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setProjectDraft((prev) => ({ ...prev, Id_Cliente: String(client.id) }));
                        setIsClientDropdownOpen(false);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>{client.Nombre}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
          <div className="field" ref={roleRef} style={{ position: 'relative' }}>
            <span>Rol</span>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsRoleDropdownOpen(!isRoleDropdownOpen);
                }
              }}
              className="multiselect-toggle-btn"
              style={{
                width: '100%',
                height: '38px',
                textAlign: 'left',
                padding: '8px 12px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--rounded-lg)',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '90%' }}>
                {userDraft.rol}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isRoleDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: 'var(--color-text-secondary)',
                  flexShrink: 0
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {isRoleDropdownOpen && (
              <div
                className="collaborators-list-box"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 100,
                  marginTop: '4px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
                  background: 'var(--color-surface-container-high)',
                  border: '2px solid var(--color-border)'
                }}
              >
                {['Admin', 'Colaborador', 'Viewer'].map((r) => {
                  const isSelected = userDraft.rol === r;
                  return (
                    <div
                      key={r}
                      className={`collaborator-label ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setUserDraft((prev) => ({ ...prev, rol: r, proyectoId: r === 'Colaborador' ? prev.proyectoId : '' }));
                        setIsRoleDropdownOpen(false);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>{r}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
