import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Convierte un elemento HTML en un PDF de alta calidad,
 * forzando temporalmente el tema claro para que el PDF
 * se imprima en fondo blanco y texto oscuro.
 * 
 * @param {string} elementId ID del elemento HTML a convertir.
 * @param {string} filename Nombre del archivo PDF resultante.
 */
export const exportToPDF = async (elementId, filename = 'presupuesto.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Activar temporalmente el estilo de impresión PDF
  element.setAttribute('data-pdf-printing', 'true');
  
  // Guardar el tema actual y cambiar a light temporalmente para la captura
  const currentTheme = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', 'light');

  try {
    // Breve pausa para dar tiempo al navegador a repintar con el tema light
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 2, // Escala alta para nítidez del texto
      useCORS: true, // Permitir capturar imágenes de otros dominios
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Crear PDF en formato A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // Ancho A4 en mm
    const pageHeight = 297; // Alto A4 en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Agregar la primera página
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Manejar paginación
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    alert('Ocurrió un error al generar el PDF: ' + error.message);
  } finally {
    // Restaurar los atributos originales
    element.removeAttribute('data-pdf-printing');
    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
};
