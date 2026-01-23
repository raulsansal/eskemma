// types/strategy-context.types.ts
/**
 * Tipos para el Sistema de Proyectos Estratégicos de Moddulo
 * "Tercera Vía" - Flujo de 3 capas + 9 fases
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================
// IDENTIFICADORES DE FASES Y CAPAS
// ============================================================

export type PhaseId =
  | 'proposito'
  | 'exploracion'
  | 'diagnostico'
  | 'estrategia'
  | 'tactica'
  | 'planeacion'
  | 'orquesta'
  | 'pulso'
  | 'evaluacion';

export type LayerId = 'fundacion' | 'estrategia' | 'operacion';

// ============================================================
// CONSTANTES Y MAPEOS
// ============================================================

export const PHASE_ORDER: PhaseId[] = [
  'proposito',
  'exploracion',
  'diagnostico',
  'estrategia',
  'tactica',
  'planeacion',
  'orquesta',
  'pulso',
  'evaluacion',
];

export const PHASE_TO_LAYER: Record<PhaseId, LayerId> = {
  proposito: 'fundacion',
  exploracion: 'fundacion',
  diagnostico: 'fundacion',
  estrategia: 'estrategia',
  tactica: 'estrategia',
  planeacion: 'estrategia',
  orquesta: 'operacion',
  pulso: 'operacion',
  evaluacion: 'operacion',
};

// ============================================================
// METADATA DE FASES
// ============================================================

export interface PhaseMetadata {
  id: PhaseId;
  name: string;
  layer: LayerId;
  description: string;
  question: string;
  icon: string;
  estimatedMinutes: number;
  requiredForNext: boolean;
  integratedApps?: string[];
  isViabilityGate?: boolean;
}

export const PHASE_METADATA: Record<PhaseId, PhaseMetadata> = {
  proposito: {
    id: 'proposito',
    name: 'Propósito',
    layer: 'fundacion',
    description: 'Define la intención central y audiencia del proyecto',
    question: '¿Por qué existe este proyecto?',
    icon: '🎯',
    estimatedMinutes: 15,
    requiredForNext: true,
  },
  exploracion: {
    id: 'exploracion',
    name: 'Exploración',
    layer: 'fundacion',
    description: 'Investigación cuantitativa y cualitativa del contexto',
    question: '¿Qué dice el entorno?',
    icon: '🔍',
    estimatedMinutes: 30,
    requiredForNext: true,
    integratedApps: ['centro-escucha', 'sintesis'],
  },
  diagnostico: {
    id: 'diagnostico',
    name: 'Diagnóstico',
    layer: 'fundacion',
    description: 'FODA, PESTEL, evaluación de viabilidad ética',
    question: '¿Es viable y ético?',
    icon: '🩺',
    estimatedMinutes: 20,
    requiredForNext: true,
    integratedApps: ['foda'],
    isViabilityGate: true,
  },
  estrategia: {
    id: 'estrategia',
    name: 'Estrategia',
    layer: 'estrategia',
    description: 'Define objetivos, narrativa central y segmentos',
    question: '¿Qué vamos a lograr?',
    icon: '♟️',
    estimatedMinutes: 25,
    requiredForNext: true,
    integratedApps: ['estratega'],
  },
  tactica: {
    id: 'tactica',
    name: 'Táctica',
    layer: 'estrategia',
    description: 'Mensajes clave, canales y formatos',
    question: '¿Cómo lo comunicamos?',
    icon: '📢',
    estimatedMinutes: 30,
    requiredForNext: true,
    integratedApps: ['redactor', 'redactor-premium'],
  },
  planeacion: {
    id: 'planeacion',
    name: 'Planeación',
    layer: 'estrategia',
    description: 'Cronograma, presupuesto y checklist de ejecución',
    question: '¿Cuándo y con qué recursos?',
    icon: '📅',
    estimatedMinutes: 20,
    requiredForNext: true,
    integratedApps: ['calendario', 'presupuesto'],
  },
  orquesta: {
    id: 'orquesta',
    name: 'Orquesta',
    layer: 'operacion',
    description: 'Programas Tierra, Aire, Agua y Principal',
    question: '¿Cómo ejecutamos?',
    icon: '🎼',
    estimatedMinutes: 30,
    requiredForNext: false,
    integratedApps: ['territorio', 'email-marketing', 'chatbot', 'crm'],
  },
  pulso: {
    id: 'pulso',
    name: 'Pulso',
    layer: 'operacion',
    description: 'Seguimiento en tiempo real de métricas',
    question: '¿Cómo vamos?',
    icon: '📊',
    estimatedMinutes: 15,
    requiredForNext: false,
    integratedApps: ['monitor-redes', 'sala-crisis', 'metricas', 'dashboard'],
  },
  evaluacion: {
    id: 'evaluacion',
    name: 'Evaluación',
    layer: 'operacion',
    description: 'Lecciones aprendidas, legado y ROI',
    question: '¿Qué aprendimos?',
    icon: '🏆',
    estimatedMinutes: 20,
    requiredForNext: false,
    integratedApps: ['retrospectiva', 'roi'],
  },
};

// ============================================================
// METADATA DE CAPAS
// ============================================================

export interface LayerMetadata {
  id: LayerId;
  name: string;
  description: string;
  color: string;
  phases: PhaseId[];
}

export const LAYER_METADATA: Record<LayerId, LayerMetadata> = {
  fundacion: {
    id: 'fundacion',
    name: 'Fundación',
    description: '¿Debo hacer esto?',
    color: '#4BB8A2',
    phases: ['proposito', 'exploracion', 'diagnostico'],
  },
  estrategia: {
    id: 'estrategia',
    name: 'Estrategia',
    description: '¿Qué voy a hacer y por qué?',
    color: '#323A99',
    phases: ['estrategia', 'tactica', 'planeacion'],
  },
  operacion: {
    id: 'operacion',
    name: 'Operación',
    description: '¿Cómo lo hago, mido y aprendo?',
    color: '#72B84B',
    phases: ['orquesta', 'pulso', 'evaluacion'],
  },
};

// ============================================================
// TIPOS DE CAMPAÑA
// ============================================================

export type CampaignType =
  | 'electoral-ejecutivo'
  | 'electoral-legislativo'
  | 'electoral-partido'
  | 'gobierno'
  | 'movimiento'
  | 'corporativo';

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  'electoral-ejecutivo': 'Campaña Electoral (Ejecutivo)',
  'electoral-legislativo': 'Campaña Electoral (Legislativo)',
  'electoral-partido': 'Campaña de Partido',
  gobierno: 'Comunicación de Gobierno',
  movimiento: 'Movimiento Social / ONG',
  corporativo: 'Comunicación Corporativa',
};

// ============================================================
// ROL DEL USUARIO
// ============================================================

export type UserRole =
  | 'candidato'
  | 'consultor'
  | 'partido'
  | 'gobierno'
  | 'ciudadano'
  | 'academico'
  | 'ong';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  candidato: 'Candidato/a',
  consultor: 'Consultor/a Político',
  partido: 'Representante de Partido',
  gobierno: 'Funcionario/a de Gobierno',
  ciudadano: 'Ciudadano/a Independiente',
  academico: 'Académico/a / Investigador/a',
  ong: 'ONG / Sociedad Civil',
};

// ============================================================
// JURISDICCIÓN
// ============================================================

export type JurisdictionLevel = 'federal' | 'estatal' | 'municipal' | 'distrital';

export const JURISDICTION_LEVEL_LABELS: Record<JurisdictionLevel, string> = {
  federal: 'Federal / Nacional',
  estatal: 'Estatal / Provincial',
  municipal: 'Municipal / Local',
  distrital: 'Distrital',
};

export interface Jurisdiction {
  country: string;
  countryName: string;
  level: JurisdictionLevel;
  state?: string;
  stateName?: string;
  municipality?: string;
  municipalityName?: string;
  district?: string;
  districtName?: string;
}

// ============================================================
// ESTADOS DEL PROYECTO
// ============================================================

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export type ViabilityStatus = 'pending' | 'viable' | 'conditional' | 'not-viable';

export type ProjectMode = 'generador' | 'refinador';

// ============================================================
// PROGRESO POR FASE
// ============================================================

export interface PhaseProgress {
  status: 'not-started' | 'in-progress' | 'completed' | 'skipped';
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  completionPercentage: number;
  lastSavedAt?: Timestamp;
}

// ============================================================
// CONFIGURACIÓN DEL PROYECTO
// ============================================================

export interface ProjectSettings {
  aiAssistanceLevel: 'minimal' | 'balanced' | 'maximum';
  preferredLanguage: 'es' | 'en' | 'pt';
  emailNotifications: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'none';
  isShared: boolean;
  collaborators: string[];
  isTemplate: boolean;
  isPublic: boolean;
}

// ============================================================
// DOCUMENTOS SUBIDOS
// ============================================================

export interface UploadedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'other';
  size: number;
  uploadedAt: Timestamp;
  storagePath: string;
  downloadUrl?: string;
  processedByAI: boolean;
  extractedContent?: string;
  relatedPhase?: PhaseId;
}

// ============================================================
// EXPORTACIONES
// ============================================================

export interface ProjectExport {
  id: string;
  format: 'pdf' | 'docx' | 'xlsx' | 'html' | 'json';
  scope: 'full' | 'layer' | 'phase';
  scopeDetail?: string;
  createdAt: Timestamp;
  storagePath: string;
  downloadUrl?: string;
  expiresAt?: Timestamp;
}

// ============================================================
// DATOS DE FASE: PROPÓSITO
// ============================================================

export interface AudienceSegment {
  name: string;
  description: string;
  demographics?: {
    ageRange?: string;
    gender?: string;
    location?: string;
    socioeconomic?: string;
  };
  psychographics?: {
    values?: string[];
    concerns?: string[];
    mediaConsumption?: string[];
  };
  size?: 'small' | 'medium' | 'large';
  priority: 'primary' | 'secondary' | 'tertiary';
}

export interface PropositoData {
  missionStatement: string;
  visionStatement?: string;
  coreValues: string[];
  primaryAudience: AudienceSegment;
  secondaryAudiences: AudienceSegment[];
  uniqueValue: string;
  aiGenerated: boolean;
  userEdited: boolean;
  lastUpdated: Timestamp;
}

// ============================================================
// DATOS DE FASE: EXPLORACIÓN
// ============================================================

export interface QuantitativeInsight {
  metric: string;
  value: string | number;
  source: string;
  date?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface QualitativeInsight {
  category: 'opinion' | 'perception' | 'sentiment' | 'narrative';
  insight: string;
  source: string;
  relevance: 'high' | 'medium' | 'low';
}

export interface ElectoralContext {
  electionDate?: string;
  registeredVoters?: number;
  expectedTurnout?: number;
  mainCompetitors: string[];
  keyIssues: string[];
}

export interface DataSource {
  name: string;
  type: 'survey' | 'social-media' | 'news' | 'official' | 'academic' | 'internal';
  url?: string;
  date?: string;
}

export interface ExploracionData {
  quantitativeInsights: QuantitativeInsight[];
  qualitativeInsights: QualitativeInsight[];
  electoralContext?: ElectoralContext;
  sources: DataSource[];
  aiGenerated: boolean;
  lastUpdated: Timestamp;
}

// ============================================================
// DATOS DE FASE: DIAGNÓSTICO
// ============================================================

export interface FODAItem {
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedAction?: string;
}

export interface FODAAnalysis {
  fortalezas: FODAItem[];
  oportunidades: FODAItem[];
  debilidades: FODAItem[];
  amenazas: FODAItem[];
}

export interface PESTELAnalysis {
  political: string[];
  economic: string[];
  social: string[];
  technological: string[];
  environmental: string[];
  legal: string[];
}

export interface Risk {
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation?: string;
}

export interface ViabilityAssessment {
  resourcesAvailable: boolean;
  timeframeFeasible: boolean;
  audienceReachable: boolean;
  competitiveAdvantage: boolean;
  overallScore: number;
  risks: Risk[];
}

export interface EthicsConcern {
  area: 'truth' | 'privacy' | 'manipulation' | 'discrimination' | 'legality' | 'other';
  description: string;
  severity: 'blocking' | 'warning' | 'note';
  recommendation?: string;
}

export interface EthicsAssessment {
  passesEthicsCheck: boolean;
  concerns: EthicsConcern[];
  commitments: string[];
}

export interface DiagnosticoData {
  foda: FODAAnalysis;
  pestel?: PESTELAnalysis;
  viabilityAssessment: ViabilityAssessment;
  ethicsAssessment: EthicsAssessment;
  recommendation: 'proceed' | 'proceed-with-caution' | 'pivot' | 'archive';
  recommendationRationale: string;
  aiGenerated: boolean;
  lastUpdated: Timestamp;
}

// ============================================================
// DATOS DE FASE: ESTRATEGIA
// ============================================================

export interface StrategicObjective {
  description: string;
  type: 'awareness' | 'persuasion' | 'mobilization' | 'conversion';
  metric: string;
  target: string;
  deadline?: string;
}

export interface CentralNarrative {
  headline: string;
  subheadline: string;
  story: string;
  emotionalAppeal: string;
  callToAction: string;
}

export interface CompetitorPosition {
  name: string;
  currentPosition: string;
  ourAdvantage: string;
}

export interface Positioning {
  category: string;
  differentiation: string;
  targetPerception: string;
  competitors: CompetitorPosition[];
}

export interface StrategicSegment {
  name: string;
  size: number;
  priority: number;
  currentStance: 'supporter' | 'leaning' | 'undecided' | 'opposition';
  targetStance: 'supporter' | 'leaning' | 'undecided' | 'opposition';
  keyMessage: string;
  channels: string[];
}

export interface EstrategiaData {
  mainObjective: string;
  specificObjectives: StrategicObjective[];
  centralNarrative: CentralNarrative;
  positioning: Positioning;
  strategicSegments: StrategicSegment[];
  aiGenerated: boolean;
  lastUpdated: Timestamp;
}

// ============================================================
// DATOS DE FASE: TÁCTICA
// ============================================================

export interface KeyMessage {
  segment: string;
  message: string;
  tone: 'formal' | 'informal' | 'emotional' | 'rational' | 'urgent';
  frequency: 'daily' | 'weekly' | 'event-based';
}

export interface ChannelStrategy {
  channel: string;
  role: 'primary' | 'secondary' | 'support';
  objective: string;
  budget?: number;
  frequency: string;
}

export interface ContentFormat {
  format: string;
  purpose: string;
  targetChannels: string[];
  estimatedQuantity: number;
}

export interface TacticaData {
  keyMessages: KeyMessage[];
  channels: ChannelStrategy[];
  contentFormats: ContentFormat[];
  editorialCalendarSummary: string;
  aiGenerated: boolean;
  lastUpdated: Timestamp;
}

// ============================================================
// DATOS DE FASE: PLANEACIÓN
// ============================================================

export interface TimelinePhase {
  name: string;
  startDate: string;
  endDate: string;
  objectives: string[];
  deliverables: string[];
}

export interface BudgetItem {
  description: string;
  amount: number;
  frequency?: 'one-time' | 'monthly' | 'weekly';
}

export interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  items: BudgetItem[];
}

export interface BudgetSummary {
  total: number;
  currency: string;
  categories: BudgetCategory[];
  contingency: number;
}

export interface ChecklistItem {
  task: string;
  responsible?: string;
  dueDate?: string;
  completed: boolean;
  notes?: string;
}

export interface ChecklistCategory {
  category: string;
  items: ChecklistItem[];
}

export interface Milestone {
  name: string;
  date: string;
  description: string;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
}

export interface PlaneacionData {
  timeline: TimelinePhase[];
  budget: BudgetSummary;
  executionChecklist: ChecklistCategory[];
  milestones: Milestone[];
  aiGenerated: boolean;
  lastUpdated: Timestamp;
}

// ============================================================
// DATOS DE FASE: ORQUESTA
// ============================================================

export interface ActivityMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
}

export interface Activity {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  responsible?: string;
  status: 'pending' | 'in-progress' | 'completed';
  metrics?: ActivityMetric[];
}

export interface ExecutionProgram {
  id: string;
  name: string;
  type: 'tierra' | 'aire' | 'agua' | 'principal';
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  activities: Activity[];
}

export interface TeamMember {
  name: string;
  role: string;
  responsibilities: string[];
  contactInfo?: string;
}

export interface OrquestaData {
  programs: ExecutionProgram[];
  team: TeamMember[];
  activeIntegrations: string[];
  lastUpdated: Timestamp;
}

// ============================================================
// DATOS DE FASE: PULSO
// ============================================================

export interface KPI {
  id: string;
  name: string;
  category: 'reach' | 'engagement' | 'conversion' | 'sentiment' | 'custom';
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Timestamp;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  source: string;
  createdAt: Timestamp;
  acknowledged: boolean;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  dominantTopics: string[];
  lastUpdated: Timestamp;
}

export interface PulsoData {
  activeKPIs: KPI[];
  lastMetricsUpdate?: Timestamp;
  activeAlerts: Alert[];
  sentimentSummary?: SentimentSummary;
  lastUpdated: Timestamp;
}

// ============================================================
// DATOS DE FASE: EVALUACIÓN
// ============================================================

export interface Lesson {
  category: 'success' | 'failure' | 'improvement';
  description: string;
  impact: 'high' | 'medium' | 'low';
  applicability: string;
}

export interface ROICategory {
  category: string;
  investment: number;
  return: number;
  roi: number;
}

export interface ROIAnalysis {
  totalInvestment: number;
  totalReturn: number;
  roiPercentage: number;
  byCategory: ROICategory[];
  intangibleBenefits: string[];
}

export interface LegacyItem {
  type: 'asset' | 'relationship' | 'knowledge' | 'infrastructure';
  description: string;
  value: 'high' | 'medium' | 'low';
  transferable: boolean;
}

export interface EvaluacionData {
  lessonsLearned: Lesson[];
  roiAnalysis?: ROIAnalysis;
  legacy: LegacyItem[];
  futureRecommendations: string[];
  completedAt?: Timestamp;
  lastUpdated: Timestamp;
}

// ============================================================
// DATOS AGRUPADOS POR CAPA
// ============================================================

export interface FundacionData {
  proposito?: PropositoData;
  exploracion?: ExploracionData;
  diagnostico?: DiagnosticoData;
}

export interface EstrategiaLayerData {
  estrategia?: EstrategiaData;
  tactica?: TacticaData;
  planeacion?: PlaneacionData;
}

export interface OperacionData {
  orquesta?: OrquestaData;
  pulso?: PulsoData;
  evaluacion?: EvaluacionData;
}

// ============================================================
// DOCUMENTO PRINCIPAL: StrategyProject
// ============================================================

export interface StrategyProject {
  // Identificación
  id: string;
  userId: string;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastAccessedAt: Timestamp;

  // Información básica (Onboarding)
  projectName: string;
  projectDescription?: string;
  mode: ProjectMode;
  campaignType: CampaignType;
  jurisdiction: Jurisdiction;
  userRole: UserRole;

  // Estado y progreso
  status: ProjectStatus;
  viabilityStatus: ViabilityStatus;
  currentPhase: PhaseId;
  completedPhases: PhaseId[];
  phaseProgress: Record<PhaseId, PhaseProgress>;

  // Datos por capa
  fundacion: FundacionData;
  estrategia: EstrategiaLayerData;
  operacion: OperacionData;

  // Documentos y exportaciones
  uploadedDocuments: UploadedDocument[];
  exports: ProjectExport[];

  // Configuración
  settings: ProjectSettings;
}

// ============================================================
// TIPOS PARA UI
// ============================================================

export interface ProjectSummary {
  id: string;
  projectName: string;
  campaignType: CampaignType;
  jurisdiction: Pick<Jurisdiction, 'country' | 'countryName' | 'level'>;
  status: ProjectStatus;
  currentPhase: PhaseId;
  completionPercentage: number;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

export interface StrategyContextState {
  project: StrategyProject | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  lastSaved: Timestamp | null;
}
