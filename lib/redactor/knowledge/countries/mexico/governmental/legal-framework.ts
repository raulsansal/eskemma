// lib/redactor/knowledge/countries/mexico/governmental/legal-framework.ts
// ============================================================
// MARCO LEGAL GUBERNAMENTAL - MÉXICO
// Fuente: Ley General de Comunicación Social, SEGOB
// ============================================================

import type { GovernmentalConfig, ValidationWarning, ValidationError } from "@/types/redactor.types";

export const MEXICO_GOVERNMENTAL_FRAMEWORK = {
  country: "Mexico",
  context: "governmental" as const,
  regulatoryBody: "Secretaría de Gobernación (SEGOB)",
  
  mainLaws: [
    {
      name: "Ley General de Comunicación Social",
      year: 2018,
      lastUpdate: 2023,
    },
    {
      name: "Lineamientos Generales para las Campañas de Comunicación Social",
      authority: "SEGOB",
      year: 2019,
    },
  ],
  
  // ============================================================
  // RESTRICCIONES Y VALIDACIONES
  // ============================================================
  
  restrictions: {
    // 1. CONTENIDO PARTIDISTA
    partisanContent: {
      rule: "Prohibida propaganda política en comunicación gubernamental",
      reference: "LGCS Art. 3, Art. 7",
      penalty: "Multa administrativa y responsabilidad del servidor público",
      
      validate: (text: string): ValidationError | null => {
        const partisanKeywords = [
          /vota por/i,
          /apoya a/i,
          /candidato/i,
          /partido político/i,
          /elección/i,
          /campaña electoral/i,
          /sufragio/i,
        ];
        
        const violations = partisanKeywords.filter(regex => regex.test(text));
        
        if (violations.length > 0) {
          return {
            type: "legal",
            message: "🚫 CONTENIDO PARTIDISTA DETECTADO",
            reference: "LGCS Art. 3, Art. 7",
            severity: "critical",
          };
        }
        
        return null;
      },
    },
    
    // 2. PROMOCIÓN PERSONAL
    personalPromotion: {
      rule: "Prohibida promoción personalizada de servidores públicos",
      reference: "LGCS Art. 8",
      penalty: "Responsabilidad administrativa",
      
      validate: (text: string, config: GovernmentalConfig): ValidationWarning | null => {
        const personalPronouns = /\b(yo|mi|mis|mío|conmigo)\b/i;
        const personalizedActions = /yo (?:propuse|hice|logré|conseguí)/i;
        
        if (personalPronouns.test(text) || personalizedActions.test(text)) {
          return {
            type: "legal",
            message: "Lenguaje personalista detectado",
            reference: "LGCS Art. 8",
            suggestion: `Usa lenguaje institucional: "${config.administration.name} implementa...", "La administración logró..."`,
          };
        }
        
        return null;
      },
    },
    
    // 3. LENGUAJE CLARO Y ACCESIBLE
    accessibilityLanguage: {
      rule: "Lenguaje claro, sencillo y accesible para toda la población",
      reference: "LGCS Art. 4, Lineamientos SEGOB",
      
      validate: (text: string): ValidationWarning | null => {
        const technicalTerms = /\b(paradigma|sinergia|holístico|transversal|estratégico|sistémico)\b/i;
        const longWords = text.split(/\s+/).filter(word => word.length > 15);
        
        if (technicalTerms.test(text) || longWords.length > 3) {
          return {
            type: "accessibility",
            message: "Lenguaje técnico o complejo detectado",
            reference: "LGCS Art. 4",
            suggestion: "Usa términos claros y comprensibles para todos los ciudadanos.",
          };
        }
        
        return null;
      },
    },
    
    // 4. INFORMACIÓN VERIFICABLE
    verifiableInformation: {
      rule: "La información debe ser veraz y verificable",
      reference: "LGCS Art. 4",
      
      validate: (text: string): ValidationWarning | null => {
        const claimKeywords = /(?:aumentamos|logramos|conseguimos|mejoramos) (?:en )?\d+%/i;
        const sourceKeywords = /según|de acuerdo con|fuente|datos de/i;
        
        const hasClaim = claimKeywords.test(text);
        const hasSource = sourceKeywords.test(text);
        
        if (hasClaim && !hasSource) {
          return {
            type: "legal",
            message: "Cifra mencionada sin fuente",
            reference: "LGCS Art. 4",
            suggestion: "Incluye la fuente de los datos: 'Según INEGI...', 'De acuerdo con el informe...'",
          };
        }
        
        return null;
      },
    },
    
    // 5. NO DISCRIMINACIÓN
    nonDiscrimination: {
      rule: "Prohibido lenguaje discriminatorio por cualquier motivo",
      reference: "LGCS Art. 4, Constitución Art. 1",
      penalty: "Responsabilidad administrativa y legal",
      
      validate: (text: string): ValidationError | null => {
        const discriminatoryPatterns = [
          /(?:hombres|mujeres|personas) no (?:pueden|deben|deberían)/i,
          /discapacitados/i,  // Debe ser "personas con discapacidad"
          /tercera edad/i,    // Debe ser "personas adultas mayores"
        ];
        
        for (const pattern of discriminatoryPatterns) {
          if (pattern.test(text)) {
            return {
              type: "legal",
              message: "🚫 Lenguaje potencialmente discriminatorio o inadecuado",
              reference: "LGCS Art. 4, Const. Art. 1",
              severity: "high",
            };
          }
        }
        
        return null;
      },
    },
    
    // 6. SÍMBOLOS INSTITUCIONALES
    institutionalSymbols: {
      rule: "Uso adecuado de símbolos y colores institucionales",
      reference: "Manual de Identidad Institucional",
      
      validate: (text: string): ValidationWarning | null => {
        // Detectar si menciona colores o símbolos
        const symbolKeywords = /logo|escudo|insignia|bandera institucional/i;
        
        if (symbolKeywords.test(text)) {
          return {
            type: "style",
            message: "Mención de símbolos institucionales",
            reference: "Manual de Identidad",
            suggestion: "Verifica que el uso cumpla con el manual de identidad institucional.",
          };
        }
        
        return null;
      },
    },
    
    // 7. EMERGENCIAS Y CRISIS
    emergencyCommunication: {
      rule: "Comunicación de emergencias debe ser clara, directa y verificada",
      reference: "Protocolo de Comunicación de Riesgos",
      
      validate: (text: string, config: GovernmentalConfig): ValidationWarning | null => {
        if (config.communicationType === "emergencia") {
          const hasInstructions = /debe|deben|es necesario|favor de/i.test(text);
          const hasContact = /llamar|contactar|línea|teléfono|número/i.test(text);
          
          if (!hasInstructions || !hasContact) {
            return {
              type: "accessibility",
              message: "Comunicación de emergencia incompleta",
              reference: "Protocolo de Riesgos",
              suggestion: "Incluye instrucciones claras y datos de contacto para emergencias.",
            };
          }
        }
        
        return null;
      },
    },
  },
  
  // ============================================================
  // DISCLAIMERS REQUERIDOS
  // ============================================================
  
  requiredDisclaimers: {
    socialProgram: {
      trigger: /\b(programa|apoyo|beca|subsidio|ayuda|beneficio)\b/i,
      text: "Este programa es público, ajeno a cualquier partido político. Queda prohibido el uso para fines distintos a los establecidos en el programa.",
      reference: "LGCS Art. 8",
    },
    
    publicResources: {
      trigger: /\b(recursos públicos|presupuesto|inversión|gasto)\b/i,
      text: "Recursos públicos de [PROGRAMA]. Financiado con [FUENTE].",
      reference: "Ley Federal de Presupuesto",
    },
    
    contactInformation: {
      trigger: /\b(información|dudas|consultas|orientación)\b/i,
      text: "Para más información, visita [SITIO_WEB] o llama al [TELÉFONO].",
      reference: "Lineamientos SEGOB",
    },
  },
  
  // ============================================================
  // TIPOS DE COMUNICACIÓN GUBERNAMENTAL
  // ============================================================
  
  communicationTypes: {
    institucional: {
      description: "Comunicación oficial general del gobierno",
      characteristics: ["Informativa", "Objetiva", "Verificable"],
      tone: "Profesional e institucional",
    },
    
    "rendicion-cuentas": {
      description: "Informes de gestión y resultados",
      characteristics: ["Datos verificables", "Fuentes oficiales", "Comparativas temporales"],
      tone: "Formal y objetivo",
      requiredElements: ["Cifras", "Fuentes", "Periodo de referencia"],
    },
    
    "programa-social": {
      description: "Difusión de programas sociales",
      characteristics: ["Requisitos claros", "Proceso de registro", "Beneficios específicos"],
      tone: "Claro y accesible",
      requiredElements: ["Quién puede acceder", "Cómo registrarse", "Qué recibirá"],
    },
    
    emergencia: {
      description: "Comunicación de crisis y emergencias",
      characteristics: ["Inmediata", "Clara", "Con instrucciones precisas"],
      tone: "Directo y tranquilizador",
      requiredElements: ["Qué pasó", "Qué hacer", "Dónde obtener ayuda"],
    },
    
    participacion: {
      description: "Consultas y participación ciudadana",
      characteristics: ["Invitación abierta", "Canales claros", "Fechas específicas"],
      tone: "Inclusivo e invitador",
      requiredElements: ["Qué se consulta", "Cómo participar", "Cuándo"],
    },
    
    servicios: {
      description: "Información sobre trámites y servicios",
      characteristics: ["Paso a paso", "Requisitos", "Costos (si aplica)"],
      tone: "Instructivo y claro",
      requiredElements: ["Qué se necesita", "Dónde se realiza", "Cuánto cuesta"],
    },
  },
};

