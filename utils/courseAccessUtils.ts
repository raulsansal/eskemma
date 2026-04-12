// utils/courseAccessUtils.ts
// ============================================================
// UTILIDADES DE ACCESO A CURSOS
// Basado en el sistema de roles de Eskemma
// ============================================================

import type { UserRole } from "../types/subscription.types";
import { ROLE_PRESENTATION } from "../lib/constants/courses";

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
export function getUpgradeMessage(requiredRole: UserRole | "public"): string {
  if (requiredRole === "admin") return "";
  return ROLE_PRESENTATION[requiredRole]?.upgradeMessage || "No tienes acceso a este contenido.";
}

/**
 * Obtiene el plan requerido para un rol
 */
export function getRequiredPlan(role: UserRole | "public"): string {
  return ROLE_PRESENTATION[role]?.planName || "Suscripción activa";
}

/**
 * Obtiene el color de badge para cada rol
 */
export function getRoleBadgeColor(role: UserRole | "public"): string {
  return ROLE_PRESENTATION[role]?.badgeClass || "bg-gray-eske-20 text-gray-eske-80";
}