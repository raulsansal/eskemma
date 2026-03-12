// lib/taller/diagnostico-electoral/config.ts
// ============================================================
// CONFIGURACIÓN DEL TALLER DE DIAGNÓSTICO ELECTORAL
// Basado en el manual de diagnóstico electoral
// ============================================================

import type { Course, CourseModule } from "@/types/course.types";

export const TALLER_CONFIG = {
  id: "taller-diagnostico-electoral",
  title: "Taller de Diagnóstico Electoral",
  slug: "taller-diagnostico-electoral",
  description: "Aprende a analizar elecciones con herramientas prácticas y datos reales. Un taller hands-on basado en el manual de diagnóstico electoral de Eskemma.",
  type: "workshop" as const,
  difficulty: "intermediate" as const,
  estimatedDuration: 1200,
  requiredRole: "user" as const,
  
  hero: {
    title: "Taller de Diagnóstico Electoral",
    subtitle: "Estrategias y herramientas para analizar una elección",
    description: "Convierte datos en decisiones estratégicas. Aprende a diseñar, ejecutar y comunicar diagnósticos electorales con herramientas digitales de vanguardia.",
    features: [
      "Trabaja con tus propios datos",
      "Ejercicios prácticos con código",
      "APIs de redes sociales y datos públicos",
      "Certificación al finalizar",
    ],
  },
};

// Módulos basados en el manual
export const TALLER_MODULES: CourseModule[] = [
  {
    id: "modulo-1-fundamentos",
    title: "Módulo 1: Fundamentos del Análisis Electoral",
    description: "Comprende las bases teóricas y conceptuales del análisis electoral.",
    order: 1,
    estimatedDuration: 180,
    sessions: [
      {
        id: "sesion-1-1-que-es-una-eleccion",
        title: "¿Qué es una elección?",
        description: "Más allá de los votos: dinámicas de poder y legitimidad",
        order: 1,
        contentType: ["text", "exercise"],
        estimatedDuration: 45,
        exercises: [
          {
            id: "ej-1-1-identificar-actores",
            title: "Identifica actores electorales",
            description: "Usando los primeros registros de tu dataset, identifica qué columnas representarían dinámicas de poder.",
            type: "analysis",
            isRequired: true,
          },
        ],
      },
      {
        id: "sesion-1-2-teorias-clave",
        title: "Teorías del comportamiento electoral",
        description: "Racionalidad vs. emociones en la decisión de voto",
        order: 2,
        contentType: ["text", "exercise"],
        estimatedDuration: 45,
      },
      {
        id: "sesion-1-3-ia-y-emociones",
        title: "Cómo la IA amplifica emociones",
        description: "Persuasión algorítmica y su impacto electoral",
        order: 3,
        contentType: ["text", "exercise"],
        estimatedDuration: 45,
      },
      {
        id: "sesion-1-4-ciclo-electoral",
        title: "El ciclo electoral",
        description: "Precampaña, campaña, jornada y posjuego",
        order: 4,
        contentType: ["text"],
        estimatedDuration: 30,
      },
      {
        id: "sesion-1-5-actores-tradicionales",
        title: "Actores y variables",
        description: "Candidatos, partidos, medios y ciudadanos",
        order: 5,
        contentType: ["text"],
        estimatedDuration: 30,
      },
      {
        id: "sesion-1-6-actores-digitales",
        title: "Nuevos actores digitales",
        description: "Plataformas, algoritmos, influencers y bots",
        order: 6,
        contentType: ["text", "exercise"],
        estimatedDuration: 45,
      },
      {
        id: "sesion-1-7-caso-practico",
        title: "Caso práctico: Elecciones 2024",
        description: "Análisis de deepfakes y desinformación en México y EE.UU.",
        order: 7,
        contentType: ["text"],
        estimatedDuration: 30,
      },
      {
        id: "sesion-1-8-reflexion",
        title: "Reflexión final",
        description: "¿Razón o sentimiento en tu contexto?",
        order: 8,
        contentType: ["exercise"],
        estimatedDuration: 30,
      },
    ],
  },
  
  {
    id: "modulo-2-diseno",
    title: "Módulo 2: Diseño del Diagnóstico Electoral",
    description: "Aprende a diseñar un diagnóstico efectivo con preguntas clave y fuentes de datos.",
    order: 2,
    estimatedDuration: 180,
    sessions: [
      {
        id: "sesion-2-1-preguntas-clave",
        title: "Preguntas clave",
        description: "Define qué quieres saber y por qué",
        order: 1,
        contentType: ["text", "exercise"],
        estimatedDuration: 45,
        exercises: [
          {
            id: "ej-2-1-definir-preguntas",
            title: "Define 5 preguntas clave",
            description: "Usando el asistente, formula 5 preguntas SMART para tu proyecto electoral.",
            type: "analysis",
            isRequired: true,
          },
        ],
      },
      {
        id: "sesion-2-2-fuentes-de-datos",
        title: "Fuentes de datos",
        description: "Encuestas, redes sociales, medios y observación directa",
        order: 2,
        contentType: ["text"],
        estimatedDuration: 30,
      },
      {
        id: "sesion-2-3-fuentes-digitales",
        title: "Fuentes digitales avanzadas",
        description: "APIs (X/Twitter, Google), big data electoral",
        order: 3,
        contentType: ["text", "exercise"],
        estimatedDuration: 45,
      },
      {
        id: "sesion-2-4-delimitacion",
        title: "Delimitación del análisis",
        description: "Geografía, demografía y temporalidad",
        order: 4,
        contentType: ["text", "exercise"],
        estimatedDuration: 30,
      },
      {
        id: "sesion-2-5-gis",
        title: "Delimitación geoespacial con GIS",
        description: "Google Earth Engine y QGIS gratuitos",
        order: 5,
        contentType: ["text"],
        estimatedDuration: 30,
      },
      {
        id: "sesion-2-6-herramientas-basicas",
        title: "Herramientas básicas",
        description: "Del Excel casero a software especializado",
        order: 6,
        contentType: ["text"],
        estimatedDuration: 30,
      },
      {
        id: "sesion-2-7-ia-y-ml",
        title: "Herramientas de IA y ML",
        description: "Python, R, Tableau para análisis electoral",
        order: 7,
        contentType: ["text"],
        estimatedDuration: 30,
      },
      {
        id: "sesion-2-8-esquema",
        title: "Esquema del plan de diagnóstico",
        description: "Pasos para armar tu plan con flujo de IA",
        order: 8,
        contentType: ["text"],
        estimatedDuration: 30,
      },
      {
        id: "sesion-2-9-ejercicio",
        title: "Ejercicio final",
        description: "Define tu plan de diagnóstico",
        order: 9,
        contentType: ["exercise"],
        estimatedDuration: 30,
      },
    ],
  },
];

