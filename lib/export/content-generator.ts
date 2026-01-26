// lib/export/content-generator.ts
/**
 * Genera el contenido estructurado del proyecto para exportación
 * Este módulo extrae y formatea los datos del proyecto para ser
 * consumidos por los generadores de DOCX y PDF
 */

import {
  type StrategyProject,
  type PhaseId,
  type PropositoData,
  type ExploracionData,
  type DiagnosticoData,
  type EstrategiaData,
  type TacticaData,
  type PlaneacionData,
  type OrquestaData,
  type PulsoData,
  type EvaluacionData,
  type LayerId,
  type FODAItem,
  type StrategicSegment,
} from '@/types/strategy-context.types';
import { 
  PHASE_NAMES, 
  LAYER_NAMES, 
  PHASE_TO_LAYER_MAP, 
  LAYER_PHASES,
  LAYER_COLORS,
  PHASE_ICONS,
  getEffectivePhases,
  type ExportOptions 
} from './export.types';

// ============================================================
// TIPOS PARA CONTENIDO ESTRUCTURADO
// ============================================================

export interface ContentSection {
  title: string;
  level: 'h1' | 'h2' | 'h3' | 'h4';
  content?: string;
  items?: ContentItem[];
  table?: ContentTable;
  status?: 'completed' | 'in-progress' | 'not-started';
}

export interface ContentItem {
  label?: string;
  value: string;
  type?: 'text' | 'bullet' | 'number';
  subItems?: ContentItem[];
}

export interface ContentTable {
  headers: string[];
  rows: string[][];
}

export interface StructuredContent {
  title: string;
  subtitle: string;
  metadata: ContentItem[];
  layers: LayerContent[];
  generatedAt: string;
  exportScope: string;
  includeCover: boolean;
  includeTableOfContents: boolean;
}

export interface LayerContent {
  id: LayerId;
  name: string;
  color: string;
  phases: PhaseContent[];
}

export interface PhaseContent {
  id: PhaseId;
  name: string;
  icon: string;
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number;
  sections: ContentSection[];
  isGate?: boolean;
}

// ============================================================
// GENERADOR PRINCIPAL
// ============================================================

export function generateStructuredContent(
  project: StrategyProject,
  options: ExportOptions
): StructuredContent {
  const now = new Date();
  const effectivePhases = getEffectivePhases(options);
  
  // Determinar texto de alcance
  let exportScope = 'Proyecto completo';
  if (options.scope === 'layers') {
    const layerNames = options.selectedLayers.map(l => LAYER_NAMES[l]).join(', ');
    exportScope = `Capas: ${layerNames}`;
  } else if (options.scope === 'phases') {
    if (effectivePhases.length === 1) {
      exportScope = `Fase: ${PHASE_NAMES[effectivePhases[0]]}`;
    } else {
      exportScope = `${effectivePhases.length} fases seleccionadas`;
    }
  }
  
  return {
    title: project.projectName,
    subtitle: 'Proyecto Estratégico - Metodología Tercera Vía',
    metadata: generateMetadata(project, exportScope),
    layers: generateLayers(project, options, effectivePhases),
    generatedAt: now.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    exportScope,
    includeCover: options.includeCover,
    includeTableOfContents: options.includeTableOfContents,
  };
}

// ============================================================
// METADATA DEL PROYECTO
// ============================================================

