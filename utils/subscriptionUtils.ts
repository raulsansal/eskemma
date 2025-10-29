// utils/subscriptionUtils.ts
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

type SubscriptionPlan = "basic" | "premium" | "grupal";

interface SubscriptionPrices {
  basic: number;
  premium: number;
  grupal: number;
}

/**
 * Precios mensuales de cada plan (en tu moneda)
 * Ajusta estos valores según tu estrategia de precios
 */
export const SUBSCRIPTION_PRICES: SubscriptionPrices = {
  basic: 199,      // Ajusta según tu moneda (ej: MXN, USD, EUR)
  premium: 399,
  grupal: 999,
};

/**
 * Características de cada plan
 */
export const PLAN_FEATURES = {
  basic: [
    "Acceso a todos los cursos básicos",
    "Certificado de finalización",
    "Soporte por email",
    "Actualizaciones mensuales",
  ],
  premium: [
    "Todo lo del Plan Básico",
    "Acceso a cursos premium",
    "Sesiones en vivo mensuales",
    "Soporte prioritario 24/7",
    "Acceso anticipado a contenido nuevo",
    "Comunidad privada",
  ],
  grupal: [
    "Todo lo del Plan Premium",
    "Hasta 10 miembros del equipo",
    "Dashboard de administración",
    "Reportes de progreso grupal",
    "Sesiones personalizadas para equipos",
    "Gestor de cuenta dedicado",
  ],
};

/**
 * Obtiene el nombre legible del plan
 */
export const getPlanName = (plan: SubscriptionPlan | null): string => {
  const planNames: Record<SubscriptionPlan, string> = {
    basic: "Plan Básico",
    premium: "Plan Premium",
    grupal: "Plan Grupal",
  };
  return plan ? planNames[plan] : "Sin plan";
};

/**
 * Obtiene el precio de un plan
 */
export const getPlanPrice = (plan: SubscriptionPlan): number => {
  return SUBSCRIPTION_PRICES[plan];
};

/**
 * Verifica si el usuario tiene acceso premium (cualquier plan activo)
 * ✅ ADMIN siempre tiene acceso premium
 */
export const hasPremiumAccess = (role: string): boolean => {
  // ✅ ADMIN tiene acceso completo
  if (role === "admin") return true;
  
  return ["basic", "premium", "grupal"].includes(role);
};

/**
 * Verifica si el usuario puede acceder a una funcionalidad
 * basándose en una jerarquía de roles
 * ✅ ADMIN tiene acceso a todo
 */
export const canAccessFeature = (
  userRole: string,
  requiredRole: "user" | "basic" | "premium" | "grupal"
): boolean => {
  // ✅ ADMIN tiene acceso a todo
  if (userRole === "admin") return true;

  const roleHierarchy = {
    visitor: 0,
    registered: 1,
    user: 2,
    basic: 3,
    premium: 4,
    grupal: 4,
    "unsubscribed-basic": 2,
    "unsubscribed-premium": 2,
    "unsubscribed-grupal": 2,
    expired: 2,
    admin: 999, // ✅ Nivel máximo para admin
  };

  const requiredLevel = roleHierarchy[requiredRole] || 0;
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
};

/**
 * Obtiene los días restantes de suscripción
 */
export const getDaysRemaining = (endDate: string | Date | null): number => {
  if (!endDate) return 0;

  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

/**
 * Formatea la fecha de expiración en formato legible
 */
export const formatExpirationDate = (endDate: string | Date | null): string => {
  if (!endDate) return "No disponible";

  const date = new Date(endDate);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Calcula el progreso de la suscripción (porcentaje usado del período)
 * Útil para mostrar barras de progreso o alertas de renovación
 */
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

/**
 * Verifica si la suscripción está próxima a expirar (menos de 7 días)
 */
export const isSubscriptionExpiringSoon = (
  endDate: string | Date | null
): boolean => {
  const daysRemaining = getDaysRemaining(endDate);
  return daysRemaining > 0 && daysRemaining <= 7;
};

/**
 * Obtiene un mensaje descriptivo del estado de la suscripción
 * ✅ Incluye mensaje especial para admin
 */
export const getSubscriptionStatusMessage = (
  role: string,
  endDate: string | Date | null
): string => {
  // ✅ Mensaje para admin
  if (role === "admin") {
    return "Acceso administrativo completo al sistema.";
  }

  if (["basic", "premium", "grupal"].includes(role)) {
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

  if (["unsubscribed-basic", "unsubscribed-premium", "unsubscribed-grupal"].includes(role)) {
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

/**
 * Calcula el precio prorrateado si se cambia de plan
 * (útil para upgrades/downgrades)
 */
export const calculateProratedPrice = (
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
  daysRemaining: number
): number => {
  const currentPrice = SUBSCRIPTION_PRICES[currentPlan];
  const newPrice = SUBSCRIPTION_PRICES[newPlan];
  
  // Calcular el valor restante del plan actual
  const dailyRate = currentPrice / 30;
  const remainingValue = dailyRate * daysRemaining;
  
  // Calcular la diferencia
  const priceDifference = newPrice - remainingValue;
  
  return Math.max(0, priceDifference);
};

/**
 * Obtiene el color asociado a cada plan (para badges, UI, etc.)
 * ✅ Incluye color para admin
 */
export const getPlanColor = (plan: SubscriptionPlan | null | "admin"): string => {
  if (plan === "admin") return "red"; // ✅ Color para admin
  
  const colors: Record<SubscriptionPlan, string> = {
    basic: "blue",
    premium: "purple",
    grupal: "green",
  };
  return plan ? colors[plan] : "gray";
};

/**
 * Formatea el precio con símbolo de moneda
 * Ajusta el símbolo según tu moneda
 */
export const formatPrice = (price: number, currency: string = "$"): string => {
  return `${currency}${price.toFixed(2)}`;
};

/**
 * Verifica si un usuario es administrador
 */
export const isAdmin = (role: string): boolean => {
  return role === "admin";
};

/**
 * Verifica si un rol requiere suscripción
 * ✅ Admin no requiere suscripción
 */
export const requiresSubscription = (role: string): boolean => {
  // Admin y roles base no requieren suscripción
  return !["visitor", "registered", "user", "admin"].includes(role);
};

/**
 * Obtiene la lista de permisos según el rol
 * Útil para mostrar qué puede hacer cada usuario
 */
export const getRolePermissions = (role: string): string[] => {
  const permissions: Record<string, string[]> = {
    visitor: ["Ver contenido público"],
    registered: ["Ver contenido público", "Completar registro"],
    user: [
      "Ver contenido público",
      "Acceso a perfil",
      "Ver cursos gratuitos",
    ],
    basic: [
      "Todo lo de Usuario",
      "Acceso a cursos básicos",
      "Certificados",
      "Soporte por email",
    ],
    premium: [
      "Todo lo de Plan Básico",
      "Acceso a cursos premium",
      "Sesiones en vivo",
      "Soporte prioritario",
      "Comunidad privada",
    ],
    grupal: [
      "Todo lo de Plan Premium",
      "Dashboard de equipo",
      "Gestión de miembros",
      "Reportes grupales",
      "Gestor dedicado",
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

