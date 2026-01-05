// lib/redactor/constants.ts

import type { RedactorLimits } from "@/types/redactor.types";

/**
 * ============================================
 * LÍMITES POR TIPO DE PLAN
 * ============================================
 */

export const PLAN_LIMITS: Record<"freemium" | "basic" | "premium" | "professional", RedactorLimits> = {
  freemium: {
    maxGenerationsTotal: 2,      // Solo 2 generaciones LIFETIME
    maxVariantes: 2,              // 2 variantes por generación
    maxHashtags: 3,               // 3 hashtags
    hasHistorial: false,          // Sin historial
    hasExportacion: false,        // Sin exportación
  },
  basic: {
    maxGenerationsTotal: null,   // Ilimitado
    maxVariantes: 3,              // 3 variantes
    maxHashtags: 5,               // 5 hashtags
    hasHistorial: true,           // Con historial
    hasExportacion: true,         // Con exportación
  },
  premium: {
    maxGenerationsTotal: null,   // Ilimitado
    maxVariantes: 3,              // 3 variantes
    maxHashtags: 5,               // 5 hashtags
    hasHistorial: true,           // Con historial
    hasExportacion: true,         // Con exportación
  },
  professional: {
    maxGenerationsTotal: null,   // Ilimitado
    maxVariantes: 3,              // 3 variantes
    maxHashtags: 5,               // 5 hashtags
    hasHistorial: true,           // Con historial
    hasExportacion: true,         // Con exportación
  },
};

/**
 * Obtiene los límites según el plan del usuario
 */
export function getPlanLimits(userPlan: string | null | undefined): RedactorLimits {
  if (!userPlan || userPlan === "null" || userPlan === "") {
    return PLAN_LIMITS.freemium;
  }

  const plan = userPlan.toLowerCase() as "basic" | "premium" | "professional";
  return PLAN_LIMITS[plan] || PLAN_LIMITS.freemium;
}

/**
 * Determina si el usuario es freemium
 */
export function isFreemiumUser(userPlan: string | null | undefined): boolean {
  return !userPlan || userPlan === "null" || userPlan === "";
}

/**
 * Mensajes del sistema
 */
export const MESSAGES = {
  FREEMIUM_LIMIT_REACHED: "Has alcanzado el límite de 2 generaciones gratuitas. Contrata el Plan Básico para acceso ilimitado.",
  GENERATION_SUCCESS: "Posts generados exitosamente",
  GENERATION_ERROR: "Error al generar posts. Intenta de nuevo.",
  VALIDATION_ERROR: "Por favor, completa todos los campos correctamente",
  COPY_SUCCESS: "Copiado al portapapeles",
  EXPORT_SUCCESS: "Exportación completada",
  RATE_LIMIT_ERROR: "Demasiadas solicitudes. Espera un momento e intenta de nuevo.",
};

/**
 * Colecciones de Firestore
 */
export const COLLECTIONS = {
  GENERATIONS: "moddulo_redactor_generations",
  USAGE: "moddulo_redactor_usage",
};
