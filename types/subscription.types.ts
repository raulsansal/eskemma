// types/subscription.types.ts
// ============================================================
// CONFIGURACIÓN CENTRALIZADA DE SUSCRIPCIONES ESKEMMA
// Versión: 1.0.0
// Última actualización: 31 de diciembre de 2025
// ============================================================

// ============================================================
// TIPOS BASE
// ============================================================

export type SubscriptionPlan = "basic" | "premium" | "professional" | null;
export type SubscriptionStatus = "active" | "cancelled" | "expired" | null;

export type UserRole =
  | "visitor"                    // a) Email no verificado
  | "registered"                 // b) Email verificado, registro incompleto
  | "user"                       // c) Registro completo, sin suscripción
  | "basic"                      // d) Suscripción Basic activa
  | "premium"                    // e) Suscripción Premium activa
  | "professional"               // f) Suscripción Professional activa
  | "unsubscribed-basic"         // g) Basic cancelada
  | "unsubscribed-premium"       // h) Premium cancelada
  | "unsubscribed-professional"  // i) Professional cancelada
  | "expired"                    // j) Suscripción expirada
  | "admin";                     // Administrador del sistema

// ============================================================
// ALIASES SEMÁNTICOS PARA MODDULO
// ============================================================

export type ModduloTier = "BASIC" | "PREMIUM" | "PROFESSIONAL";

// Niveles de acceso para otras plataformas
export type AccessLevel = "freemium" | "basic" | "premium" | "professional";

// ============================================================
// MAPEOS PLAN → TIER
// ============================================================

export const PLAN_TO_TIER_MAP: Record<NonNullable<SubscriptionPlan>, ModduloTier> = {
  basic: "BASIC",
  premium: "PREMIUM",
  professional: "PROFESSIONAL",
};

export const TIER_TO_PLAN_MAP: Record<ModduloTier, SubscriptionPlan> = {
  BASIC: "basic",
  PREMIUM: "premium",
  PROFESSIONAL: "professional",
};

// ============================================================
// CONFIGURACIÓN DE CARACTERÍSTICAS POR PLAN
// ============================================================

export interface PlanFeatures {
  // ========== INFORMACIÓN COMERCIAL ==========
  code: string;
  displayName: string;
  price: number;
  currency: string;
  
  // ========== LÍMITES GENERALES ==========
  maxUsers: number | "unlimited";
  storageGB: number | "unlimited";
  
  // ========== MODDULO ==========
  modduloTier: ModduloTier;
  modduloAppsCount: number;
  modduloAppsIncluded: string[];
  
  // ========== OTRAS PLATAFORMAS ==========
  sefixAccess: AccessLevel;
  monitorAccess: AccessLevel;
  cursosAccess: AccessLevel;
  recursosAccess: AccessLevel[];
  
  // ========== BLOG & NEWSLETTER ==========
  blogAccess: boolean;
  newsletterTier: "standard" | "premium" | "exclusive";
  
  // ========== SOPORTE ==========
  supportType: "none" | "email-48h" | "email-chat-24h" | "24-7-phone";
  supportDescription: string;
  
  // ========== CAPACITACIÓN ==========
  onboardingHours: number;
  trainingType: "none" | "documentation" | "group-online" | "personalized-monthly";
  
  // ========== FUNCIONALIDADES AVANZADAS ==========
  apiAccess: boolean;
  whiteLabel: boolean;
  slaUptime: number | null;
  accountManager: boolean;
  consultingHoursPerMonth: number;
  exportAdvanced: boolean;
  customIntegrations: boolean;
  dailyBackups: boolean;
  advancedSecurity: boolean;
  customReports: boolean;
}

// ============================================================
// CATÁLOGO DE APPS DE MODDULO
// ============================================================

export const MODDULO_APPS = {
  BASIC: [
    "redactor",
    "crm",
    "dashboard",
    "calendario",
    "presupuesto",
    "foda",
    "metricas",
    "informe-diario",
  ],
  
  PREMIUM: [
    "redactor",
    "crm", 
    "dashboard",
    "calendario",
    "presupuesto",
    "foda",
    "metricas",
    "informe-diario",
    "centro-escucha",
    "email-marketing",
    "estratega",
    "sintesis",
    "redactor-premium",
    "crm-premium",
    "dashboard-premium",
    "calendario-premium",
  ],
  
  PROFESSIONAL: [
    "redactor",
    "crm",
    "dashboard",
    "calendario",
    "presupuesto",
    "foda",
    "metricas",
    "informe-diario",
    "centro-escucha",
    "email-marketing",
    "estratega",
    "sintesis",
    "redactor-premium",
    "crm-premium",
    "dashboard-premium",
    "calendario-premium",
    "monitor-redes",
    "sala-crisis",
    "territorio",
    "chatbot",
    "brigada-app",
    "rival",
    "retrospectiva",
    "prensa",
    "roi",
  ],
};

