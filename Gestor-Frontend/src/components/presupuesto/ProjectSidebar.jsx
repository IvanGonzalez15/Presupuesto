import React from 'react';
import CustomClientSelect from './CustomClientSelect';

export default function ProjectSidebar({
  proyectos,
  selectedProjectId,
  setSelectedProjectId,
  deleteProject,
  money,
  isAdmin,
  selectedClientIdFilter,
  setSelectedClientIdFilter,
  clientes
}) {
  return (
    <aside className="panel project-list">
      <div className="section-title"><span>04</span><h2>Proyectos</h2></div>
      
      {/* Selector de Cliente para ADMIN en la barra lateral superior de proyectos */}
      {isAdmin && (
        <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-surface-container-low)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Filtrar por Cliente:</label>
          <CustomClientSelect
            value={selectedClientIdFilter}
            onChange={setSelectedClientIdFilter}
            clientes={clientes}
          />
        </div>
      )}

      <div className="projects-container">
        {proyectos.map((project) => (
          <div className={project.id === Number(selectedProjectId) ? 'project-item-wrapper active' : 'project-item-wrapper'} key={project.id}>
            <button className="project-card" onClick={() => setSelectedProjectId(String(project.id))} type="button">
              <strong>{project.Codigo}</strong>
              <small>{project.proyecto || 'Sin nombre'}</small>
              <small style={{ color: 'var(--color-text-secondary)' }}>{project.Cliente_Nombre || `Cliente #${project.Id_Cliente}`}</small>
              <span>{money.format(Number(project.Total || 0))}</span>
            </button>
            {isAdmin && (
              <button className="project-delete-btn" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }} title="Eliminar proyecto" type="button">
                Eliminar
              </button>
            )}
          </div>
        ))}
      </div>
      {!proyectos.length && <p className="empty-state">No hay proyectos para mostrar.</p>}
    </aside>
  );
}
