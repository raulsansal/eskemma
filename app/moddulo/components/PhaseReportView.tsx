// app/moddulo/components/PhaseReportView.tsx
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PhaseId } from "@/types/moddulo.types";
import { PHASE_NAMES } from "@/types/moddulo.types";

interface PhaseReportViewProps {
  phaseId: PhaseId;
  reportText: string | null;
  projectId: string;
  /** Si es false (borrador), muestra el banner de siguiente paso. Default: true */
  isCompleted?: boolean;
  onStartEdit?: () => void;
  className?: string;
}

function getReportLabel(phaseId: PhaseId): string {
  const labels: Partial<Record<PhaseId, string>> = {
    proposito: "Resumen de Propósito",
    exploracion: "Resultado Exploratorio",
    investigacion: "Reporte de Investigación",
    diagnostico: "Dictamen Diagnóstico",
    estrategia: "Diseño Estratégico",
    tactica: "Plan Táctico",
    gerencia: "Reporte de Gerencia",
    seguimiento: "Seguimiento de KPIs",
    evaluacion: "Evaluación Final",
  };
  return labels[phaseId] ?? PHASE_NAMES[phaseId];
}

function getNextStep(phaseId: PhaseId): { action: string; next: string } {
  const steps: Partial<Record<PhaseId, { action: string; next: string }>> = {
    exploracion: { action: "Cerrar Fase 2", next: "Fase 3 — Investigación" },
    investigacion: { action: "Cerrar Fase 3", next: "Fase 4 — Diagnóstico" },
    diagnostico: { action: "Cerrar Fase 4", next: "Fase 5 — Estrategia" },
    estrategia: { action: "Cerrar Fase 5", next: "Fase 6 — Táctica" },
    tactica: { action: "Cerrar Fase 6", next: "Fase 7 — Gerencia" },
  };
  return steps[phaseId] ?? { action: `Cerrar ${PHASE_NAMES[phaseId]}`, next: "la siguiente fase" };
}

function getFooterText(phaseId: PhaseId): string {
  const texts: Partial<Record<PhaseId, string>> = {
    proposito: "Documento rector de la Fase 1. Úsalo como referencia para las siguientes fases.",
    exploracion: "Resultado exploratorio de la Fase 2. Documenta el escaneo situacional PEST-L del proyecto.",
    investigacion: "Reporte de investigación de campo. Valida o refuta la hipótesis planteada en F2.",
    diagnostico: "Dictamen diagnóstico de la Fase 4. Base para el diseño estratégico.",
    estrategia: "Diseño estratégico de la Fase 5. Define la narrativa y posicionamiento del proyecto.",
  };
  return texts[phaseId] ?? `Documento de referencia — ${PHASE_NAMES[phaseId]}.`;
}

