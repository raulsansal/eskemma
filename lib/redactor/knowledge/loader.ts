// lib/redactor/knowledge/loader.ts
// ============================================================
// CARGADOR DINÁMICO DE KNOWLEDGE BASE
// ============================================================

import type { ProjectContext } from "@/types/redactor.types";

// Interfaces para los frameworks
export interface LegalFramework {
  country: string;
  context: ProjectContext;
  regulatoryBody: string;
  mainLaws: Array<{
    name: string;
    year: number;
    lastUpdate?: number;
    authority?: string;
  }>;
  restrictions: Record<string, any>;
  requiredDisclaimers: Record<string, any>;
}

// ============================================================
// FUNCIÓN PRINCIPAL DE CARGA
// ============================================================

export async function loadKnowledgeBase(
  country: string,
  context: ProjectContext
): Promise<LegalFramework> {
  try {
    // Normalizar nombre del país
    const normalizedCountry = country.toLowerCase().replace(/\s+/g, "-");
    
    // Construir path dinámico
    const modulePath = `./countries/${normalizedCountry}/${context}/legal-framework`;
    
    console.log(`Loading knowledge base: ${modulePath}`);
    
    // Importar módulo dinámicamente
    const module = await import(modulePath);
    
    // Retornar el framework (puede ser default export o named export)
    return module.default || module[`${country.toUpperCase()}_${context.toUpperCase()}_FRAMEWORK`];
    
  } catch (error) {
    console.warn(`No knowledge base found for ${country} (${context}). Using generic framework.`);
    return getGenericFramework(context);
  }
}

// ============================================================
// FRAMEWORK GENÉRICO (FALLBACK)
// ============================================================

function getGenericFramework(context: ProjectContext): LegalFramework {
  if (context === "electoral") {
    return {
      country: "Generic",
      context: "electoral",
      regulatoryBody: "Electoral Authority",
      mainLaws: [
        {
          name: "General Electoral Law",
          year: 2020,
        },
      ],
      restrictions: {
        basicCompliance: {
          rule: "Follow general electoral best practices",
          validate: () => null,
        },
      },
      requiredDisclaimers: {
        generic: {
          trigger: /.*/,
          text: "Political campaign content.",
        },
      },
    };
  } else {
    return {
      country: "Generic",
      context: "governmental",
      regulatoryBody: "Government Communication Office",
      mainLaws: [
        {
          name: "Government Communication Act",
          year: 2020,
        },
      ],
      restrictions: {
        neutralLanguage: {
          rule: "Use neutral, non-political language",
          validate: () => null,
        },
      },
      requiredDisclaimers: {
        generic: {
          trigger: /.*/,
          text: "Official government communication.",
        },
      },
    };
  }
}

// ============================================================
// CACHE DEL KNOWLEDGE BASE
// ============================================================

const knowledgeCache = new Map<string, LegalFramework>();

export async function loadKnowledgeBaseCached(
  country: string,
  context: ProjectContext
): Promise<LegalFramework> {
  const cacheKey = `${country}-${context}`;
  
  // Verificar si ya está en cache
  if (knowledgeCache.has(cacheKey)) {
    return knowledgeCache.get(cacheKey)!;
  }
  
  // Cargar y cachear
  const framework = await loadKnowledgeBase(country, context);
  knowledgeCache.set(cacheKey, framework);
  
  return framework;
}

// ============================================================
// HELPER: LISTAR PAÍSES DISPONIBLES
// ============================================================

export function getAvailableCountries(): Array<{
  code: string;
  name: string;
  contexts: ProjectContext[];
}> {
  return [
    {
      code: "mexico",
      name: "México",
      contexts: ["electoral", "governmental"],
    },
    {
      code: "colombia",
      name: "Colombia",
      contexts: ["electoral", "governmental"],
    },
    {
      code: "chile",
      name: "Chile",
      contexts: ["electoral", "governmental"],
    },
    {
      code: "espana",
      name: "España",
      contexts: ["electoral", "governmental"],
    },
  ];
}

// ============================================================
// HELPER: VERIFICAR SI HAY KNOWLEDGE BASE
// ============================================================

export async function hasKnowledgeBase(
  country: string,
  context: ProjectContext
): Promise<boolean> {
  try {
    await loadKnowledgeBase(country, context);
    return true;
  } catch {
    return false;
  }
}
