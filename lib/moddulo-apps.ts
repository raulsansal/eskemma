// lib/moddulo-apps.ts
import type { ModduloApp, ModduloCategoryInfo } from "@/types/moddulo.types";

/**
 * Catálogo completo de apps de Moddulo
 * 25 aplicaciones organizadas en 3 tiers
 */
export const MODDULO_APPS_CATALOG: ModduloApp[] = [
  // ========== TIER BASIC (8 apps) ==========
  {
    id: "redactor",
    slug: "redactor",
    name: "Redactor Político",
    shortDescription: "Crea contenido político profesional con IA",
    fullDescription: "Genera discursos, comunicados y contenido para redes sociales adaptado a tu audiencia",
    category: "comunicacion",
    tier: "BASIC",
    icon: "/icons/moddulo/redactor.svg",
    comingSoon: false,
    features: [
      "Generación de discursos",
      "Comunicados de prensa",
      "Posts para redes sociales",
      "Tono adaptable",
    ],
  },
  {
    id: "crm",
    slug: "crm",
    name: "CRM Comunitario",
    shortDescription: "Gestiona tu red de contactos políticos",
    fullDescription: "Sistema de gestión de relaciones para mantener contacto con tu base de apoyo",
    category: "operaciones",
    tier: "BASIC",
    icon: "/icons/moddulo/crm.svg",
    comingSoon: false,
    features: [
      "Base de datos de contactos",
      "Segmentación de audiencia",
      "Seguimiento de interacciones",
      "Recordatorios automáticos",
    ],
  },
  {
    id: "dashboard",
    slug: "dashboard",
    name: "Dashboard Político",
    shortDescription: "Visualiza métricas clave de tu proyecto",
    fullDescription: "Panel de control con indicadores de desempeño político y electoral",
    category: "datos",
    tier: "BASIC",
    icon: "/icons/moddulo/dashboard.svg",
    comingSoon: false,
    features: [
      "Métricas en tiempo real",
      "Gráficos interactivos",
      "Reportes automáticos",
      "KPIs personalizados",
    ],
  },
  {
    id: "calendario",
    slug: "calendario",
    name: "Calendario Político",
    shortDescription: "Organiza eventos y actividades",
    fullDescription: "Calendario inteligente para gestionar tu agenda política",
    category: "operaciones",
    tier: "BASIC",
    icon: "/icons/moddulo/calendario.svg",
    comingSoon: false,
    features: [
      "Gestión de eventos",
      "Recordatorios inteligentes",
      "Sincronización con Google",
      "Vista semanal/mensual",
    ],
  },
  {
    id: "presupuesto",
    slug: "presupuesto",
    name: "Presupuesto Electoral",
    shortDescription: "Controla gastos de campaña",
    fullDescription: "Herramienta para planificar y monitorear el presupuesto de tu campaña",
    category: "operaciones",
    tier: "BASIC",
    icon: "/icons/moddulo/presupuesto.svg",
    comingSoon: false,
    features: [
      "Control de gastos",
      "Proyecciones financieras",
      "Reportes de cumplimiento",
      "Alertas de presupuesto",
    ],
  },
  {
    id: "foda",
    slug: "foda",
    name: "Análisis FODA",
    shortDescription: "Analiza tu posición política",
    fullDescription: "Matriz FODA interactiva para identificar fortalezas y oportunidades",
    category: "estrategia",
    tier: "BASIC",
    icon: "/icons/moddulo/foda.svg",
    comingSoon: false,
    features: [
      "Matriz FODA digital",
      "Análisis comparativo",
      "Estrategias sugeridas",
      "Exportación a PDF",
    ],
  },
  {
    id: "metricas",
    slug: "metricas",
    name: "Métricas de Campaña",
    shortDescription: "Mide el impacto de tus acciones",
    fullDescription: "Sistema de medición de resultados de actividades políticas",
    category: "datos",
    tier: "BASIC",
    icon: "/icons/moddulo/metricas.svg",
    comingSoon: false,
    features: [
      "Tracking de actividades",
      "ROI político",
      "Gráficos de tendencias",
      "Comparativas históricas",
    ],
  },
  {
    id: "informe-diario",
    slug: "informe-diario",
    name: "Informe Diario",
    shortDescription: "Resumen automático de noticias",
    fullDescription: "Boletín diario con noticias políticas relevantes para tu proyecto",
    category: "comunicacion",
    tier: "BASIC",
    icon: "/icons/moddulo/informe-diario.svg",
    comingSoon: false,
    features: [
      "Noticias personalizadas",
      "Alertas de menciones",
      "Resumen ejecutivo",
      "Envío por email",
    ],
  },

  // ========== TIER PREMIUM (8 apps exclusivas) ==========
  {
    id: "centro-escucha",
    slug: "centro-escucha",
    name: "Centro de Escucha",
    shortDescription: "Monitorea conversaciones en redes sociales",
    fullDescription: "Herramienta de social listening para entender el sentimiento ciudadano",
    category: "comunicacion",
    tier: "PREMIUM",
    icon: "/icons/moddulo/centro-escucha.svg",
    comingSoon: false,
    features: [
      "Monitoreo de redes sociales",
      "Análisis de sentimiento",
      "Trending topics",
      "Alertas en tiempo real",
    ],
  },
  {
    id: "email-marketing",
    slug: "email-marketing",
    name: "Email Marketing",
    shortDescription: "Campañas de email segmentadas",
    fullDescription: "Plataforma para crear y enviar campañas de email político",
    category: "comunicacion",
    tier: "PREMIUM",
    icon: "/icons/moddulo/email-marketing.svg",
    comingSoon: false,
    features: [
      "Plantillas profesionales",
      "Segmentación avanzada",
      "A/B testing",
      "Análisis de apertura",
    ],
  },
  {
    id: "estratega",
    slug: "estratega",
    name: "Estratega IA",
    shortDescription: "Asistente estratégico con IA",
    fullDescription: "Asesor virtual que sugiere estrategias políticas basadas en datos",
    category: "estrategia",
    tier: "PREMIUM",
    icon: "/icons/moddulo/estratega.svg",
    comingSoon: false,
    features: [
      "Recomendaciones estratégicas",
      "Análisis de escenarios",
      "Simulaciones políticas",
      "Chat con IA",
    ],
  },
  {
    id: "sintesis",
    slug: "sintesis",
    name: "Síntesis Legislativa",
    shortDescription: "Resume iniciativas de ley con IA",
    fullDescription: "Analiza y resume documentos legislativos automáticamente",
    category: "datos",
    tier: "PREMIUM",
    icon: "/icons/moddulo/sintesis.svg",
    comingSoon: false,
    features: [
      "Resumen automático",
      "Extracción de puntos clave",
      "Comparación de versiones",
      "Alertas legislativas",
    ],
  },
  {
    id: "redactor-premium",
    slug: "redactor-premium",
    name: "Redactor Político Premium",
    shortDescription: "Redactor con multi-agente IA avanzado",
    fullDescription: "Versión mejorada del redactor con capacidades multi-agente y análisis profundo",
    category: "comunicacion",
    tier: "PREMIUM",
    icon: "/icons/moddulo/redactor-premium.svg",
    comingSoon: false,
    isPremiumUpgrade: true,
    baseAppSlug: "redactor",
    features: [
      "Todo lo de Redactor Básico",
      "Multi-agente IA",
      "Análisis de audiencia profundo",
      "Generación multicanal",
      "Optimización SEO automática",
    ],
  },
  {
    id: "crm-premium",
    slug: "crm-premium",
    name: "CRM Comunitario Premium",
    shortDescription: "CRM con ML scoring y predicción",
    fullDescription: "CRM avanzado con machine learning para predecir comportamiento electoral",
    category: "operaciones",
    tier: "PREMIUM",
    icon: "/icons/moddulo/crm-premium.svg",
    comingSoon: false,
    isPremiumUpgrade: true,
    baseAppSlug: "crm",
    features: [
      "Todo lo de CRM Básico",
      "ML scoring de votantes",
      "Predicción de comportamiento",
      "Automatización avanzada",
      "Integración con WhatsApp",
    ],
  },
  {
    id: "dashboard-premium",
    slug: "dashboard-premium",
    name: "Dashboard Político Premium",
    shortDescription: "Dashboard con AutoML y predicciones",
    fullDescription: "Panel de control con machine learning automático y análisis predictivo",
    category: "datos",
    tier: "PREMIUM",
    icon: "/icons/moddulo/dashboard-premium.svg",
    comingSoon: false,
    isPremiumUpgrade: true,
    baseAppSlug: "dashboard",
    features: [
      "Todo lo de Dashboard Básico",
      "AutoML integrado",
      "Predicciones electorales",
      "Análisis de correlaciones",
      "Dashboards compartidos",
    ],
  },
  {
    id: "calendario-premium",
    slug: "calendario-premium",
    name: "Calendario Político Premium",
    shortDescription: "Calendario con agente proactivo",
    fullDescription: "Calendario inteligente con asistente que sugiere actividades óptimas",
    category: "operaciones",
    tier: "PREMIUM",
    icon: "/icons/moddulo/calendario-premium.svg",
    comingSoon: false,
    isPremiumUpgrade: true,
    baseAppSlug: "calendario",
    features: [
      "Todo lo de Calendario Básico",
      "Agente IA proactivo",
      "Optimización de agenda",
      "Sugerencias inteligentes",
      "Coordinación de equipo",
    ],
  },

  // ========== TIER PROFESSIONAL (9 apps exclusivas) ==========
  {
    id: "monitor-redes",
    slug: "monitor-redes",
    name: "Monitor de Redes",
    shortDescription: "Análisis profundo de redes sociales",
    fullDescription: "Monitoreo avanzado con análisis de influenciadores y viralidad",
    category: "comunicacion",
    tier: "PROFESSIONAL",
    icon: "/icons/moddulo/monitor-redes.svg",
    comingSoon: false,
    features: [
      "Análisis de influenciadores",
      "Mapa de conversaciones",
      "Predicción de viralidad",
      "Reportes personalizados",
    ],
  },
  {
    id: "sala-crisis",
    slug: "sala-crisis",
    name: "Sala de Crisis",
    shortDescription: "Gestión de crisis políticas en tiempo real",
    fullDescription: "Centro de comando para manejar situaciones de crisis",
    category: "estrategia",
    tier: "PROFESSIONAL",
    icon: "/icons/moddulo/sala-crisis.svg",
    comingSoon: false,
    features: [
      "Alertas en tiempo real",
      "Protocolos de respuesta",
      "Coordinación de equipo",
      "Simulacros de crisis",
    ],
  },
  {
    id: "territorio",
    slug: "territorio",
    name: "Territorio Digital",
    shortDescription: "Mapeo y análisis territorial",
    fullDescription: "Herramienta GIS para análisis geopolítico y territorial",
    category: "territorio",
    tier: "PROFESSIONAL",
    icon: "/icons/moddulo/territorio.svg",
    comingSoon: false,
    features: [
      "Mapas interactivos",
      "Análisis geodemográfico",
      "Rutas optimizadas",
      "Capas de datos",
    ],
  },
  {
    id: "chatbot",
    slug: "chatbot",
    name: "Chatbot Político",
    shortDescription: "Asistente virtual para ciudadanos",
    fullDescription: "Chatbot personalizado para atención ciudadana 24/7",
    category: "comunicacion",
    tier: "PROFESSIONAL",
    icon: "/icons/moddulo/chatbot.svg",
    comingSoon: true,
    features: [
      "Respuestas automáticas",
      "Integración WhatsApp/FB",
      "Base de conocimiento",
      "Escalamiento humano",
    ],
  },
  {
    id: "brigada-app",
    slug: "brigada-app",
    name: "Brigada App",
    shortDescription: "App móvil para brigadas electorales",
    fullDescription: "Aplicación móvil para coordinar equipos de campo en territorio",
    category: "territorio",
    tier: "PROFESSIONAL",
    icon: "/icons/moddulo/brigada-app.svg",
    comingSoon: true,
    features: [
      "App iOS/Android",
      "Geolocalización",
      "Reportes desde campo",
      "Coordinación en vivo",
    ],
  },
  {
    id: "rival",
    slug: "rival",
    name: "Análisis de Rivales",
    shortDescription: "Inteligencia competitiva política",
    fullDescription: "Monitoreo y análisis de estrategias de competidores políticos",
    category: "estrategia",
    tier: "PROFESSIONAL",
    icon: "/icons/moddulo/rival.svg",
    comingSoon: false,
    features: [
      "Seguimiento de competidores",
      "Análisis de estrategias",
      "Comparación de mensajes",
      "Alertas de movimientos",
    ],
  },
  {
    id: "retrospectiva",
    slug: "retrospectiva",
    name: "Retrospectiva Electoral",
    shortDescription: "Análisis post-electoral profundo",
    fullDescription: "Herramienta para analizar resultados electorales y aprender de campañas",
    category: "datos",
    tier: "PROFESSIONAL",
    icon: "/icons/moddulo/retrospectiva.svg",
    comingSoon: false,
    features: [
      "Análisis de resultados",
      "Lecciones aprendidas",
      "Comparación histórica",
      "Recomendaciones futuras",
    ],
  },
  {
    id: "prensa",
    slug: "prensa",
    name: "Sala de Prensa Digital",
    shortDescription: "Gestión de relaciones con medios",
    fullDescription: "Plataforma para gestionar comunicación con periodistas y medios",
    category: "comunicacion",
    tier: "PROFESSIONAL",
    icon: "/icons/moddulo/prensa.svg",
    comingSoon: false,
    features: [
      "Base de datos de medios",
      "Distribución de boletines",
      "Seguimiento de cobertura",
      "Análisis de impacto",
    ],
  },
  {
    id: "roi",
    slug: "roi",
    name: "ROI Político",
    shortDescription: "Retorno de inversión en política",
    fullDescription: "Analiza el retorno de inversión de tus acciones políticas",
    category: "datos",
    tier: "PROFESSIONAL",
    icon: "/icons/moddulo/roi.svg",
    comingSoon: false,
    features: [
      "Análisis de ROI",
      "Optimización de gastos",
      "Impacto por actividad",
      "Recomendaciones de inversión",
    ],
  },
];

