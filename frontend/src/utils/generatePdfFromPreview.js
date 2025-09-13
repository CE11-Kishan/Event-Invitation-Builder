import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Capture a DOM node (the invitation preview hero) and generate a PDF matching visible style.
export async function generateInvitationPdf(previewEl, filename = 'invitation.pdf') {
  if (!previewEl) throw new Error('Preview element not found');
  // Use html2canvas to rasterize
  const canvas = await html2canvas(previewEl, {
    backgroundColor: null,
    scale: 2, // higher DPI
    useCORS: true
  });
  const imgData = canvas.toDataURL('image/png');
  // Create PDF sized proportionally to the capture (portrait A4 fallback)
  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 60; // margin 30 each side
  const imgHeight = (canvas.height / canvas.width) * imgWidth;
  let y = (pageHeight - imgHeight) / 2;
  if (y < 30) y = 30;

  pdf.addImage(imgData, 'PNG', 30, y, imgWidth, imgHeight, undefined, 'FAST');
  pdf.save(filename);
}
