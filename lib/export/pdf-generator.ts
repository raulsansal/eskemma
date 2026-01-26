// lib/export/pdf-generator.ts
/**
 * Generador de documentos PDF usando Puppeteer
 * Convierte HTML a PDF para soporte completo de Unicode, emojis y layout profesional
 */

import puppeteer from 'puppeteer';
import {
  type StructuredContent,
  type LayerContent,
  type PhaseContent,
  type ContentSection,
  type ContentItem,
  type ContentTable,
} from './content-generator';

// ============================================================
// COLORES
// ============================================================

const COLORS = {
  primary: '#0D6E6E',
  secondary: '#4B5563',
  lightGray: '#F3F4F6',
  mediumGray: '#D1D5DB',
  darkGray: '#374151',
  white: '#FFFFFF',
  fundacion: '#3B82F6',
  estrategia: '#8B5CF6',
  operacion: '#10B981',
};

// ============================================================
// GENERADOR PRINCIPAL
// ============================================================

export async function generatePdf(
  content: StructuredContent,
  logoEskemmaBuffer?: Buffer,
  logoModduloBuffer?: Buffer
): Promise<Buffer> {
  // Convertir logos a base64 si están disponibles
  const logoEskemmaBase64 = logoEskemmaBuffer 
    ? `data:image/png;base64,${logoEskemmaBuffer.toString('base64')}` 
    : null;
  const logoModduloBase64 = logoModduloBuffer 
    ? `data:image/png;base64,${logoModduloBuffer.toString('base64')}` 
    : null;

  // Generar HTML
  const html = generateHTML(content, logoEskemmaBase64, logoModduloBase64);

  // Lanzar Puppeteer y generar PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Cargar el HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '25mm',
        left: '20mm',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; color: #6B7280; text-align: center; padding: 10px 20px;">
          <span>Generado con Moddulo | Eskemma</span>
          <span style="margin-left: 20px;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        </div>
      `,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

// ============================================================
// GENERADOR DE HTML
// ============================================================

function generateHTML(
  content: StructuredContent,
  logoEskemmaBase64: string | null,
  logoModduloBase64: string | null
): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(content.title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: ${COLORS.darkGray};
    }
    
    .page-break {
      page-break-after: always;
    }
    
    .avoid-break {
      page-break-inside: avoid;
    }
    
    /* Portada */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 85vh;
      text-align: center;
    }
    
    .cover-title {
      font-size: 28px;
      font-weight: bold;
      color: ${COLORS.primary};
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    
    .cover-project-name {
      font-size: 32px;
      font-weight: bold;
      color: ${COLORS.darkGray};
      margin-bottom: 20px;
    }
    
    .cover-divider {
      width: 200px;
      height: 3px;
      background: ${COLORS.primary};
      margin: 20px auto;
    }
    
    .cover-subtitle {
      font-size: 14px;
      font-style: italic;
      color: ${COLORS.secondary};
      margin-bottom: 10px;
    }
    
    .cover-scope {
      font-size: 12px;
      color: ${COLORS.secondary};
      margin-bottom: 40px;
    }
    
    .cover-date {
      font-size: 11px;
      color: ${COLORS.secondary};
      margin-top: 60px;
    }
    
    .cover-logos {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin-top: 20px;
    }
    
    .cover-logos img {
      height: 35px;
      width: auto;
      object-fit: contain;
    }
    
    .cover-branding {
      font-size: 10px;
      color: ${COLORS.secondary};
      margin-top: 20px;
    }
    
    /* Tabla de contenidos */
    .toc {
      padding: 20px 0;
    }
    
    .toc h1 {
      font-size: 22px;
      color: ${COLORS.primary};
      margin-bottom: 25px;
      border-bottom: 2px solid ${COLORS.primary};
      padding-bottom: 10px;
    }
    
    .toc-item {
      padding: 6px 0;
      border-bottom: 1px dotted ${COLORS.mediumGray};
    }
    
    .toc-layer {
      font-weight: bold;
      font-size: 12px;
      margin-top: 15px;
    }
    
    .toc-phase {
      padding-left: 20px;
      font-size: 11px;
      color: ${COLORS.secondary};
    }
    
    /* Secciones */
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: ${COLORS.primary};
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${COLORS.primary};
    }
    
    /* Metadata */
    .metadata-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .metadata-table tr {
      border-bottom: 1px solid ${COLORS.lightGray};
    }
    
    .metadata-table td {
      padding: 10px 12px;
      vertical-align: top;
    }
    
    .metadata-table td:first-child {
      width: 180px;
      font-weight: bold;
      background: ${COLORS.lightGray};
      color: ${COLORS.darkGray};
    }
    
    /* Capas */
    .layer {
      margin-bottom: 40px;
    }
    
    .layer-header {
      padding: 12px 15px;
      color: white;
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    
    .layer-fundacion .layer-header { background: ${COLORS.fundacion}; }
    .layer-estrategia .layer-header { background: ${COLORS.estrategia}; }
    .layer-operacion .layer-header { background: ${COLORS.operacion}; }
    
    /* Fases */
    .phase {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid ${COLORS.lightGray};
    }
    
    .phase:last-child {
      border-bottom: none;
    }
    
    .phase-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      margin-bottom: 15px;
      border-radius: 6px;
    }
    
    .layer-fundacion .phase-header { background: rgba(59, 130, 246, 0.1); }
    .layer-estrategia .phase-header { background: rgba(139, 92, 246, 0.1); }
    .layer-operacion .phase-header { background: rgba(16, 185, 129, 0.1); }
    
    .phase-icon {
      font-size: 18px;
    }
    
    .phase-name {
      font-size: 14px;
      font-weight: bold;
    }
    
    .layer-fundacion .phase-name { color: ${COLORS.fundacion}; }
    .layer-estrategia .phase-name { color: ${COLORS.estrategia}; }
    .layer-operacion .phase-name { color: ${COLORS.operacion}; }
    
    .phase-badge {
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: bold;
    }
    
    .badge-gate {
      background: ${COLORS.primary};
      color: white;
    }
    
    .badge-completed {
      background: #10B981;
      color: white;
    }
    
    .badge-progress {
      background: #F59E0B;
      color: white;
    }
    
    /* Contenido de secciones */
    .content-section {
      margin-bottom: 18px;
    }
    
    .content-section h3 {
      font-size: 12px;
      font-weight: bold;
      color: ${COLORS.darkGray};
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid ${COLORS.lightGray};
    }
    
    .content-section p {
      color: ${COLORS.secondary};
      margin-bottom: 8px;
      text-align: justify;
    }
    
    .content-section ul {
      list-style: none;
      padding-left: 0;
    }
    
    .content-section li {
      padding: 4px 0 4px 15px;
      position: relative;
      color: ${COLORS.secondary};
    }
    
    .content-section li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: ${COLORS.primary};
      font-weight: bold;
    }
    
    .content-section li strong {
      color: ${COLORS.darkGray};
    }
    
    /* Tablas de datos */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 10px;
    }
    
    .data-table th {
      padding: 10px 8px;
      text-align: left;
      font-weight: bold;
      color: white;
    }
    
    .layer-fundacion .data-table th { background: ${COLORS.fundacion}; }
    .layer-estrategia .data-table th { background: ${COLORS.estrategia}; }
    .layer-operacion .data-table th { background: ${COLORS.operacion}; }
    
    .data-table td {
      padding: 8px;
      border-bottom: 1px solid ${COLORS.lightGray};
      vertical-align: top;
    }
    
    .data-table tr:nth-child(even) td {
      background: ${COLORS.lightGray};
    }
    
    /* Íconos de fase sin emoji - usar texto */
    .icon-proposito::before { content: "●"; color: ${COLORS.fundacion}; }
    .icon-exploracion::before { content: "◉"; color: ${COLORS.fundacion}; }
    .icon-diagnostico::before { content: "◆"; color: ${COLORS.fundacion}; }
    .icon-estrategia::before { content: "♦"; color: ${COLORS.estrategia}; }
    .icon-tactica::before { content: "▸"; color: ${COLORS.estrategia}; }
    .icon-planeacion::before { content: "▪"; color: ${COLORS.estrategia}; }
    .icon-orquesta::before { content: "♪"; color: ${COLORS.operacion}; }
    .icon-pulso::before { content: "♥"; color: ${COLORS.operacion}; }
    .icon-evaluacion::before { content: "▲"; color: ${COLORS.operacion}; }
  </style>
</head>
<body>
  ${content.includeCover ? generateCoverHTML(content, logoEskemmaBase64, logoModduloBase64) : ''}
  
  ${content.includeTableOfContents ? generateTocHTML(content) : ''}
  
  ${generateMetadataHTML(content)}
  
  ${generateLayersHTML(content)}
</body>
</html>
  `;
}

