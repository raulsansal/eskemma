// app/api/moddulo/projects/[projectId]/generate-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";
import { getProject } from "@/lib/moddulo/project";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { anthropic, CLAUDE_MODEL } from "@/lib/ai/claude";
import type { PhaseId, XPCTO } from "@/types/moddulo.types";

interface GenerateReportBody {
  phaseId: PhaseId;
  xpcto: Partial<XPCTO>;
  projectName?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { projectId } = await params;
    const body: GenerateReportBody = await request.json();
    const { phaseId, xpcto, projectName } = body;

    const project = await getProject(projectId, session.uid);
    if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

    const fecha = new Date().toLocaleDateString("es-MX", {
      year: "numeric", month: "long", day: "numeric",
    });

    const prompt = buildReportPrompt(phaseId, xpcto, projectName ?? project.name, fecha);

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const reportText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    // Guardar en Firestore
    await adminDb.collection("moddulo_projects").doc(projectId).update({
      [`phases.${phaseId}.reportText`]: reportText,
      [`phases.${phaseId}.reportGeneratedAt`]: new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ reportText });
  } catch (error) {
    console.error("[generate-report] Error:", error);
    return NextResponse.json({ error: "Error al generar el reporte" }, { status: 500 });
  }
}

function buildReportPrompt(
  phaseId: PhaseId,
  xpcto: Partial<XPCTO>,
  projectName: string,
  fecha: string
): string {
  if (phaseId !== "proposito") {
    return `Genera un resumen diagnóstico de la fase ${phaseId} del proyecto "${projectName}". Fecha: ${fecha}.`;
  }

  return `Eres Moddulo, el copiloto estratégico de Eskemma. Genera el REPORTE DIAGNÓSTICO COMPLETO de la Fase 1 — Propósito para el siguiente proyecto.

Proyecto: ${projectName}
Fecha: ${fecha}

VARIABLES XPCTO DEFINIDAS:
- X (Hito): ${xpcto.hito ?? "No definido"}
- P (Sujeto): ${xpcto.sujeto ?? "No definido"}
- C (Capacidades):
  · Financiero: ${xpcto.capacidades?.financiero ?? "No definido"}
  · Humano: ${xpcto.capacidades?.humano ?? "No definido"}
  · Logístico: ${xpcto.capacidades?.logistico ?? "No definido"}
- T (Tiempo): Fecha límite ${xpcto.tiempo?.fechaLimite ?? "No definida"} (${xpcto.tiempo?.duracionMeses ?? 0} meses desde hoy)
- O (Justificación): ${xpcto.justificacion ?? "No definida"}

Genera el reporte con exactamente esta estructura:

# REPORTE DIAGNÓSTICO — FASE 1: PROPÓSITO
## ${projectName}
*Generado el ${fecha}*

---

## VARIABLES XPCTO — ESTADO Y LECTURA ESTRATÉGICA

### X — HITO
[El hito tal como fue definido]

**Lectura estratégica:** [Análisis de 3-5 oraciones sobre la solidez y viabilidad del hito]

---

### P — SUJETO
[El sujeto tal como fue definido]

**Lectura estratégica:** [Análisis del perfil político: fortalezas, activos, riesgos]

---

### C — CAPACIDADES

| Dimensión | Disponible | Nivel de riesgo |
|---|---|---|
| Financiero | [dato] | [✅ Sólido / ⚠️ Ajustado / 🔴 Crítico] |
| Humano | [dato] | [✅ Sólido / ⚠️ Ajustado / 🔴 Crítico] |
| Logístico | [dato] | [✅ Sólido / ⚠️ Ajustado / 🔴 Crítico] |

**Lectura estratégica:** [Análisis integrado de las tres dimensiones de capacidad]

---

### T — TIEMPO
**Fecha límite:** [fecha]
**Horizonte real:** ~[N] meses

**Lectura estratégica:** [Análisis del tiempo disponible: ¿es suficiente? ¿qué implica para la planificación?]

---

### O — JUSTIFICACIÓN
[La justificación tal como fue definida]

**Lectura estratégica:** [Análisis de la solidez ética y narrativa del propósito]

---

## DIAGNÓSTICO GENERAL

| Variable | Estado | Observación |
|---|---|---|
| Hito (X) | [✅/⚠️/🔴] [Sólido/Funcional/Débil] | [síntesis en una línea] |
| Sujeto (P) | [✅/⚠️/🔴] | [síntesis en una línea] |
| Capacidades (C) | [✅/⚠️/🔴] | [síntesis en una línea] |
| Tiempo (T) | [✅/⚠️/🔴] | [síntesis en una línea] |
| Justificación (O) | [✅/⚠️/🔴] | [síntesis en una línea] |

**Semáforo de integridad:** [🟢 Verde / 🟡 Amarillo / 🔴 Rojo]

---

## IMPLICACIONES PARA LAS SIGUIENTES FASES

[3-5 puntos concretos sobre qué debe atenderse en Exploración, Investigación y Diagnóstico basándose en las fortalezas y riesgos identificados en el XPCTO]

Sé preciso, directo y estratégico. No uses frases genéricas. Basa cada análisis en los datos específicos del proyecto.`;
}
