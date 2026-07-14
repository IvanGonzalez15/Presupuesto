import React from 'react';

const defaultOptions = {
  noIncluido: [
    "diseño personalizado, transporte de los elementos, montaje o instalación",
    "Diseño personalizado, montaje e instalación, elementos estructurales, toboganes, jardinería, sistemas hidráulicos, conexiones eléctricas"
  ],
  formaPago: [
    "50% a la firma del presupuesto y el resto del 50% antes de la entrega",
    "Según contrato"
  ],
  iban: [
    "ES17 2100 0440 1802 0016 8996"
  ],
  importante: [
    [
      "Cualquier cambio por parte del cliente en el proceso de producción, implicará un nuevo cambio en la fecha de entrega y del presupuesto.",
      "La fabricación se iniciará a partir de recibir el primer pago.",
      "Cualquier impuesto local, será a cargo del cliente.",
      "Para ejecutar la obra se necesitará la zona libre de personas y vehículos.",
      "A partir de la jornada de 8 horas, se consideran horas extras.",
      "A partir de las 10:00 PM hasta las 6:00 AM, se consideran horas nocturnas.",
      "Las horas extras se facturaran aparte.",
      "Al finalizar la obra se efectuarán nuevas mediciones."
    ],
    [
      "Cualquier cambio por parte del cliente en el proceso de producción, implicará un nuevo cambio en la fecha de entrega and del presupuesto.",
      "La fabricación comenzará a partir de recibir el primer pago.",
      "Los impuestos de importación y cualquier impuesto local, serán a cargo del cliente."
    ]
  ],
  descripcion: [
    "En nombre de la empresa LINE-X HISPANIA, S. L., tratamos la información que nos facilita con el fin de poder hacer efectivo nuestro servicio/cumplir con nuestra relación comercial, y realizar la facturación del mismo. Los datos proporcionados se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales. Los datos no se cederán a terceros salvo en los casos en que exista una obligación legal. Usted tiene derecho a obtener confirmación sobre si en LINE-X HISPANIA, S. L. estamos tratando sus datos personales por tanto tiene derecho a acceder a sus datos personales, rectificar los datos inexactos o solicitar su supresión cuando los datos ya no sean necesarios.",
    "Presupuesto provisional hasta tener toda la información y documentación del proyecto."
  ]
};

