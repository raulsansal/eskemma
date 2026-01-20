// lib/redactor/constants.ts - V3.0 MULTI-PROYECTO

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
    maxProjects: 1,               // ⭐ Solo 1 proyecto
  },
  basic: {
    maxGenerationsTotal: null,   // Ilimitado
    maxVariantes: 3,              // 3 variantes
    maxHashtags: 5,               // 5 hashtags
    hasHistorial: true,           // Con historial
    hasExportacion: true,         // Con exportación
    maxProjects: 5,               // ⭐ Hasta 5 proyectos
  },
  premium: {
    maxGenerationsTotal: null,   // Ilimitado
    maxVariantes: 3,              // 3 variantes
    maxHashtags: 5,               // 5 hashtags
    hasHistorial: true,           // Con historial
    hasExportacion: true,         // Con exportación
    maxProjects: 10,              // ⭐ Hasta 10 proyectos
  },
  professional: {
    maxGenerationsTotal: null,   // Ilimitado
    maxVariantes: 3,              // 3 variantes
    maxHashtags: 5,               // 5 hashtags
    hasHistorial: true,           // Con historial
    hasExportacion: true,         // Con exportación
    maxProjects: 999,             // ⭐ Ilimitado (prácticamente)
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
  
  // ⭐ NUEVOS: Proyectos
  PROJECT_CREATED: "Proyecto creado exitosamente",
  PROJECT_UPDATED: "Proyecto actualizado",
  PROJECT_DELETED: "Proyecto eliminado",
  PROJECT_LIMIT_REACHED: "Has alcanzado el límite de proyectos de tu plan. Mejora tu plan o archiva proyectos existentes.",
  NO_PROJECTS_YET: "Aún no tienes proyectos. Crea tu primer proyecto para comenzar.",
  PROJECT_NAME_REQUIRED: "El nombre del proyecto es requerido",
  PROJECT_NAME_TOO_SHORT: "El nombre debe tener al menos 3 caracteres",
  PROJECT_NAME_TOO_LONG: "El nombre no puede exceder 50 caracteres",
};

/**
 * Colecciones de Firestore
 */
export const COLLECTIONS = {
  PROJECTS: "moddulo_redactor_projects",        // ⭐ NUEVO
  GENERATIONS: "moddulo_redactor_generations",
  USAGE: "moddulo_redactor_usage",
};
