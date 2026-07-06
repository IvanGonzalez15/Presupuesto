import React from 'react';
import { getPhotoUrl, parseElementExtraData } from '../../utils/elementHelpers';

export default function TabCalculoPresupuesto({
  isViewer,
  projectItems,
  updateElementExtraValue,
  money,
  tarifas
}) {
  const porexRate = tarifas?.materiales?.porex ?? 90.00;
  const linexRate = tarifas?.materiales?.linex ?? 10.00;
  const fibraRate = tarifas?.materiales?.fibra ?? 12.00;
  const pinturaRate = tarifas?.materiales?.pintura ?? 25.00;
  const morteroRate = tarifas?.materiales?.mortero ?? 190.00;

  const inputStyle = { width: '55px', padding: '4px 4px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', textAlign: 'center', fontSize: '0.8rem' };
  const cellStyle = { padding: '4px', textAlign: 'center' };
  const thStyle = { padding: '6px', fontSize: '0.7rem', textAlign: 'center' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="excel-calc-card" style={{ background: 'var(--color-surface-container-low)', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>TARIFAS BASE DE COSTE</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
          <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
            <strong>Porex:</strong> {money.format(porexRate)}/m³
          </div>
          <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
            <strong>Line-X:</strong> {money.format(linexRate)}/m²
          </div>
          <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
            <strong>Fibra:</strong> {money.format(fibraRate)}/m²
          </div>
          <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
            <strong>Pintura:</strong> {money.format(pinturaRate)}/m²
          </div>
          <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
            <strong>Mortero:</strong> {money.format(morteroRate)}/m²
          </div>
        </div>
      </div>

      <div className="items-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="excel-style-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-sheet-cell-bg)', minWidth: '1600px' }}>
          <thead>
            <tr style={{ background: 'var(--color-sheet-header-bg)', borderBottom: '2px solid var(--color-sheet-border)' }}>
              <th rowSpan={2} style={{ padding: '8px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid var(--color-sheet-border)', width: '60px' }}>FOTO</th>
              <th rowSpan={2} style={{ padding: '8px', textAlign: 'left', fontSize: '0.75rem', borderRight: '1px solid var(--color-sheet-border)' }}>PIEZA</th>
              <th rowSpan={2} style={{ padding: '8px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid var(--color-sheet-border)' }}>UDS</th>
              <th colSpan={5} style={{ padding: '6px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid var(--color-sheet-border)', background: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-sheet-border)' }}>MATERIALES</th>
              <th colSpan={11} style={{ padding: '6px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid var(--color-sheet-border)', background: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-sheet-border)' }}>MANO DE OBRA / PROCESOS (horas)</th>
              <th rowSpan={2} style={{ padding: '8px', textAlign: 'right', fontSize: '0.75rem' }}>PRECIO CALC.</th>
            </tr>
            <tr style={{ background: 'var(--color-sheet-header-bg)', borderBottom: '2px solid var(--color-sheet-border)' }}>
              <th style={thStyle}>Porex</th>
              <th style={thStyle}>Line-X</th>
              <th style={thStyle}>Fibra</th>
              <th style={thStyle}>Pintura</th>
              <th style={{ ...thStyle, borderRight: '1px solid var(--color-sheet-border)' }}>Mortero</th>
              <th style={thStyle}>Ofic.</th>
              <th style={thStyle}>Progr.</th>
              <th style={thStyle}>Mecan.</th>
              <th style={thStyle}>Lijar</th>
              <th style={thStyle}>Esculpir</th>
              <th style={thStyle}>Line-X</th>
              <th style={thStyle}>Fibra</th>
              <th style={thStyle}>Mortero</th>
              <th style={thStyle}>Pintura</th>
              <th style={thStyle}>Estruct.</th>
              <th style={{ ...thStyle, borderRight: '1px solid var(--color-sheet-border)' }}>Entrega</th>
            </tr>
          </thead>
          <tbody>
            {projectItems.map((item) => {
              const extra = parseElementExtraData(item);
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid var(--color-border-light)' }}>
                    {extra && extra.fotoUrl ? (
                      <img alt={item.Nombre} src={getPhotoUrl(item.Foto)} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', margin: '0 auto', display: 'block' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)', borderRadius: '4px', margin: '0 auto' }}>—</div>
                    )}
                  </td>
                  <td style={{ padding: '8px', fontWeight: 'bold', borderRight: '1px solid var(--color-border-light)' }}>{item.Nombre}</td>
                  <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid var(--color-border-light)' }}>{item.Cantidad}</td>
                  
                  <td style={cellStyle}>
                    <input type="checkbox" checked={extra.materials.porex || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'porex', e.target.checked)} />
                  </td>
                  <td style={cellStyle}>
                    <input type="checkbox" checked={extra.materials.linex || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'linex', e.target.checked)} />
                  </td>
                  <td style={cellStyle}>
                    <input type="checkbox" checked={extra.materials.fibra || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'fibra', e.target.checked)} />
                  </td>
                  <td style={cellStyle}>
                    <input type="checkbox" checked={extra.materials.pintura || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'pintura', e.target.checked)} />
                  </td>
                  <td style={{ ...cellStyle, borderRight: '1px solid var(--color-border-light)' }}>
                    <input type="checkbox" checked={extra.materials.mortero || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'mortero', e.target.checked)} />
                  </td>

                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.oficina || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'oficina', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.programacion || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'programacion', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.mecanizado || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'mecanizado', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.prepost || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'prepost', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.esculpir || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'esculpir', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.linex || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'linex', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.fibra || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'fibra', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.mortero || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'mortero', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.pintura || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'pintura', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={cellStyle}>
                    <input type="number" min="0" step="0.5" value={extra.hours.estructura || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'estructura', Number(e.target.value))} style={inputStyle} />
                  </td>
                  <td style={{ ...cellStyle, borderRight: '1px solid var(--color-border-light)' }}>
                    <input type="number" min="0" step="0.5" value={extra.hours.entrega || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'entrega', Number(e.target.value))} style={inputStyle} />
                  </td>

                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {money.format(item.Precio)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
