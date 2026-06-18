import React from 'react';

export default function Presupuestos({
  proyectos,
  selectedProjectId,
  setSelectedProjectId,
  deleteProject,
  money,
  subTab,
  setSubTab,
  selectedProject,
  exportToExcel,
  handleImportExcel,
  clientes,
  usuarios,
  total,
  totalManufacturingCost,
  createElemento,
  updateDraft,
  setItemDraft,
  itemDraft,
  projectItems,
  updateElementQuantity,
  updateElementPrice,
  deleteElemento,
  updateElementExtraValue,
  parseElementExtraData,
  isAdmin,
  isViewer,
  selectedClientIdFilter,
  setSelectedClientIdFilter
}) {
  return (
    <section className="workspace">
      <aside className="panel project-list">
        <div className="section-title"><span>04</span><h2>Proyectos</h2></div>
        
        {/* Selector de Cliente para ADMIN en la barra lateral superior de proyectos */}
        {isAdmin && (
          <div style={{ marginBottom: '16px', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Filtrar por Cliente:</label>
            <select
              value={selectedClientIdFilter}
              onChange={(e) => setSelectedClientIdFilter(e.target.value)}
              style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}
            >
              <option value="">Todos los clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.Nombre}</option>
              ))}
            </select>
          </div>
        )}

        <div className="projects-container">
          {proyectos.map((project) => (
            <div className={project.id === Number(selectedProjectId) ? 'project-item-wrapper active' : 'project-item-wrapper'} key={project.id}>
              <button className="project-card" onClick={() => setSelectedProjectId(String(project.id))} type="button">
                <strong>{project.Codigo}</strong>
                <small>{project.proyecto || 'Sin nombre'}</small>
                <small style={{ color: '#64748b' }}>{project.Cliente_Nombre || `Cliente #${project.Id_Cliente}`}</small>
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

      <section className="panel budget-builder" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="budget-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="section-title" style={{ margin: 0, padding: 0, borderBottom: 0 }}>
            <span>05</span>
            <h2 style={{ fontSize: '1.25rem' }}>Presupuesto: {selectedProject ? selectedProject.Codigo : 'Sin selección'}</h2>
          </div>
          {selectedProject && (
            <div className="excel-actions" style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={exportToExcel} className="excel-btn export-btn" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Exportar Excel
              </button>
              {!isViewer && (
                <label className="excel-btn import-btn" style={{ padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Importar Excel
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          )}
        </div>

        {selectedProject ? (
          <>
            {/* Selector de Pestañas Estilo Excel */}
            <div className="excel-sheets-tabs" style={{ display: 'flex', borderBottom: '2px solid #b7c5d8', background: '#e2e8f0', padding: '4px 4px 0 4px', borderRadius: '6px 6px 0 0' }}>
              {[
                { id: '00-proyecto', label: '00-PROYECTO' },
                { id: '01-listado_elementos', label: '01-LISTADO_ELEMENTOS' },
                { id: '02-listado_medidas', label: '02-LISTADO_MEDIDAS' },
                { id: '03-calculo_presupuesto', label: '03-CALCULO_PRESUPUESTO' },
                { id: '04-presupuesto', label: '04-PRESUPUESTO' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id)}
                  className={`excel-sheet-tab-btn ${subTab === tab.id ? 'active' : ''}`}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #cbd5e1',
                    borderBottom: subTab === tab.id ? '2px solid #ffffff' : '1px solid #cbd5e1',
                    background: subTab === tab.id ? '#ffffff' : '#f1f5f9',
                    fontWeight: 'bold',
                    color: subTab === tab.id ? '#0f172a' : '#475569',
                    borderRadius: '4px 4px 0 0',
                    cursor: 'pointer',
                    marginRight: '2px',
                    marginBottom: subTab === tab.id ? '-2px' : '0',
                    fontSize: '0.8rem',
                    zIndex: subTab === tab.id ? 2 : 1
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* VISTA 00-PROYECTO */}
            {subTab === '00-proyecto' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="project-excel-sheet-card" style={{ border: '2px solid #b7c5d8', borderRadius: '6px', overflow: 'hidden', background: '#ffffff' }}>
                  <div className="sheet-tab-header" style={{ padding: '10px 14px', background: '#f1f5f9', borderBottom: '2px solid #b7c5d8', fontWeight: 'bold', fontSize: '0.85rem', color: '#334155' }}>
                    PROYECTO METADATA (LECTURA)
                  </div>
                  <div className="sheet-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid #d7e0eb', borderBottom: '1px solid #d7e0eb' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>CLIENTE</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedProject.Cliente_Nombre || `ID: ${selectedProject.Id_Cliente}`}</strong>
                    </div>
                    <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid #d7e0eb', borderBottom: '1px solid #d7e0eb' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>PROYECTO (NOMBRE)</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedProject.proyecto || '—'}</strong>
                    </div>
                    <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid #d7e0eb', borderBottom: '1px solid #d7e0eb' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>CÓDIGO (GENERICO)</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0284c7', fontFamily: 'monospace' }}>{selectedProject.Codigo}</strong>
                    </div>
                    <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid #d7e0eb', borderBottom: '1px solid #d7e0eb' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>RESPONSABLE</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedProject.Responsable_Nombre || `ID: ${selectedProject.Responsable}`}</strong>
                    </div>
                    <div className="sheet-cell" style={{ padding: '12px', borderRight: '1px solid #d7e0eb', borderBottom: '1px solid #d7e0eb' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>COLABORADORES</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedProject.Colaboradores_Nombre || 'Ninguno'}</strong>
                    </div>
                    <div className="sheet-cell" style={{ padding: '12px', borderBottom: '1px solid #d7e0eb' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>FECHA ENTREGA</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{selectedProject.Fecha_entrega ? new Date(selectedProject.Fecha_entrega).toLocaleDateString('es-ES') : '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* Tarjetas Resumen de Costes del Proyecto */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#ffffff', padding: '20px', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Precio Venta Total</span>
                    <h3 style={{ fontSize: '1.8rem', color: '#0d9488', margin: '4px 0 0 0', fontWeight: '800' }}>
                      {money.format(total)}
                    </h3>
                  </div>
                  <div style={{ background: '#ffffff', padding: '20px', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Coste Fabricación Estimado</span>
                    <h3 style={{ fontSize: '1.8rem', color: '#3b82f6', margin: '4px 0 0 0', fontWeight: '800' }}>
                      {money.format(totalManufacturingCost)}
                    </h3>
                  </div>
                  <div style={{ background: '#ffffff', padding: '20px', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Margen Industrial Estimado</span>
                    <h3 style={{ fontSize: '1.8rem', color: (total - totalManufacturingCost) >= 0 ? '#10b981' : '#ef4444', margin: '4px 0 0 0', fontWeight: '800' }}>
                      {money.format(total - totalManufacturingCost)}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* VISTA 01-LISTADO_ELEMENTOS */}
            {subTab === '01-listado_elementos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Formulario solo visible si no es un Viewer */}
                {!isViewer && (
                  <form className="item-form" onSubmit={createElemento} style={{ background: '#ffffff', padding: '20px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <div className="item-form-header" style={{ marginBottom: '16px' }}>
                      <div>
                        <span className="form-kicker" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase' }}>Nueva partida</span>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '1.15rem' }}>Añadir partida al listado</h3>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <label className="field" style={{ gridColumn: 'span 2' }}>
                        <span>Concepto / Descripción del elemento</span>
                        <input name="Nombre" onChange={updateDraft(setItemDraft)} placeholder="Ej. Escultura porex elefante" required value={itemDraft.Nombre} style={{ padding: '8px' }} />
                      </label>
                      <label className="field">
                        <span>Foto (URL)</span>
                        <input name="Foto" onChange={updateDraft(setItemDraft)} placeholder="https://..." value={itemDraft.Foto} style={{ padding: '8px' }} />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                      <label className="field">
                        <span>Cantidad</span>
                        <input min="1" name="Cantidad" onChange={updateDraft(setItemDraft)} type="number" value={itemDraft.Cantidad} style={{ padding: '8px' }} />
                      </label>
                      <button className="primary-action" type="submit" style={{ padding: '10px', background: '#0d9488', color: '#ffffff', fontWeight: 'bold', border: 0, borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                        Añadir Elemento
                      </button>
                    </div>
                  </form>
                )}

                <div className="items-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="excel-style-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.8rem' }}>FOTO</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.8rem' }}>REFERENCIA</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.8rem' }}>CONCEPTO / NOMBRE</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', width: '100px' }}>UNIDADES</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.8rem' }}>TOTAL VENTA (€)</th>
                        {!isViewer && <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem' }}>ACCIONES</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {projectItems.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            {item.Foto && !item.Foto.trim().startsWith('{') ? (
                              <img alt={item.Nombre} className="table-item-photo" src={item.Foto} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                              <div style={{ width: '40px', height: '40px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#94a3b8', borderRadius: '4px' }}>—</div>
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
                              <button onClick={() => deleteElemento(item.id)} style={{ padding: '4px 8px', background: '#e11d48', color: '#ffffff', border: 0, borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                Eliminar
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {projectItems.length > 0 && (
                        <tr style={{ background: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                          <td colSpan={4} style={{ padding: '12px', textAlign: 'right' }}>Total Presupuesto Venta:</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#0d9488', fontSize: '1.05rem' }}>{money.format(total)}</td>
                          {!isViewer && <td></td>}
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {!projectItems.length && <p className="empty-state">No hay elementos creados para este proyecto.</p>}
                </div>
              </div>
            )}

            {/* VISTA 02-LISTADO_MEDIDAS */}
            {subTab === '02-listado_medidas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="info-alert" style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '12px', borderRadius: '4px', fontSize: '0.85rem', color: '#1e3a8a' }}>
                  Introduce las dimensiones en **milímetros** (Largo, Ancho, Alto) para cada elemento. Se calculará automáticamente la superficie (m²) y volumen (m³) siguiendo la fórmula del Excel.
                </div>
                <div className="items-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="excel-style-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', minWidth: '900px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
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
                          <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
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
            )}

            {/* VISTA 03-CALCULO_PRESUPUESTO */}
            {subTab === '03-calculo_presupuesto' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="excel-calc-card" style={{ background: '#f8fafc', padding: '16px', border: '1px solid #b7c5d8', borderRadius: '6px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#1e293b' }}>TARIFAS BASE DE COSTE (EXCEL)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
                    <div style={{ background: '#ffffff', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <strong>Porex:</strong> 90.00 €/m³
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <strong>Line-X:</strong> 10.00 €/m²
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <strong>Fibra:</strong> 12.00 €/m²
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <strong>Pintura:</strong> 25.00 €/m²
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <strong>Mortero:</strong> 190.00 €/m²
                    </div>
                  </div>
                </div>

                <div className="items-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="excel-style-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', minWidth: '1200px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                        <th rowSpan={2} style={{ padding: '8px', textAlign: 'left', fontSize: '0.75rem', borderRight: '1px solid #cbd5e1' }}>PIEZA</th>
                        <th rowSpan={2} style={{ padding: '8px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid #cbd5e1' }}>UDS</th>
                        <th colSpan={5} style={{ padding: '6px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid #cbd5e1', background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>MATERIALES</th>
                        <th colSpan={5} style={{ padding: '6px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid #cbd5e1', background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>MANO DE OBRA / PROCESOS (horas)</th>
                        <th rowSpan={2} style={{ padding: '8px', textAlign: 'right', fontSize: '0.75rem' }}>PRECIO CALC.</th>
                      </tr>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Porex</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Line-X</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Fibra</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Pintura</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Mortero</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Ofic.</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Progr.</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Mecan.</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Lijar</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Esculpir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectItems.map((item) => {
                        const extra = parseElementExtraData(item);
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold', borderRight: '1px solid #e2e8f0' }}>{item.Nombre}</td>
                            <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>{item.Cantidad}</td>
                            
                            {/* Materials Checkboxes */}
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              <input type="checkbox" checked={extra.materials.porex || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'porex', e.target.checked)} />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              <input type="checkbox" checked={extra.materials.linex || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'linex', e.target.checked)} />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              <input type="checkbox" checked={extra.materials.fibra || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'fibra', e.target.checked)} />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              <input type="checkbox" checked={extra.materials.pintura || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'pintura', e.target.checked)} />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                              <input type="checkbox" checked={extra.materials.mortero || false} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'materials', 'mortero', e.target.checked)} />
                            </td>

                            {/* Hours inputs */}
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              <input type="number" min="0" step="0.5" value={extra.hours.oficina || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'oficina', Number(e.target.value))} style={{ width: '45px', textAlign: 'center' }} />
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              <input type="number" min="0" step="0.5" value={extra.hours.programacion || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'programacion', Number(e.target.value))} style={{ width: '45px', textAlign: 'center' }} />
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              <input type="number" min="0" step="0.5" value={extra.hours.mecanizado || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'mecanizado', Number(e.target.value))} style={{ width: '45px', textAlign: 'center' }} />
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              <input type="number" min="0" step="0.5" value={extra.hours.prepost || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'prepost', Number(e.target.value))} style={{ width: '45px', textAlign: 'center' }} />
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                              <input type="number" min="0" step="0.5" value={extra.hours.esculpir || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'esculpir', Number(e.target.value))} style={{ width: '45px', textAlign: 'center' }} />
                            </td>

                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#0f766e' }}>
                              {money.format(item.Precio)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VISTA 04-PRESUPUESTO */}
            {subTab === '04-presupuesto' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Selector de Cliente para ADMIN dentro de la vista de Presupuesto */}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Filtrar Proyectos por Cliente:</span>
                    <select
                      value={selectedClientIdFilter}
                      onChange={(e) => setSelectedClientIdFilter(e.target.value)}
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      <option value="">Todos los clientes</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>{c.Nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: '#ffffff', padding: '32px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  {/* Cabecera del presupuesto corporativo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>LINE-X HISPANIA, S.L.</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>
                        B-64084759<br />
                        Carretera C-55 KM 24. Raval dels Torrents.<br />
                        08297-CASTELLGALI (Barcelona)<br />
                        Telf: 938 789 622
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 10px 0' }}>PRESUPUESTO</h3>
                      <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span><strong>CÓDIGO:</strong> {selectedProject.Codigo}</span>
                        <span><strong>FECHA:</strong> {selectedProject.Fecha_entrega ? new Date(selectedProject.Fecha_entrega).toLocaleDateString('es-ES') : ''}</span>
                        <span><strong>CLIENTE:</strong> {selectedProject.Cliente_Nombre || `ID: ${selectedProject.Id_Cliente}`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabla de partidas estilo cotización formal */}
                  <div style={{ margin: '10px 0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                          <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: '0.8rem' }}>REF</th>
                          <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: '0.8rem' }}>CONCEPTO / DESCRIPCIÓN</th>
                          <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '0.8rem', width: '80px' }}>UDS</th>
                          <th style={{ padding: '12px 10px', textAlign: 'right', fontSize: '0.8rem', width: '140px' }}>PRECIO SPOT</th>
                          <th style={{ padding: '12px 10px', textAlign: 'right', fontSize: '0.8rem', width: '140px' }}>TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectItems.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '12px 10px', fontSize: '0.85rem', fontFamily: 'monospace', color: '#64748b' }}>{item.Ref}</td>
                            <td style={{ padding: '12px 10px', fontSize: '0.9rem', fontWeight: '600' }}>
                              {item.Nombre}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '0.9rem' }}>{item.Cantidad}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: '0.9rem' }}>{money.format(item.Precio)}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 'bold' }}>{money.format(item.Cantidad * item.Precio)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bloque de firma y totales */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '20px', pt: '20px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '400px', lineHeight: '1.5' }}>
                      <strong>Condiciones de venta:</strong><br />
                      - Los precios no incluyen IVA.<br />
                      - Validez del presupuesto: 30 días.<br />
                      - Forma de pago según condiciones pactadas.
                    </div>
                    <div style={{ width: '300px', background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                        <span>Subtotal:</span>
                        <span>{money.format(total)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
                        <span>I.V.A. (21%):</span>
                        <span>{money.format(total * 0.21)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '10px', fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                        <span>TOTAL PRES.:</span>
                        <span>{money.format(total * 1.21)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="empty-state">Selecciona o crea un proyecto de la lista izquierda para empezar a gestionar el presupuesto.</p>
        )}
      </section>
    </section>
  );
}