export default function Template2({ company, project, items, total, money, templateOptions }) {
  const [openDropdown, setOpenDropdown] = React.useState(null);
  const [selectedNoIncluido, setSelectedNoIncluido] = React.useState(0);
  const [selectedFormaPago, setSelectedFormaPago] = React.useState(0);
  const [selectedIban, setSelectedIban] = React.useState(0);
  const [selectedImportante, setSelectedImportante] = React.useState(0);
  const [selectedDescripcion, setSelectedDescripcion] = React.useState(0);

  React.useEffect(() => {
    function handleClickOutside() {
      setOpenDropdown(null);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!company || !project) return null;

  const options = templateOptions || defaultOptions;
  const ibans = company.ibans || (company.iban ? [company.iban] : (options.iban || []));
  const safeSelectedIban = selectedIban < ibans.length ? selectedIban : 0;
  const activeIban = ibans[safeSelectedIban] || '';

  const handleLabelClick = (e, key) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif', color: '#1E293B', background: '#FFFFFF', padding: '16px' }}>
      
      {/* Cabecera del presupuesto con diseño Minimalista y Profesional */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid #F1F5F9',
        paddingBottom: '28px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 8px 0', color: '#0F172A', letterSpacing: '-0.5px' }}>
            {company.nombre}
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.6' }}>
            <strong>NIF:</strong> {company.nif} <span style={{ color: '#CBD5E1', margin: '0 8px' }}>|</span> 
            <strong>Telf:</strong> {company.telefono}<br />
            {company.direccion1} {company.direccion2}
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748B', fontWeight: '800' }}>Presupuesto de Venta</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '4px 0 0 0', color: '#0F172A' }}>
            {project.Codigo}
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
            Fecha: {project.Fecha_entrega ? new Date(project.Fecha_entrega).toLocaleDateString('es-ES') : ''}
          </div>
        </div>
      </div>

      {/* Datos del Cliente */}
      <div style={{ 
        background: '#F8FAFC', 
        padding: '18px 24px', 
        borderRadius: '8px', 
        borderLeft: '4px solid #1E293B',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ color: '#64748B', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>Destinatario</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '750', marginTop: '4px', color: '#0F172A' }}>
            {project.Cliente_Nombre || `Cliente ID: ${project.Id_Cliente}`}
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'right' }}>
          Proyecto: <strong style={{ color: '#0F172A' }}>{project.proyecto || '—'}</strong>
        </div>
      </div>

      {/* Tabla de Partidas */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1E293B', color: '#FFFFFF' }}>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }}>Ref</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>Concepto / Descripción</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', width: '80px' }}>Cant.</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', width: '140px' }}>P. Unitario</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', width: '140px', borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} style={{ 
                borderBottom: '1px solid #F1F5F9',
                background: idx % 2 === 0 ? 'transparent' : '#F8FAFC'
              }}>
                <td style={{ padding: '14px 14px', fontSize: '0.85rem', fontFamily: 'monospace', color: '#64748B' }}>
                  {item.Ref}
                </td>
                <td style={{ padding: '14px 14px', fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>
                  {item.Nombre}
                </td>
                <td style={{ padding: '14px 14px', textAlign: 'center', fontSize: '0.9rem', color: '#334155' }}>
                  {item.Cantidad}
                </td>
                <td style={{ padding: '14px 14px', textAlign: 'right', fontSize: '0.9rem', color: '#334155' }}>
                  {money.format(item.Precio)}
                </td>
                <td style={{ padding: '14px 14px', textAlign: 'right', fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>
                  {money.format(item.Cantidad * item.Precio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección final de firma y cálculo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', marginTop: '16px', alignItems: 'flex-start' }}>
        
        {/* Condiciones Interactivas de Venta */}
        <div style={{ fontSize: '0.78rem', color: '#475569', flex: 1, lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* NO INCLUIDO */}
          <div style={{ position: 'relative', paddingBottom: '4px' }}>
            <strong 
              onClick={(e) => handleLabelClick(e, 'noIncluido')}
              style={{ cursor: 'pointer', color: '#0F172A', fontWeight: '800', marginRight: '4px' }}
            >
              NO INCLUIDO:
            </strong>
            <span>{options.noIncluido[selectedNoIncluido]}</span>

            {openDropdown === 'noIncluido' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', padding: '6px 0', width: '340px', marginTop: '4px' }}>
                {options.noIncluido.map((opt, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedNoIncluido(i); setOpenDropdown(null); }}
                    style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '0.75rem', background: selectedNoIncluido === i ? '#F1F5F9' : 'transparent', color: selectedNoIncluido === i ? '#0F172A' : '#334155', fontWeight: selectedNoIncluido === i ? '600' : 'normal', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = selectedNoIncluido === i ? '#F1F5F9' : 'transparent'}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORMA PAGO */}
          <div style={{ position: 'relative', paddingBottom: '4px' }}>
            <strong 
              onClick={(e) => handleLabelClick(e, 'formaPago')}
              style={{ cursor: 'pointer', color: '#0F172A', fontWeight: '800', marginRight: '4px' }}
            >
              FORMA PAGO:
            </strong>
            <span>{options.formaPago[selectedFormaPago]}</span>

            {openDropdown === 'formaPago' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', padding: '6px 0', width: '340px', marginTop: '4px' }}>
                {options.formaPago.map((opt, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedFormaPago(i); setOpenDropdown(null); }}
                    style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '0.75rem', background: selectedFormaPago === i ? '#F1F5F9' : 'transparent', color: selectedFormaPago === i ? '#0F172A' : '#334155', fontWeight: selectedFormaPago === i ? '600' : 'normal', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = selectedFormaPago === i ? '#F1F5F9' : 'transparent'}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IBAN */}
          <div style={{ position: 'relative', paddingBottom: '4px' }}>
            <strong 
              onClick={(e) => handleLabelClick(e, 'iban')}
              style={{ cursor: 'pointer', color: '#0F172A', fontWeight: '800', marginRight: '4px' }}
            >
              IBAN:
            </strong>
            <span style={{ fontFamily: 'monospace' }}>{activeIban}</span>

            {openDropdown === 'iban' && ibans.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', padding: '6px 0', width: '340px', marginTop: '4px' }}>
                {ibans.map((opt, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedIban(i); setOpenDropdown(null); }}
                    style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '0.75rem', background: safeSelectedIban === i ? '#F1F5F9' : 'transparent', color: safeSelectedIban === i ? '#0F172A' : '#334155', fontWeight: safeSelectedIban === i ? '600' : 'normal', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = safeSelectedIban === i ? '#F1F5F9' : 'transparent'}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IMPORTANTE */}
          <div style={{ position: 'relative', paddingBottom: '4px' }}>
            <strong 
              onClick={(e) => handleLabelClick(e, 'importante')}
              style={{ cursor: 'pointer', color: '#0F172A', fontWeight: '800', marginRight: '4px' }}
            >
              IMPORTANTE:
            </strong>
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px', listStyleType: 'square', color: '#475569' }}>
              {options.importante[selectedImportante].map((note, idx) => (
                <li key={idx} style={{ marginBottom: '3px' }}>{note}</li>
              ))}
            </ul>

            {openDropdown === 'importante' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', padding: '6px 0', width: '380px', marginTop: '4px' }}>
                {options.importante.map((optList, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedImportante(i); setOpenDropdown(null); }}
                    style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '0.75rem', background: selectedImportante === i ? '#F1F5F9' : 'transparent', color: selectedImportante === i ? '#0F172A' : '#334155', transition: 'background 0.15s ease', borderBottom: '1px solid #F1F5F9' }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = selectedImportante === i ? '#F1F5F9' : 'transparent'}
                  >
                    <strong>Opción {i + 1} ({optList.length} puntos):</strong>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {optList[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DESCRIPCION / LOPD */}
          <div style={{ 
            position: 'relative', 
            marginTop: '8px', 
            padding: '12px 16px', 
            background: '#F8FAFC', 
            borderRadius: '6px', 
            border: '1px solid #E2E8F0' 
          }}>
            <strong 
              onClick={(e) => handleLabelClick(e, 'descripcion')}
              style={{ cursor: 'pointer', color: '#0F172A', fontWeight: '800' }}
            >
              DESCRIPCIÓN:
            </strong>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.72rem', color: '#64748B', textAlign: 'justify', lineHeight: '1.5' }}>
              {options.descripcion[selectedDescripcion]}
            </p>

            {openDropdown === 'descripcion' && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, zIndex: 1000, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', padding: '6px 0', width: '380px', marginBottom: '4px' }}>
                {options.descripcion.map((opt, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedDescripcion(i); setOpenDropdown(null); }}
                    style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '0.75rem', background: selectedDescripcion === i ? '#F1F5F9' : 'transparent', color: selectedDescripcion === i ? '#0F172A' : '#334155', transition: 'background 0.15s ease', borderBottom: '1px solid #F1F5F9' }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = selectedDescripcion === i ? '#F1F5F9' : 'transparent'}
                  >
                    <strong>Opción {i + 1}:</strong>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {opt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        
        {/* Totales Box */}
        <div style={{ 
          width: '300px', 
          background: '#F8FAFC', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #E2E8F0',
          alignSelf: 'flex-start'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#475569' }}>
            <span>Suma Total:</span>
            <span style={{ fontWeight: '600' }}>{money.format(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
            <span>I.V.A. (21%):</span>
            <span style={{ fontWeight: '600' }}>{money.format(total * 0.21)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '16px 0 0 0', 
            fontWeight: '800', 
            fontSize: '1.25rem', 
            color: '#0F172A' 
          }}>
            <span>Total Neto:</span>
            <span>{money.format(total * 1.21)}</span>
          </div>
        </div>
      </div>

      {/* Bloque de Firmas estilo Excel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
        <div>
          <div style={{ borderBottom: '1.5px solid #1E293B', width: '220px', marginBottom: '8px' }}></div>
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F172A' }}>Por LINE-X HISPANIA, S.L.</span>
          <br /><span style={{ fontSize: '0.7rem', color: '#64748B' }}>Administrador</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ borderBottom: '1.5px solid #1E293B', width: '220px', marginBottom: '8px', marginLeft: 'auto' }}></div>
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F172A' }}>Por CLIENTE</span>
          <br /><span style={{ fontSize: '0.7rem', color: '#64748B' }}>Firma de conformidad</span>
        </div>
      </div>
      
    </div>
  );
}