// ============================================================
// CONFIGURACIÓN COMPLETA DE PLANES
// ============================================================

export const PLAN_FEATURES: Record<"user" | NonNullable<SubscriptionPlan>, PlanFeatures> = {
  user: {
    code: "user",
    displayName: "Usuario (Freemium)",
    price: 0,
    currency: "MXN",
    
    maxUsers: 1,
    storageGB: 0,
    
    modduloTier: "BASIC",
    modduloAppsCount: 0,
    modduloAppsIncluded: [],
    
    sefixAccess: "freemium",
    monitorAccess: "freemium",
    cursosAccess: "freemium",
    recursosAccess: ["freemium"],
    
    blogAccess: true,
    newsletterTier: "standard",
    
    supportType: "none",
    supportDescription: "Sin soporte técnico",
    
    onboardingHours: 0,
    trainingType: "none",
    
    apiAccess: false,
    whiteLabel: false,
    slaUptime: null,
    accountManager: false,
    consultingHoursPerMonth: 0,
    exportAdvanced: false,
    customIntegrations: false,
    dailyBackups: false,
    advancedSecurity: false,
    customReports: false,
  },

  basic: {
    code: "basic",
    displayName: "Basic",
    price: 2899,
    currency: "MXN",
    
    maxUsers: 1,
    storageGB: 5,
    
    modduloTier: "BASIC",
    modduloAppsCount: 8,
    modduloAppsIncluded: MODDULO_APPS.BASIC,
    
    sefixAccess: "basic",
    monitorAccess: "basic",
    cursosAccess: "basic",
    recursosAccess: ["freemium", "basic"],
    
    blogAccess: true,
    newsletterTier: "standard",
    
    supportType: "email-48h",
    supportDescription: "Soporte por email (48 hrs)",
    
    onboardingHours: 0,
    trainingType: "documentation",
    
    apiAccess: false,
    whiteLabel: false,
    slaUptime: null,
    accountManager: false,
    consultingHoursPerMonth: 0,
    exportAdvanced: false,
    customIntegrations: false,
    dailyBackups: false,
    advancedSecurity: false,
    customReports: false,
  },

  premium: {
    code: "premium",
    displayName: "Premium",
    price: 5899,
    currency: "MXN",
    
    maxUsers: 5,
    storageGB: 50,
    
    modduloTier: "PREMIUM",
    modduloAppsCount: 16,
    modduloAppsIncluded: MODDULO_APPS.PREMIUM,
    
    sefixAccess: "premium",
    monitorAccess: "premium",
    cursosAccess: "premium",
    recursosAccess: ["freemium", "basic", "premium"],
    
    blogAccess: true,
    newsletterTier: "premium",
    
    supportType: "email-chat-24h",
    supportDescription: "Soporte prioritario por email/chat (24 hrs)",
    
    onboardingHours: 2,
    trainingType: "group-online",
    
    apiAccess: false,
    whiteLabel: false,
    slaUptime: null,
    accountManager: false,
    consultingHoursPerMonth: 0,
    exportAdvanced: true,
    customIntegrations: false,
    dailyBackups: false,
    advancedSecurity: false,
    customReports: false,
  },

  professional: {
    code: "professional",
    displayName: "Professional",
    price: 9899,
    currency: "MXN",
    
    maxUsers: "unlimited",
    storageGB: "unlimited",
    
    modduloTier: "PROFESSIONAL",
    modduloAppsCount: 25,
    modduloAppsIncluded: MODDULO_APPS.PROFESSIONAL,
    
    sefixAccess: "professional",
    monitorAccess: "professional",
    cursosAccess: "professional",
    recursosAccess: ["freemium", "basic", "premium", "professional"],
    
    blogAccess: true,
    newsletterTier: "exclusive",
    
    supportType: "24-7-phone",
    supportDescription: "Soporte 24/7 prioritario (teléfono, chat, email)",
    
    onboardingHours: 8,
    trainingType: "personalized-monthly",
    
    apiAccess: true,
    whiteLabel: true,
    slaUptime: 99.9,
    accountManager: true,
    consultingHoursPerMonth: 4,
    exportAdvanced: true,
    customIntegrations: true,
    dailyBackups: true,
    advancedSecurity: true,
    customReports: true,
  },
};

// ============================================================
// CARACTERÍSTICAS DETALLADAS (para UI)
// ============================================================

