import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { elementService } from '../services/api';

// eslint-disable-next-line no-unused-vars
export const exportToExcel = async (selectedProject, projectItems, setStatus, money) => {
  if (!selectedProject || !projectItems.length) {
    setStatus('No hay elementos en este proyecto para exportar.');
    return;
  }
  
  try {
    setStatus('Generando Presupuesto en Excel...');
    
    // Fetch the template from public folder
    const response = await fetch('/presupuesto.xlsx');
    if (!response.ok) {
      throw new Error('No se pudo cargar la plantilla de presupuesto (presupuesto.xlsx).');
    }
    const arrayBuffer = await response.arrayBuffer();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    const sheetPresupuesto = workbook.getWorksheet('04_PRESUPUESTO');
    if (!sheetPresupuesto) {
      throw new Error('No se encontró la hoja de presupuesto en la plantilla.');
    }
    
    // Rename sheet to a clean, user-friendly name
    sheetPresupuesto.name = 'Presupuesto';
    
    // 1. Populate metadata statically in the budget sheet (no cross-sheet formulas)
    sheetPresupuesto.getCell('B2').value = selectedProject.Cliente_Nombre || '';
    sheetPresupuesto.getCell('B6').value = selectedProject.proyecto || '';
    sheetPresupuesto.getCell('B9').value = selectedProject.Fecha_entrega 
      ? new Date(selectedProject.Fecha_entrega).toLocaleDateString('es-ES') 
      : '';
      
    // 2. Style Header Row (Row 12) to be flat & professional slate gray
    const headerRow = sheetPresupuesto.getRow(12);
    headerRow.height = 30;
    
    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Slate/Charcoal Gray (very clean and professional)
    };
    
    ['B', 'C', 'D', 'E'].forEach((col, idx) => {
      const cell = sheetPresupuesto.getCell(col + '12');
      cell.fill = headerFill;
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      
      const border = {
        bottom: { style: 'medium', color: { argb: 'FF475569' } }
      };
      if (idx < 3) {
        border.right = { style: 'thin', color: { argb: 'FF475569' } };
      }
      cell.border = border;
      
      if (col === 'B') cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      else if (col === 'C') cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else cell.alignment = { vertical: 'middle', horizontal: 'right' };
    });
      
    // 3. Populate elements list
    const N = projectItems.length;
    for (let i = 0; i < N; i++) {
      const item = projectItems[i];
      const rowNum = 14 + i;
      
      const cellB = sheetPresupuesto.getCell('B' + rowNum);
      const cellC = sheetPresupuesto.getCell('C' + rowNum);
      const cellD = sheetPresupuesto.getCell('D' + rowNum);
      const cellE = sheetPresupuesto.getCell('E' + rowNum);
      
      cellB.value = item.Nombre || '';
      cellC.value = Number(item.Cantidad) || 0;
      cellD.value = Number(item.Precio) || 0;
      cellE.value = { formula: `IF(C${rowNum},C${rowNum}*D${rowNum},"")` };
      
      // Premium Styling for item row
      const isEven = (i % 2 === 0);
      const rowFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' } // Subtle zebra striping
      };
      
      [cellB, cellC, cellD, cellE].forEach((cell, idx) => {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF334155' } };
        cell.fill = rowFill;
        
        const border = {
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
        if (idx < 3) {
          border.right = { style: 'thin', color: { argb: 'FFE2E8F0' } };
        }
        cell.border = border;
      });
      
      cellB.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
      cellC.alignment = { vertical: 'middle', horizontal: 'center' };
      cellD.alignment = { vertical: 'middle', horizontal: 'right' };
      cellE.alignment = { vertical: 'middle', horizontal: 'right' };
      
      cellD.numFormat = '€#,##0.00;(€#,##0.00);"-"';
      cellE.numFormat = '€#,##0.00;(€#,##0.00);"-"';
      
      sheetPresupuesto.getRow(rowNum).height = 26;
    }
    
    // Clear remaining rows up to row 29 to prevent leftover template data
    for (let rowNum = 14 + N; rowNum <= 29; rowNum++) {
      sheetPresupuesto.getCell('B' + rowNum).value = null;
      sheetPresupuesto.getCell('C' + rowNum).value = null;
      sheetPresupuesto.getCell('D' + rowNum).value = null;
      sheetPresupuesto.getCell('E' + rowNum).value = null;
      
      sheetPresupuesto.getRow(rowNum).height = 20;
      ['B', 'C', 'D', 'E'].forEach(col => {
        const cell = sheetPresupuesto.getCell(col + rowNum);
        cell.fill = { type: 'pattern', pattern: 'none' };
        cell.border = {};
      });
    }
    
    // Style totals (rows 30, 31, 32)
    const rowSubtotal = sheetPresupuesto.getRow(30);
    const rowIva = sheetPresupuesto.getRow(31);
    const rowTotal = sheetPresupuesto.getRow(32);
    
    rowSubtotal.height = 24;
    rowIva.height = 24;
    rowTotal.height = 32;
    
    const subtotalLabel = sheetPresupuesto.getCell('D30');
    const subtotalVal = sheetPresupuesto.getCell('E30');
    const ivaLabel = sheetPresupuesto.getCell('D31');
    const ivaVal = sheetPresupuesto.getCell('E31');
    const totalLabel = sheetPresupuesto.getCell('D32');
    const totalVal = sheetPresupuesto.getCell('E32');
    
    // Subtotal
    subtotalVal.value = { formula: 'SUM(E14:E29)' };
    subtotalVal.numFormat = '€#,##0.00;(€#,##0.00);"-"';
    subtotalVal.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF475569' } };
    subtotalLabel.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF475569' } };
    
    // IVA
    ivaVal.value = { formula: 'E30*0.21' };
    ivaVal.numFormat = '€#,##0.00;(€#,##0.00);"-"';
    ivaVal.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF64748B' } };
    ivaLabel.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF64748B' } };
    
    // Total (Dark Slate blue for premium look, not bright red)
    totalVal.value = { formula: 'E30+E31' };
    totalVal.numFormat = '€#,##0.00;(€#,##0.00);"-"';
    totalVal.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FF0F172A' } };
    totalLabel.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF1E293B' } };
    totalVal.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'double', color: { argb: 'FF94A3B8' } }
    };
    totalLabel.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'double', color: { argb: 'FF94A3B8' } }
    };
    
    // Adjust column widths to avoid overflow or ### errors
    sheetPresupuesto.getColumn('B').width = 65; // Concepto
    sheetPresupuesto.getColumn('C').width = 12; // Uds
    sheetPresupuesto.getColumn('D').width = 18; // Precio
    sheetPresupuesto.getColumn('E').width = 20; // Total
    
    // Hide gridlines to keep it "liso"
    sheetPresupuesto.views = [{ showGridLines: false }];
    
    // Remove all other sheets to leave ONLY 'Presupuesto'
    const allSheets = workbook.worksheets.map(ws => ws.name);
    allSheets.forEach(name => {
      if (name !== 'Presupuesto') {
        const ws = workbook.getWorksheet(name);
        if (ws) {
          workbook.removeWorksheet(ws.id);
        }
      }
    });
    
    // Generate Buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Presupuesto_${selectedProject.Codigo || 'Exportado'}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setStatus('Presupuesto exportado a Excel.');
  } catch (err) {
    console.error('Error generating Excel:', err);
    setStatus(`Error al exportar Excel: ${err.message}`);
  }
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

      const promises = rawData.map(async (row) => {
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
          return true;
        }
        return false;
      });

      const results = await Promise.all(promises);
      const count = results.filter(Boolean).length;
      
      await refreshProjects();
      const elementsRes = await elementService.getAll(selectedProjectId);
      setElementos(elementsRes.data);
      setStatus(`Importadas ${count} partidas desde Excel.`);
    } catch (err) {
      setStatus(`Error al importar Excel: ${err.message}`);
    }
  };
  reader.readAsBinaryString(file);
  event.target.value = '';
};
