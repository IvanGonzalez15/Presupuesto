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
    "En nombre de la empresa LINE-X HISPANIA, S. L., tratamos la información que nos facilita con el fin de poder hacer efectivo nuestro servicio/cumplir con nuestra relación comercial, y realizar la facturación del mismo. Los datos proporcionados se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales. Los datos no se cederán a terceros salvo en los casos en que exista una obligación legal.",
    "Presupuesto provisional hasta tener toda la información y documentación del proyecto."
  ]
};

export default function Template3({ company, project, items, total, money, templateOptions }) {
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

  const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 1000,
    background: '#FFFFFF',
    border: '1px solid #D1D5DB',
    borderRadius: '4px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
    padding: '4px 0',
    width: '320px',
    marginTop: '4px'
  };

  const dropdownItemStyle = (isSelected) => ({
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.72rem',
    background: isSelected ? '#F3F4F6' : 'transparent',
    color: '#111827',
    borderBottom: '1px solid #F9FAFB'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: '"Georgia", Times, serif', color: '#1F2937', background: '#FAFAFA', padding: '24px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '400', margin: '0 0 6px 0', color: '#111827', letterSpacing: '-0.5px' }}>
            {company.nombre}
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontFamily: 'sans-serif', lineHeight: '1.4' }}>
            NIF: {company.nif} | Tel: {company.telefono}<br />
            {company.direccion1} {company.direccion2}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'sans-serif' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '2px' }}>Presupuesto de Obra</span>
          <div style={{ fontSize: '1.3rem', fontWeight: '300', color: '#111827', marginTop: '4px' }}>
            {project.Codigo}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #D1D5DB', borderBottom: '1px solid #D1D5DB', padding: '14px 0', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', fontFamily: 'sans-serif' }}>
        <div>
          <span style={{ color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Cliente</span>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>
            {project.Cliente_Nombre || `ID: ${project.Id_Cliente}`}
          </div>
        </div>
        <div style={{ borderLeft: '1px solid #E5E7EB', paddingLeft: '20px' }}>
          <span style={{ color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>DETALLES DEL PROYECTO</span>
          <div style={{ fontSize: '0.8rem', color: '#374151' }}>
            Proyecto: <strong style={{ color: '#111827' }}>{project.proyecto || '—'}</strong><br />
            Fecha: {project.Fecha_entrega ? new Date(project.Fecha_entrega).toLocaleDateString('es-ES') : ''}
          </div>
        </div>
      </div>

      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #111827', fontFamily: 'sans-serif' }}>
              <th style={{ padding: '10px 8px 10px 0', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#6B7280', width: '12%' }}>Ref</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#6B7280' }}>Concepto</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#6B7280', width: '60px' }}>Cant.</th>
              <th style={{ padding: '10px 24px 10px 8px', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#6B7280', width: '140px' }}>Precio Unit.</th>
              <th style={{ padding: '10px 0 10px 24px', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#111827', width: '140px', borderLeft: '1px solid #D1D5DB' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '12px 8px 12px 0', fontSize: '0.8rem', fontFamily: 'monospace', color: '#9CA3AF' }}>
                  {item.Ref}
                </td>
                <td style={{ padding: '12px 8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#1F2937' }}>
                  {item.Nombre}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.85rem', color: '#374151', fontFamily: 'sans-serif' }}>
                  {item.Cantidad}
                </td>
                <td style={{ padding: '12px 24px 12px 8px', textAlign: 'right', fontSize: '0.85rem', color: '#6B7280', fontFamily: 'sans-serif' }}>
                  {money.format(item.Precio)}
                </td>
                <td style={{ padding: '12px 0 12px 24px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '700', color: '#111827', fontFamily: 'sans-serif', borderLeft: '1px solid #E5E7EB' }}>
                  {money.format(item.Cantidad * item.Precio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '0.74rem', color: '#4B5563', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ position: 'relative' }}>
            <strong onClick={(e) => handleLabelClick(e, 'noIncluido')} style={{ cursor: 'pointer', color: '#111827', fontWeight: '700' }}>
              NO INCLUIDO:
            </strong>
            {" "}{options.noIncluido[selectedNoIncluido]}

            {openDropdown === 'noIncluido' && (
              <div style={dropdownMenuStyle}>
                {options.noIncluido.map((opt, i) => (
                  <div key={i} onClick={() => { setSelectedNoIncluido(i); setOpenDropdown(null); }} style={dropdownItemStyle(selectedNoIncluido === i)}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <strong onClick={(e) => handleLabelClick(e, 'formaPago')} style={{ cursor: 'pointer', color: '#111827', fontWeight: '700' }}>
              FORMA PAGO:
            </strong>
            {" "}{options.formaPago[selectedFormaPago]}

            {openDropdown === 'formaPago' && (
              <div style={dropdownMenuStyle}>
                {options.formaPago.map((opt, i) => (
                  <div key={i} onClick={() => { setSelectedFormaPago(i); setOpenDropdown(null); }} style={dropdownItemStyle(selectedFormaPago === i)}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <strong onClick={(e) => handleLabelClick(e, 'iban')} style={{ cursor: 'pointer', color: '#111827', fontWeight: '700' }}>
              IBAN:
            </strong>
            {" "}<span style={{ fontFamily: 'monospace' }}>{activeIban}</span>

            {openDropdown === 'iban' && ibans.length > 0 && (
              <div style={dropdownMenuStyle}>
                {ibans.map((opt, i) => (
                  <div key={i} onClick={() => { setSelectedIban(i); setOpenDropdown(null); }} style={dropdownItemStyle(safeSelectedIban === i)}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <strong onClick={(e) => handleLabelClick(e, 'importante')} style={{ cursor: 'pointer', color: '#111827', fontWeight: '700' }}>
              CONDICIONES DE VENTA:
            </strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '14px', listStyleType: 'circle', color: '#6B7280' }}>
              {options.importante[selectedImportante].map((note, idx) => (
                <li key={idx} style={{ marginBottom: '2px' }}>{note}</li>
              ))}
            </ul>

            {openDropdown === 'importante' && (
              <div style={{ ...dropdownMenuStyle, width: '360px' }}>
                {options.importante.map((optList, i) => (
                  <div key={i} onClick={() => { setSelectedImportante(i); setOpenDropdown(null); }} style={dropdownItemStyle(selectedImportante === i)}>
                    <strong>Opción {i + 1}:</strong> {optList[0]}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative', marginTop: '6px', padding: '10px', background: '#F9FAFB', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
            <strong onClick={(e) => handleLabelClick(e, 'descripcion')} style={{ cursor: 'pointer', color: '#111827', fontWeight: '700' }}>
              PROTECCIÓN DE DATOS:
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.68rem', color: '#6B7280', textAlign: 'justify', lineHeight: '1.4' }}>
              {options.descripcion[selectedDescripcion]}
            </p>

            {openDropdown === 'descripcion' && (
              <div style={{ ...dropdownMenuStyle, bottom: '100%', top: 'auto', marginBottom: '4px', width: '360px' }}>
                {options.descripcion.map((opt, i) => (
                  <div key={i} onClick={() => { setSelectedDescripcion(i); setOpenDropdown(null); }} style={dropdownItemStyle(selectedDescripcion === i)}>
                    <strong>Opción {i + 1}:</strong> {opt.substring(0, 50)}...
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '4px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280' }}>
            <span>Subtotal:</span>
            <span>{money.format(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px' }}>
            <span>IVA (21%):</span>
            <span>{money.format(total * 0.21)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '700', color: '#111827', paddingTop: '6px' }}>
            <span>Total Neto:</span>
            <span>{money.format(total * 1.21)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #E5E7EB', fontFamily: 'sans-serif' }}>
        <div>
          <div style={{ borderBottom: '1px solid #111827', width: '180px', marginBottom: '6px' }}></div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>Por LINE-X HISPANIA, S.L.</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ borderBottom: '1px solid #111827', width: '180px', marginBottom: '6px', marginLeft: 'auto' }}></div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>Conformidad del Cliente</span>
        </div>
      </div>

    </div>
  );
}
