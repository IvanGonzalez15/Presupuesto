import React from 'react';
import { exportToPDF } from '../utils/pdfHelper';
import { BASE_URL } from '../services/api';

const getPhotoUrl = (fotoPath) => {
  if (!fotoPath) return '';
  if (fotoPath.startsWith('http://') || fotoPath.startsWith('https://') || fotoPath.startsWith('data:')) {
    return fotoPath;
  }
  return `${BASE_URL}${fotoPath}`;
};


function CustomClientSelect({ value, onChange, clientes }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const selectedClient = clientes.find(c => String(c.id) === String(value));
  const displayText = selectedClient ? selectedClient.Nombre : 'Todos los clientes';

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="custom-select-container" style={{ position: 'relative', width: '100%', minWidth: '200px' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          background: 'var(--color-surface)',
          border: '2px solid var(--color-border)',
          borderRadius: 'var(--rounded-lg)',
          fontSize: '0.85rem',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
      >
        <span>{displayText}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            maxHeight: '220px',
            overflowY: 'auto',
            background: 'var(--color-surface)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--rounded-lg)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            padding: '4px 0',
            margin: 0,
            listStyle: 'none'
          }}
        >
          <li
            onClick={() => { onChange(''); setIsOpen(false); }}
            style={{
              padding: '10px 14px',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              background: value === '' ? 'var(--color-surface-container)' : 'var(--color-surface)',
              fontWeight: value === '' ? '700' : '500',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-container-high)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = value === '' ? 'var(--color-surface-container)' : 'var(--color-surface)'; }}
          >
            Todos los clientes
          </li>
          {clientes.map((c) => {
            const isSelected = String(c.id) === String(value);
            return (
              <li
                key={c.id}
                onClick={() => { onChange(String(c.id)); setIsOpen(false); }}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--color-surface-container-high)' : 'var(--color-surface)',
                  fontWeight: isSelected ? '700' : '500',
                  transition: 'background 0.15s ease',
                  borderTop: '1px solid var(--color-border-light)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-container-high)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'var(--color-surface-container-high)' : 'var(--color-surface)'; }}
              >
                {c.Nombre}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

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
  projectItems,
  updateElementQuantity,
  updateElementPrice,
  deleteElemento,
  updateElementExtraValue,
  parseElementExtraData,
  isAdmin,
  isViewer,
  selectedClientIdFilter,
  setSelectedClientIdFilter,
  handleUploadPhoto,
  updateElementPhoto
}) {
  const initialItem = { Nombre: '', Foto: '', Cantidad: 1, Unidad_de_medida: 'ud', Precio: 0, medida_metro_cuadrado: 0, medida_metro_cubico: 0 };
  const [itemDraft, setItemDraft] = React.useState(initialItem);

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setItemDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemSubmit = (e) => {
    e.preventDefault();
    createElemento(itemDraft);
    setItemDraft(initialItem);
  };

  const [dragOverForm, setDragOverForm] = React.useState(false);
  const [uploadingForm, setUploadingForm] = React.useState(false);
  const [uploadingTableId, setUploadingTableId] = React.useState(null);
  const [dragOverTableId, setDragOverTableId] = React.useState(null);

  const handleFileChange = async (e, targetType, targetItem = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAndSet(file, targetType, targetItem);
  };

  const handleDrop = async (e, targetType, targetItem = null) => {
    e.preventDefault();
    if (targetType === 'form') {
      setDragOverForm(false);
    } else {
      setDragOverTableId(null);
    }
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadAndSet(file, targetType, targetItem);
  };

  const uploadAndSet = async (file, targetType, targetItem) => {
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
    <section className="workspace">
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
              {subTab === '04-presupuesto' && (
                <button
                  type="button"
                  onClick={() => exportToPDF('formal-budget-pdf-content', `Presupuesto-${selectedProject.Codigo}.pdf`)}
                  className="excel-btn export-btn"
                  style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Exportar PDF
                </button>
              )}
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
            <div className="excel-sheets-tabs" style={{ display: 'flex', borderBottom: '2px solid var(--color-sheet-border)', background: 'var(--color-sheet-header-bg)', padding: '4px 4px 0 4px', borderRadius: '6px 6px 0 0' }}>
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
                    border: '1px solid var(--color-border)',
                    borderBottom: subTab === tab.id ? '2px solid var(--color-surface)' : '1px solid var(--color-border)',
                    background: subTab === tab.id ? 'var(--color-surface)' : 'var(--color-surface-container-low)',
                    fontWeight: 'bold',
                    color: subTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
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
            )}

            {/* VISTA 01-LISTADO_ELEMENTOS */}
            {subTab === '01-listado_elementos' && (
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
                          onDrop={(e) => handleDrop(e, 'form')}
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
                            onChange={(e) => handleFileChange(e, 'form')}
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
                      {projectItems.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                          <td style={{ padding: '8px', textAlign: 'center', position: 'relative' }}>
                            {!isViewer ? (
                              <div
                                onDragOver={(e) => { e.preventDefault(); setDragOverTableId(item.id); }}
                                onDragLeave={() => setDragOverTableId(null)}
                                onDrop={(e) => handleDrop(e, 'table', item)}
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
                                ) : item.Foto && !item.Foto.trim().startsWith('{') ? (
                                  <img alt={item.Nombre} src={getPhotoUrl(item.Foto)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>+</span>
                                )}
                                <input
                                  type="file"
                                  id={`table-file-input-${item.id}`}
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, 'table', item)}
                                  style={{ display: 'none' }}
                                />
                              </div>
                            ) : (
                              item.Foto && !item.Foto.trim().startsWith('{') ? (
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
                      ))}
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
            )}

            {/* VISTA 02-LISTADO_MEDIDAS */}
            {subTab === '02-listado_medidas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="info-alert" style={{ background: 'var(--color-info-bg)', borderLeft: '4px solid var(--color-info-border)', padding: '12px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--color-info-text)' }}>
                  Introduce las dimensiones en **milímetros** (Largo, Ancho, Alto) para cada elemento. Se calculará automáticamente la superficie (m²) y volumen (m³) siguiendo la fórmula del Excel.
                </div>
                <div className="items-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="excel-style-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-sheet-cell-bg)', minWidth: '900px' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-sheet-header-bg)', borderBottom: '2px solid var(--color-sheet-border)' }}>
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
                <div className="excel-calc-card" style={{ background: 'var(--color-surface-container-low)', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>TARIFAS BASE DE COSTE (EXCEL)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
                    <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
                      <strong>Porex:</strong> 90.00 €/m³
                    </div>
                    <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
                      <strong>Line-X:</strong> 10.00 €/m²
                    </div>
                    <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
                      <strong>Fibra:</strong> 12.00 €/m²
                    </div>
                    <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
                      <strong>Pintura:</strong> 25.00 €/m²
                    </div>
                    <div style={{ background: 'var(--color-surface)', padding: '8px 12px', border: '1px solid var(--color-border-light)', borderRadius: '4px' }}>
                      <strong>Mortero:</strong> 190.00 €/m²
                    </div>
                  </div>
                </div>

                <div className="items-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="excel-style-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-sheet-cell-bg)', minWidth: '1200px' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-sheet-header-bg)', borderBottom: '2px solid var(--color-sheet-border)' }}>
                        <th rowSpan={2} style={{ padding: '8px', textAlign: 'left', fontSize: '0.75rem', borderRight: '1px solid var(--color-sheet-border)' }}>PIEZA</th>
                        <th rowSpan={2} style={{ padding: '8px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid var(--color-sheet-border)' }}>UDS</th>
                        <th colSpan={5} style={{ padding: '6px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid var(--color-sheet-border)', background: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-sheet-border)' }}>MATERIALES</th>
                        <th colSpan={5} style={{ padding: '6px', textAlign: 'center', fontSize: '0.75rem', borderRight: '1px solid var(--color-sheet-border)', background: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-sheet-border)' }}>MANO DE OBRA / PROCESOS (horas)</th>
                        <th rowSpan={2} style={{ padding: '8px', textAlign: 'right', fontSize: '0.75rem' }}>PRECIO CALC.</th>
                      </tr>
                      <tr style={{ background: 'var(--color-sheet-header-bg)', borderBottom: '2px solid var(--color-sheet-border)' }}>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Porex</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Line-X</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Fibra</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Pintura</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid var(--color-sheet-border)' }}>Mortero</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Ofic.</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Progr.</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Mecan.</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center' }}>Lijar</th>
                        <th style={{ padding: '6px', fontSize: '0.7rem', textAlign: 'center', borderRight: '1px solid var(--color-sheet-border)' }}>Esculpir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectItems.map((item) => {
                        const extra = parseElementExtraData(item);
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold', borderRight: '1px solid var(--color-border-light)' }}>{item.Nombre}</td>
                            <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid var(--color-border-light)' }}>{item.Cantidad}</td>
                            
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
                            <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid var(--color-border-light)' }}>
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
                            <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid var(--color-border-light)' }}>
                              <input type="number" min="0" step="0.5" value={extra.hours.esculpir || ''} disabled={isViewer} onChange={(e) => updateElementExtraValue(item, 'hours', 'esculpir', Number(e.target.value))} style={{ width: '45px', textAlign: 'center' }} />
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
            )}

            {/* VISTA 04-PRESUPUESTO */}
            {subTab === '04-presupuesto' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Selector de Cliente para ADMIN dentro de la vista de Presupuesto */}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--color-surface-container-low)', padding: '12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Filtrar Proyectos por Cliente:</span>
                    <CustomClientSelect
                      value={selectedClientIdFilter}
                      onChange={setSelectedClientIdFilter}
                      clientes={clientes}
                    />
                  </div>
                )}

                <div id="formal-budget-pdf-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--color-surface-container-lowest)', padding: '32px', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)' }}>
                  {/* Cabecera del presupuesto corporativo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-border)', paddingBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>LINE-X HISPANIA, S.L.</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                        B-64084759<br />
                        Carretera C-55 KM 24. Raval dels Torrents.<br />
                        08297-CASTELLGALI (Barcelona)<br />
                        Telf: 938 789 622
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: '0 0 10px 0' }}>PRESUPUESTO</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                        <tr style={{ background: 'var(--color-surface-bright)', color: 'var(--color-text-primary)' }}>
                          <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: '0.8rem' }}>REF</th>
                          <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: '0.8rem' }}>CONCEPTO / DESCRIPCIÓN</th>
                          <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '0.8rem', width: '80px' }}>UDS</th>
                          <th style={{ padding: '12px 10px', textAlign: 'right', fontSize: '0.8rem', width: '140px' }}>PRECIO SPOT</th>
                          <th style={{ padding: '12px 10px', textAlign: 'right', fontSize: '0.8rem', width: '140px' }}>TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectItems.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                            <td style={{ padding: '12px 10px', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{item.Ref}</td>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-border-light)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', maxWidth: '400px', lineHeight: '1.5' }}>
                      <strong>Condiciones de venta:</strong><br />
                      - Los precios no incluyen IVA.<br />
                      - Validez del presupuesto: 30 días.<br />
                      - Forma de pago según condiciones pactadas.
                    </div>
                    <div style={{ width: '300px', background: 'var(--color-surface-container-low)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                        <span>Subtotal:</span>
                        <span>{money.format(total)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
                        <span>I.V.A. (21%):</span>
                        <span>{money.format(total * 0.21)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-border)', paddingTop: '10px', fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-success)' }}>
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
