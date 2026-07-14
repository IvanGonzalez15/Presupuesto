import React from 'react';
import { Template1, Template2 } from '../templates';
import CustomDropdown from '../CustomDropdown';

export default function TabPresupuestoFormal({
  selectedCompanyId,
  setSelectedCompanyId,
  companies,
  selectedTemplateId,
  setSelectedTemplateId,
  selectedProject,
  projectItems,
  total,
  money,
  templateOptions
}) {
  const currentCompany = companies.find(c => String(c.id) === String(selectedCompanyId)) || companies[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Selectores de empresa y plantilla */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--color-surface-container-low)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>

        <div style={{ minWidth: '220px' }}>
          <CustomDropdown
            label="Empresa Emisora"
            placeholder="Seleccionar..."
            value={selectedCompanyId}
            onChange={setSelectedCompanyId}
            options={companies.map(c => ({ id: c.id, label: c.nombre }))}
          />
        </div>

        <div style={{ minWidth: '260px' }}>
          <CustomDropdown
            label="Plantilla Visual"
            placeholder="Seleccionar..."
            value={selectedTemplateId}
            onChange={setSelectedTemplateId}
            options={[
              { id: 'Template1', label: 'Plantilla Clásica (Template 1)' },
              { id: 'Template2', label: 'Plantilla Moderna (Template 2)' }
            ]}
          />
        </div>
      </div>

      <div id="formal-budget-pdf-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--color-surface-container-lowest)', padding: '32px', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)' }}>
        {selectedTemplateId === 'Template1' ? (
          <Template1
            company={currentCompany}
            project={selectedProject}
            items={projectItems}
            total={total}
            money={money}
            templateOptions={templateOptions}
          />
        ) : (
          <Template2
            company={currentCompany}
            project={selectedProject}
            items={projectItems}
            total={total}
            money={money}
            templateOptions={templateOptions}
          />
        )}
      </div>
    </div>
  );
}
