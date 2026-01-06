// lib/redactor/knowledge/countries/mexico/electoral/legal-framework.ts
// ============================================================
// MARCO LEGAL ELECTORAL - MÉXICO
// Fuente: INE, TEPJF, LGIPE
// ============================================================

import type { ElectoralConfig, ValidationWarning, ValidationError } from "@/types/redactor.types";

export const MEXICO_ELECTORAL_FRAMEWORK = {
  country: "Mexico",
  context: "electoral" as const,
  regulatoryBody: "INE (Instituto Nacional Electoral)",
  
  mainLaws: [
    {
      name: "LGIPE - Ley General de Instituciones y Procedimientos Electorales",
      year: 2014,
      lastUpdate: 2024,
    },
    {
      name: "LEGIPE - Ley General en Materia de Delitos Electorales",
      year: 2014,
      lastUpdate: 2023,
    },
    {
      name: "Ley General de Partidos Políticos",
      year: 2014,
      lastUpdate: 2023,
    },
  ],
  
  // ============================================================
  // RESTRICCIONES Y VALIDACIONES
  // ============================================================
  
  restrictions: {
    // 1. PERIODO DE CAMPAÑA
    campaignPeriod: {
      rule: "Solo propaganda permitida en periodo oficial de campaña",
      reference: "LGIPE Art. 242",
      penalty: "Multa hasta 5,000 veces UMA",
      
      validate: (text: string, config: ElectoralConfig): ValidationWarning | null => {
        const now = new Date();
        const { campaignStart, campaignEnd } = config.electionCalendar;
        
        // Detectar lenguaje persuasivo
        const persuasiveKeywords = /vota por|apoya a|elige|sufragio|tu voto/i;
        const hasPersuasiveLanguage = persuasiveKeywords.test(text);
        
        if (hasPersuasiveLanguage && (now < campaignStart || now > campaignEnd)) {
          return {
            type: "legal",
            message: "Fuera de periodo de campaña",
            reference: "LGIPE Art. 242",
            suggestion: "Usa lenguaje informativo, no persuasivo. Evita palabras como 'vota', 'apoya', 'elige'.",
          };
        }
        
        return null;
      },
    },
    
    // 2. VEDA ELECTORAL
    vedaElectoral: {
      rule: "Prohibida propaganda 3 días antes de elección hasta cierre de casillas",
      reference: "LGIPE Art. 243",
      penalty: "Multa y posible anulación de elección",
      
      validate: (text: string, config: ElectoralConfig): ValidationError | null => {
        const now = new Date();
        const { electionDay } = config.electionCalendar;
        
        // Calcular días hasta elección
        const daysDiff = Math.floor((electionDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 3 && daysDiff >= 0) {
          return {
            type: "legal",
            message: "🚫 VEDA ELECTORAL: Prohibida toda propaganda",
            reference: "LGIPE Art. 243",
            severity: "critical",
          };
        }
        
        return null;
      },
    },
    
    // 3. SÍMBOLOS PATRIOS
    symbolsPatrios: {
      rule: "Prohibido uso indebido de símbolos patrios",
      reference: "Ley sobre el Escudo, la Bandera y el Himno Nacionales",
      penalty: "Multa administrativa",
      
      validate: (text: string): ValidationWarning | null => {
        const symbolKeywords = /bandera|himno nacional|escudo nacional|lábaro patrio/i;
        
        if (symbolKeywords.test(text)) {
          return {
            type: "legal",
            message: "Mención de símbolos patrios detectada",
            reference: "Ley de Símbolos Patrios",
            suggestion: "Verifica que el contexto sea respetuoso y no use símbolos con fines propagandísticos.",
          };
        }
        
        return null;
      },
    },
    
    // 4. COALICIÓN
    coalitionMention: {
      rule: "Debe mencionarse la coalición si el candidato forma parte de una",
      reference: "Reglamento de Elecciones INE",
      
      validate: (text: string, config: ElectoralConfig): ValidationWarning | null => {
        if (config.candidate.coalition && config.candidate.coalition.length > 0) {
          const coalitionMentioned = config.candidate.coalition.some(party => 
            text.toLowerCase().includes(party.toLowerCase())
          );
          
          const candidateMentioned = text.toLowerCase().includes(config.candidate.name.toLowerCase());
          
          if (candidateMentioned && !coalitionMentioned) {
            return {
              type: "legal",
              message: "No se menciona la coalición",
              reference: "Reglamento INE",
              suggestion: `Incluye: "En coalición con ${config.candidate.coalition.join(', ')}"`,
            };
          }
        }
        
        return null;
      },
    },
    
    // 5. CALUMNIA Y DIFAMACIÓN
    defamation: {
      rule: "Prohibidas calumnias y difamación contra oponentes",
      reference: "LEGIPE Art. 7",
      penalty: "Prisión de 200 a 400 días",
      
      validate: (text: string): ValidationWarning | null => {
        const defamatoryKeywords = /corrupto|ladrón|criminal|delincuente|mentiroso|fraudulento/i;
        
        if (defamatoryKeywords.test(text)) {
          return {
            type: "legal",
            message: "Posible lenguaje difamatorio detectado",
            reference: "LEGIPE Art. 7",
            suggestion: "Evita acusaciones directas sin sustento. Enfócate en propuestas y diferencias programáticas.",
          };
        }
        
        return null;
      },
    },
    
    // 6. PROMESAS SIN SUSTENTO
    unfoundedPromises: {
      rule: "Las promesas de campaña deben tener sustento técnico y financiero",
      reference: "Criterios INE sobre propaganda",
      
      validate: (text: string): ValidationWarning | null => {
        const promiseKeywords = /prometo|garantizo|aseguro|haré que|eliminaré/i;
        const budgetKeywords = /presupuesto|inversión|recursos|millones|pesos/i;
        
        const hasPromise = promiseKeywords.test(text);
        const hasBudget = budgetKeywords.test(text);
        
        if (hasPromise && !hasBudget) {
          return {
            type: "legal",
            message: "Promesa detectada sin sustento presupuestal",
            reference: "Criterios INE",
            suggestion: "Incluye información sobre cómo se financiará la propuesta.",
          };
        }
        
        return null;
      },
    },
    
    // 7. DISCRIMINACIÓN
    discrimination: {
      rule: "Prohibido lenguaje discriminatorio por género, raza, religión, etc.",
      reference: "LGIPE Art. 38, párr. 1, inc. s",
      penalty: "Multa y amonestación pública",
      
      validate: (text: string): ValidationError | null => {
        // Lista de términos potencialmente discriminatorios
        const discriminatoryPatterns = [
          /(?:hombres|mujeres) no pueden/i,
          /(?:personas|gente) de color/i,
          /extranjeros? ilegales?/i,
        ];
        
        for (const pattern of discriminatoryPatterns) {
          if (pattern.test(text)) {
            return {
              type: "legal",
              message: "🚫 Lenguaje potencialmente discriminatorio",
              reference: "LGIPE Art. 38",
              severity: "high",
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
    paidContent: {
      trigger: /patrocinado|pagado|promocionado|propaganda/i,
      text: "Propaganda política pagada. Financiada con recursos de [PARTIDO/INE].",
      reference: "LGIPE Art. 242",
    },
    
    socialMediaPost: {
      trigger: /.*/,  // Siempre para posts en redes
      text: "Campaña electoral de [CANDIDATO] - [PARTIDO]",
      reference: "Criterios INE para redes sociales",
    },
  },
  
  // ============================================================
  // PERIODOS SENSIBLES
  // ============================================================
  
  sensitivePeriods: [
    {
      name: "Pre-campaña",
      description: "Desde registro de precandidaturas hasta inicio oficial",
      restrictions: "Propaganda limitada, solo para elecciones internas del partido",
    },
    {
      name: "Campaña",
      description: "Periodo oficial de campaña electoral",
      restrictions: "Propaganda permitida con límites de gasto",
    },
    {
      name: "Veda electoral",
      description: "3 días antes de elección hasta cierre de casillas",
      restrictions: "Prohibida toda propaganda",
    },
  ],
};

// ============================================================
// FUNCIÓN DE VALIDACIÓN COMPLETA
// ============================================================

export function validateElectoralPost(
  text: string,
  config: ElectoralConfig
): {
  warnings: ValidationWarning[];
  errors: ValidationError[];
  requiredDisclaimers: string[];
} {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];
  const requiredDisclaimers: string[] = [];
  
  const { restrictions, requiredDisclaimers: disclaimersConfig } = MEXICO_ELECTORAL_FRAMEWORK;
  
  // Ejecutar todas las validaciones
  const campaignPeriodCheck = restrictions.campaignPeriod.validate(text, config);
  if (campaignPeriodCheck) warnings.push(campaignPeriodCheck);
  
  const vedaCheck = restrictions.vedaElectoral.validate(text, config);
  if (vedaCheck) errors.push(vedaCheck);
  
  const symbolsCheck = restrictions.symbolsPatrios.validate(text);
  if (symbolsCheck) warnings.push(symbolsCheck);
  
  const coalitionCheck = restrictions.coalitionMention.validate(text, config);
  if (coalitionCheck) warnings.push(coalitionCheck);
  
  const defamationCheck = restrictions.defamation.validate(text);
  if (defamationCheck) warnings.push(defamationCheck);
  
  const promiseCheck = restrictions.unfoundedPromises.validate(text);
  if (promiseCheck) warnings.push(promiseCheck);
  
  const discriminationCheck = restrictions.discrimination.validate(text);
  if (discriminationCheck) errors.push(discriminationCheck);
  
  // Detectar disclaimers requeridos
  for (const [key, disclaimerConfig] of Object.entries(disclaimersConfig)) {
    if (disclaimerConfig.trigger.test(text)) {
      // Personalizar disclaimer con datos del config
      let disclaimer = disclaimerConfig.text
        .replace("[CANDIDATO]", config.candidate.name || "")
        .replace("[PARTIDO]", config.candidate.party || "");
      
      requiredDisclaimers.push(disclaimer);
    }
  }
  
  return { warnings, errors, requiredDisclaimers };
}
