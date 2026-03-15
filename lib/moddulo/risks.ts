// lib/moddulo/risks.ts
// Detección de señales de riesgo en los datos XPCTO de un proyecto

import type { XPCTO, ProjectType } from "@/types/moddulo.types";

export type RiskLevel = "warning" | "critical";

export interface RiskSignal {
  id: string;
  level: RiskLevel;
  field: string;       // Campo XPCTO afectado (ej. "xpcto.tiempo")
  title: string;
  description: string;
}

// ==========================================
// FUNCIÓN PRINCIPAL
// ==========================================

export function detectRisks(
  xpcto: Partial<XPCTO>,
  projectType: ProjectType
): RiskSignal[] {
  const risks: RiskSignal[] = [];

  // --- HITO (X) ---
  if (xpcto.hito !== undefined) {
    if (xpcto.hito.trim().length < 20) {
      risks.push({
        id: "hito-vago",
        level: "warning",
        field: "xpcto.hito",
        title: "Hito poco específico",
        description:
          "El Hito definido parece demasiado breve o vago. Un hito sólido debe ser concreto, medible y sin ambigüedad. Considera reformularlo con cifras o condiciones verificables.",
      });
    }
  }

  // --- TIEMPO (T) ---
  if (xpcto.tiempo?.duracionMeses !== undefined) {
    const meses = xpcto.tiempo.duracionMeses;

    if (meses < 3 && projectType === "electoral") {
      risks.push({
        id: "tiempo-critico-electoral",
        level: "critical",
        field: "xpcto.tiempo",
        title: "Tiempo insuficiente para campaña electoral",
        description:
          "Menos de 3 meses para una campaña electoral es un escenario de altísimo riesgo. La metodología XPCTO requiere tiempo mínimo para completar investigación, estrategia y táctica. Valida si la fecha límite es realmente inamovible.",
      });
    } else if (meses < 2) {
      risks.push({
        id: "tiempo-critico",
        level: "critical",
        field: "xpcto.tiempo",
        title: "Tiempo extremadamente reducido",
        description:
          "Con menos de 2 meses de horizonte, varias fases de la metodología tendrán que comprimirse o eliminarse. Esto compromete la calidad del diagnóstico y la estrategia.",
      });
    } else if (meses < 4 && projectType !== "ciudadano") {
      risks.push({
        id: "tiempo-ajustado",
        level: "warning",
        field: "xpcto.tiempo",
        title: "Tiempo ajustado",
        description:
          "El horizonte temporal es corto para el tipo de proyecto. Se recomienda revisar el cronograma y priorizar las fases críticas.",
      });
    }
  }

  // --- CAPACIDADES (C) ---
  if (xpcto.capacidades) {
    const { financiero, humano, logistico } = xpcto.capacidades;
    const vacíos = [financiero, humano, logistico].filter(
      (v) => v !== undefined && v.trim().length < 10
    );

    if (vacíos.length >= 2) {
      risks.push({
        id: "capacidades-incompletas",
        level: "warning",
        field: "xpcto.capacidades",
        title: "Capacidades insuficientemente definidas",
        description:
          "Al menos dos dimensiones de las Capacidades (C) están sin desarrollar. Sin un diagnóstico claro de recursos, la táctica carecerá de base real. Completa financiero, humano y logístico con información concreta.",
      });
    }

    if (financiero !== undefined && financiero.trim().length > 0) {
      const textoLower = financiero.toLowerCase();
      if (
        textoLower.includes("no hay") ||
        textoLower.includes("sin presupuesto") ||
        textoLower.includes("cero") ||
        textoLower.includes("ninguno")
      ) {
        risks.push({
          id: "sin-presupuesto",
          level: "critical",
          field: "xpcto.capacidades.financiero",
          title: "Sin presupuesto declarado",
          description:
            "El proyecto no cuenta con presupuesto disponible. Sin recursos financieros, la ejecución táctica es inviable. Considera si existe financiamiento potencial antes de avanzar.",
        });
      }
    }
  }

  // --- JUSTIFICACIÓN (O) ---
  if (xpcto.justificacion !== undefined) {
    if (xpcto.justificacion.trim().length < 30) {
      risks.push({
        id: "justificacion-debil",
        level: "warning",
        field: "xpcto.justificacion",
        title: "Justificación estratégica débil",
        description:
          "La Justificación (O) es el elemento ético y motivacional del proyecto. Una justificación débil o poco desarrollada dificulta la construcción de narrativa y el compromiso del equipo. ¿Por qué este proyecto merece existir más allá de ganar?",
      });
    }
  }

  return risks;
}

// ==========================================
// UTILIDADES
// ==========================================

export function getRiskSummary(risks: RiskSignal[]): {
  criticals: number;
  warnings: number;
  integrityLevel: "green" | "yellow" | "red";
} {
  const criticals = risks.filter((r) => r.level === "critical").length;
  const warnings = risks.filter((r) => r.level === "warning").length;

  let integrityLevel: "green" | "yellow" | "red" = "green";
  if (criticals > 0) integrityLevel = "red";
  else if (warnings > 0) integrityLevel = "yellow";

  return { criticals, warnings, integrityLevel };
}
