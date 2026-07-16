import React, { useState, useEffect } from 'react';
import { getPhotoUrl, parseElementExtraData } from '../../utils/elementHelpers';
import CustomDropdown from '../CustomDropdown';

export default function TabCalculoPresupuesto({
  isViewer,
  projectItems,
  updateElementExtraValue,
  money,
  tarifas,
  tarifasMateriales = []
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
    boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
      
      {}
      <div style={{ background: 'var(--color-surface-container-low)', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Tarifas activas en Base de Datos</h4>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>
          {['porex', 'linex', 'fibra', 'pintura', 'mortero'].map(cat => {
            const list = tarifasMateriales.filter(m => m.categoria === cat);
            return (
              <div key={cat} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <strong style={{ textTransform: 'uppercase', color: 'var(--color-primary)' }}>{cat}:</strong>
                <span>{list.map(m => `${m.nombre} (${money.format(m.precio)}/${m.unidad})`).join(', ') || 'Ninguno'}</span>
              </div>
            );
          })}
        </div>
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
              
              
              const totalHrs = Object.values(extra.hours || {}).reduce((acc, h) => acc + Number(h || 0), 0);
              
              
              const activeMats = [];
              if (extra.materials.porexId) activeMats.push('Porex');
              if (extra.materials.linexId) activeMats.push('Line-X');
              if (extra.materials.fibraId) activeMats.push('Fibra');
              if (extra.materials.pinturaId) activeMats.push('Pintura');
              if (extra.materials.morteroId) activeMats.push('Mortero');

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
                      {totalHrs} horas
                    </span>
                    {activeMats.map(mat => (
                      <span key={mat} style={{ background: 'var(--color-surface-container-lowest)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border-light)', color: 'var(--color-primary)' }}>
                        {mat}
                      </span>
                    ))}
                    {activeMats.length === 0 && (
                      <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Sin materiales</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border-light)', paddingTop: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Precio Calculado:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.9rem' }}>{money.format(item.Precio)}</span>
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
              
              <div style={{ background: 'var(--color-surface-container-low)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
                  <div>
                    <h2 style={{ margin: '0', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Detalle de Pieza: {activeItem.Nombre}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Edita los materiales y las horas de trabajo a continuación</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Precio Unitario PVP</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{money.format(activeItem.Precio)}</div>
                  </div>
                </div>

                {}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Materiales y Acabados</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    
                    <div>
                      <CustomDropdown
                        label="Porex"
                        placeholder="Ninguno"
                        value={activeExtra.materials.porexId || ''}
                        disabled={isViewer}
                        onChange={(val) => {
                          const numericVal = val ? Number(val) : null;
                          updateElementExtraValue(activeItem, 'materials', 'porexId', numericVal);
                        }}
                        options={[
                          { id: '', label: 'Ninguno' },
                          ...tarifasMateriales.filter(m => m.categoria === 'porex').map(m => ({ id: m.id, label: m.nombre }))
                        ]}
                      />
                    </div>

                    <div>
                      <CustomDropdown
                        label="Line-X"
                        placeholder="Ninguno"
                        value={activeExtra.materials.linexId || ''}
                        disabled={isViewer}
                        onChange={(val) => {
                          const numericVal = val ? Number(val) : null;
                          updateElementExtraValue(activeItem, 'materials', 'linexId', numericVal);
                        }}
                        options={[
                          { id: '', label: 'Ninguno' },
                          ...tarifasMateriales.filter(m => m.categoria === 'linex').map(m => ({ id: m.id, label: m.nombre }))
                        ]}
                      />
                    </div>

                    <div>
                      <CustomDropdown
                        label="Fibra"
                        placeholder="Ninguno"
                        value={activeExtra.materials.fibraId || ''}
                        disabled={isViewer}
                        onChange={(val) => {
                          const numericVal = val ? Number(val) : null;
                          updateElementExtraValue(activeItem, 'materials', 'fibraId', numericVal);
                        }}
                        options={[
                          { id: '', label: 'Ninguno' },
                          ...tarifasMateriales.filter(m => m.categoria === 'fibra').map(m => ({ id: m.id, label: m.nombre }))
                        ]}
                      />
                    </div>

                    <div>
                      <CustomDropdown
                        label="Pintura"
                        placeholder="Ninguno"
                        value={activeExtra.materials.pinturaId || ''}
                        disabled={isViewer}
                        onChange={(val) => {
                          const numericVal = val ? Number(val) : null;
                          updateElementExtraValue(activeItem, 'materials', 'pinturaId', numericVal);
                        }}
                        options={[
                          { id: '', label: 'Ninguno' },
                          ...tarifasMateriales.filter(m => m.categoria === 'pintura').map(m => ({ id: m.id, label: m.nombre }))
                        ]}
                      />
                    </div>

                    <div>
                      <CustomDropdown
                        label="Mortero"
                        placeholder="Ninguno"
                        value={activeExtra.materials.morteroId || ''}
                        disabled={isViewer}
                        onChange={(val) => {
                          const numericVal = val ? Number(val) : null;
                          updateElementExtraValue(activeItem, 'materials', 'morteroId', numericVal);
                        }}
                        options={[
                          { id: '', label: 'Ninguno' },
                          ...tarifasMateriales.filter(m => m.categoria === 'mortero').map(m => ({ id: m.id, label: m.nombre }))
                        ]}
                      />
                    </div>

                  </div>
                </div>

                {}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Horas de Mano de Obra</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    
                    {}
                    <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase' }}>1. Oficina y Robótica</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Ofs (Oficina)</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.oficina || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'oficina', Number(e.target.value))} style={inputStyle} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Programación</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.programacion || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'programacion', Number(e.target.value))} style={inputStyle} />
                        </label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Mecanizado</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.mecanizado || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'mecanizado', Number(e.target.value))} style={inputStyle} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Pegar / lijar</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.prepost || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'prepost', Number(e.target.value))} style={inputStyle} />
                        </label>
                      </div>
                    </div>

                    {}
                    <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase' }}>2. Taller</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Esculpir</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.esculpir || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'esculpir', Number(e.target.value))} style={inputStyle} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Line-X</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.linex || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'linex', Number(e.target.value))} style={inputStyle} />
                        </label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Fibra</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.fibra || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'fibra', Number(e.target.value))} style={inputStyle} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Mortero</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.mortero || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'mortero', Number(e.target.value))} style={inputStyle} />
                        </label>
                      </div>
                    </div>

                    {}
                    <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase' }}>3. Pintura, Estructura y Entrega</span>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Pintura</span>
                        <input type="number" min="0" step="0.5" value={activeExtra.hours.pintura || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'pintura', Number(e.target.value))} style={inputStyle} />
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Estructura</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.estructura || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'estructura', Number(e.target.value))} style={inputStyle} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Embalaje / carga</span>
                          <input type="number" min="0" step="0.5" value={activeExtra.hours.entrega || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(activeItem, 'hours', 'entrega', Number(e.target.value))} style={inputStyle} />
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div style={{ background: 'var(--color-surface-container-low)', padding: '40px', borderRadius: '8px', border: '1px dashed var(--color-border)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Selecciona una pieza del listado izquierdo para ver y editar sus cálculos.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
