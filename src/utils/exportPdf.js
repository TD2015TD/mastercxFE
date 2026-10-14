import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data as a styled PDF with company logos in the header.
 * @param {Object} options
 * @param {string[][]} options.rows     - 2D array: first row = headers, rest = data
 * @param {string}     options.filename - Output filename (without extension)
 * @param {string}     options.title    - Report title shown in the header
 */
export async function exportToPdf({ rows, filename, title = 'Report' }) {
  const headers = rows[0] || [];
  const dataRows = rows.slice(1);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  let cursorY = 10;

  // ── Load logos ───────────────────────────────────────────────────────────
  const loadImage = async (src) => {
    try {
      const res = await fetch(src);
      if (!res.ok) return null;
      const bytes = new Uint8Array(await res.arrayBuffer());
      const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
      if (pngSignature.every((byte, index) => bytes[index] === byte)) {
        return { bytes, format: 'PNG' };
      }
      if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
        return { bytes, format: 'JPEG' };
      }
      console.warn(`Skipping report logo: ${src} did not return a PNG or JPEG image.`);
      return null;
    } catch {
      return null;
    }
  };

  const [cxBuf, customBuf] = await Promise.all([
    loadImage('/assets/cxlogo.png'),
    loadImage('/Mitel2.png'),
    
  ]);

  const logoH = 18; // mm height for logos
  const logoW = Math.round(logoH * (120 / 72)); // keep aspect ratio ~1.67
  const mitelSize = customBuf
  ? doc.getImageProperties(customBuf.bytes)
  : null;

const customW = mitelSize
  ? logoH * (mitelSize.width / mitelSize.height)
  : 25;

  if (cxBuf) {
  doc.addImage(cxBuf.bytes, cxBuf.format,
    marginX, cursorY, logoW, logoH);
}

if (customBuf) {
  doc.addImage(customBuf.bytes, customBuf.format,
    marginX + logoW + 5, cursorY, customW, logoH);
}



  // ── Header background bar ────────────────────────────────────────────────
  // Draw a dark-blue bar on the right side of the header for the title
  const barX = marginX + logoW + customW + 10;
  const barW = pageWidth - barX - marginX;

  doc.setFillColor(10, 36, 99); // dark navy
  doc.rect(barX, cursorY, barW, logoH, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, barX + 4, cursorY + logoH / 2 + 2);

  doc.setTextColor(200, 210, 230);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const generatedAt = `Generated: ${new Date().toLocaleString('en-MY', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`;
  doc.text(generatedAt, barX + 4, cursorY + logoH - 3);

  cursorY += logoH + 4;

  // ── Table ────────────────────────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: cursorY,
    head: [headers],
    body: dataRows,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [10, 36, 99],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [235, 241, 255],
    },
    didDrawPage: (data) => {
      // Footer with page number
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    },
  });

  doc.save(`${filename}.pdf`);
}