function generateMetadata(project: StrategyProject, exportScope: string): ContentItem[] {
  const campaignTypeLabels: Record<string, string> = {
    'electoral-ejecutivo': 'Electoral - Ejecutivo',
    'electoral-legislativo': 'Electoral - Legislativo',
    'electoral-partido': 'Electoral - Partido',
    'gobierno': 'Gobierno',
    'movimiento': 'Movimiento Social',
    'corporativo': 'Corporativo',
  };

  const statusLabels: Record<string, string> = {
    'draft': 'Borrador',
    'active': 'Activo',
    'paused': 'Pausado',
    'completed': 'Completado',
    'archived': 'Archivado',
  };

  return [
    { label: 'Tipo de campaña', value: campaignTypeLabels[project.campaignType] || project.campaignType },
    { label: 'Jurisdicción', value: `${project.jurisdiction.stateName || project.jurisdiction.countryName} (${project.jurisdiction.level})` },
    { label: 'Modo', value: project.mode === 'generador' ? 'Generador' : 'Refinador' },
    { label: 'Estado', value: statusLabels[project.status] || project.status },
    { label: 'Fase actual', value: PHASE_NAMES[project.currentPhase] },
    { label: 'Fases completadas', value: `${project.completedPhases.length} de 9` },
    { label: 'Fecha de creación', value: project.createdAt.toDate().toLocaleDateString('es-MX') },
    { label: 'Alcance del reporte', value: exportScope },
  ];
}

// ============================================================
// GENERACIÓN DE CAPAS
// ============================================================

function generateLayers(
  project: StrategyProject, 
  options: ExportOptions,
  effectivePhases: PhaseId[]
): LayerContent[] {
  const layers: LayerContent[] = [];

  const layerOrder: LayerId[] = ['fundacion', 'estrategia', 'operacion'];

  for (const layerId of layerOrder) {
    const layerPhaseIds = LAYER_PHASES[layerId];
    const filteredPhases = layerPhaseIds.filter(p => effectivePhases.includes(p));
    
    if (filteredPhases.length === 0) continue;

    const phaseContents: PhaseContent[] = [];

    for (const phaseId of filteredPhases) {
      const phaseContent = generatePhaseContent(project, phaseId, options);
      
      if (!options.includeEmptyPhases && phaseContent.sections.length === 0) {
        continue;
      }

      phaseContents.push(phaseContent);
    }

    if (phaseContents.length > 0) {
      layers.push({
        id: layerId,
        name: LAYER_NAMES[layerId],
        color: LAYER_COLORS[layerId],
        phases: phaseContents,
      });
    }
  }

  return layers;
}

// ============================================================
// GENERACIÓN DE FASES
// ============================================================

function generatePhaseContent(
  project: StrategyProject,
  phaseId: PhaseId,
  options: ExportOptions
): PhaseContent {
  const gatePhases: PhaseId[] = ['diagnostico', 'planeacion', 'evaluacion'];

  const isCompleted = project.completedPhases.includes(phaseId);
  const progress = project.phaseProgress[phaseId]?.completionPercentage || 0;
  const status = isCompleted ? 'completed' : progress > 0 ? 'in-progress' : 'not-started';

  let sections: ContentSection[] = [];

  switch (phaseId) {
    case 'proposito':
      sections = generatePropositoSections(project.fundacion?.proposito);
      break;
    case 'exploracion':
      sections = generateExploracionSections(project.fundacion?.exploracion);
      break;
    case 'diagnostico':
      sections = generateDiagnosticoSections(project.fundacion?.diagnostico);
      break;
    case 'estrategia':
      sections = generateEstrategiaSections(project.estrategia?.estrategia);
      break;
    case 'tactica':
      sections = generateTacticaSections(project.estrategia?.tactica);
      break;
    case 'planeacion':
      sections = generatePlaneacionSections(project.estrategia?.planeacion);
      break;
    case 'orquesta':
      sections = generateOrquestaSections(project.operacion?.orquesta);
      break;
    case 'pulso':
      sections = generatePulsoSections(project.operacion?.pulso);
      break;
    case 'evaluacion':
      sections = generateEvaluacionSections(project.operacion?.evaluacion);
      break;
  }

  return {
    id: phaseId,
    name: PHASE_NAMES[phaseId],
    icon: PHASE_ICONS[phaseId],
    status,
    progress,
    sections,
    isGate: gatePhases.includes(phaseId),
  };
}

// ============================================================
// SECCIONES POR FASE
// ============================================================

