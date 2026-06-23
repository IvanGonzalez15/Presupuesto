import React from 'react';
import CustomClientSelect from './CustomClientSelect';
import { Template1, Template2 } from '../templates';

export default function TabPresupuestoFormal({
  isAdmin,
  selectedClientIdFilter,
  setSelectedClientIdFilter,
  clientes,
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
      
      {/* Selectores de empresa, plantilla y filtro de cliente */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--color-surface-container-low)', padding: '16px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Filtrar Proyectos por Cliente:</span>
            <CustomClientSelect
              value={selectedClientIdFilter}
              onChange={setSelectedClientIdFilter}
              clientes={clientes}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Empresa Emisora:</span>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--color-surface)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--rounded-lg)',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Plantilla Visual:</span>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--color-surface)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--rounded-lg)',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Template1">Plantilla Clásica (Template 1)</option>
            <option value="Template2">Plantilla Moderna (Template 2)</option>
          </select>
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