// ============================================================
// GENERADORES DE SECCIONES HTML
// ============================================================

function generateCoverHTML(
  content: StructuredContent,
  logoEskemmaBase64: string | null,
  logoModduloBase64: string | null
): string {
  const logosHTML = (logoEskemmaBase64 || logoModduloBase64) ? `
    <div class="cover-logos">
      ${logoEskemmaBase64 ? `<img src="${logoEskemmaBase64}" alt="Eskemma">` : ''}
      ${logoModduloBase64 ? `<img src="${logoModduloBase64}" alt="Moddulo">` : ''}
    </div>
  ` : `<div class="cover-branding">Generado con Moddulo | Eskemma</div>`;

  return `
    <div class="cover">
      <div class="cover-title">PROYECTO ESTRATÉGICO</div>
      <div class="cover-project-name">${escapeHtml(content.title)}</div>
      <div class="cover-divider"></div>
      <div class="cover-subtitle">${escapeHtml(content.subtitle)}</div>
      <div class="cover-scope">${escapeHtml(content.exportScope)}</div>
      <div class="cover-date">Documento generado el ${escapeHtml(content.generatedAt)}</div>
      ${logosHTML}
    </div>
    <div class="page-break"></div>
  `;
}

function generateTocHTML(content: StructuredContent): string {
  let tocItems = `<div class="toc-item">1. Información General</div>`;
  
  let sectionNum = 2;
  for (const layer of content.layers) {
    const layerColorClass = `color: ${layer.id === 'fundacion' ? COLORS.fundacion : layer.id === 'estrategia' ? COLORS.estrategia : COLORS.operacion}`;
    
    tocItems += `
      <div class="toc-item toc-layer" style="${layerColorClass}">
        ${sectionNum}. Capa: ${escapeHtml(layer.name)}
      </div>
    `;
    
    for (const phase of layer.phases) {
      const gateLabel = phase.isGate ? ' [GATE]' : '';
      const phaseIconText = getPhaseIconText(phase.id);
      tocItems += `
        <div class="toc-item toc-phase">
          ${phaseIconText} ${escapeHtml(phase.name)}${gateLabel}
        </div>
      `;
    }
    
    sectionNum++;
  }

  return `
    <div class="toc">
      <h1>Contenido</h1>
      ${tocItems}
    </div>
    <div class="page-break"></div>
  `;
}