function generatePropositoSections(data?: PropositoData): ContentSection[] {
  if (!data) return [];
  
  const sections: ContentSection[] = [];

  if (data.missionStatement) {
    sections.push({
      title: 'Declaración de Misión',
      level: 'h3',
      content: data.missionStatement,
    });
  }

  if (data.visionStatement) {
    sections.push({
      title: 'Declaración de Visión',
      level: 'h3',
      content: data.visionStatement,
    });
  }

  if (data.coreValues && data.coreValues.length > 0) {
    sections.push({
      title: 'Valores Fundamentales',
      level: 'h3',
      items: data.coreValues.map(v => ({ value: v, type: 'bullet' as const })),
    });
  }

  if (data.uniqueValue) {
    sections.push({
      title: 'Propuesta de Valor Única',
      level: 'h3',
      content: data.uniqueValue,
    });
  }

  if (data.primaryAudience) {
    const audience = data.primaryAudience;
    const items: ContentItem[] = [
      { label: 'Nombre', value: audience.name },
      { label: 'Descripción', value: audience.description },
      { label: 'Prioridad', value: audience.priority },
    ];
    
    if (audience.size) {
      items.push({ label: 'Tamaño', value: audience.size });
    }

    sections.push({
      title: 'Audiencia Principal',
      level: 'h3',
      items,
    });
  }

  if (data.secondaryAudiences && data.secondaryAudiences.length > 0) {
    sections.push({
      title: 'Audiencias Secundarias',
      level: 'h3',
      items: data.secondaryAudiences.map(a => ({
        label: a.name,
        value: `${a.description} (${a.priority})`,
        type: 'bullet' as const,
      })),
    });
  }

  return sections;
}

function generateExploracionSections(data?: ExploracionData): ContentSection[] {
  if (!data) return [];
  
  const sections: ContentSection[] = [];

  if (data.quantitativeInsights && data.quantitativeInsights.length > 0) {
    sections.push({
      title: 'Datos Cuantitativos',
      level: 'h3',
      table: {
        headers: ['Métrica', 'Valor', 'Fuente', 'Tendencia'],
        rows: data.quantitativeInsights.map(i => [
          i.metric,
          String(i.value),
          i.source,
          i.trend === 'up' ? '↑ Al alza' : i.trend === 'down' ? '↓ A la baja' : '→ Estable'
        ]),
      },
    });
  }

  if (data.qualitativeInsights && data.qualitativeInsights.length > 0) {
    sections.push({
      title: 'Insights Cualitativos',
      level: 'h3',
      items: data.qualitativeInsights.map(i => ({
        label: `[${i.category}] Relevancia: ${i.relevance}`,
        value: i.insight,
        type: 'bullet' as const,
      })),
    });
  }

  if (data.electoralContext) {
    const ctx = data.electoralContext;
    const items: ContentItem[] = [];
    
    if (ctx.electionDate) items.push({ label: 'Fecha de elección', value: ctx.electionDate });
    if (ctx.expectedTurnout) items.push({ label: 'Participación esperada', value: `${ctx.expectedTurnout}%` });
    if (ctx.mainCompetitors?.length) items.push({ label: 'Competidores', value: ctx.mainCompetitors.join(', ') });
    if (ctx.keyIssues?.length) items.push({ label: 'Temas clave', value: ctx.keyIssues.join(', ') });

    if (items.length > 0) {
      sections.push({
        title: 'Contexto Electoral',
        level: 'h3',
        items,
      });
    }
  }

  if (data.sources && data.sources.length > 0) {
    sections.push({
      title: 'Fuentes de Información',
      level: 'h3',
      items: data.sources.map(s => ({
        label: s.type,
        value: s.url ? `${s.name} - ${s.url}` : s.name,
        type: 'bullet' as const,
      })),
    });
  }

  return sections;
}

