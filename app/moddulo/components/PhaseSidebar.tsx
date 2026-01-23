// app/moddulo/components/PhaseSidebar.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStrategyContext, useSaveStatus } from './StrategyContextProvider';
import {
  PHASE_METADATA,
  LAYER_METADATA,
  PHASE_TO_LAYER,
  type PhaseId,
  type LayerId,
} from '@/types/strategy-context.types';

// ============================================================
// TIPOS
// ============================================================

interface PhaseSidebarProps {
  projectId: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function PhaseSidebar({
  projectId,
  collapsed = false,
  onToggleCollapse,
}: PhaseSidebarProps) {
  const pathname = usePathname();
  const { project, canAccessPhase, getOverallProgress, loading } = useStrategyContext();

  const [expandedLayers, setExpandedLayers] = useState<Record<LayerId, boolean>>({
    fundacion: true,
    estrategia: true,
    operacion: true,
  });

  const toggleLayer = (layer: LayerId) => {
    setExpandedLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading || !project) {
    return (
      <aside
        className={`
          bg-white-eske border-r border-gray-eske-20 h-full
          ${collapsed ? 'w-16' : 'w-72'}
          transition-all duration-300
          flex flex-col
        `}
      >
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-eske-20 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-eske-10 rounded w-1/2 mb-4" />
            <div className="h-2 bg-gray-eske-10 rounded-full mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-eske-10 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const overallProgress = getOverallProgress();

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <aside
      className={`
        bg-white-eske border-r border-gray-eske-20 h-full
        ${collapsed ? 'w-16' : 'w-72'}
        transition-all duration-300
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-eske-20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex-1 min-w-0 mr-2">
              <h2 className="text-sm font-semibold text-bluegreen-eske truncate">
                {project.projectName}
              </h2>
              <p className="text-xs text-gray-eske-60 mt-0.5 truncate">
                {PHASE_METADATA[project.currentPhase].name}
              </p>
            </div>
          )}

          {/* Toggle button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-gray-eske-10 text-gray-eske-50 transition-colors shrink-0"
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Progress bar */}
        {!collapsed && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-eske-60">Progreso general</span>
              <span className="font-medium text-bluegreen-eske">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-gray-eske-10 rounded-full overflow-hidden">
              <div
                className="h-full bg-bluegreen-eske transition-all duration-500 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {(Object.keys(LAYER_METADATA) as LayerId[]).map((layerId) => {
          const layer = LAYER_METADATA[layerId];
          const layerPhases = layer.phases;
          const isExpanded = expandedLayers[layerId];

          // Calcular progreso de la capa
          const completedInLayer = layerPhases.filter((p) =>
            project.completedPhases.includes(p)
          ).length;
          const layerProgress = Math.round((completedInLayer / layerPhases.length) * 100);

          return (
            <div key={layerId} className="mb-2">
              {/* Layer Header */}
              <button
                onClick={() => !collapsed && toggleLayer(layerId)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5 rounded-lg
                  hover:bg-gray-eske-10 transition-colors
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                {/* Layer color indicator */}
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: layer.color }}
                  title={collapsed ? layer.name : undefined}
                />

                {!collapsed && (
                  <>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-gray-eske-80">
                        {layer.name}
                      </span>
                      <span className="text-xs text-gray-eske-50 ml-2">
                        {layerProgress}%
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-eske-50 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </button>

              {/* Phases */}
              {isExpanded && !collapsed && (
                <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-gray-eske-10 pl-3">
                  {layerPhases.map((phaseId) => (
                    <PhaseItem
                      key={phaseId}
                      projectId={projectId}
                      phaseId={phaseId}
                      layerId={layerId}
                      isCompleted={project.completedPhases.includes(phaseId)}
                      isCurrent={project.currentPhase === phaseId}
                      isAccessible={canAccessPhase(phaseId)}
                      isActive={pathname?.includes(`/${phaseId}`) || false}
                      layerColor={layer.color}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer: Save status */}
      {!collapsed && <SaveStatusFooter />}
    </aside>
  );
}

// ============================================================
// PHASE ITEM
// ============================================================

interface PhaseItemProps {
  projectId: string;
  phaseId: PhaseId;
  layerId: LayerId;
  isCompleted: boolean;
  isCurrent: boolean;
  isAccessible: boolean;
  isActive: boolean;
  layerColor: string;
}

function PhaseItem({
  projectId,
  phaseId,
  layerId,
  isCompleted,
  isCurrent,
  isAccessible,
  isActive,
  layerColor,
}: PhaseItemProps) {
  const phase = PHASE_METADATA[phaseId];
  const href = `/moddulo/proyecto/${projectId}/${layerId}/${phaseId}`;

  const content = (
    <div
      className={`
        flex items-center gap-2.5 px-3 py-2 rounded-lg
        transition-all duration-200
        ${isActive
          ? 'bg-bluegreen-eske/10 text-bluegreen-eske'
          : isAccessible
            ? 'hover:bg-gray-eske-10 text-gray-eske-70'
            : 'text-gray-eske-40 cursor-not-allowed'
        }
        ${isCurrent && !isActive ? 'ring-1 ring-bluegreen-eske/30' : ''}
      `}
    >
      {/* Status icon */}
      <div className="shrink-0">
        {isCompleted ? (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: layerColor }}
          >
            <svg className="w-3 h-3 text-white-eske" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : isCurrent ? (
          <div
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: layerColor }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: layerColor }}
            />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-eske-30" />
        )}
      </div>

      {/* Phase info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg" aria-hidden="true">
            {phase.icon}
          </span>
          <span className="text-sm font-medium truncate">{phase.name}</span>
          {phase.isViabilityGate && (
            <span className="text-[9px] px-1 py-0.5 bg-orange-eske/10 text-orange-eske rounded font-semibold uppercase">
              Gate
            </span>
          )}
        </div>
      </div>

      {/* Lock icon if not accessible */}
      {!isAccessible && (
        <svg
          className="w-4 h-4 text-gray-eske-40 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  if (!isAccessible) {
    return <div title="Completa las fases anteriores para desbloquear">{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}

// ============================================================
// SAVE STATUS FOOTER
// ============================================================

function SaveStatusFooter() {
  const { isDirty, isSaving, lastSaved, error } = useSaveStatus();

  if (error) {
    return (
      <div className="p-3 border-t border-gray-eske-20 bg-red-50">
        <p className="text-xs text-red-600 flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">Error al guardar</span>
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-gray-eske-20">
      <p className="text-xs text-gray-eske-50 flex items-center gap-1.5">
        {isSaving ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Guardando...</span>
          </>
        ) : isDirty ? (
          <>
            <span className="w-2 h-2 bg-orange-eske rounded-full shrink-0" />
            <span>Cambios sin guardar</span>
          </>
        ) : lastSaved ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Guardado a las {lastSaved}</span>
          </>
        ) : (
          <span>Sin cambios</span>
        )}
      </p>
    </div>
  );
}
