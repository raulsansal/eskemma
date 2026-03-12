// utils/courseAccessUtils.ts
// ============================================================
// UTILIDADES DE ACCESO A CURSOS
// Basado en el sistema de roles de Eskemma
// ============================================================

import type { UserRole } from "../types/subscription.types";

// Jerarquía de roles (mayor índice = más privilegios)
export const ROLE_HIERARCHY: Record<UserRole | "public", number> = {
  "public": -1,
  "visitor": 0,
  "registered": 1,
  "user": 2,
  "basic": 3,
  "premium": 4,
  "professional": 5,
  "unsubscribed-basic": 2,
  "unsubscribed-premium": 2,
  "unsubscribed-professional": 2,
  "expired": 2,
  "admin": 999,
};

/**
 * Verifica si un usuario tiene acceso a un curso
 */
export function canAccessCourse(
  userRole: UserRole | null,
  requiredRole: UserRole | "public"
): boolean {
  // Si el curso es público, todos acceden
  if (requiredRole === "public") {
    return true;
  }
  
  // Si no hay usuario, no accede a contenido restringido
  if (!userRole) {
    return false;
  }
  
  // Admin tiene acceso a todo
  if (userRole === "admin") {
    return true;
  }
  
  // Comparar jerarquía de roles
  const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Obtiene el mensaje de upgrade apropiado
 */
export function getUpgradeMessage(requiredRole: UserRole): string {
  const messages: Record<UserRole, string> = {
    visitor: "Verifica tu correo electrónico para continuar.",
    registered: "Completa tu registro para acceder a este contenido.",
    user: "Este contenido requiere una suscripción activa.",
    basic: "Este contenido requiere el plan Premium o Professional.",
    premium: "Este contenido requiere el plan Professional.",
    professional: "Este contenido es exclusivo para equipos profesionales.",
    "unsubscribed-basic": "Reactiva tu suscripción Basic para acceder.",
    "unsubscribed-premium": "Reactiva tu suscripción Premium para acceder.",
    "unsubscribed-professional": "Reactiva tu suscripción Professional para acceder.",
    expired: "Tu suscripción ha expirado. Renueva para acceder.",
    admin: "",
  };
  
  return messages[requiredRole] || "No tienes acceso a este contenido.";
}

/**
 * Obtiene el plan requerido para un rol
 */
export function getRequiredPlan(role: UserRole): string {
  const planMap: Partial<Record<UserRole, string>> = {
    basic: "Plan Basic",
    premium: "Plan Premium",
    professional: "Plan Professional",
    user: "Registro completo",
    registered: "Verificación de email",
    visitor: "Verificación de email",
  };
  
  return planMap[role] || "Suscripción activa";
}

/**
 * Obtiene el color de badge para cada rol
 */
export function getRoleBadgeColor(role: UserRole | "public"): string {
  const colors: Record<string, string> = {
    public: "bg-gray-eske-20 text-gray-eske-80",
    visitor: "bg-yellow-eske-20 text-yellow-eske-80",
    registered: "bg-blue-eske-20 text-blue-eske-80",
    user: "bg-green-eske-20 text-green-eske-80",
    basic: "bg-green-eske text-white",
    premium: "bg-bluegreen-eske text-white",
    professional: "bg-blue-eske text-white",
    "unsubscribed-basic": "bg-red-eske-20 text-red-eske-80",
    "unsubscribed-premium": "bg-red-eske-20 text-red-eske-80",
    "unsubscribed-professional": "bg-red-eske-20 text-red-eske-80",
    expired: "bg-gray-eske-40 text-gray-eske-90",
    admin: "bg-black-eske text-white",
  };
  
  return colors[role] || "bg-gray-eske-20 text-gray-eske-80";
}