export const PLAN_FEATURES_DETAILED = {
  basic: [
    "Acceso a Sefix",
    "Acceso a 8 Apps Estándar de Moddulo",
    "Acceso a Monitor 'Basic'",
    "Acceso a cursos 'Basic'",
    "Acceso a Recursos 'Basic'",
    "Acceso al Blog (El Baúl de Fouché)",
    "Suscripción al Newsletter",
    "Soporte por email (48 hrs)",
    "Documentación completa",
    "Actualizaciones automáticas",
    "Almacenamiento: 5 GB",
    "Un solo usuario",
  ],
  premium: [
    "Todo lo del Plan Básico",
    "Acceso a Sefix 'Premium'",
    "Acceso a paquete Premium de Apps de Moddulo (16 apps)",
    "Acceso a Monitor 'Premium'",
    "Acceso a cursos 'Premium'",
    "Acceso a recursos 'Basic' y 'Premium'",
    "Suscripción al Newsletter (Premium)",
    "Soporte prioritario por email/chat (24 hrs)",
    "Onboarding personalizado (2 hrs)",
    "Capacitación grupal online (1 sesión)",
    "Almacenamiento: 50 GB",
    "Multi-usuario: hasta 5 usuarios",
    "Exportación avanzada (Excel, PowerPoint)",
  ],
  professional: [
    "Todo lo del Plan Premium",
    "Acceso a Sefix 'Professional'",
    "Acceso a paquete Professional de Apps de Moddulo (25 apps)",
    "Acceso a Monitor 'Professional'",
    "Acceso a cursos 'Professional'",
    "Acceso a Recursos 'Basic', 'Premium' y 'Professional'",
    "Suscripción al Newsletter (Exclusive)",
    "Soporte 24/7 prioritario (teléfono, chat, email)",
    "Onboarding dedicado (8 hrs + presencial opcional)",
    "Capacitación personalizada (mensual, ilimitada)",
    "Account Manager dedicado",
    "Consultoría estratégica (4 hrs/mes incluidas)",
    "API Access completo (webhook + REST)",
    "White label (tu marca en reportes)",
    "Almacenamiento ilimitado",
    "Usuarios ilimitados",
    "Integración con sistemas propios",
    "SLA 99.9% uptime garantizado",
    "Backups diarios",
    "Seguridad avanzada (2FA, SSO)",
    "Reportes personalizados a demanda",
  ],
};

// ============================================================
// FUNCIONES HELPER
// ============================================================

export function getPlanTier(plan: SubscriptionPlan): ModduloTier {
  if (!plan) return "BASIC";
  return PLAN_TO_TIER_MAP[plan];
}

export function getPlanFeatures(plan: SubscriptionPlan | "user"): PlanFeatures {
  const planKey = plan || "user";
  return PLAN_FEATURES[planKey as keyof typeof PLAN_FEATURES];
}

export function canAccessModduloApp(
  userPlan: SubscriptionPlan,
  appSlug: string
): boolean {
  const features = getPlanFeatures(userPlan || "user");
  return features.modduloAppsIncluded.includes(appSlug);
}

export function getPlanDisplayName(plan: SubscriptionPlan | "user"): string {
  return getPlanFeatures(plan || "user").displayName;
}

export function getPlanPrice(plan: SubscriptionPlan): number {
  if (!plan) return 0;
  return PLAN_FEATURES[plan].price;
}

export function getAppsForTier(tier: ModduloTier): string[] {
  return MODDULO_APPS[tier];
}

export function tierHasApp(tier: ModduloTier, appSlug: string): boolean {
  return MODDULO_APPS[tier].includes(appSlug);
}

export function getRequiredTierForApp(appSlug: string): ModduloTier | null {
  if (MODDULO_APPS.BASIC.includes(appSlug)) return "BASIC";
  if (MODDULO_APPS.PREMIUM.includes(appSlug)) return "PREMIUM";
  if (MODDULO_APPS.PROFESSIONAL.includes(appSlug)) return "PROFESSIONAL";
  return null;
}

export function formatPrice(price: number, currency: string = "MXN"): string {
  const symbols: Record<string, string> = {
    MXN: "$",
    USD: "$",
    EUR: "€",
  };
  
  const symbol = symbols[currency] || "$";
  return `${symbol}${price.toLocaleString("es-MX")}`;
}

export function planHasFeature(
  plan: SubscriptionPlan,
  feature: keyof PlanFeatures
): boolean {
  const features = getPlanFeatures(plan || "user");
  const value = features[feature];
  
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (value === "unlimited") return true;
  if (Array.isArray(value)) return value.length > 0;
  
  return !!value;
}