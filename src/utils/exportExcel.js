import ExcelJS from 'exceljs';

/**
 * Export data as a styled .xlsx file with the company logo in the header.
 * @param {Object} options
 * @param {string[][]} options.rows     - 2D array: first row = headers, rest = data
 * @param {string}     options.filename - Output filename (without extension)
 * @param {string}     options.title    - Report title shown below the logo
 * @param {string}     [options.logoUrl] - URL/path to logo image (default: /assets/cxlogo.png)
 */
export async function exportToExcel({ rows, filename, title = 'Ticket Report', logoUrl }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'JKDM CRM';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Report', {
    views: [{ showGridLines: true }],
  });

  const headers = rows[0] || [];
  const dataRows = rows.slice(1);
  const colCount = headers.length;

  // ── Logos (cxlogo left, custom right) ────────────────────────────────────
  const fetchImage = async (src) => {
    try {
      const res = await fetch(src);
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      const ext = src.split('.').pop().toLowerCase();
      const mime = ext === 'jpeg' || ext === 'jpg' ? 'jpeg' : 'png';
      return workbook.addImage({ buffer: buf, extension: mime });
    } catch {
      return null;
    }
  };

  const [cxImageId, customImageId] = await Promise.all([
    fetchImage(logoUrl || '/assets/cxlogo.png'),
    fetchImage('/assets/custom.png'),
  ]);

  // Reserve rows 1-4 for logo + title block; data starts at row 6
  const LOGO_ROWS = 4;
  const TITLE_ROW = 5;
  const HEADER_ROW = 6;

  // Set row heights for the logo area
  for (let r = 1; r <= LOGO_ROWS; r++) {
    sheet.getRow(r).height = 18;
  }

  // cxlogo on the left (cols 0-2)
  if (cxImageId !== null) {
    sheet.addImage(cxImageId, {
      tl: { col: 0, row: 0 },
      br: { col: 2, row: LOGO_ROWS },
      editAs: 'oneCell',
    });
  }

  // custom logo on the right (cols 3-5)
  if (customImageId !== null) {
    sheet.addImage(customImageId, {
      tl: { col: 3, row: 0 },
      br: { col: 5, row: LOGO_ROWS },
      editAs: 'oneCell',
    });
  }

  // ── Title row ──────────────────────────────────────────────────────────────
  sheet.getRow(TITLE_ROW).height = 24;
  const titleCell = sheet.getCell(TITLE_ROW, 1);
  titleCell.value = title;
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF1E3A5F' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // Generated on info
  const genCell = sheet.getCell(TITLE_ROW, colCount);
  genCell.value = `Generated: ${new Date().toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}`;
  genCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF666666' } };
  genCell.alignment = { vertical: 'middle', horizontal: 'right' };

  // ── Header row ─────────────────────────────────────────────────────────────
  const headerRow = sheet.getRow(HEADER_ROW);
  headerRow.height = 20;
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1E3A5F' } },
      bottom: { style: 'thin', color: { argb: 'FF1E3A5F' } },
      left: { style: 'thin', color: { argb: 'FF1E3A5F' } },
      right: { style: 'thin', color: { argb: 'FF1E3A5F' } },
    };
  });

  // ── Data rows ──────────────────────────────────────────────────────────────
  dataRows.forEach((rowData, rowIdx) => {
    const row = sheet.getRow(HEADER_ROW + 1 + rowIdx);
    row.height = 16;
    const isEven = rowIdx % 2 === 1;
    rowData.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val ?? '';
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFF0F4FA' : 'FFFFFFFF' },
      };
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } },
      };
    });
  });

  // ── Column widths (auto-fit based on header length, min 12) ────────────────
  headers.forEach((h, i) => {
    const col = sheet.getColumn(i + 1);
    const maxLen = Math.max(
      h.length,
      ...dataRows.map(r => String(r[i] ?? '').length)
    );
    col.width = Math.min(Math.max(maxLen + 2, 12), 40);
  });

  // ── Write & download ───────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
