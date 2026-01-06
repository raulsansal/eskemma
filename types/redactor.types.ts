// types/redactor.types.ts - VERSIÓN EXTENDIDA COMPATIBLE
/**
 * ============================================
 * TIPOS PARA REDACTOR POLÍTICO
 * Versión 2.0 - Soporte Dual Context
 * ============================================
 */

// ============================================
// TIPOS BASE (COMPATIBLES CON VERSIÓN 1.0)
// ============================================

/**
 * Público objetivo para posts políticos
 */
export type PublicoObjetivo =
  | "jovenes"           // 18-29 años
  | "adultos"           // 30-54 años
  | "adultos-mayores"   // 55+ años
  | "mujeres"
  | "comunidad-rural"
  | "comunidad-urbana"
  | "empresarios"
  | "trabajadores"
  | "general";          // Audiencia general

/**
 * Tono del mensaje político
 */
export type TonoMensaje =
  | "profesional"
  | "cercano"
  | "inspirador"
  | "combativo"
  | "tecnico"
  | "emotivo";

/**
 * Input del usuario para generar posts
 */
export interface RedactorInput {
  tema: string;
  publico: PublicoObjetivo;
  tono: TonoMensaje;
}

/**
 * Una variante de post generada
 */
export interface PostVariante {
  id: string;
  texto: string;
  titulo: string;
  caracteresUsados: number;
}

/**
 * Output completo de la generación con Claude
 */
export interface RedactorOutput {
  variantes: PostVariante[];
  hashtags: string[];
  imagenDescripcion: string;
}

/**
 * Generación completa guardada en Firestore
 */
export interface RedactorGeneration {
  id: string;
  userId: string;
  timestamp: Date;
  
  // Input
  input: RedactorInput;
  
  // Output
  output: RedactorOutput;
  
  // Metadata
  userPlan: "freemium" | "basic" | "premium" | "professional";
  selected: string | null;      // ID de variante seleccionada
  exported: boolean;
  isFreemium: boolean;
}

/**
 * Uso del redactor (para rate limiting freemium)
 */
export interface RedactorUsage {
  userId: string;
  userIP?: string;
  totalGenerations: number;
  lastGeneration: Date;
  isFreemium: boolean;
}

/**
 * Límites según tipo de plan
 */
export interface RedactorLimits {
  maxGenerationsTotal: number | null;  // null = ilimitado
  maxVariantes: number;
  maxHashtags: number;
  hasHistorial: boolean;
  hasExportacion: boolean;
}

/**
 * Estado de la UI del redactor
 */
export interface RedactorUIState {
  isGenerating: boolean;
  currentGeneration: RedactorGeneration | null;
  selectedVarianteId: string | null;
  error: string | null;
  usageInfo: RedactorUsage | null;
}

// ============================================
// NUEVOS TIPOS PARA CONTEXTO DUAL (V2.0)
// ============================================

export type ProjectContext = "electoral" | "governmental";

/**
 * Configuración de proyecto
 */
export interface ProjectConfiguration {
  id: string;
  userId: string;
  context: ProjectContext;
  country: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Configuración específica según contexto
  electoral?: ElectoralConfig;
  governmental?: GovernmentalConfig;
  
  // Lineamientos comunes
  guidelines?: CampaignGuidelines;
}

// ============================================
// CONFIGURACIÓN ELECTORAL
// ============================================

export interface ElectoralConfig {
  electionType: "federal" | "estatal" | "municipal" | "diputacion" | "senado";
  electionYear: number;
  position: string;
  
  candidate: {
    name: string;
    party?: string;
    coalition?: string[];
    slogan?: string;
  };
  
  electionCalendar: {
    campaignStart: Date;
    campaignEnd: Date;
    electionDay: Date;
    currentPhase: "pre-campaña" | "campaña" | "veda" | "post-electoral";
  };
  
  opponents?: Array<{
    name: string;
    party: string;
    mainTopics: string[];
  }>;
  
  compliance: {
    enableINEValidation: boolean;
    enableSpendingTracking: boolean;
    requireDisclaimers: boolean;
  };
}

// ============================================
// CONFIGURACIÓN GUBERNAMENTAL
// ============================================

export interface GovernmentalConfig {
  governmentLevel: "federal" | "estatal" | "municipal";
  
  administration: {
    name: string;
    head: string;
    headName?: string;
    term: {
      start: Date;
      end: Date;
    };
  };
  
  department?: string;
  
  communicationType: 
    | "institucional"
    | "rendicion-cuentas"
    | "programa-social"
    | "emergencia"
    | "participacion"
    | "servicios";
  
  compliance: {
    requireNeutralLanguage: boolean;
    requireLegalDisclaimers: boolean;
    requireAccessibility: boolean;
    prohibitPartisanContent: boolean;
  };
  
  programInfo?: {
    name: string;
    budget: number;
    source: string;
  };
}

// ============================================
// LINEAMIENTOS DE CAMPAÑA
// ============================================

export interface CampaignGuidelines {
  identity: {
    candidateName?: string;
    institutionName?: string;
    party?: string;
    slogan?: string;
    mainMessage: string;
  };
  
  values: string[];
  mainTopics: string[];
  
  tone: {
    general: TonoMensaje;
    voice: string;
    avoid: string[];
  };
  
  targetAudience: {
    primary: string[];
    secondary?: string[];
  };
  
  avoidTopics: string[];
  keyPhrases: string[];
  bannedWords: string[];
  
  referenceDocuments: UploadedDocument[];
  regulatoryDocuments?: RegulatoryDocument[];
}

// ============================================
// DOCUMENTOS
// ============================================

export interface UploadedDocument {
  id: string;
  name: string;
  type: "plan-comunicacion" | "manual-identidad" | "lineamientos-generales" | "otro";
  fileUrl: string;
  uploadedAt: Date;
  extractedContent?: string;
  summary?: string;
}

export interface RegulatoryDocument {
  id: string;
  name: string;
  type: "ley" | "reglamento" | "norma" | "lineamiento" | "circular";
  jurisdiction: "federal" | "estatal" | "municipal";
  authority: string;
  publicationDate: Date;
  fileUrl: string;
  extractedContent?: string;
  keyProvisions?: string[];
  uploadedAt: Date;
}

// ============================================
// VALIDACIÓN
// ============================================

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
  requiredDisclaimers: string[];
  suggestions?: string[];
}

export interface ValidationWarning {
  type: "legal" | "guideline" | "style" | "accessibility";
  message: string;
  reference?: string;
  suggestion?: string;
}

export interface ValidationError {
  type: "legal" | "guideline";
  message: string;
  reference: string;
  severity: "critical" | "high" | "medium";
}

// ============================================
// OUTPUT EXTENDIDO
// ============================================

export interface RedactorOutputExtended extends RedactorOutput {
  disclaimer?: string;
  validation?: ValidationResult;
  metadata?: {
    context: ProjectContext;
    generatedAt: Date;
    country: string;
  };
}
