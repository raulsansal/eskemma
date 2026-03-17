// app/moddulo/components/PhaseNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PHASE_ORDER, PHASE_NAMES } from "@/types/moddulo.types";
import type { PhaseId, PhaseStatus } from "@/types/moddulo.types";

interface PhaseNavProps {
  projectId: string;
  phaseStatuses?: Partial<Record<PhaseId, PhaseStatus>>;
  currentPhase?: PhaseId;
  onLinkClick?: () => void;
}

const STATUS_STYLES: Record<PhaseStatus, string> = {
  "not-started": "bg-gray-eske-20 text-gray-eske-50",
  "in-progress": "bg-bluegreen-eske/10 text-bluegreen-eske border border-bluegreen-eske/30",
  completed: "bg-green-100 text-green-700",
  "needs-review": "bg-amber-100 text-amber-700",
};

const STATUS_LABEL: Record<PhaseStatus, string> = {
  "not-started": "Pendiente",
  "in-progress": "En progreso",
  completed: "Completada",
  "needs-review": "En revisión",
};

export default function PhaseNav({
  projectId,
  phaseStatuses = {},
  currentPhase,
  onLinkClick,
}: PhaseNavProps) {
  const pathname = usePathname();

  return (
    <nav className="h-full flex flex-col bg-white-eske border-r border-gray-eske-20">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-eske-20 bg-bluegreen-eske/5">
        <p className="text-xs font-bold uppercase tracking-widest text-bluegreen-eske">
          Fases del proyecto
        </p>
        <p className="text-xs text-gray-eske-50 mt-0.5 font-medium">Metodología Eskemma · 9 fases</p>
      </div>

      {/* Phase list */}
      <div className="flex-1 overflow-y-auto py-2">
        {PHASE_ORDER.map((phaseId, index) => {
          const href = `/moddulo/proyecto/${projectId}/${phaseId}`;
          const isActive = pathname.includes(`/${phaseId}`);
          const status = phaseStatuses[phaseId] ?? "not-started";
          const isCompleted = status === "completed";

          return (
            <Link
              key={phaseId}
              href={href}
              onClick={onLinkClick}
              className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-eske-10 ${
                isActive ? "bg-bluegreen-eske/5 border-r-2 border-bluegreen-eske" : ""
              }`}
            >
              {/* Number bubble + connector */}
              <div className="shrink-0 flex flex-col items-center gap-0.5 pt-0.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-bluegreen-eske text-white-eske shadow-sm"
                      : STATUS_STYLES[status]
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </span>
                {index < PHASE_ORDER.length - 1 && (
                  <div
                    className={`w-px h-4 mt-0.5 ${
                      isCompleted ? "bg-green-300" : "bg-gray-eske-20"
                    }`}
                  />
                )}
              </div>

              {/* Phase info */}
              <div className="flex-1 min-w-0 pb-1">
                <p
                  className={`text-sm font-semibold truncate leading-tight ${
                    isActive ? "text-bluegreen-eske" : "text-gray-eske-80"
                  }`}
                >
                  {PHASE_NAMES[phaseId]}
                </p>
                <span
                  className={`text-xs font-medium ${
                    status === "in-progress"
                      ? "text-bluegreen-eske"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-eske-40"
                  }`}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer con link a hub */}
      <div className="shrink-0 border-t border-gray-eske-20 px-4 py-3">
        <Link
          href="/moddulo"
          onClick={onLinkClick}
          className="flex items-center gap-2 text-xs font-medium text-gray-eske-50 hover:text-bluegreen-eske transition-colors"
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
