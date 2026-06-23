import React from 'react';

export default function Template2({ company, project, items, total, money }) {
  if (!company || !project) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Cabecera del presupuesto con diseño Moderno y barra de color */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-surface-bright) 100%)', 
        padding: '24px', 
        borderRadius: '8px', 
        color: 'var(--color-text-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid var(--color-border)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--color-primary)' }}>
            {company.nombre}
          </h2>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, lineHeight: '1.5' }}>
            <strong>NIF:</strong> {company.nif} | <strong>Telf:</strong> {company.telefono}<br />
            {company.direccion1} {company.direccion2}
          </div>
        </div>
        <div style={{ textAlign: 'right', background: 'var(--color-surface)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>PRESUPUESTO OFICIAL</span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '4px 0', color: 'var(--color-text-primary)' }}>
            {project.Codigo}
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Fecha: {project.Fecha_entrega ? new Date(project.Fecha_entrega).toLocaleDateString('es-ES') : ''}
          </div>
        </div>
      </div>

      {/* Datos del Cliente */}
      <div style={{ background: 'var(--color-surface-container-low)', padding: '16px', borderRadius: '6px', borderLeft: '4px solid var(--color-primary)', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 'bold' }}>Cliente Destinatario</span>
        <div style={{ fontSize: '1.05rem', fontWeight: '700', marginTop: '4px', color: 'var(--color-text-primary)' }}>
          {project.Cliente_Nombre || `Cliente ID: ${project.Id_Cliente}`}
        </div>
      </div>

      {/* Tabla de Partidas */}
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-primary)' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Código / Ref</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Descripción del Elemento</th>
              <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', width: '80px' }}>Cant.</th>
              <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', width: '120px' }}>P. Unitario</th>
              <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', width: '120px' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} style={{ 
                borderBottom: '1px solid var(--color-border-light)',
                background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-container-lowest)'
              }}>
                <td style={{ padding: '12px 10px', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  {item.Ref}
                </td>
                <td style={{ padding: '12px 10px', fontSize: '0.9rem', fontWeight: '500' }}>
                  {item.Nombre}
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '0.9rem' }}>
                  {item.Cantidad}
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: '0.9rem' }}>
                  {money.format(item.Precio)}
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {money.format(item.Cantidad * item.Precio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección final de firma y cálculo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '30px' }}>
        <div style={{ flex: 1, fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
          <h4 style={{ margin: '0 0 6px 0', color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>Términos y Condiciones</h4>
          <div>• Este presupuesto tiene una validez de 30 días naturales a partir de la fecha de emisión.</div>
          <div>• Los precios indicados no contemplan el Impuesto sobre el Valor Añadido (I.V.A.).</div>
          <div>• Formas de pago y plazos según los acuerdos comerciales preestablecidos.</div>
        </div>
        
        <div style={{ width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', borderBottom: '1px dashed var(--color-border)' }}>
            <span>Suma Total:</span>
            <span>{money.format(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', borderBottom: '1px dashed var(--color-border)' }}>
            <span>I.V.A. (21%):</span>
            <span>{money.format(total * 0.21)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '12px 0 0 0', 
            fontWeight: 'bold', 
            fontSize: '1.2rem', 
            color: 'var(--color-primary)' 
          }}>
            <span>Total Neto:</span>
            <span>{money.format(total * 1.21)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