// ============================================================
// FUNCIÓN DE VALIDACIÓN COMPLETA
// ============================================================

export function validateGovernmentalPost(
  text: string,
  config: GovernmentalConfig
): {
  warnings: ValidationWarning[];
  errors: ValidationError[];
  requiredDisclaimers: string[];
} {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];
  const requiredDisclaimers: string[] = [];
  
  const { restrictions, requiredDisclaimers: disclaimersConfig } = MEXICO_GOVERNMENTAL_FRAMEWORK;
  
  // Ejecutar todas las validaciones
  const partisanCheck = restrictions.partisanContent.validate(text);
  if (partisanCheck) errors.push(partisanCheck);
  
  const personalCheck = restrictions.personalPromotion.validate(text, config);
  if (personalCheck) warnings.push(personalCheck);
  
  const accessibilityCheck = restrictions.accessibilityLanguage.validate(text);
  if (accessibilityCheck) warnings.push(accessibilityCheck);
  
  const verifiableCheck = restrictions.verifiableInformation.validate(text);
  if (verifiableCheck) warnings.push(verifiableCheck);
  
  const discriminationCheck = restrictions.nonDiscrimination.validate(text);
  if (discriminationCheck) errors.push(discriminationCheck);
  
  const symbolsCheck = restrictions.institutionalSymbols.validate(text);
  if (symbolsCheck) warnings.push(symbolsCheck);
  
  const emergencyCheck = restrictions.emergencyCommunication.validate(text, config);
  if (emergencyCheck) warnings.push(emergencyCheck);
  
  // Detectar disclaimers requeridos
  for (const [key, disclaimerConfig] of Object.entries(disclaimersConfig)) {
    if (disclaimerConfig.trigger.test(text)) {
      let disclaimer = disclaimerConfig.text;
      
      // Personalizar disclaimer con datos del config
      if (config.programInfo) {
        disclaimer = disclaimer
          .replace("[PROGRAMA]", config.programInfo.name)
          .replace("[FUENTE]", config.programInfo.source);
      }
      
      requiredDisclaimers.push(disclaimer);
    }
  }
  
  return { warnings, errors, requiredDisclaimers };
}