function generateDiagnosticoSections(data?: DiagnosticoData): ContentSection[] {
  if (!data) return [];
  
  const sections: ContentSection[] = [];

  // FODA - usando el nombre correcto 'foda'
  if (data.foda) {
    const foda = data.foda;
    
    const formatFodaItems = (items: FODAItem[]): ContentItem[] => {
      return items.map(item => ({
        value: `${item.description} (Impacto: ${item.impact}${item.actionable ? ', Accionable' : ''})`,
        type: 'bullet' as const,
      }));
    };

    if (foda.fortalezas?.length) {
      sections.push({
        title: 'Fortalezas',
        level: 'h3',
        items: formatFodaItems(foda.fortalezas),
      });
    }

    if (foda.oportunidades?.length) {
      sections.push({
        title: 'Oportunidades',
        level: 'h3',
        items: formatFodaItems(foda.oportunidades),
      });
    }

    if (foda.debilidades?.length) {
      sections.push({
        title: 'Debilidades',
        level: 'h3',
        items: formatFodaItems(foda.debilidades),
      });
    }

    if (foda.amenazas?.length) {
      sections.push({
        title: 'Amenazas',
        level: 'h3',
        items: formatFodaItems(foda.amenazas),
      });
    }
  }

  // PESTEL
  if (data.pestel) {
    const pestel = data.pestel;
    const pestelItems: ContentItem[] = [];
    
    if (pestel.political?.length) pestelItems.push({ label: 'Político', value: pestel.political.join('; ') });
    if (pestel.economic?.length) pestelItems.push({ label: 'Económico', value: pestel.economic.join('; ') });
    if (pestel.social?.length) pestelItems.push({ label: 'Social', value: pestel.social.join('; ') });
    if (pestel.technological?.length) pestelItems.push({ label: 'Tecnológico', value: pestel.technological.join('; ') });
    if (pestel.environmental?.length) pestelItems.push({ label: 'Ambiental', value: pestel.environmental.join('; ') });
    if (pestel.legal?.length) pestelItems.push({ label: 'Legal', value: pestel.legal.join('; ') });

    if (pestelItems.length > 0) {
      sections.push({
        title: 'Análisis PESTEL',
        level: 'h3',
        items: pestelItems,
      });
    }
  }

  // Evaluación de Viabilidad
  if (data.viabilityAssessment) {
    const va = data.viabilityAssessment;
    sections.push({
      title: 'Evaluación de Viabilidad',
      level: 'h3',
      items: [
        { label: 'Recursos disponibles', value: va.resourcesAvailable ? 'Sí' : 'No' },
        { label: 'Tiempo factible', value: va.timeframeFeasible ? 'Sí' : 'No' },
        { label: 'Audiencia alcanzable', value: va.audienceReachable ? 'Sí' : 'No' },
        { label: 'Ventaja competitiva', value: va.competitiveAdvantage ? 'Sí' : 'No' },
        { label: 'Puntuación general', value: `${va.overallScore}/100` },
      ],
    });

    if (va.risks?.length) {
      sections.push({
        title: 'Riesgos Identificados',
        level: 'h3',
        table: {
          headers: ['Riesgo', 'Probabilidad', 'Impacto', 'Mitigación'],
          rows: va.risks.map(r => [
            r.description,
            r.probability,
            r.impact,
            r.mitigation || '-'
          ]),
        },
      });
    }
  }

  // Evaluación Ética
  if (data.ethicsAssessment) {
    const ea = data.ethicsAssessment;
    sections.push({
      title: 'Evaluación Ética',
      level: 'h3',
      items: [
        { label: 'Pasa evaluación ética', value: ea.passesEthicsCheck ? '✓ Sí' : '✗ No' },
        ...(ea.commitments?.length ? [{ label: 'Compromisos', value: ea.commitments.join(', ') }] : []),
      ],
    });

    if (ea.concerns?.length) {
      sections.push({
        title: 'Preocupaciones Éticas',
        level: 'h3',
        items: ea.concerns.map(c => ({
          label: `[${c.area}] ${c.severity}`,
          value: c.description + (c.recommendation ? ` - Recomendación: ${c.recommendation}` : ''),
          type: 'bullet' as const,
        })),
      });
    }
  }

  // Recomendación
  if (data.recommendation) {
    const recommendationLabels: Record<string, string> = {
      'proceed': '✓ Proceder',
      'proceed-with-caution': '⚠ Proceder con precaución',
      'pivot': '↻ Pivotar',
      'archive': '✗ Archivar',
    };

    sections.push({
      title: 'Recomendación Final',
      level: 'h3',
      items: [
        { label: 'Decisión', value: recommendationLabels[data.recommendation] || data.recommendation },
        ...(data.recommendationRationale ? [{ label: 'Justificación', value: data.recommendationRationale }] : []),
      ],
    });
  }

  return sections;
}