// Exportar configuración completa
export const TALLER_DIAGNOSTICO = {
  ...TALLER_CONFIG,
  modules: TALLER_MODULES,
};

// Helper para obtener una sesión específica
export function getSession(moduleId: string, sessionId: string) {
  const module = TALLER_MODULES.find(m => m.id === moduleId);
  if (!module) return null;
  return module.sessions.find(s => s.id === sessionId) || null;
}

// Helper para obtener el módulo actual y siguiente/anterior
export function getModuleNavigation(moduleId: string, sessionId: string) {
  const moduleIndex = TALLER_MODULES.findIndex(m => m.id === moduleId);
  if (moduleIndex === -1) return { prev: null, next: null };
  
  const module = TALLER_MODULES[moduleIndex];
  const sessionIndex = module.sessions.findIndex(s => s.id === sessionId);
  
  let prev = null;
  let next = null;
  
  // Sesión anterior en el mismo módulo
  if (sessionIndex > 0) {
    prev = {
      moduleId,
      sessionId: module.sessions[sessionIndex - 1].id,
      title: module.sessions[sessionIndex - 1].title,
    };
  } 
  // Última sesión del módulo anterior
  else if (moduleIndex > 0) {
    const prevModule = TALLER_MODULES[moduleIndex - 1];
    const lastSession = prevModule.sessions[prevModule.sessions.length - 1];
    prev = {
      moduleId: prevModule.id,
      sessionId: lastSession.id,
      title: lastSession.title,
    };
  }
  
  // Sesión siguiente en el mismo módulo
  if (sessionIndex < module.sessions.length - 1) {
    next = {
      moduleId,
      sessionId: module.sessions[sessionIndex + 1].id,
      title: module.sessions[sessionIndex + 1].title,
    };
  }
  // Primera sesión del módulo siguiente
  else if (moduleIndex < TALLER_MODULES.length - 1) {
    const nextModule = TALLER_MODULES[moduleIndex + 1];
    next = {
      moduleId: nextModule.id,
      sessionId: nextModule.sessions[0].id,
      title: nextModule.sessions[0].title,
    };
  }
  
  return { prev, next };
}