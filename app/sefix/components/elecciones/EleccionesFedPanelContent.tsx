"use client";

import { useState, useCallback } from "react";
import { useEscapeKey } from "@/app/hooks/useEscapeKey";
import {
  useEleccionesFilters,
  useResultadosElecciones,
} from "@/app/sefix/hooks/useEleccionesFilters";
import { useResultadosAllYears } from "@/app/sefix/hooks/useResultados";
import MobileBottomBar from "@/app/sefix/components/lne/MobileBottomBar";
import EleccionesFilters from "./EleccionesFilters";
import ResultadosStatCards from "./ResultadosStatCards";
import PartidosBarChart from "./PartidosBarChart";
import HistoricoComparison from "./HistoricoComparison";
import EleccionesDataTable from "./EleccionesDataTable";
import EleccionesDynamicText from "./EleccionesDynamicText";
import { CARGO_DISPLAY_LABELS } from "@/lib/sefix/eleccionesConstants";

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-lg bg-gray-eske-10 dark:bg-white/10 animate-pulse"
      style={{ height }}
      aria-hidden="true"
    />
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-semibold text-black-eske dark:text-[#EAF2F8]">{title}</h3>
      {subtitle && (
        <p className="text-xs text-black-eske-60 dark:text-[#9AAEBE] mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

export default function EleccionesFedPanelContent() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  useEscapeKey(leftOpen, useCallback(() => setLeftOpen(false), []));
  useEscapeKey(rightOpen, useCallback(() => setRightOpen(false), []));

  const {
    pendingAnio, pendingCargo, pendingEstado, pendingPartidos,
    pendingTipo, pendingPrincipio, pendingCabecera, pendingMunicipio, pendingSecciones,
    committed, queryVersion, hasPending,
    setAnio, setCargo, setEstado, setPartidos, setTipo, setPrincipio,
    setCabecera, setMunicipio, setSecciones,
    handleConsultar, handleRestablecer,
    cargosDisponibles, partidosDisponibles,
  } = useEleccionesFilters();

  const { data, isLoading, error } = useResultadosElecciones(committed, queryVersion);

  const { data: allYearsData, isLoading: loadingHistorico } = useResultadosAllYears({
    estado: committed.estado,
    cargo: committed.cargo,
  });

  const cargoLabel = CARGO_DISPLAY_LABELS[committed.cargo] ?? committed.cargo;
  const geoLabel = committed.estado || "Nacional";

  return (
    <div className="space-y-6 pb-14 sm:pb-0">
      {/* Overlay izquierdo — solo mobile */}
      {leftOpen && (
        <div
          className="fixed inset-0 bg-black-eske/40 z-30 sm:hidden"
          aria-hidden="true"
          onClick={() => setLeftOpen(false)}
        />
      )}

      {/* Overlay derecho — solo mobile */}
      {rightOpen && (
        <div
          className="fixed inset-0 bg-black-eske/40 z-30 sm:hidden"
          aria-hidden="true"
          onClick={() => setRightOpen(false)}
        />
      )}

      {/* Layout principal — 3 columnas en lg */}
      <div className="lg:grid lg:grid-cols-[240px_1fr_280px] lg:gap-6 lg:items-start">

        {/* ── Col 1: Filtros ── */}
        <div className={[
          "fixed left-0 top-0 bottom-14 w-[min(85vw,320px)]",
          "bg-white-eske dark:bg-[#112230] overflow-y-auto z-40 shadow-xl",
          "transition-transform duration-300 ease-in-out",
          leftOpen ? "translate-x-0" : "-translate-x-full",
          "sm:static sm:z-auto sm:w-auto sm:overflow-visible",
          "sm:bg-transparent sm:shadow-none sm:translate-x-0 sm:bottom-auto",
        ].join(" ")}>
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-bluegreen-eske text-white-eske sm:hidden">
            <span className="text-sm font-semibold">Filtros de Consulta</span>
            <button
              type="button"
              onClick={() => setLeftOpen(false)}
              aria-label="Cerrar filtros"
              className="hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-eske rounded"
            >
              ✕
            </button>
          </div>
          <div className="p-4 sm:p-0">
            <EleccionesFilters
              pendingAnio={pendingAnio}
              pendingCargo={pendingCargo}
              pendingEstado={pendingEstado}
              pendingPartidos={pendingPartidos}
              pendingTipo={pendingTipo}
              pendingPrincipio={pendingPrincipio}
              pendingCabecera={pendingCabecera}
              pendingMunicipio={pendingMunicipio}
              pendingSecciones={pendingSecciones}
              setAnio={setAnio}
              setCargo={setCargo}
              setEstado={setEstado}
              setPartidos={setPartidos}
              setTipo={setTipo}
              setPrincipio={setPrincipio}
              setCabecera={setCabecera}
              setMunicipio={setMunicipio}
              setSecciones={setSecciones}
              hasPending={hasPending}
              onConsultar={handleConsultar}
              onRestablecer={handleRestablecer}
              cargosDisponibles={cargosDisponibles}
              partidosDisponibles={partidosDisponibles}
            />
          </div>
        </div>

        {/* ── Col 2: Visualizaciones ── */}
        <div className="space-y-8 min-w-0">
          {error && (
            <p className="text-sm text-red-eske py-8 text-center">{error}</p>
          )}

          {!error && (
            <>
              {/* KPIs */}
              {isLoading || !data ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-lg bg-gray-eske-10 dark:bg-white/10 animate-pulse"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : (
                <ResultadosStatCards data={data} />
              )}

              {/* Distribución por partido */}
              <div>
                <SectionHeader
                  title="Distribución de votos por partido"
                  subtitle={data
                    ? `${cargoLabel} — ${geoLabel} (${committed.anio})`
                    : undefined}
                />
                {isLoading || !data ? (
                  <ChartSkeleton height={320} />
                ) : (
                  <PartidosBarChart data={data} />
                )}
              </div>

              {/* Participación histórica */}
              <div>
                <SectionHeader
                  title="Participación histórica"
                  subtitle={`Porcentaje de participación ciudadana — ${cargoLabel} (todos los años disponibles)`}
                />
                {loadingHistorico || allYearsData.length === 0 ? (
                  <ChartSkeleton height={220} />
                ) : (
                  <HistoricoComparison data={allYearsData} />
                )}
              </div>

              {/* Tabla de datos */}
              <div>
                <SectionHeader title="Tabla de datos" />
                <EleccionesDataTable committed={committed} queryVersion={queryVersion} />
              </div>

              {data && (
                <p className="text-[11px] text-black-eske-60 dark:text-[#9AAEBE]">
                  Fuente: {data.fuente}. Los datos corresponden a cómputos distritales definitivos publicados por el INE.
                </p>
              )}
            </>
          )}
        </div>

        {/* ── Col 3: Análisis textual ── */}
        <div className={[
          "fixed right-0 top-0 bottom-14 w-[min(85vw,320px)]",
          "bg-white-eske dark:bg-[#112230] overflow-y-auto z-40 shadow-xl",
          "transition-transform duration-300 ease-in-out",
          rightOpen ? "translate-x-0" : "translate-x-full",
          "sm:static sm:z-auto sm:w-auto sm:overflow-visible",
          "sm:bg-transparent sm:shadow-none sm:translate-x-0 sm:bottom-auto",
          "sm:mt-4 lg:mt-0 sm:pt-4 lg:pt-0 sm:border-t lg:border-t-0 sm:border-gray-eske-20 dark:sm:border-white/10",
        ].join(" ")}>
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-bluegreen-eske text-white-eske sm:hidden">
            <span className="text-sm font-semibold">Análisis</span>
            <button
              type="button"
              onClick={() => setRightOpen(false)}
              aria-label="Cerrar análisis"
              className="hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-eske rounded"
            >
              ✕
            </button>
          </div>
          <div className="p-4 sm:p-0">
            <EleccionesDynamicText
              data={data}
              committed={committed}
              isLoading={isLoading}
              onClose={() => setRightOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Barra inferior mobile */}
      <MobileBottomBar
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onFiltros={() => { setLeftOpen((v) => !v); setRightOpen(false); }}
        onAnalisis={() => { setRightOpen((v) => !v); setLeftOpen(false); }}
      />
    </div>
  );
}
