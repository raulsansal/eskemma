// types/redactor.types.ts

/**
 * ============================================
 * TIPOS PARA REDACTOR POLÍTICO
 * ============================================
 */

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
