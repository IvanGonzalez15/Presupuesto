import React from 'react';

export default function Sidebar({
  currentUser,
  isAdmin,
  theme,
  toggleTheme,
  handleLogout,
  activeTab,
  setActiveTab
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>GESTOR LXH</h2>
      </div>
      
      <div className="user-profile-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-sidebar-text-secondary)' }}>Usuario Conectado</span>
          <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-sidebar-text)', marginTop: '2px' }}>{currentUser?.nombre}</strong>
        </div>
        <span className={`user-badge ${isAdmin ? 'admin' : 'viewer'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
          {currentUser?.rol}
        </span>
        
        <button 
          onClick={toggleTheme} 
          type="button"
          style={{
            marginTop: '4px',
            padding: '6px 12px',
            background: 'var(--color-surface-bright)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          {theme === 'light' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              Modo Oscuro
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              Modo Claro
            </>
          )}
        </button>

        <button onClick={handleLogout} className="logout-btn" style={{
          marginTop: '4px',
          padding: '6px 12px',
          background: 'var(--color-surface-bright)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          transition: 'all 0.15s ease'
        }}>
          Cerrar Sesión
        </button>
      </div>

      <nav className="sidebar-nav">
        <button className={activeTab === 'presupuestos' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('presupuestos')} type="button">
          Presupuestos
        </button>
        <button className={activeTab === 'materiales' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('materiales')} type="button">
          Base de Materiales
        </button>
        {isAdmin && (
          <button className={activeTab === 'registro' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('registro')} type="button">
            Clientes y Setup
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">Sincronizado</div>
      </div>
    </aside>
  );
}
