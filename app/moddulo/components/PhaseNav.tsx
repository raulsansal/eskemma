// app/moddulo/components/PhaseNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PHASE_ORDER, PHASE_NAMES, PHASE_DESCRIPTIONS } from "@/types/moddulo.types";
import type { PhaseId, PhaseStatus } from "@/types/moddulo.types";

interface PhaseNavProps {
  projectId: string;
  phaseStatuses?: Partial<Record<PhaseId, PhaseStatus>>;
  currentPhase?: PhaseId;
  onLinkClick?: () => void;
}

// Semáforo: colores de marca
// No iniciada → gris | En curso → ámbar | Concluida → bluegreen
const SEMAPHORE: Record<PhaseStatus, { bubble: string; dot: string }> = {
  "not-started": {
    bubble: "bg-gray-eske-20 text-gray-eske-60",
    dot: "bg-gray-eske-40",
  },
  "in-progress": {
    bubble: "bg-amber-100 text-amber-700 border border-amber-300",
    dot: "bg-amber-400",
  },
  completed: {
    bubble: "bg-bluegreen-eske text-white-eske",
    dot: "bg-bluegreen-eske",
  },
  "needs-review": {
    bubble: "bg-amber-100 text-amber-700 border border-amber-300",
    dot: "bg-amber-400",
  },
};

// Descripciones estratégicas cortas (sin el guión largo)
const PHASE_SHORT_DESC: Record<PhaseId, string> = {
  proposito: "Direccionamiento estratégico",
  exploracion: "Investigación preliminar",
  investigacion: "Levantamiento de inteligencia",
  diagnostico: "Análisis de viabilidad",
  estrategia: "Conceptualización",
  tactica: "Programación operativa",
  gerencia: "Mando y ejecución",
  seguimiento: "Monitoreo permanente",
  evaluacion: "Resultados y legado",
};

export default function PhaseNav({
  projectId,
  phaseStatuses = {},
  onLinkClick,
}: PhaseNavProps) {
  const pathname = usePathname();

  return (
    <nav className="h-full flex flex-col bg-white-eske dark:bg-[#18324A] border-r border-gray-eske-20 dark:border-white/10">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-eske-20 dark:border-white/10 bg-bluegreen-eske/5 dark:bg-bluegreen-eske/10">
        <p className="text-xs font-bold uppercase tracking-widest text-bluegreen-eske dark:text-[#6BA4C6]">
          Fases del proyecto
        </p>
        <p className="text-xs text-black-eske-10 dark:text-[#9AAEBE] font-medium mt-0.5">Metodología Eskemma · 9 fases</p>
      </div>

      {/* Phase list */}
      <div className="flex-1 overflow-y-auto py-1">
        {PHASE_ORDER.map((phaseId, index) => {
          const href = `/moddulo/proyecto/${projectId}/${phaseId}`;
          const isActive = pathname.includes(`/${phaseId}`);
          const status = phaseStatuses[phaseId] ?? "not-started";
          const { bubble, dot } = SEMAPHORE[status];
          const isCompleted = status === "completed";

          return (
            <Link
              key={phaseId}
              href={href}
              onClick={onLinkClick}
              className={`flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-gray-eske-10 dark:hover:bg-white/5 ${
                isActive ? "bg-bluegreen-eske/5 dark:bg-bluegreen-eske/10 border-r-2 border-bluegreen-eske" : ""
              }`}
            >
              {/* Burbuja numérica + conector */}
              <div className="shrink-0 flex flex-col items-center gap-0.5 pt-0.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isActive ? "bg-bluegreen-eske text-white-eske shadow-sm" : bubble
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </span>
                {index < PHASE_ORDER.length - 1 && (
                  <div className={`w-px h-3.5 mt-0.5 ${isCompleted ? dot : "bg-gray-eske-20"}`} />
                )}
              </div>

              {/* Nombre + descripción estratégica */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate leading-tight ${isActive ? "text-bluegreen-eske dark:text-[#6BA4C6]" : "text-black-eske dark:text-[#C7D6E0]"}`}>
                  {PHASE_NAMES[phaseId]}
                </p>
                <p className="text-xs text-black-eske-10 dark:text-[#9AAEBE] leading-snug mt-0.5 line-clamp-1">
                  {PHASE_SHORT_DESC[phaseId]}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-eske-20 dark:border-white/10 px-4 py-3">
        <Link
          href="/moddulo"
          onClick={onLinkClick}
          className="flex items-center gap-2 text-xs font-semibold text-black-eske-10 dark:text-[#9AAEBE] hover:text-bluegreen-eske dark:hover:text-[#4791B3] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Hub de Moddulo
        </Link>
      </div>
    </nav>
  );
}

// Exportar para uso externo
export type { PhaseNavProps };
export { PHASE_SHORT_DESC };