function generateEstrategiaSections(data?: EstrategiaData): ContentSection[] {
  if (!data) return [];
  
  const sections: ContentSection[] = [];

  if (data.mainObjective) {
    sections.push({
      title: 'Objetivo Principal',
      level: 'h3',
      content: data.mainObjective,
    });
  }

  if (data.specificObjectives?.length) {
    sections.push({
      title: 'Objetivos Específicos',
      level: 'h3',
      table: {
        headers: ['Objetivo', 'Tipo', 'Métrica', 'Meta'],
        rows: data.specificObjectives.map(o => [
          o.description,
          o.type,
          o.metric,
          o.target,
        ]),
      },
    });
  }

  if (data.centralNarrative) {
    const n = data.centralNarrative;
    sections.push({
      title: 'Narrativa Central',
      level: 'h3',
      items: [
        { label: 'Headline', value: n.headline },
        { label: 'Subtítulo', value: n.subheadline },
        { label: 'Historia', value: n.story },
        { label: 'Apelación emocional', value: n.emotionalAppeal },
        { label: 'Llamado a la acción', value: n.callToAction },
      ],
    });
  }

  if (data.positioning) {
    sections.push({
      title: 'Posicionamiento',
      level: 'h3',
      items: [
        { label: 'Categoría', value: data.positioning.category },
        { label: 'Diferenciación', value: data.positioning.differentiation },
        { label: 'Percepción objetivo', value: data.positioning.targetPerception },
      ],
    });

    if (data.positioning.competitors?.length) {
      sections.push({
        title: 'Análisis de Competidores',
        level: 'h3',
        table: {
          headers: ['Competidor', 'Posición Actual', 'Nuestra Ventaja'],
          rows: data.positioning.competitors.map(c => [
            c.name,
            c.currentPosition,
            c.ourAdvantage,
          ]),
        },
      });
    }
  }

  if (data.strategicSegments?.length) {
    sections.push({
      title: 'Segmentos Estratégicos',
      level: 'h3',
      table: {
        headers: ['Segmento', 'Tamaño', 'Prioridad', 'Mensaje Clave'],
        rows: data.strategicSegments.map((s: StrategicSegment) => [
          s.name,
          String(s.size),
          `${s.priority}/5`,
          s.keyMessage,
        ]),
      },
    });
  }

  return sections;
}

function generateTacticaSections(data?: TacticaData): ContentSection[] {
  if (!data) return [];
  
  const sections: ContentSection[] = [];

  if (data.keyMessages?.length) {
    sections.push({
      title: 'Mensajes Clave',
      level: 'h3',
      table: {
        headers: ['Segmento', 'Mensaje', 'Tono', 'Frecuencia'],
        rows: data.keyMessages.map(m => [
          m.segment,
          m.message,
          m.tone,
          m.frequency,
        ]),
      },
    });
  }

  if (data.channels?.length) {
    sections.push({
      title: 'Estrategia de Canales',
      level: 'h3',
      table: {
        headers: ['Canal', 'Rol', 'Objetivo', 'Frecuencia'],
        rows: data.channels.map(c => [
          c.channel,
          c.role === 'primary' ? 'Principal' : c.role === 'secondary' ? 'Secundario' : 'Soporte',
          c.objective,
          c.frequency,
        ]),
      },
    });
  }

  if (data.contentFormats?.length) {
    sections.push({
      title: 'Formatos de Contenido',
      level: 'h3',
      table: {
        headers: ['Formato', 'Propósito', 'Canales', 'Cantidad'],
        rows: data.contentFormats.map(f => [
          f.format,
          f.purpose,
          f.targetChannels.join(', '),
          String(f.estimatedQuantity),
        ]),
      },
    });
  }

  if (data.editorialCalendarSummary) {
    sections.push({
      title: 'Calendario Editorial',
      level: 'h3',
      content: data.editorialCalendarSummary,
    });
  }

  return sections;
}

