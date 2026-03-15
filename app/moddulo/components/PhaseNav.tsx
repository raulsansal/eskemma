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
  collapsed?: boolean;
}

const STATUS_STYLES: Record<PhaseStatus, string> = {
  "not-started": "bg-gray-eske-20 text-gray-eske-50",
  "in-progress": "bg-bluegreen-eske/10 text-bluegreen-eske border border-bluegreen-eske/30",
  completed: "bg-green-100 text-green-700",
  "needs-review": "bg-amber-100 text-amber-700",
};

const STATUS_ICON: Record<PhaseStatus, string> = {
  "not-started": "○",
  "in-progress": "◉",
  completed: "✓",
  "needs-review": "⚠",
};

export default function PhaseNav({
  projectId,
  phaseStatuses = {},
  currentPhase,
  collapsed = false,
}: PhaseNavProps) {
  const pathname = usePathname();

  return (
    <nav className="h-full flex flex-col bg-white-eske border-r border-gray-eske-20">
      {/* Header */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-eske-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-eske-50">
            Fases del proyecto
          </p>
        </div>
      )}

      {/* Phase list */}
      <div className="flex-1 overflow-y-auto py-2">
        {PHASE_ORDER.map((phaseId, index) => {
          const href = `/moddulo/proyecto/${projectId}/${phaseId}`;
          const isActive = pathname.includes(`/${phaseId}`);
          const isCurrent = currentPhase === phaseId;
          const status = phaseStatuses[phaseId] ?? "not-started";

          return (
            <Link
              key={phaseId}
              href={href}
              className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-eske-10 ${
                isActive ? "bg-bluegreen-eske/5 border-r-2 border-bluegreen-eske" : ""
              }`}
            >
              {/* Phase number + status */}
              <div className="shrink-0 flex flex-col items-center gap-1">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${STATUS_STYLES[status]}`}
                >
                  {status === "completed" ? "✓" : index + 1}
                </span>
                {index < PHASE_ORDER.length - 1 && (
                  <div className="w-px h-3 bg-gray-eske-20" />
                )}
              </div>

              {/* Phase info */}
              {!collapsed && (
                <div className="flex-1 min-w-0 pt-0.5">
                  <p
                    className={`text-sm font-medium truncate ${
                      isActive ? "text-bluegreen-eske" : "text-gray-eske-70"
                    }`}
                  >
                    {PHASE_NAMES[phaseId]}
                  </p>
                  {isCurrent && status === "in-progress" && (
                    <span className="text-xs text-bluegreen-eske font-medium">En progreso</span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
