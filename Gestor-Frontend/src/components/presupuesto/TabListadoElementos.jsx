import React, { useState } from 'react';
import { getPhotoUrl, parseElementExtraData } from '../../utils/elementHelpers';

export default function TabListadoElementos({
  isViewer,
  itemDraft,
  setItemDraft,
  handleItemInputChange,
  handleItemSubmit,
  handleUploadPhoto,
  updateElementPhoto,
  projectItems,
  updateElementQuantity,
  deleteElemento,
  money,
  total
}) {
  const [dragOverForm, setDragOverForm] = useState(false);
  const [uploadingForm, setUploadingForm] = useState(false);
  const [uploadingTableId, setUploadingTableId] = useState(null);
  const [dragOverTableId, setDragOverTableId] = useState(null);

  const handleFileChangeLocal = async (e, targetType, targetItem = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAndSetLocal(file, targetType, targetItem);
  };

  const handleDropLocal = async (e, targetType, targetItem = null) => {
    e.preventDefault();
    if (targetType === 'form') {
      setDragOverForm(false);
    } else {
      setDragOverTableId(null);
    }
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadAndSetLocal(file, targetType, targetItem);
  };

  const uploadAndSetLocal = async (file, targetType, targetItem) => {
    if (targetType === 'form') {
      setUploadingForm(true);
      try {
        const url = await handleUploadPhoto(file);
        setItemDraft((current) => ({ ...current, Foto: url }));
      } catch (err) {
        alert('Error al subir la imagen: ' + err.message);
      } finally {
        setUploadingForm(false);
      }
    } else if (targetType === 'table' && targetItem) {
      setUploadingTableId(targetItem.id);
      try {
        const url = await handleUploadPhoto(file);
        await updateElementPhoto(targetItem, url);
      } catch (err) {
        alert('Error al subir la imagen: ' + err.message);
      } finally {
        setUploadingTableId(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Formulario solo visible si no es un Viewer */}
      {!isViewer && (
        <form className="item-form" onSubmit={handleItemSubmit} autoComplete="off" style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
          <div className="item-form-header" style={{ marginBottom: '16px' }}>
            <div>
              <span className="form-kicker" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase' }}>Nueva partida</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.15rem' }}>Añadir partida al listado</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '12px', marginBottom: '16px' }}>
            <label className="field">
              <span>Concepto / Descripción del elemento</span>
              <input name="Nombre" onChange={handleItemInputChange} placeholder="Ej. Escultura porex elefante" required value={itemDraft.Nombre} autoComplete="off" style={{ padding: '8px' }} />
            </label>
            <div className="field">
              <span>Imagen / Foto</span>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverForm(true); }}
                onDragLeave={() => setDragOverForm(false)}
                onDrop={(e) => handleDropLocal(e, 'form')}
                onClick={() => document.getElementById('form-file-input').click()}
                style={{
                  border: `2px dashed ${dragOverForm ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: '6px',
                  padding: '12px',
                  textAlign: 'center',
                  background: dragOverForm ? 'var(--color-surface-container-high)' : 'var(--color-surface-container-low)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '80px',
                  transition: 'all 0.2s ease',
                  color: 'var(--color-text-secondary)',
                  position: 'relative'
                }}
              >
                {uploadingForm ? (
                  <span>Subiendo imagen...</span>
                ) : itemDraft.Foto ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <img src={getPhotoUrl(itemDraft.Foto)} alt="Previsualización" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 'bold' }}>¡Cargada con éxito!</span>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '4px', color: 'var(--color-text-secondary)' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span style={{ fontSize: '0.75rem' }}>Arrastra foto o haz clic para subir</span>
                  </>
                )}
                <input
                  type="file"
                  id="form-file-input"
                  accept="image/*"
                  onChange={(e) => handleFileChangeLocal(e, 'form')}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
            <label className="field">
              <span>Cantidad</span>
              <input min="1" name="Cantidad" onChange={handleItemInputChange} type="number" value={itemDraft.Cantidad} autoComplete="off" style={{ padding: '8px' }} />
            </label>
            <button className="primary-action" type="submit" style={{ padding: '10px', background: 'var(--color-success)', color: 'var(--color-on-primary)', fontWeight: 'bold', border: 0, borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
              Añadir Elemento
            </button>
          </div>
        </form>
      )}

      <div className="items-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="excel-style-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-sheet-cell-bg)', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: 'var(--color-sheet-header-bg)', borderBottom: '2px solid var(--color-sheet-border)' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.8rem' }}>FOTO</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.8rem' }}>REFERENCIA</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.8rem' }}>CONCEPTO / NOMBRE</th>
              <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', width: '100px' }}>UNIDADES</th>
              <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.8rem' }}>TOTAL VENTA (€)</th>
              {!isViewer && <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem' }}>ACCIONES</th>}
            </tr>
          </thead>
          <tbody>
            {projectItems.map((item) => {
              const extra = parseElementExtraData(item);
              const hasPhoto = !!(extra && extra.fotoUrl);
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '8px', textAlign: 'center', position: 'relative' }}>
                    {!isViewer ? (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOverTableId(item.id); }}
                        onDragLeave={() => setDragOverTableId(null)}
                        onDrop={(e) => handleDropLocal(e, 'table', item)}
                        onClick={() => document.getElementById(`table-file-input-${item.id}`).click()}
                        style={{
                          width: '44px',
                          height: '44px',
                          margin: '0 auto',
                          border: `2px dashed ${dragOverTableId === item.id ? 'var(--color-accent)' : 'var(--color-border-light)'}`,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          background: dragOverTableId === item.id ? 'var(--color-surface-container-high)' : 'var(--color-surface-container-low)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease'
                        }}
                        title="Arrastra una foto o haz clic para cambiar"
                      >
                        {uploadingTableId === item.id ? (
                          <span style={{ fontSize: '0.55rem', color: 'var(--color-success)' }}>Subiendo...</span>
                        ) : hasPhoto ? (
                          <img alt={item.Nombre} src={getPhotoUrl(item.Foto)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>+</span>
                        )}
                        <input
                          type="file"
                          id={`table-file-input-${item.id}`}
                          accept="image/*"
                          onChange={(e) => handleFileChangeLocal(e, 'table', item)}
                          style={{ display: 'none' }}
                        />
                      </div>
                    ) : (
                      hasPhoto ? (
                        <img alt={item.Nombre} src={getPhotoUrl(item.Foto)} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', margin: '0 auto' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--color-text-secondary)', borderRadius: '4px', margin: '0 auto' }}>—</div>
                      )
                    )}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.Ref}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.Nombre}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      value={item.Cantidad}
                      disabled={isViewer}
                      onChange={(e) => updateElementQuantity(item, e.target.value)}
                      style={{ width: '60px', textAlign: 'center', padding: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{money.format(item.Cantidad * item.Precio)}</td>
                  {!isViewer && (
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button onClick={() => deleteElemento(item.id)} style={{ padding: '4px 8px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {projectItems.length > 0 && (
              <tr style={{ background: 'var(--color-surface-container-low)', fontWeight: 'bold', borderTop: '2px solid var(--color-border)' }}>
                <td colSpan={4} style={{ padding: '12px', textAlign: 'right' }}>Total Presupuesto Venta:</td>
                <td style={{ padding: '12px', textAlign: 'right', color: 'var(--color-success)', fontSize: '1.05rem' }}>{money.format(total)}</td>
                {!isViewer && <td></td>}
              </tr>
            )}
          </tbody>
        </table>
        {!projectItems.length && <p className="empty-state">No hay elementos creados para este proyecto.</p>}
      </div>
    </div>
  );
}