function generatePlaneacionSections(data?: PlaneacionData): ContentSection[] {
  if (!data) return [];
  
  const sections: ContentSection[] = [];

  if (data.timeline?.length) {
    sections.push({
      title: 'Cronograma',
      level: 'h3',
      table: {
        headers: ['Fase', 'Inicio', 'Fin', 'Objetivos'],
        rows: data.timeline.map(t => [
          t.name,
          t.startDate,
          t.endDate,
          t.objectives.join('; '),
        ]),
      },
    });
  }

  if (data.budget) {
    const items: ContentItem[] = [
      { label: 'Inversión total', value: `$${data.budget.total.toLocaleString()} ${data.budget.currency}` },
      { label: 'Contingencia', value: `${data.budget.contingency}%` },
    ];

    if (data.budget.categories?.length) {
      items.push({
        label: 'Categorías',
        value: data.budget.categories.map(c => `${c.name}: $${c.amount.toLocaleString()} (${c.percentage}%)`).join(', '),
      });
    }

    sections.push({
      title: 'Presupuesto',
      level: 'h3',
      items,
    });
  }

  if (data.milestones?.length) {
    sections.push({
      title: 'Hitos',
      level: 'h3',
      table: {
        headers: ['Hito', 'Fecha', 'Estado', 'Descripción'],
        rows: data.milestones.map(m => [
          m.name,
          m.date,
          m.status === 'completed' ? '✓ Completado' : m.status === 'in-progress' ? '⏳ En progreso' : m.status === 'delayed' ? '⚠ Retrasado' : '○ Pendiente',
          m.description,
        ]),
      },
    });
  }

  if (data.executionChecklist?.length) {
    const items: ContentItem[] = [];
    for (const category of data.executionChecklist) {
      const completedCount = category.items.filter(i => i.completed).length;
      items.push({
        label: category.category,
        value: `${completedCount}/${category.items.length} tareas completadas`,
        type: 'bullet' as const,
      });
    }

    sections.push({
      title: 'Checklist de Ejecución',
      level: 'h3',
      items,
    });
  }

  return sections;
}

function generateOrquestaSections(data?: OrquestaData): ContentSection[] {
  if (!data) return [];
  
  const sections: ContentSection[] = [];

  if (data.programs?.length) {
    const programTypes: Record<string, string> = {
      tierra: '🏃 Tierra',
      aire: '📺 Aire',
      agua: '💻 Agua',
      principal: '⭐ Principal',
    };

    sections.push({
      title: 'Programas de Ejecución',
      level: 'h3',
      table: {
        headers: ['Programa', 'Tipo', 'Estado', 'Actividades'],
        rows: data.programs.map(p => [
          p.name,
          programTypes[p.type] || p.type,
          p.status === 'active' ? 'Activo' : p.status === 'completed' ? 'Completado' : p.status,
          String(p.activities.length),
        ]),
      },
    });
  }

  if (data.team?.length) {
    sections.push({
      title: 'Equipo',
      level: 'h3',
      table: {
        headers: ['Nombre', 'Rol', 'Responsabilidades'],
        rows: data.team.map(t => [
          t.name,
          t.role,
          t.responsibilities.join('; '),
        ]),
      },
    });
  }

  if (data.activeIntegrations?.length) {
    sections.push({
      title: 'Integraciones Activas',
      level: 'h3',
      items: data.activeIntegrations.map(i => ({ value: i, type: 'bullet' as const })),
    });
  }

  return sections;
}

