import React from 'react';

export default function TabProyecto({
  selectedProject,
  total,
  totalManufacturingCost,
  money
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="project-excel-sheet-card" style={{ border: '2px solid var(--color-sheet-border)', borderRadius: '6px', overflow: 'hidden', background: 'var(--color-sheet-cell-bg)' }}>
        <div className="sheet-tab-header" style={{ padding: '10px 14px', background: 'var(--color-sheet-header-bg)', borderBottom: '2px solid var(--color-sheet-border)', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          PROYECTO METADATA (LECTURA)
        </div>
        <div className="sheet-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid var(--color-sheet-border)', borderBottom: '1px solid var(--color-sheet-border)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>CLIENTE</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{selectedProject.Cliente_Nombre || `ID: ${selectedProject.Id_Cliente}`}</strong>
          </div>
          <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid var(--color-sheet-border)', borderBottom: '1px solid var(--color-sheet-border)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>PROYECTO (NOMBRE)</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{selectedProject.proyecto || '—'}</strong>
          </div>
          <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid var(--color-sheet-border)', borderBottom: '1px solid var(--color-sheet-border)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>CÓDIGO (GENERICO)</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontFamily: 'monospace' }}>{selectedProject.Codigo}</strong>
          </div>
          <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid var(--color-sheet-border)', borderBottom: '1px solid var(--color-sheet-border)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>RESPONSABLE</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{selectedProject.Responsable_Nombre || `ID: ${selectedProject.Responsable}`}</strong>
          </div>
          <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid var(--color-sheet-border)', borderBottom: '1px solid var(--color-sheet-border)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>COLABORADORES</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{selectedProject.Colaboradores_Nombre || 'Ninguno'}</strong>
          </div>
          <div className="sheet-cell" style={{ padding: '12px', borderBottom: '1px solid var(--color-sheet-border)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>FECHA ENTREGA</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{selectedProject.Fecha_entrega ? new Date(selectedProject.Fecha_entrega).toLocaleDateString('es-ES') : '—'}</strong>
          </div>
        </div>
      </div>

      {/* Tarjetas Resumen de Costes del Proyecto */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--color-surface-container)', padding: '20px', borderRadius: '6px', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Precio Venta Total</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)', margin: '4px 0 0 0', fontWeight: '800' }}>
            {money.format(total)}
          </h3>
        </div>
        <div style={{ background: 'var(--color-surface-container)', padding: '20px', borderRadius: '6px', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Coste Fabricación Estimado</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', margin: '4px 0 0 0', fontWeight: '800' }}>
            {money.format(totalManufacturingCost)}
          </h3>
        </div>
        <div style={{ background: 'var(--color-surface-container)', padding: '20px', borderRadius: '6px', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Margen Industrial Estimado</span>
          <h3 style={{ fontSize: '1.8rem', color: (total - totalManufacturingCost) >= 0 ? 'var(--color-success)' : 'var(--color-danger)', margin: '4px 0 0 0', fontWeight: '800' }}>
            {money.format(total - totalManufacturingCost)}
          </h3>
        </div>
      </div>
    </div>
  );
}
