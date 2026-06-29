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
      "Cualquier cambio por parte del cliente en el proceso de producción, implicará un nuevo cambio en la fecha de entrega y del presupuesto.",
      "La fabricación comenzará a partir de recibir el primer pago.",
      "Los impuestos de importación y cualquier impuesto local, serán a cargo del cliente."
    ]
  ],
  descripcion: [
    "En nombre de la empresa LINE-X HISPANIA, S. L., tratamos la información que nos facilita con el fin de poder hacer efectivo nuestro servicio/cumplir con nuestra relación comercial, y realizar la facturación del mismo. Los datos proporcionados se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales. Los datos no se cederán a terceros salvo en los casos en que exista una obligación legal. Usted tiene derecho a obtener confirmación sobre si en LINE-X HISPANIA, S. L. estamos tratando sus datos personales por tanto tiene derecho a acceder a sus datos personales, rectificar los datos inexactos o solicitar su supresión cuando los datos ya no sean necesarios.",
    "Presupuesto provisional hasta tener toda la información y documentación del proyecto."
  ]
};

export default function Template1({ company, project, items, total, money, templateOptions }) {
  if (!company || !project) return null;

  const options = templateOptions || defaultOptions;

  const [openDropdown, setOpenDropdown] = React.useState(null);
  
  const [selectedNoIncluido, setSelectedNoIncluido] = React.useState(0);
  const [selectedFormaPago, setSelectedFormaPago] = React.useState(0);
  const [selectedIban, setSelectedIban] = React.useState(0);
  const [selectedImportante, setSelectedImportante] = React.useState(0);
  const [selectedDescripcion, setSelectedDescripcion] = React.useState(0);

  React.useEffect(() => {
    setSelectedIban(0);
  }, [company]);

  React.useEffect(() => {
    function handleClickOutside() {
      setOpenDropdown(null);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const ibans = company.ibans || (company.iban ? [company.iban] : (options.iban || []));

  const handleLabelClick = (e, key) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-border)', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>
            {company.nombre}
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
            NIF: {company.nif}<br />
            {company.direccion1}<br />
            {company.direccion2}<br />
            Telf: {company.telefono}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: '0 0 10px 0' }}>
            PRESUPUESTO
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span><strong>CÓDIGO:</strong> {project.Codigo}</span>
            <span><strong>FECHA:</strong> {project.Fecha_entrega ? new Date(project.Fecha_entrega).toLocaleDateString('es-ES') : ''}</span>
            <span><strong>CLIENTE:</strong> {project.Cliente_Nombre || `ID: ${project.Id_Cliente}`}</span>
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
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '12px 10px', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                  {item.Ref}
                </td>
                <td style={{ padding: '12px 10px', fontSize: '0.9rem', fontWeight: '600' }}>
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

      {/* Bloque de condiciones y totales */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-border-light)' }}>
        
        {/* Condiciones de venta con dropdowns interactivos sin bordes */}
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', maxWidth: '520px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* NO INCLUIDO */}
          <div style={{ position: 'relative' }}>
            <strong 
              style={{ cursor: 'pointer', color: 'var(--color-text-primary)', userSelect: 'none' }}
              onClick={(e) => handleLabelClick(e, 'noIncluido')}
            >
              NO INCLUIDO:
            </strong>
            {" "}{options.noIncluido[selectedNoIncluido]}

            {openDropdown === 'noIncluido' && (
              <div className="budget-dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: 'var(--color-surface-container)', border: '1px solid var(--color-border)', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '6px 0', width: '320px', marginTop: '4px' }}>
                {options.noIncluido.map((opt, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedNoIncluido(i); setOpenDropdown(null); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.75rem', background: selectedNoIncluido === i ? 'var(--color-surface-container-high)' : 'transparent', color: 'var(--color-text-primary)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-container-highest)'}
                    onMouseLeave={(e) => e.target.style.background = selectedNoIncluido === i ? 'var(--color-surface-container-high)' : 'transparent'}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORMA PAGO */}
          <div style={{ position: 'relative' }}>
            <strong 
              style={{ cursor: 'pointer', color: 'var(--color-text-primary)', userSelect: 'none' }}
              onClick={(e) => handleLabelClick(e, 'formaPago')}
            >
              FORMA PAGO:
            </strong>
            {" "}{options.formaPago[selectedFormaPago]}

            {openDropdown === 'formaPago' && (
              <div className="budget-dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: 'var(--color-surface-container)', border: '1px solid var(--color-border)', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '6px 0', width: '320px', marginTop: '4px' }}>
                {options.formaPago.map((opt, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedFormaPago(i); setOpenDropdown(null); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.75rem', background: selectedFormaPago === i ? 'var(--color-surface-container-high)' : 'transparent', color: 'var(--color-text-primary)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-container-highest)'}
                    onMouseLeave={(e) => e.target.style.background = selectedFormaPago === i ? 'var(--color-surface-container-high)' : 'transparent'}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IBAN */}
          <div style={{ position: 'relative' }}>
            <strong 
              style={{ cursor: 'pointer', color: 'var(--color-text-primary)', userSelect: 'none' }}
              onClick={(e) => handleLabelClick(e, 'iban')}
            >
              IBAN:
            </strong>
            {" "}{ibans[selectedIban] || ibans[0] || ''}

            {openDropdown === 'iban' && ibans.length > 0 && (
              <div className="budget-dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: 'var(--color-surface-container)', border: '1px solid var(--color-border)', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '6px 0', width: '320px', marginTop: '4px' }}>
                {ibans.map((opt, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedIban(i); setOpenDropdown(null); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.75rem', background: selectedIban === i ? 'var(--color-surface-container-high)' : 'transparent', color: 'var(--color-text-primary)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-container-highest)'}
                    onMouseLeave={(e) => e.target.style.background = selectedIban === i ? 'var(--color-surface-container-high)' : 'transparent'}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IMPORTANTE */}
          <div style={{ position: 'relative' }}>
            <strong 
              style={{ cursor: 'pointer', color: 'var(--color-text-primary)', userSelect: 'none' }}
              onClick={(e) => handleLabelClick(e, 'importante')}
            >
              IMPORTANTE:
            </strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
              {options.importante[selectedImportante].map((note, idx) => (
                <li key={idx} style={{ marginBottom: '2px' }}>{note}</li>
              ))}
            </ul>

            {openDropdown === 'importante' && (
              <div className="budget-dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: 'var(--color-surface-container)', border: '1px solid var(--color-border)', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '6px 0', width: '380px', marginTop: '4px' }}>
                {options.importante.map((optList, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedImportante(i); setOpenDropdown(null); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.75rem', background: selectedImportante === i ? 'var(--color-surface-container-high)' : 'transparent', color: 'var(--color-text-primary)', transition: 'background 0.15s ease', borderBottom: '1px solid var(--color-border-light)' }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-container-highest)'}
                    onMouseLeave={(e) => e.target.style.background = selectedImportante === i ? 'var(--color-surface-container-high)' : 'transparent'}
                  >
                    <strong>Opción {i + 1} ({optList.length} puntos):</strong>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {optList[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DESCRIPCION / LOPD */}
          <div style={{ position: 'relative', marginTop: '8px', padding: '8px', background: 'var(--color-surface-container-low)', borderRadius: '4px', border: '1px solid var(--color-border-light)' }}>
            <strong 
              style={{ cursor: 'pointer', color: 'var(--color-text-primary)', userSelect: 'none' }}
              onClick={(e) => handleLabelClick(e, 'descripcion')}
            >
              DESCRIPCIÓN:
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--color-text-secondary)', textAlign: 'justify', lineHeight: '1.4' }}>
              {options.descripcion[selectedDescripcion]}
            </p>

            {openDropdown === 'descripcion' && (
              <div className="budget-dropdown-menu" style={{ position: 'absolute', bottom: '100%', left: 0, zIndex: 1000, background: 'var(--color-surface-container)', border: '1px solid var(--color-border)', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '6px 0', width: '380px', marginBottom: '4px' }}>
                {options.descripcion.map((opt, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedDescripcion(i); setOpenDropdown(null); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.75rem', background: selectedDescripcion === i ? 'var(--color-surface-container-high)' : 'transparent', color: 'var(--color-text-primary)', transition: 'background 0.15s ease', borderBottom: '1px solid var(--color-border-light)' }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-container-highest)'}
                    onMouseLeave={(e) => e.target.style.background = selectedDescripcion === i ? 'var(--color-surface-container-high)' : 'transparent'}
                  >
                    <strong>Opción {i + 1}:</strong>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {opt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Bloque de Totales */}
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
            <span>TOTAL:</span>
            <span>{money.format(total * 1.21)}</span>
          </div>
        </div>
      </div>

      {/* Bloque de Firmas estilo Excel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', padding: '10px 0 20px 0' }}>
        <div>
          <div style={{ borderBottom: '1px solid var(--color-border)', width: '200px', marginBottom: '6px' }}></div>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Por LINE-X HISPANIA, S.L.</span>
          <br /><span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Administrador</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ borderBottom: '1px solid var(--color-border)', width: '200px', marginBottom: '6px', marginLeft: 'auto' }}></div>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Por CLIENTE</span>
          <br /><span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>bla bla</span>
        </div>
      </div>
    </div>
  );
}
