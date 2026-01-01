// types/moddulo.types.ts

/**
 * Categorías de apps de Moddulo
 */
export type ModduloAppCategory = 
  | "comunicacion"
  | "estrategia"
  | "datos"
  | "operaciones"
  | "territorio";

/**
 * Estados de una app
 */
export type ModduloAppStatus = "active" | "locked" | "coming-soon";

/**
 * Tiers de Moddulo
 */
export type ModduloAppTier = "BASIC" | "PREMIUM" | "PROFESSIONAL";

/**
 * Interfaz de una app de Moddulo
 */
export interface ModduloApp {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: ModduloAppCategory;
  tier: ModduloAppTier;
  icon: string;
  comingSoon: boolean;
  isPremiumUpgrade?: boolean;
  baseAppSlug?: string;
  features: string[];
}

/**
 * App con estado calculado según el plan del usuario
 */
export interface ModduloAppWithStatus extends ModduloApp {
  status: ModduloAppStatus;
  requiresUpgrade: boolean;
  requiredTier?: ModduloAppTier;
}

/**
 * Información de una categoría
 */
export interface ModduloCategoryInfo {
  id: ModduloAppCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Estadísticas del hub de Moddulo
 */
export interface ModduloStats {
  totalApps: number;
  availableApps: number;
  lockedApps: number;
  comingSoonApps: number;
  currentTier: ModduloAppTier;
}
