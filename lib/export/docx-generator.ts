// lib/export/docx-generator.ts
/**
 * Generador de documentos DOCX usando docx-js
 * Sigue las mejores prácticas del SKILL.md
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  PageBreak,
  LevelFormat,
  ImageRun,
  TableOfContents,
} from 'docx';
import {
  type StructuredContent,
  type LayerContent,
  type PhaseContent,
  type ContentSection,
  type ContentItem,
  type ContentTable,
} from './content-generator';

// ============================================================
// CONSTANTES DE ESTILO
// ============================================================

const COLORS = {
  primary: '0D6E6E',      // bluegreen-eske
  secondary: '4B5563',    // gray-700
  lightGray: 'F3F4F6',    // gray-100
  mediumGray: 'D1D5DB',   // gray-300
  white: 'FFFFFF',
  fundacion: '3B82F6',    // blue
  estrategia: '8B5CF6',   // purple
  operacion: '10B981',    // green
};

const FONTS = {
  default: 'Arial',
  heading: 'Arial',
};

// DXA units: 1440 = 1 inch
const PAGE_CONFIG = {
  width: 12240,       // 8.5 inches (US Letter)
  height: 15840,      // 11 inches
  marginTop: 1440,    // 1 inch
  marginRight: 1440,
  marginBottom: 1440,
  marginLeft: 1440,
};

// ============================================================
// GENERADOR PRINCIPAL
// ============================================================

export async function generateDocx(
  content: StructuredContent,
  logoEskemmaBuffer?: Buffer,
  logoModduloBuffer?: Buffer
): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Portada (condicional)
  if (content.includeCover) {
    children.push(...generateCoverPage(content, logoEskemmaBuffer, logoModduloBuffer));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Tabla de contenidos (condicional)
  if (content.includeTableOfContents) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Contenido', bold: true })],
      })
    );
    children.push(new TableOfContents('Tabla de Contenidos', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Información general
  children.push(...generateMetadataSection(content));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Capas y fases
  for (const layer of content.layers) {
    children.push(...generateLayerSection(layer));
  }

  // Crear documento
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONTS.default,
            size: 24, // 12pt
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 36,
            bold: true,
            font: FONTS.heading,
            color: COLORS.primary,
          },
          paragraph: {
            spacing: { before: 400, after: 200 },
            outlineLevel: 0,
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 30,
            bold: true,
            font: FONTS.heading,
            color: COLORS.secondary,
          },
          paragraph: {
            spacing: { before: 300, after: 150 },
            outlineLevel: 1,
          },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 26,
            bold: true,
            font: FONTS.heading,
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
            outlineLevel: 2,
          },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
        {
          reference: 'numbers',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PAGE_CONFIG.width,
              height: PAGE_CONFIG.height,
            },
            margin: {
              top: PAGE_CONFIG.marginTop,
              right: PAGE_CONFIG.marginRight,
              bottom: PAGE_CONFIG.marginBottom,
              left: PAGE_CONFIG.marginLeft,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: content.title,
                    size: 18,
                    color: COLORS.secondary,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Generado con Moddulo | Eskemma  •  Página ',
                    size: 18,
                    color: COLORS.secondary,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: COLORS.secondary,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  // Generar buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer as Buffer;
}

// ============================================================
// PORTADA
// ============================================================

function generateCoverPage(
  content: StructuredContent,
  logoEskemmaBuffer?: Buffer,
  logoModduloBuffer?: Buffer
): Paragraph[] {
  const coverElements: Paragraph[] = [
    // Espaciado superior
    new Paragraph({ spacing: { before: 2000 } }),
    
    // Título principal
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: 'PROYECTO ESTRATÉGICO',
          bold: true,
          size: 48,
          color: COLORS.primary,
          font: FONTS.heading,
        }),
      ],
    }),
    
    // Nombre del proyecto
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: content.title,
          bold: true,
          size: 56,
          color: COLORS.secondary,
          font: FONTS.heading,
        }),
      ],
    }),
    
    // Línea decorativa
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          color: COLORS.primary,
          size: 24,
        }),
      ],
    }),
    
    // Subtítulo
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: content.subtitle,
          size: 28,
          color: COLORS.secondary,
          italics: true,
        }),
      ],
    }),
    
    // Alcance del reporte
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: content.exportScope,
          size: 24,
          color: COLORS.secondary,
        }),
      ],
    }),
    
    // Espaciado
    new Paragraph({ spacing: { before: 2500 } }),
    
    // Fecha de generación
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Documento generado el ${content.generatedAt}`,
          size: 22,
          color: COLORS.secondary,
        }),
      ],
    }),
  ];

  // Agregar logos si están disponibles
  // Logo Eskemma: rectangular ~3:1 ratio, Logo Moddulo: cuadrado
  if (logoEskemmaBuffer || logoModduloBuffer) {
    coverElements.push(new Paragraph({ spacing: { before: 500 } }));
    
    const logoChildren: (TextRun | ImageRun)[] = [];
    
    // Dimensiones: Eskemma rectangular (90x30), Moddulo cuadrado (30x30)
    const eskemmaWidth = 90;
    const eskemmaHeight = 30;
    const modduloSize = 30;
    
    if (logoEskemmaBuffer) {
      logoChildren.push(
        new ImageRun({
          type: 'png',
          data: logoEskemmaBuffer,
          transformation: { width: eskemmaWidth, height: eskemmaHeight },
          altText: { title: 'Eskemma', description: 'Logo de Eskemma', name: 'eskemma-logo' },
        })
      );
    }
    
    if (logoEskemmaBuffer && logoModduloBuffer) {
      // Espacio entre logos
      logoChildren.push(new TextRun({ text: '    ', size: 22 }));
    }
    
    if (logoModduloBuffer) {
      logoChildren.push(
        new ImageRun({
          type: 'png',
          data: logoModduloBuffer,
          transformation: { width: modduloSize, height: modduloSize },
          altText: { title: 'Moddulo', description: 'Logo de Moddulo', name: 'moddulo-logo' },
        })
      );
    }

    coverElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: logoChildren,
      })
    );
  }

  return coverElements;
}

// ============================================================
// SECCIÓN DE METADATA
// ============================================================

function generateMetadataSection(content: StructuredContent): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Información General', bold: true })],
    })
  );

  // Tabla de metadata
  const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.mediumGray };
  const borders = { top: border, bottom: border, left: border, right: border };

  const rows = content.metadata.map(
    (item) =>
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 3000, type: WidthType.DXA },
            shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.label || '',
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders,
            width: { size: 6360, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.value,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [3000, 6360],
      rows,
    })
  );

  return elements;
}

// ============================================================
// SECCIÓN DE CAPA
// ============================================================

function generateLayerSection(layer: LayerContent): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Título de capa
  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: `CAPA: ${layer.name.toUpperCase()}`,
          bold: true,
          color: layer.color.replace('#', ''),
        }),
      ],
    })
  );

  // Fases de la capa
  for (const phase of layer.phases) {
    elements.push(...generatePhaseSection(phase, layer.color));
  }

  // Salto de página después de cada capa
  elements.push(new Paragraph({ children: [new PageBreak()] }));

  return elements;
}

// ============================================================
// SECCIÓN DE FASE
// ============================================================

function generatePhaseSection(phase: PhaseContent, layerColor: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Título de fase
  const statusText = phase.status === 'completed' 
    ? ' ✓ Completada' 
    : phase.status === 'in-progress' 
      ? ` (${phase.progress}% en progreso)` 
      : ' (Sin iniciar)';

  const gateText = phase.isGate ? ' [GATE]' : '';

  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: `${phase.icon} ${phase.name}${gateText}`,
          bold: true,
        }),
        new TextRun({
          text: statusText,
          size: 20,
          italics: true,
          color: phase.status === 'completed' ? '10B981' : COLORS.secondary,
        }),
      ],
    })
  );

  // Secciones de la fase
  if (phase.sections.length === 0) {
    elements.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: 'Esta fase no tiene datos registrados.',
            italics: true,
            color: COLORS.secondary,
          }),
        ],
      })
    );
  } else {
    for (const section of phase.sections) {
      elements.push(...generateContentSection(section));
    }
  }

  return elements;
}

// ============================================================
// SECCIÓN DE CONTENIDO
// ============================================================

function generateContentSection(section: ContentSection): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Título de sección
  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      children: [new TextRun({ text: section.title, bold: true })],
    })
  );

  // Contenido de texto
  if (section.content) {
    elements.push(
      new Paragraph({
        spacing: { before: 80, after: 160 },
        children: [new TextRun({ text: section.content, size: 22 })],
      })
    );
  }

  // Lista de items
  if (section.items && section.items.length > 0) {
    for (const item of section.items) {
      elements.push(generateContentItem(item));
    }
  }

  // Tabla
  if (section.table) {
    elements.push(generateContentTable(section.table));
  }

  return elements;
}

// ============================================================
// ITEMS DE CONTENIDO
// ============================================================

function generateContentItem(item: ContentItem): Paragraph {
  const children: TextRun[] = [];

  if (item.label) {
    children.push(
      new TextRun({
        text: `${item.label}: `,
        bold: true,
        size: 22,
      })
    );
  }

  children.push(
    new TextRun({
      text: item.value,
      size: 22,
    })
  );

  if (item.type === 'bullet') {
    return new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      spacing: { before: 40, after: 40 },
      children,
    });
  }

  if (item.type === 'number') {
    return new Paragraph({
      numbering: { reference: 'numbers', level: 0 },
      spacing: { before: 40, after: 40 },
      children,
    });
  }

  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children,
  });
}

// ============================================================
// TABLAS
// ============================================================

function generateContentTable(table: ContentTable): Table {
  const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.mediumGray };
  const borders = { top: border, bottom: border, left: border, right: border };

  // Calcular ancho de columnas
  const numCols = table.headers.length;
  const totalWidth = 9360; // Content width in DXA
  const colWidth = Math.floor(totalWidth / numCols);
  const columnWidths = Array(numCols).fill(colWidth);

  // Header row
  const headerRow = new TableRow({
    children: table.headers.map(
      (header) =>
        new TableCell({
          borders,
          width: { size: colWidth, type: WidthType.DXA },
          shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: header,
                  bold: true,
                  color: COLORS.white,
                  size: 20,
                }),
              ],
            }),
          ],
        })
    ),
  });

  // Data rows
  const dataRows = table.rows.map(
    (row, rowIndex) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              borders,
              width: { size: colWidth, type: WidthType.DXA },
              shading: rowIndex % 2 === 0 
                ? { fill: COLORS.white, type: ShadingType.CLEAR }
                : { fill: COLORS.lightGray, type: ShadingType.CLEAR },
              margins: { top: 60, bottom: 60, left: 80, right: 80 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell || '-',
                      size: 20,
                    }),
                  ],
                }),
              ],
            })
        ),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths,
    rows: [headerRow, ...dataRows],
  });
}
