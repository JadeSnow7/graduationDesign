const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType,
        WidthType, BorderStyle, ShadingType, HeadingLevel, PageBreak } = require('docx');

// Utility function to create border
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

// Parse markdown and convert to docx
function createDocxFromMarkdown(mdContent, outputPath) {
  const lines = mdContent.split('\n');
  const children = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Main title
    if (line.startsWith('# ') && !line.startsWith('##')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: line.slice(2), bold: true, size: 32 })],
          spacing: { before: 0, after: 240 }
        })
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: line.slice(3), bold: true, size: 28 })],
          spacing: { before: 240, after: 120 }
        })
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: line.slice(4), bold: true, size: 26 })],
          spacing: { before: 180, after: 100 }
        })
      );
      i++;
      continue;
    }

    // Metadata (authors, keywords, etc.)
    if (line.startsWith('**') && line.includes('：')) {
      const parts = line.split('：');
      const label = parts[0].replace(/\*\*/g, '');
      const content = parts.slice(1).join('：').replace(/\*\*/g, '');

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: label + '： ', bold: true }),
            new TextRun({ text: content })
          ],
          spacing: { line: 240, after: 120 }
        })
      );
      i++;
      continue;
    }

    // Block quotes
    if (line.startsWith('> ')) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line.slice(2), italics: true })],
          spacing: { before: 120, after: 120 },
          indent: { left: 720 }
        })
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      children.push(new Paragraph({ children: [new PageBreak()] }));
      i++;
      continue;
    }

    // Tables
    if (line.includes('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }

      if (tableLines.length > 0) {
        const rows = tableLines
          .filter(l => l.trim() !== '' && !l.includes('---'))
          .map(l => l.split('|').filter(c => c.trim() !== '').map(c => c.trim()));

        if (rows.length > 0) {
          const colCount = rows[0].length;
          const colWidth = Math.floor(9360 / colCount); // US Letter width minus margins

          const tableRows = rows.map((row, rowIdx) =>
            new TableRow({
              children: row.map(cell =>
                new TableCell({
                  borders,
                  width: { size: colWidth, type: WidthType.DXA },
                  shading: rowIdx === 0 ? { fill: "D5E8F0", type: ShadingType.CLEAR } : undefined,
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, bold: rowIdx === 0 })],
                      alignment: AlignmentType.CENTER
                    })
                  ]
                })
              )
            })
          );

          children.push(
            new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: Array(colCount).fill(colWidth),
              rows: tableRows
            })
          );
          children.push(new Paragraph({ children: [new TextRun('')], spacing: { after: 120 } }));
        }
      }
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraphs
    if (line.trim() !== '') {
      // Parse inline formatting and formulas
      const runs = parseInlineFormats(line);
      children.push(
        new Paragraph({
          children: runs,
          spacing: { line: 280, after: 120 }
        })
      );
    }

    i++;
  }

  // Create document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children
    }]
  });

  // Write to file
  Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Created: ${outputPath}`);
  });
}

// Parse inline formatting
function parseInlineFormats(text) {
  const runs = [];
  let current = '';
  let i = 0;

  while (i < text.length) {
    // Bold
    if (text.substring(i, i + 2) === '**') {
      if (current) runs.push(new TextRun(current));
      current = '';
      i += 2;
      let bold = '';
      while (i < text.length && text.substring(i, i + 2) !== '**') {
        bold += text[i];
        i++;
      }
      runs.push(new TextRun({ text: bold, bold: true }));
      i += 2;
      continue;
    }

    // Italics
    if (text[i] === '_' || text[i] === '*') {
      if (current) runs.push(new TextRun(current));
      current = '';
      const marker = text[i];
      i++;
      let italic = '';
      while (i < text.length && text[i] !== marker) {
        italic += text[i];
        i++;
      }
      runs.push(new TextRun({ text: italic, italics: true }));
      i++;
      continue;
    }

    // Math formula (simple inline)
    if (text[i] === '$') {
      if (current) runs.push(new TextRun(current));
      current = '';
      i++;
      let formula = '';
      while (i < text.length && text[i] !== '$') {
        formula += text[i];
        i++;
      }
      runs.push(new TextRun({ text: formula, italics: true })); // Render as italics for now
      i++;
      continue;
    }

    current += text[i];
    i++;
  }

  if (current) runs.push(new TextRun(current));
  return runs.length > 0 ? runs : [new TextRun('')];
}

// Main
const ragMd = fs.readFileSync('/Users/huaodong/graduationDesign/academic/literature/translations/retrieval-augmented-generation-full.md', 'utf-8');
const transformerMd = fs.readFileSync('/Users/huaodong/graduationDesign/academic/literature/translations/attention-is-all-you-need-full.md', 'utf-8');

createDocxFromMarkdown(ragMd, '/Users/huaodong/graduationDesign/academic/literature/translations/retrieval-augmented-generation-full.docx');
createDocxFromMarkdown(transformerMd, '/Users/huaodong/graduationDesign/academic/literature/translations/attention-is-all-you-need-full.docx');