function generateMetadataHTML(content: StructuredContent): string {
  const rows = content.metadata.map(item => `
    <tr>
      <td>${escapeHtml(item.label || '')}</td>
      <td>${escapeHtml(item.value)}</td>
    </tr>
  `).join('');

  return `
    <div class="section">
      <h2 class="section-title">Información General</h2>
      <table class="metadata-table">
        ${rows}
      </table>
    </div>
    <div class="page-break"></div>
  `;
}

function generateLayersHTML(content: StructuredContent): string {
  return content.layers.map((layer, index) => {
    const layerClass = `layer layer-${layer.id}`;
    const phasesHTML = layer.phases.map(phase => generatePhaseHTML(phase, layer.id)).join('');
    const pageBreak = index < content.layers.length - 1 ? '<div class="page-break"></div>' : '';

    return `
      <div class="${layerClass}">
        <div class="layer-header">CAPA: ${escapeHtml(layer.name.toUpperCase())}</div>
        ${phasesHTML}
      </div>
      ${pageBreak}
    `;
  }).join('');
}

function generatePhaseHTML(phase: PhaseContent, layerId: string): string {
  const phaseIconText = getPhaseIconText(phase.id);
  const gateBadge = phase.isGate ? '<span class="phase-badge badge-gate">GATE</span>' : '';
  const statusBadge = phase.status === 'completed' 
    ? '<span class="phase-badge badge-completed">✓ Completada</span>'
    : phase.status === 'in-progress' 
      ? '<span class="phase-badge badge-progress">En progreso</span>' 
      : '';

  const sectionsHTML = phase.sections.map(section => generateSectionHTML(section)).join('');

  return `
    <div class="phase avoid-break">
      <div class="phase-header">
        <span class="phase-icon">${phaseIconText}</span>
        <span class="phase-name">${escapeHtml(phase.name)}</span>
        ${gateBadge}
        ${statusBadge}
      </div>
      ${sectionsHTML}
    </div>
  `;
}

function generateSectionHTML(section: ContentSection): string {
  let contentHTML = '';

  if (section.content) {
    contentHTML += `<p>${escapeHtml(section.content)}</p>`;
  }

  if (section.items && section.items.length > 0) {
    const itemsHTML = section.items.map(item => {
      if (item.label) {
        return `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}</li>`;
      }
      return `<li>${escapeHtml(item.value)}</li>`;
    }).join('');
    contentHTML += `<ul>${itemsHTML}</ul>`;
  }

  if (section.table) {
    contentHTML += generateTableHTML(section.table);
  }

  return `
    <div class="content-section avoid-break">
      <h3>${escapeHtml(section.title)}</h3>
      ${contentHTML}
    </div>
  `;
}

function generateTableHTML(table: ContentTable): string {
  const headersHTML = table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
  const rowsHTML = table.rows.map(row => {
    const cellsHTML = row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('');
    return `<tr>${cellsHTML}</tr>`;
  }).join('');

  return `
    <table class="data-table">
      <thead><tr>${headersHTML}</tr></thead>
      <tbody>${rowsHTML}</tbody>
    </table>
  `;
}

// ============================================================
// UTILIDADES
// ============================================================

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getPhaseIconText(phaseId: string): string {
  // Usar caracteres simples en lugar de emojis para mejor compatibilidad
  const icons: Record<string, string> = {
    proposito: '●',
    exploracion: '◉',
    diagnostico: '◆',
    estrategia: '♦',
    tactica: '▸',
    planeacion: '▪',
    orquesta: '♪',
    pulso: '♥',
    evaluacion: '▲',
  };
  return icons[phaseId] || '•';
}
