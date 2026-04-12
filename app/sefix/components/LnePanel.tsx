"use client";

import { useState } from "react";
import HistoricoView from "./lne/HistoricoView";
import SemanalView from "./lne/SemanalView";

type LneSubView = "historico" | "semanal";

const TOOLTIP_CONFIG: Record<LneSubView, { text: string; bg: string }> = {
  historico: { text: "Evolución anual y mensual del Padrón y LNE", bg: "#FFF2CC" },
  semanal:   { text: "Datos semanales detallados del año en curso",  bg: "#CCE4B1" },
};

export default function LnePanel() {
  const [subView, setSubView] = useState<LneSubView>("historico");
  const [hoveredView, setHoveredView] = useState<LneSubView | null>(null);

  return (
    <section
      id="sefix-panel-lne"
      role="tabpanel"
      aria-labelledby="sefix-tab-lne"
      className="w-full"
    >
      {/* Sub-tabs Histórico / Semanal */}
      <div className="border-b border-gray-eske-20 bg-gray-eske-10 px-4 sm:px-6 md:px-8">
        <div className="flex gap-0 max-w-7xl mx-auto">
          {(["historico", "semanal"] as LneSubView[]).map((sv) => {
            const label = sv === "historico" ? "Vista Histórica" : "Vista Semanal";
            const isActive = subView === sv;
            const tooltip = TOOLTIP_CONFIG[sv];
            const showTooltip = hoveredView === sv;
            return (
              <div
                key={sv}
                className="relative"
                onMouseEnter={() => setHoveredView(sv)}
                onMouseLeave={() => setHoveredView(null)}
              >
                <button
                  onClick={() => setSubView(sv)}
                  className={[
                    "px-5 py-2.5 text-sm font-medium transition-colors border-b-2",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske",
                    isActive
                      ? "border-orange-eske text-orange-eske bg-white-eske"
                      : "border-transparent text-black-eske-60 hover:text-black-eske hover:bg-gray-eske-20",
                  ].join(" ")}
                  aria-selected={isActive}
                  role="tab"
                >
                  {label}
                </button>
                {showTooltip && (
                  <div
                    role="tooltip"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 whitespace-nowrap rounded px-2.5 py-1.5 text-xs text-black-eske shadow-md border border-gray-eske-20 pointer-events-none"
                    style={{ backgroundColor: tooltip.bg }}
                  >
                    {tooltip.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {subView === "historico" && <HistoricoView />}
        {subView === "semanal" && <SemanalView />}
      </div>
    </section>
  );
}
