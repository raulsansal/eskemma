// utils/roleUtils.ts (VERSIÓN DEFINITIVA CON ADMIN)
type UserRole =
  | "visitor"
  | "registered"
  | "user"
  | "basic"
  | "premium"
  | "grupal"
  | "unsubscribed-basic"
  | "unsubscribed-premium"
  | "unsubscribed-grupal"
  | "expired"
  | "admin"; 

type SubscriptionPlan = "basic" | "premium" | "grupal" | null;
type SubscriptionStatus = "active" | "cancelled" | "expired" | null;

interface UserData {
  emailVerified: boolean;
  profileCompleted: boolean;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionEndDate?: Date | string | null;
  previousSubscription?: SubscriptionPlan;
  role?: UserRole; // ✅ AGREGAR para preservar admin
}

/**
 * Calcula el rol correcto del usuario basado en su estado
 */
export const calculateUserRole = (userData: UserData): UserRole => {
  // ✅ CRÍTICO: Preservar rol admin
  if (userData.role === "admin") {
    return "admin";
  }

  const {
    emailVerified,
    profileCompleted,
    subscriptionPlan,
    subscriptionStatus,
    subscriptionEndDate,
    previousSubscription,
  } = userData;

  // a) Email NO verificado → visitor
  if (!emailVerified) {
    return "visitor";
  }

  // b) Email verificado pero registro NO completo → registered
  if (!profileCompleted) {
    return "registered";
  }

  // Verificar si la suscripción está expirada
  const isSubscriptionExpired = subscriptionEndDate
    ? new Date(subscriptionEndDate) < new Date()
    : false;

  // j) Suscripción expirada y no renovada → expired
  if (isSubscriptionExpired && subscriptionStatus !== "cancelled") {
    return "expired";
  }

  // d, e, f) Suscripciones activas
  if (subscriptionStatus === "active" && subscriptionPlan) {
    switch (subscriptionPlan) {
      case "basic":
        return "basic";
      case "premium":
        return "premium";
      case "grupal":
        return "grupal";
    }
  }

  // g, h, i) Suscripciones canceladas
  if (subscriptionStatus === "cancelled" && previousSubscription) {
    switch (previousSubscription) {
      case "basic":
        return "unsubscribed-basic";
      case "premium":
        return "unsubscribed-premium";
      case "grupal":
        return "unsubscribed-grupal";
    }
  }

  // c) Registro completo sin suscripción → user
  return "user";
};

/**
 * Verifica si una suscripción está expirada
 */
export const isSubscriptionExpired = (
  endDate: Date | string | null | undefined
): boolean => {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
};

/**
 * Obtiene el nombre legible del rol
 */
export const getRoleName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    visitor: "Visitante",
    registered: "Registrado",
    user: "Usuario",
    basic: "Plan Básico",
    premium: "Plan Premium",
    grupal: "Plan Grupal",
    "unsubscribed-basic": "Plan Básico (Cancelado)",
    "unsubscribed-premium": "Plan Premium (Cancelado)",
    "unsubscribed-grupal": "Plan Grupal (Cancelado)",
    expired: "Suscripción Expirada",
    admin: "Administrador", // ✅ ADMIN
  };
  return roleNames[role] || "Usuario";
};