export default function PhaseReportView({
  phaseId,
  reportText,
  isCompleted = true,
  onStartEdit,
  className = "",
}: PhaseReportViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Si no hay reporte guardado, mostrar estado vacío con opción de volver al chat
  if (!reportText) {
    return (
      <div className={`flex flex-col bg-white-eske dark:bg-[#18324A] rounded-xl border border-gray-eske-20 dark:border-white/10 overflow-hidden ${className}`}>
        <div className="shrink-0 px-4 py-3 border-b border-gray-eske-20 dark:border-white/10 bg-gray-eske-10/50 dark:bg-[#112230]/50 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-eske-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-semibold text-gray-eske-60 dark:text-[#9AAEBE]">Reporte de {PHASE_NAMES[phaseId]}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-eske-10 dark:bg-[#112230] flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-gray-eske-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-eske-70 dark:text-[#9AAEBE] mb-2">Reporte no disponible</h3>
          <p className="text-sm text-gray-eske-50 dark:text-[#9AAEBE] mb-6 max-w-xs leading-relaxed">
            Esta fase fue cerrada sin un reporte diagnóstico guardado. Puedes editar las variables para continuar trabajando con Moddulo.
          </p>
          {onStartEdit && (
            <button
              onClick={onStartEdit}
              className="px-5 py-2.5 border border-bluegreen-eske text-bluegreen-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/5 transition-colors"
            >
              Editar variables y continuar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white-eske dark:bg-[#18324A] rounded-xl border border-gray-eske-20 dark:border-white/10 overflow-hidden ${className}`}>
      {/* Header del reporte */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-eske-20 dark:border-white/10 flex items-center justify-between bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-green-800 dark:text-green-300">{getReportLabel(phaseId)}</span>
        </div>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <div className="w-4 h-4 border-2 border-bluegreen-eske/30 border-t-bluegreen-eske rounded-full animate-spin" />
          )}
          <span className="text-xs text-green-600 font-medium">
            {isCompleted ? "Fase completada" : "Borrador generado"}
          </span>
        </div>
      </div>

      {/* Contenido del reporte — scrollable */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        <div className="prose prose-sm max-w-none text-gray-800 dark:text-[#C7D6E0]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-base font-bold text-gray-900 dark:text-[#C7D6E0] mt-4 mb-2 first:mt-0 pb-1 border-b border-gray-200 dark:border-white/10">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-bold text-gray-800 dark:text-[#C7D6E0] mt-4 mb-2 first:mt-0">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold text-bluegreen-eske dark:text-[#6BA4C6] mt-3 mb-1 first:mt-0">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-sm text-gray-700 dark:text-[#C7D6E0] leading-relaxed mb-3 last:mb-0">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900 dark:text-[#C7D6E0]">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-600 dark:text-[#9AAEBE]">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-gray-700 dark:text-[#C7D6E0]">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-gray-700 dark:text-[#C7D6E0]">{children}</ol>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              hr: () => <hr className="border-gray-200 dark:border-white/10 my-4" />,
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table className="text-xs border-collapse w-full">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-gray-300 dark:border-white/10 px-3 py-1.5 bg-gray-100 dark:bg-[#112230] font-semibold text-gray-700 dark:text-[#C7D6E0] text-left">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-300 dark:border-white/10 px-3 py-1.5 text-gray-700 dark:text-[#C7D6E0]">{children}</td>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-bluegreen-eske/40 pl-4 italic text-gray-600 dark:text-[#9AAEBE] my-3">{children}</blockquote>
              ),
            }}
          >
            {reportText}
          </ReactMarkdown>
        </div>

        {/* Banner de siguiente paso — solo cuando la fase aún no está cerrada */}
        {!isCompleted && (() => {
          const { action, next } = getNextStep(phaseId);
          return (
            <div className="mt-5 p-4 bg-bluegreen-eske/5 border border-bluegreen-eske/25 rounded-lg">
              <p className="text-xs font-bold uppercase tracking-wide text-bluegreen-eske mb-1">Siguiente paso</p>
              <p className="text-sm text-gray-700 dark:text-[#C7D6E0] leading-relaxed">
                Revisa el resultado. Cuando estés conforme, pulsa{" "}
                <strong className="text-black-eske dark:text-[#C7D6E0]">{action}</strong>{" "}
                en la parte superior para consolidar el análisis y avanzar a la{" "}
                <strong className="text-black-eske dark:text-[#C7D6E0]">{next}</strong>.
              </p>
            </div>
          );
        })()}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-eske-20 dark:border-white/10 bg-gray-eske-10/30 dark:bg-[#112230]/30 flex items-center justify-between">
        <p className="text-xs text-gray-eske-40 dark:text-[#6D8294]">
          {getFooterText(phaseId)}
        </p>
        {onStartEdit && (
          <button
            onClick={onStartEdit}
            className="text-xs font-medium text-bluegreen-eske hover:underline"
          >
            Editar variables
          </button>
        )}
      </div>
    </div>
  );
}
