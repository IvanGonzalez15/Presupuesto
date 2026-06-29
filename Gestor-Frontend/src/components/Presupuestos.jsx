import React, { useState, useEffect } from 'react';
import { exportToPDF } from '../utils/pdfHelper';
import api from '../services/api';

// Modular child components
import ProjectSidebar from './presupuesto/ProjectSidebar';
import TabProyecto from './presupuesto/TabProyecto';
import TabListadoElementos from './presupuesto/TabListadoElementos';
import TabListadoMedidas from './presupuesto/TabListadoMedidas';
import TabCalculoPresupuesto from './presupuesto/TabCalculoPresupuesto';
import TabPresupuestoFormal from './presupuesto/TabPresupuestoFormal';

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
  const [itemDraft, setItemDraft] = useState(initialItem);

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('linex');
  const [selectedTemplateId, setSelectedTemplateId] = useState('Template1');
  const [templateOptions, setTemplateOptions] = useState(null);

  useEffect(() => {
    api.get('/empresas')
      .then(res => {
        setCompanies(res.data);
        if (res.data.length > 0) {
          setSelectedCompanyId(res.data[0].id);
        }
      })
      .catch(err => console.error('Error fetching companies:', err));

    api.get('/templateoptions')
      .then(res => setTemplateOptions(res.data))
      .catch(err => console.error('Error fetching template options:', err));
  }, []);

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setItemDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemSubmit = (e) => {
    e.preventDefault();
    createElemento(itemDraft);
    setItemDraft(initialItem);
  };

  return (
    <section className="workspace">
      {/* Sidebar List of Projects */}
      <ProjectSidebar
        proyectos={proyectos}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        deleteProject={deleteProject}
        money={money}
        isAdmin={isAdmin}
        selectedClientIdFilter={selectedClientIdFilter}
        setSelectedClientIdFilter={setSelectedClientIdFilter}
        clientes={clientes}
      />

      <section className="panel budget-builder" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header and Action Buttons */}
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

            {/* Renderizado de Pestañas Dinámico */}
            {subTab === '00-proyecto' && (
              <TabProyecto
                selectedProject={selectedProject}
                total={total}
                money={money}
              />
            )}

            {subTab === '01-listado_elementos' && (
              <TabListadoElementos
                isViewer={isViewer}
                itemDraft={itemDraft}
                setItemDraft={setItemDraft}
                handleItemInputChange={handleItemInputChange}
                handleItemSubmit={handleItemSubmit}
                handleUploadPhoto={handleUploadPhoto}
                updateElementPhoto={updateElementPhoto}
                projectItems={projectItems}
                updateElementQuantity={updateElementQuantity}
                deleteElemento={deleteElemento}
                money={money}
                total={total}
              />
            )}

            {subTab === '02-listado_medidas' && (
              <TabListadoMedidas
                isViewer={isViewer}
                projectItems={projectItems}
                updateElementExtraValue={updateElementExtraValue}
              />
            )}

            {subTab === '03-calculo_presupuesto' && (
              <TabCalculoPresupuesto
                isViewer={isViewer}
                projectItems={projectItems}
                updateElementExtraValue={updateElementExtraValue}
                money={money}
              />
            )}

            {subTab === '04-presupuesto' && (
              <TabPresupuestoFormal
                selectedCompanyId={selectedCompanyId}
                setSelectedCompanyId={setSelectedCompanyId}
                companies={companies}
                selectedTemplateId={selectedTemplateId}
                setSelectedTemplateId={setSelectedTemplateId}
                selectedProject={selectedProject}
                projectItems={projectItems}
                total={total}
                money={money}
                templateOptions={templateOptions}
              />
            )}
          </>
        ) : (
          <p className="empty-state">Selecciona o crea un proyecto de la lista izquierda para empezar a gestionar el presupuesto.</p>
        )}
      </section>
    </section>
  );
}
