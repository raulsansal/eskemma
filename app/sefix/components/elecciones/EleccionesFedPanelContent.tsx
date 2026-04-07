"use client";

import { useState } from "react";
import { ESTADOS_LIST, CARGOS_LIST } from "@/lib/sefix/constants";
import {
  useResultados,
  useResultadosAllYears,
  useAvailableYears,
} from "@/app/sefix/hooks/useResultados";
import ResultadosStatCards from "./ResultadosStatCards";
import PartidosBarChart from "./PartidosBarChart";
import HistoricoComparison from "./HistoricoComparison";

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-lg bg-gray-eske-10 animate-pulse"
      style={{ height }}
      aria-hidden="true"
    />
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-semibold text-black-eske">{title}</h3>
      {subtitle && (
        <p className="text-xs text-black-eske-60 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

export default function EleccionesFedPanelContent() {
  const [estado, setEstado] = useState("");   // "" = Nacional
  const [cargo, setCargo] = useState("dip");
  const [anio, setAnio] = useState<number | undefined>(undefined);

  const { years: availableYears } = useAvailableYears(cargo);

  const { data, isLoading, error } = useResultados({
    estado,
    cargo,
    anio,
  });

  const {
    data: allYearsData,
    isLoading: loadingHistorico,
  } = useResultadosAllYears({ estado, cargo });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="p-4 bg-gray-eske-10 rounded-lg border border-gray-eske-20">
        <div className="flex flex-wrap items-end gap-4">
          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label htmlFor="ef-estado" className="text-xs font-medium text-black-eske-60">
              Entidad federativa
            </label>
            <select
              id="ef-estado"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setAnio(undefined);
              }}
              className="text-sm border border-gray-eske-30 rounded-md px-2 py-1.5 bg-white-eske text-black-eske focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske min-w-45"
            >
              <option value="">— Nacional —</option>
              {ESTADOS_LIST.map((e) => (
                <option key={e.key} value={e.nombre}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Cargo */}
          <div className="flex flex-col gap-1">
            <label htmlFor="ef-cargo" className="text-xs font-medium text-black-eske-60">
              Cargo
            </label>
            <select
              id="ef-cargo"
              value={cargo}
              onChange={(e) => {
                setCargo(e.target.value);
                setAnio(undefined);
              }}
              className="text-sm border border-gray-eske-30 rounded-md px-2 py-1.5 bg-white-eske text-black-eske focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske"
            >
              {CARGOS_LIST.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Año */}
          {availableYears.length > 0 && (
            <div className="flex flex-col gap-1">
              <label htmlFor="ef-anio" className="text-xs font-medium text-black-eske-60">
                Año
              </label>
              <select
                id="ef-anio"
                value={anio ?? ""}
                onChange={(e) =>
                  setAnio(e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="text-sm border border-gray-eske-30 rounded-md px-2 py-1.5 bg-white-eske text-black-eske focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske"
              >
                <option value="">Más reciente</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Estado vacío */}
      {/* Error */}
      {error && (
        <p className="text-sm text-red-eske py-8 text-center">{error}</p>
      )}

      {/* Contenido principal */}
      {!error && (
        <div className="space-y-8">
          {/* KPIs */}
          {isLoading || !data ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-gray-eske-10 animate-pulse"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : (
            <ResultadosStatCards data={data} />
          )}

          {/* Gráfica de partidos */}
          <div>
            <SectionHeader
              title="Distribución de votos por partido"
              subtitle={
                data
                  ? `${data.cargo} — ${data.estado} (${data.anio}). Partidos simples, coaliciones desglosadas aparte.`
                  : undefined
              }
            />
            {isLoading || !data ? (
              <ChartSkeleton height={320} />
            ) : (
              <>
                <PartidosBarChart data={data} />
                {data.coaliconesIncluidas.length > 0 && (
                  <p className="text-[11px] text-black-eske-60 mt-2">
                    Coaliciones en datos: {data.coaliconesIncluidas.join(", ")}. Los votos de
                    coalición pueden estar contabilizados en partidos individuales según la
                    distribución acordada.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Comparativa histórica */}
          <div>
            <SectionHeader
              title="Participación histórica"
              subtitle={`Porcentaje de participación ciudadana — ${
                CARGOS_LIST.find((c) => c.key === cargo)?.label ?? cargo
              } (todos los años disponibles)`}
            />
            {loadingHistorico || allYearsData.length === 0 ? (
              <ChartSkeleton height={220} />
            ) : (
              <HistoricoComparison data={allYearsData} />
            )}
          </div>

          {/* Fuente */}
          {data && (
            <p className="text-[11px] text-black-eske-60">
              Fuente: {data.fuente}. Los datos corresponden a cómputos distritales
              definitivos publicados por el INE.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
