import React, { useState, useEffect } from 'react';
import { getPhotoUrl, parseElementExtraData } from '../../utils/elementHelpers';

export default function TabListadoMedidas({
  isViewer,
  projectItems,
  updateElementMeasureValue
}) {
  const [selectedItemId, setSelectedItemId] = useState(null);

  
  useEffect(() => {
    if (projectItems.length > 0 && !selectedItemId) {
      setSelectedItemId(projectItems[0].id);
    }
  }, [projectItems, selectedItemId]);

  const activeItem = projectItems.find(item => item.id === selectedItemId) || projectItems[0];
  const activeExtra = activeItem ? parseElementExtraData(activeItem) : null;

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    fontSize: '0.85rem',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
      
      {}
      <div className="info-alert" style={{ background: 'var(--color-info-bg)', borderLeft: '4px solid var(--color-info-border)', padding: '12px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--color-info-text)' }}>
        Escribe directamente los resultados de Superficie (m²) y Volumen (m³) para cada pieza en este listado de medidas.
      </div>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: '0', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Piezas del Presupuesto</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '720px', overflowY: 'auto', paddingRight: '4px' }}>
            {projectItems.map((item) => {
              const extra = parseElementExtraData(item);
              const isSelected = activeItem && activeItem.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  style={{
                    background: isSelected ? 'var(--color-surface-container-high)' : 'var(--color-surface)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 6px -1px rgba(131, 212, 211, 0.15)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {extra && extra.fotoUrl ? (
                      <img alt={item.Nombre} src={getPhotoUrl(item.Foto)} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)', borderRadius: '4px' }}>—</div>
                    )}
                    <div style={{ flex: 1, minWidth: '0' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.Nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Ref: {item.Ref || 'S/R'} • Cantidad: {item.Cantidad}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', fontSize: '0.7rem' }}>
                    <span style={{ background: 'var(--color-surface-container-lowest)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border-light)' }}>
                      {(item.medida_metro_cuadrado || 0).toFixed(3)} m²
                    </span>
                    <span style={{ background: 'var(--color-surface-container-lowest)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border-light)' }}>
                      {(item.medida_metro_cubico || 0).toFixed(3)} m³
                    </span>
                  </div>
                </div>
              );
            })}
            {projectItems.length === 0 && (
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', padding: '20px 0' }}>No hay piezas en este presupuesto.</p>
            )}
          </div>
        </div>

        {}
        <div>
          {activeItem && activeExtra ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ background: 'var(--color-surface-container-low)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
                  <div>
                    <h2 style={{ margin: '0', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Detalle de Medidas: {activeItem.Nombre}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Edita la superficie y volumen de la pieza</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Cantidad total</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{activeItem.Cantidad} ud(s)</div>
                  </div>
                </div>


                {}
                <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase' }}>Resultados de Medida</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Superficie (m²)</span>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={activeItem.medida_metro_cuadrado ?? ''}
                        placeholder="0.0000"
                        disabled={isViewer}
                        onChange={(e) => updateElementMeasureValue(activeItem, 'medida_metro_cuadrado', e.target.value)}
                        style={inputStyle}
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Volumen (m³)</span>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={activeItem.medida_metro_cubico ?? ''}
                        placeholder="0.0000"
                        disabled={isViewer}
                        onChange={(e) => updateElementMeasureValue(activeItem, 'medida_metro_cubico', e.target.value)}
                        style={inputStyle}
                      />
                    </label>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div style={{ background: 'var(--color-surface-container-low)', padding: '40px', borderRadius: '8px', border: '1px dashed var(--color-border)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Selecciona una pieza del listado izquierdo para ver y editar sus medidas.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