/**
 * Información de categorías con colores distintivos
 */
export const MODDULO_CATEGORIES: ModduloCategoryInfo[] = [
  {
    id: "comunicacion",
    name: "Comunicación",
    description: "Herramientas para gestionar mensajes y audiencias",
    icon: "/icons/categories/comunicacion.svg",
    color: "#72B84B", // Verde
  },
  {
    id: "estrategia",
    name: "Estrategia",
    description: "Planificación y análisis estratégico",
    icon: "/icons/categories/estrategia.svg",
    color: "#4BB8A2", // Turquesa
  },
  {
    id: "datos",
    name: "Datos y Análisis",
    description: "Visualización y análisis de información",
    icon: "/icons/categories/datos.svg",
    color: "#323A99", // Azul oscuro
  },
  {
    id: "operaciones",
    name: "Operaciones",
    description: "Gestión operativa de campañas",
    icon: "/icons/categories/operaciones.svg",
    color: "#E8B64A", // Amarillo-dorado
  },
  {
    id: "territorio",
    name: "Territorio",
    description: "Análisis y gestión territorial",
    icon: "/icons/categories/territorio.svg",
    color: "#E8624A", // Rojo-naranja
  },
];

/**
 * Función helper: Obtener apps por tier
 */
export function getAppsByTier(tier: "BASIC" | "PREMIUM" | "PROFESSIONAL"): ModduloApp[] {
  switch (tier) {
    case "BASIC":
      return MODDULO_APPS_CATALOG.filter(app => app.tier === "BASIC");
    case "PREMIUM":
      return MODDULO_APPS_CATALOG.filter(app => 
        app.tier === "BASIC" || app.tier === "PREMIUM"
      );
    case "PROFESSIONAL":
      return MODDULO_APPS_CATALOG;
    default:
      return [];
  }
}

/**
 * Función helper: Obtener app por slug
 */
export function getAppBySlug(slug: string): ModduloApp | undefined {
  return MODDULO_APPS_CATALOG.find(app => app.slug === slug);
}

/**
 * Función helper: Obtener apps por categoría
 */
export function getAppsByCategory(category: string): ModduloApp[] {
  return MODDULO_APPS_CATALOG.filter(app => app.category === category);
}

/**
 * Función helper: Obtener color de categoría
 */
export function getCategoryColor(categoryId: string): string {
  const category = MODDULO_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.color || "#026988"; // Default: bluegreen-eske
}
