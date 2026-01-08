// utils/subscriptionUtils.ts
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import {
  SubscriptionPlan,
  PLAN_FEATURES,
  PLAN_FEATURES_DETAILED,
  getPlanFeatures,
  getPlanDisplayName,
  getPlanPrice,
  formatPrice as formatPriceHelper,
} from "../types/subscription.types";

// ============================================================
// RE-EXPORTAR DESDE TYPES CENTRALIZADOS
// ============================================================

export const SUBSCRIPTION_PRICES = {
  basic: PLAN_FEATURES.basic.price,
  premium: PLAN_FEATURES.premium.price,
  professional: PLAN_FEATURES.professional.price,
};

// ✅ EXPORTAR PLAN_FEATURES para compatibilidad con page.tsx
export { PLAN_FEATURES_DETAILED as PLAN_FEATURES };

export const getPlanName = (plan: SubscriptionPlan | null): string => {
  if (!plan) return "Sin plan";
  return getPlanDisplayName(plan);
};

export { getPlanPrice };

// ============================================================
// FUNCIONES DE VALIDACIÓN Y ESTADO
// ============================================================

export const hasPremiumAccess = (role: string): boolean => {
  if (role === "admin") return true;
  return ["basic", "premium", "professional"].includes(role);
};

export const canAccessFeature = (
  userRole: string,
  requiredRole: "user" | "basic" | "premium" | "professional"
): boolean => {
  if (userRole === "admin") return true;

  const roleHierarchy: Record<string, number> = {
    visitor: 0,
    registered: 1,
    user: 2,
    basic: 3,
    premium: 4,
    professional: 5,
    "unsubscribed-basic": 2,
    "unsubscribed-premium": 2,
    "unsubscribed-professional": 2,
    expired: 2,
    admin: 999,
  };

  const requiredLevel = roleHierarchy[requiredRole] || 0;
  const userLevel = roleHierarchy[userRole] || 0;

  return userLevel >= requiredLevel;
};

// ============================================================
// FUNCIONES DE FECHAS
// ============================================================

export const getDaysRemaining = (endDate: string | Date | null): number => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const formatExpirationDate = (endDate: string | Date | null): string => {
  if (!endDate) return "No disponible";
  const date = new Date(endDate);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getSubscriptionProgress = (
  startDate: string | Date | null,
  endDate: string | Date | null
): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  if (now < start) return 0;
  if (now > end) return 100;
  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
};

export const isSubscriptionExpiringSoon = (
  endDate: string | Date | null
): boolean => {
  const daysRemaining = getDaysRemaining(endDate);
  return daysRemaining > 0 && daysRemaining <= 7;
};

export const getSubscriptionStatusMessage = (
  role: string,
  endDate: string | Date | null
): string => {
  if (role === "admin") {
    return "Acceso administrativo completo al sistema.";
  }

  if (["basic", "premium", "professional"].includes(role)) {
    const daysRemaining = getDaysRemaining(endDate);
    if (daysRemaining > 7) {
      return `Tu suscripción está activa hasta el ${formatExpirationDate(endDate)}`;
    } else if (daysRemaining > 0) {
      return `⚠️ Tu suscripción expira en ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""}`;
    }
  }

  if (role === "expired") {
    return `Tu suscripción expiró el ${formatExpirationDate(endDate)}. Renueva para seguir disfrutando del contenido premium.`;
  }

  if (["unsubscribed-basic", "unsubscribed-premium", "unsubscribed-professional"].includes(role)) {
    return "Has cancelado tu suscripción. Puedes reactivarla en cualquier momento.";
  }

  if (role === "user") {
    return "No tienes una suscripción activa. Suscríbete para acceder a contenido premium.";
  }

  if (role === "registered") {
    return "Completa tu registro para poder suscribirte.";
  }

  return "Verifica tu correo electrónico para activar tu cuenta.";
};

// ============================================================
// FUNCIONES DE PRECIOS
// ============================================================

export const calculateProratedPrice = (
  currentPlan: NonNullable<SubscriptionPlan>,
  newPlan: NonNullable<SubscriptionPlan>,
  daysRemaining: number
): number => {
  const currentPrice = getPlanPrice(currentPlan);
  const newPrice = getPlanPrice(newPlan);
  const dailyRate = currentPrice / 30;
  const remainingValue = dailyRate * daysRemaining;
  const priceDifference = newPrice - remainingValue;
  return Math.max(0, priceDifference);
};

export const formatPrice = (price: number, currency: string = "MXN"): string => {
  return formatPriceHelper(price, currency);
};

// ============================================================
// FUNCIONES DE ADMINISTRACIÓN
// ============================================================

export const getPlanColor = (plan: SubscriptionPlan | null | "admin"): string => {
  if (plan === "admin") return "red";
  
  const colors: Record<NonNullable<SubscriptionPlan>, string> = {
    basic: "blue",
    premium: "purple",
    professional: "green",
  };
  
  return plan ? colors[plan] : "gray";
};

export const isAdmin = (role: string): boolean => {
  return role === "admin";
};

export const requiresSubscription = (role: string): boolean => {
  return !["visitor", "registered", "user", "admin"].includes(role);
};

export const getRolePermissions = (role: string): string[] => {
  const permissions: Record<string, string[]> = {
    visitor: ["Ver contenido público"],
    registered: ["Ver contenido público", "Completar registro"],
    user: ["Ver contenido público", "Acceso a perfil", "Ver cursos gratuitos"],
    basic: ["Todo lo de Usuario", "Acceso a Sefix", "Acceso a 8 Apps de Moddulo", "Soporte por email"],
    premium: ["Todo lo de Plan Básico", "Acceso a 16 Apps de Moddulo", "Soporte prioritario 24h", "Hasta 5 usuarios"],
    professional: [
      "Todo lo de Plan Premium",
      "Acceso a 25 Apps de Moddulo",
      "Usuarios ilimitados",
      "Account Manager dedicado",
      "API Access completo",
    ],
    admin: [
      "Acceso completo al sistema",
      "Gestión de usuarios",
      "Gestión de contenido",
      "Gestión de suscripciones",
      "Reportes y análisis",
      "Configuración del sitio",
    ],
  };

  return permissions[role] || ["Sin permisos definidos"];
};
