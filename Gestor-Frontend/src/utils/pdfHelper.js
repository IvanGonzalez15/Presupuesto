import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export const exportToPDF = async (elementId, filename = 'presupuesto.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  
  element.setAttribute('data-pdf-printing', 'true');
  
  
  const currentTheme = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', 'light');

  try {
    
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    
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
    
    element.removeAttribute('data-pdf-printing');
    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
};
