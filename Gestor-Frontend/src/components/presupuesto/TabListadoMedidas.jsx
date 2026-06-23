import React from 'react';
import { getPhotoUrl, parseElementExtraData } from '../../utils/elementHelpers';

export default function TabListadoMedidas({
  isViewer,
  projectItems,
  updateElementExtraValue
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="info-alert" style={{ background: 'var(--color-info-bg)', borderLeft: '4px solid var(--color-info-border)', padding: '12px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--color-info-text)' }}>
        Introduce las dimensiones en **milímetros** (Largo, Ancho, Alto) para cada elemento. Se calculará automáticamente la superficie (m²) y volumen (m³) siguiendo la fórmula del Excel.
      </div>
      <div className="items-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="excel-style-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-sheet-cell-bg)', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: 'var(--color-sheet-header-bg)', borderBottom: '2px solid var(--color-sheet-border)' }}>
              <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', width: '60px' }}>FOTO</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.8rem' }}>REF</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.8rem' }}>ELEMENTO</th>
              <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', width: '110px' }}>LARGO (mm)</th>
              <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', width: '110px' }}>ANCHO (mm)</th>
              <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', width: '110px' }}>ALTO (mm)</th>
              <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.8rem' }}>VOLUMEN (m³)</th>
              <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.8rem' }}>SUPERFICIE (m²)</th>
              <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem' }}>UDS</th>
            </tr>
          </thead>
          <tbody>
            {projectItems.map((item) => {
              const extra = parseElementExtraData(item);
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '4px', textAlign: 'center' }}>
                    {extra && extra.fotoUrl ? (
                      <img alt={item.Nombre} src={getPhotoUrl(item.Foto)} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', margin: '0 auto', display: 'block' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)', borderRadius: '4px', margin: '0 auto' }}>—</div>
                    )}
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.Ref}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.Nombre}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={extra.largo || ''}
                      placeholder="0"
                      disabled={isViewer}
                      onChange={(e) => updateElementExtraValue(item, 'general', 'largo', Number(e.target.value))}
                      style={{ width: '90px', textAlign: 'center', padding: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={extra.ancho || ''}
                      placeholder="0"
                      disabled={isViewer}
                      onChange={(e) => updateElementExtraValue(item, 'general', 'ancho', Number(e.target.value))}
                      style={{ width: '90px', textAlign: 'center', padding: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={extra.alto || ''}
                      placeholder="0"
                      disabled={isViewer}
                      onChange={(e) => updateElementExtraValue(item, 'general', 'alto', Number(e.target.value))}
                      style={{ width: '90px', textAlign: 'center', padding: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {(item.medida_metro_cubico || 0).toFixed(4)} m³
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {(item.medida_metro_cuadrado || 0).toFixed(4)} m²
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{item.Cantidad}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!projectItems.length && <p className="empty-state">No hay elementos creados para este proyecto.</p>}
      </div>
    </div>
  );
}
