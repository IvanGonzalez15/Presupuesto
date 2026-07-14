import React, { useState, useEffect } from 'react';
import { exportToPDF } from '../utils/pdfHelper';
import api from '../services/api';

import ProjectSidebar from './presupuesto/ProjectSidebar';
import TabProyecto from './presupuesto/TabProyecto';
import TabListadoElementos from './presupuesto/TabListadoElementos';
import TabListadoMedidas from './presupuesto/TabListadoMedidas';
import TabCalculoPresupuesto from './presupuesto/TabCalculoPresupuesto';
import TabPresupuestoFormal from './presupuesto/TabPresupuestoFormal';
import VersionHistoryModal from './presupuesto/VersionHistoryModal';

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
  updateElementMeasureValue,
  deleteElemento,
  updateElementExtraValue,
  parseElementExtraData,
  isAdmin,
  isViewer,
  selectedClientIdFilter,
  setSelectedClientIdFilter,
  handleUploadPhoto,
  updateElementPhoto,
  setStatus,
  tarifas,
  tarifasMateriales,
  companies = [],
  setCompanies,
  templateOptions,
  handleProjectRestored,
  undo,
  canUndo
}) {
  const initialItem = { Nombre: '', Foto: '', Cantidad: 1, Unidad_de_medida: 'ud', Precio: 0, medida_metro_cuadrado: 0, medida_metro_cubico: 0 };
  const [itemDraft, setItemDraft] = useState(initialItem);

  const [selectedCompanyId, setSelectedCompanyId] = useState('linex');
  const [selectedTemplateId, setSelectedTemplateId] = useState('Template1');
  const [openVersionModal, setOpenVersionModal] = useState(false);

  useEffect(() => {
    if (companies && companies.length > 0 && selectedCompanyId === 'linex' && !companies.find(c => c.id === 'linex')) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies]);

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
        <div className="budget-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '12px' }}>
          <div className="section-title" style={{ margin: 0, padding: 0, borderBottom: 0, flexShrink: 0 }}>
            <h2 style={{ fontSize: '1.2rem' }}>Presupuesto: {selectedProject ? selectedProject.Codigo : 'Sin selección'}</h2>
          </div>
          {selectedProject && (
            <div className="excel-actions" style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="excel-btn export-btn"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: canUndo ? 1 : 0.5,
                  cursor: canUndo ? 'pointer' : 'not-allowed',
                  background: 'var(--color-surface-container-high)',
                  border: '1px solid var(--color-border)'
                }}
                title="Deshacer el último cambio (Atajo: Ctrl + Z)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                Deshacer
              </button>
              <button
                type="button"
                onClick={() => setOpenVersionModal(true)}
                className="excel-btn export-btn"
                style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-surface-container-high)', border: '1px solid var(--color-border)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Historial
              </button>
              <button type="button" onClick={exportToExcel} className="excel-btn export-btn" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                Exportar Excel
              </button>
              {subTab === '04-presupuesto' && (
                <button
                  type="button"
                  onClick={() => exportToPDF('formal-budget-pdf-content', `Presupuesto-${selectedProject.Codigo}.pdf`)}
                  className="excel-btn export-btn"
                  style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Exportar PDF
                </button>
              )}
              {!isViewer && (
                <label className="excel-btn import-btn" style={{ padding: '6px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  Importar Excel
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          )}
        </div>

        {selectedProject ? (
          <>
            <div className="excel-sheets-tabs" style={{ display: 'flex', borderBottom: '2px solid var(--color-sheet-border)', background: 'var(--color-sheet-header-bg)', padding: '4px 4px 0 4px', borderRadius: '6px 6px 0 0' }}>
              {[
                { id: '00-proyecto', label: 'PROYECTO' },
                { id: '01-listado_elementos', label: 'LISTADO ELEMENTOS' },
                { id: '02-listado_medidas', label: 'LISTADO MEDIDAS' },
                { id: '03-calculo_presupuesto', label: 'CÁLCULO PRESUPUESTO' },
                { id: '04-presupuesto', label: 'PRESUPUESTO' }
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
                setStatus={setStatus}
              />
            )}

            {subTab === '02-listado_medidas' && (
              <TabListadoMedidas
                isViewer={isViewer}
                projectItems={projectItems}
                updateElementExtraValue={updateElementExtraValue}
                updateElementMeasureValue={updateElementMeasureValue}
              />
            )}

            {subTab === '03-calculo_presupuesto' && (
              <TabCalculoPresupuesto
                isViewer={isViewer}
                projectItems={projectItems}
                updateElementExtraValue={updateElementExtraValue}
                money={money}
                tarifas={tarifas}
                tarifasMateriales={tarifasMateriales}
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

      {selectedProject && (
        <VersionHistoryModal
          isOpen={openVersionModal}
          onClose={() => setOpenVersionModal(false)}
          proyectoId={selectedProject.id}
          onProjectRestored={handleProjectRestored}
          setStatus={setStatus}
        />
      )}
    </section>
  );
}