function generatePulsoSections(data?: PulsoData): ContentSection[] {
  if (!data) return [];
  
  const sections: ContentSection[] = [];

  if (data.activeKPIs?.length) {
    sections.push({
      title: 'KPIs Activos',
      level: 'h3',
      table: {
        headers: ['KPI', 'Categoría', 'Actual', 'Meta', 'Tendencia'],
        rows: data.activeKPIs.map(k => [
          k.name,
          k.category,
          `${k.currentValue} ${k.unit}`,
          `${k.targetValue} ${k.unit}`,
          k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→',
        ]),
      },
    });
  }

  if (data.sentimentSummary) {
    const s = data.sentimentSummary;
    sections.push({
      title: 'Resumen de Sentimiento',
      level: 'h3',
      items: [
        { label: 'Positivo', value: `${s.positive}%` },
        { label: 'Neutral', value: `${s.neutral}%` },
        { label: 'Negativo', value: `${s.negative}%` },
        ...(s.dominantTopics?.length ? [{ label: 'Temas dominantes', value: s.dominantTopics.join(', ') }] : []),
      ],
    });
  }

  if (data.activeAlerts?.length) {
    const unacknowledged = data.activeAlerts.filter(a => !a.acknowledged);
    if (unacknowledged.length) {
      sections.push({
        title: 'Alertas Pendientes',
        level: 'h3',
        items: unacknowledged.map(a => ({
          label: a.type === 'critical' ? '🚨 Crítico' : a.type === 'warning' ? '⚠️ Advertencia' : 'ℹ️ Info',
          value: a.message,
          type: 'bullet' as const,
        })),
      });
    }
  }

  return sections;
}

function generateEvaluacionSections(data?: EvaluacionData): ContentSection[] {
  if (!data) return [];
  
  const sections: ContentSection[] = [];

  if (data.lessonsLearned?.length) {
    const categoryLabels: Record<string, string> = {
      success: '✅ Éxito',
      failure: '❌ Fracaso',
      improvement: '💡 Mejora',
    };

    sections.push({
      title: 'Lecciones Aprendidas',
      level: 'h3',
      items: data.lessonsLearned.map(l => ({
        label: `${categoryLabels[l.category] || l.category} (Impacto: ${l.impact})`,
        value: l.description,
        type: 'bullet' as const,
      })),
    });
  }

  if (data.roiAnalysis) {
    const roi = data.roiAnalysis;
    sections.push({
      title: 'Análisis de ROI',
      level: 'h3',
      items: [
        { label: 'Inversión total', value: `$${roi.totalInvestment.toLocaleString()}` },
        { label: 'Retorno total', value: `$${roi.totalReturn.toLocaleString()}` },
        { label: 'ROI', value: `${roi.roiPercentage}%` },
        ...(roi.intangibleBenefits?.length ? [{ label: 'Beneficios intangibles', value: roi.intangibleBenefits.join(', ') }] : []),
      ],
    });
  }

  if (data.legacy?.length) {
    const typeLabels: Record<string, string> = {
      asset: '💎 Activo',
      relationship: '🤝 Relación',
      knowledge: '📚 Conocimiento',
      infrastructure: '🏗️ Infraestructura',
    };

    sections.push({
      title: 'Legado',
      level: 'h3',
      items: data.legacy.map(l => ({
        label: typeLabels[l.type] || l.type,
        value: `${l.description} (Valor: ${l.value}${l.transferable ? ', Transferible' : ''})`,
        type: 'bullet' as const,
      })),
    });
  }

  if (data.futureRecommendations?.length) {
    sections.push({
      title: 'Recomendaciones Futuras',
      level: 'h3',
      items: data.futureRecommendations.map(r => ({
        value: r,
        type: 'number' as const,
      })),
    });
  }

  return sections;
}
