// lib/constants/courses.ts
// ============================================================
// CONFIGURACIÓN MAESTRA DE CURSOS Y TALLERES
// Centraliza niveles, categorías y presentación de roles
// ============================================================

import type { DifficultyLevel } from "@/types/course.types";
import type { UserRole } from "@/types/subscription.types";

/**
 * Configuración de Niveles de Dificultad
 */
export interface DifficultyConfig {
  label: string;
  colorClass: string;
}

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
  beginner: {
    label: "Principiante",
    colorClass: "bg-orange-eske-20 text-black-eske",
  },
  intermediate: {
    label: "Intermedio",
    colorClass: "bg-yellow-eske-30 text-black-eske",
  },
  advanced: {
    label: "Avanzado",
    colorClass: "bg-blue-eske-20 text-black-eske",
  },
};

/**
 * Categorías de Cursos
 */
export interface CourseCategory {
  id: string;
  label: string;
  description?: string;
}

export const COURSE_CATEGORIES: CourseCategory[] = [
  { id: "analisis-electoral", label: "Análisis Electoral" },
  { id: "comunicacion-politica", label: "Comunicación Política" },
  { id: "estrategia", label: "Estrategia" },
  { id: "datos", label: "Datos" },
  { id: "gerencia", label: "Gerencia" },
];

/**
 * Configuración Visual de Roles de Acceso
 */
export interface RolePresentation {
  label: string;
  badgeClass: string;
  upgradeMessage: string;
  planName: string;
}

export const ROLE_PRESENTATION: Record<UserRole | "public", RolePresentation> = {
  public: {
    label: "Gratuito",
    badgeClass: "bg-orange-eske-10 text-black-eske",
    upgradeMessage: "Acceso libre para todos.",
    planName: "Público",
  },
  visitor: {
    label: "Visitante",
    badgeClass: "bg-yellow-eske-20 text-black-eske",
    upgradeMessage: "Verifica tu correo electrónico para continuar.",
    planName: "Verificación de email",
  },
  registered: {
    label: "Registrado",
    badgeClass: "bg-blue-eske-20 text-black-eske",
    upgradeMessage: "Completa tu registro para acceder a este contenido.",
    planName: "Verificación de email",
  },
  user: {
    label: "Suscriptor",
    badgeClass: "bg-green-eske-10 text-black-eske",
    upgradeMessage: "Este contenido requiere una suscripción activa.",
    planName: "Registro completo",
  },
  basic: {
    label: "Plan Basic",
    badgeClass: "bg-green-eske-30 text-black-eske",
    upgradeMessage: "Este contenido requiere el plan Premium o Professional.",
    planName: "Plan Basic",
  },
  premium: {
    label: "Plan Premium",
    badgeClass: "bg-green-eske-60 text-white-eske",
    upgradeMessage: "Este contenido requiere el plan Professional.",
    planName: "Plan Premium",
  },
  professional: {
    label: "Profesional",
    badgeClass: "bg-green-eske-80 text-white-eske",
    upgradeMessage: "Este contenido es exclusivo para equipos profesionales.",
    planName: "Plan Professional",
  },

  "unsubscribed-basic": {
    label: "Basic (Inactivo)",
    badgeClass: "bg-red-eske-20 text-red-eske-80",
    upgradeMessage: "Reactiva tu suscripción Basic para acceder.",
    planName: "Plan Basic",
  },
  "unsubscribed-premium": {
    label: "Premium (Inactivo)",
    badgeClass: "bg-red-eske-20 text-red-eske-80",
    upgradeMessage: "Reactiva tu suscripción Premium para acceder.",
    planName: "Plan Premium",
  },
  "unsubscribed-professional": {
    label: "Professional (Inactivo)",
    badgeClass: "bg-red-eske-20 text-red-eske-80",
    upgradeMessage: "Reactiva tu suscripción Professional para acceder.",
    planName: "Plan Professional",
  },
  expired: {
    label: "Expirado",
    badgeClass: "bg-gray-eske-40 text-gray-eske-90",
    upgradeMessage: "Tu suscripción ha expirado. Renueva para acceder.",
    planName: "Suscripción expirada",
  },
  admin: {
    label: "Administrador",
    badgeClass: "bg-black-eske text-white-eske",
    upgradeMessage: "Acceso total de administrador.",
    planName: "Admin",
  },
};

/**
 * Helpers para obtener configuraciones de forma segura
 */

export function getDifficultyInfo(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIG[level];
}

export function getRoleInfo(role: UserRole | "public"): RolePresentation {
  return ROLE_PRESENTATION[role] || ROLE_PRESENTATION.public;
}

export function getCategoryLabel(id: string): string {
  return COURSE_CATEGORIES.find(c => c.id === id)?.label || id;
}
