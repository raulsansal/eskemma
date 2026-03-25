// types/centinela.types.ts
import type { Timestamp } from "firebase/firestore";

// ==========================================
// ENUMERACIONES FUNDAMENTALES
// ==========================================

export type NivelTerritorial =
  | "nacional"    // Todo México
  | "estatal"     // Un estado (ej. Jalisco)
  | "municipal"   // Un municipio (ej. Zapopan)
  | "distrito";   // Un distrito electoral específico

export type ModoAnalisis =
  | "ciudadano"     // Enfoque en percepción ciudadana
  | "gubernamental"; // Enfoque en gestión pública

export type TendenciaPESTL =
  | "creciente"    // Factor en aumento
  | "estable"      // Sin cambios significativos
  | "decreciente"; // Factor en descenso

export type ImpactoFactor =
  | "alto"   // Impacto alto en la estrategia
  | "medio"  // Impacto moderado
  | "bajo";  // Impacto leve

export type JobStatus =
  | "pending"    // En cola, aún no inicia
  | "running"    // Ejecutándose en Cloud Function
  | "completed"  // Finalizado con éxito
  | "failed";    // Error durante la ejecución

// ==========================================
// INTERFACES DE CONFIGURACIÓN
// ==========================================

export interface Territorio {
  nivel: NivelTerritorial;
  estado?: string;    // Requerido si nivel >= estatal (ej. "Jalisco")
  municipio?: string; // Requerido si nivel >= municipal (ej. "Zapopan")
  nombre: string;     // Nombre legible: "Jalisco > Zapopan > Distrito 10"
}

export interface AlertasConfig {
  vectorRiesgoUmbral: number;  // 0-100: dispara alerta cuando vectorRiesgo >= umbral
  notificarEmail: boolean;     // Enviar email vía Firebase Trigger Email
  notificarInApp: boolean;     // Mostrar banner en dashboard al recargar
}

export interface CentinelaConfig {
  id: string;
  userId: string;
  territorio: Territorio;
  modo: ModoAnalisis;
  isActive: boolean;
  alertas: AlertasConfig;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ==========================================
// INTERFACES DE ANÁLISIS PEST-L
// ==========================================

export interface Factor {
  descripcion: string;    // Descripción del factor identificado
  impacto: ImpactoFactor;
  sentiment: number;      // Puntuación de sentimiento: -1.0 (muy negativo) a 1.0 (muy positivo)
  fuente: string;         // Fuente de la información (ej. "Jornada Jalisco, 20/03/2026")
  isManual: boolean;      // true si fue agregado manualmente por el usuario
}

export interface DimensionPESTL {
  contexto: string;       // Resumen generado por Claude de la dimensión
  factores: Factor[];     // Lista de factores identificados
  tendencia: TendenciaPESTL;
  fuentes: string[];      // URLs de fuentes consultadas
}

export interface PESTLAnalysis {
  politico: DimensionPESTL;
  economico: DimensionPESTL;
  social: DimensionPESTL;
  tecnologico: DimensionPESTL;
  legal: DimensionPESTL;
}

// ==========================================
// INTERFACES DE FEEDS Y JOBS
// ==========================================

export interface CentinelaFeed {
  id: string;
  configId: string;         // Referencia a centinela_configs
  userId: string;           // Desnormalizado para queries directas
  generadoEn: Timestamp | string;
  territorio: string;       // Territorio desnormalizado (ej. "Jalisco")
  vigente: boolean;         // true = es el análisis más reciente
  pestl: PESTLAnalysis;
  vectorRiesgo: number;         // 0-100: índice global de riesgo del entorno
  indicePresionSocial: number;  // 0-100: presión social acumulada
  indiceClimaInversion: number; // 0-100: favorabilidad para inversión
  syncedToModdulo: boolean;     // true si fue consultado por Moddulo F2
}

export interface CentinelaJob {
  id: string;
  configId: string;
  userId: string;
  status: JobStatus;
  startedAt: Timestamp | string;
  completedAt?: Timestamp | string;
  error?: string;    // Mensaje si status === "failed"
  feedId?: string;   // ID del feed generado si status === "completed"
}

// ==========================================
// INTERFACES DE ALERTAS
// ==========================================

export interface CentinelaAlert {
  id: string;
  feedId: string;
  territorio: string;
  vectorRiesgo: number;
  generadoEn: Timestamp | string;
  readAt?: Timestamp | string | null; // null = alerta no leída
}
