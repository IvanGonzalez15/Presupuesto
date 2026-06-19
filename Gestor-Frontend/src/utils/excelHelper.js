import * as XLSX from 'xlsx';
import { elementService } from '../services/api';

export const exportToExcel = (selectedProject, projectItems, setStatus, money) => {
  if (!selectedProject || !projectItems.length) {
    setStatus('No hay elementos en este proyecto para exportar.');
    return;
  }
  
  const data = projectItems.map((item) => ({
    'Referencia': item.Ref,
    'Concepto': item.Nombre,
    'Cantidad': item.Cantidad,
    'Unidad': item.Unidad_de_medida,
    'Precio Unitario (€)': item.Precio,
    'Total (€)': item.Cantidad * item.Precio,
    'Medida m²': item.medida_metro_cuadrado,
    'Medida m³': item.medida_metro_cubico
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presupuesto');
  XLSX.writeFile(workbook, `Presupuesto_${selectedProject.Codigo}.xlsx`);
  setStatus('Presupuesto exportado a Excel.');
};

export const handleImportExcel = (event, selectedProjectId, currentUser, refreshProjects, setElementos, setStatus) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!selectedProjectId) {
    setStatus('Selecciona un proyecto antes de importar partidas.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const bstr = e.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      let count = 0;
      for (const row of rawData) {
        const nombre = row['Concepto'] || row['Concepto/Nombre'] || row['Nombre'] || row['nombre'] || row['Referencia'];
        const cantidad = Number(row['Cantidad'] || row['cantidad'] || 1);
        const unidad = row['Unidad'] || row['unidad'] || 'ud';
        const precio = Number(row['Precio Unitario (€)'] || row['Precio Unitario'] || row['precio'] || row['Precio'] || 0);
        const m2 = Number(row['Medida m²'] || row['m²'] || 0);
        const m3 = Number(row['Medida m³'] || row['m³'] || 0);

        if (nombre) {
          const payload = {
            Nombre: nombre,
            Foto: '',
            Cantidad: cantidad,
            Unidad_de_medida: unidad,
            Precio: precio,
            medida_metro_cuadrado: m2,
            medida_metro_cubico: m3,
            Id_proyecto: Number(selectedProjectId),
            Id_usuario_creador: currentUser?.id || 1,
          };
          await elementService.create(payload);
          count++;
        }
      }
      
      await refreshProjects();
      const elementsRes = await elementService.getAll();
      setElementos(elementsRes.data);
      setStatus(`Importadas ${count} partidas desde Excel.`);
    } catch (err) {
      setStatus(`Error al importar Excel: ${err.message}`);
    }
  };
  reader.readAsBinaryString(file);
  event.target.value = '';
};
