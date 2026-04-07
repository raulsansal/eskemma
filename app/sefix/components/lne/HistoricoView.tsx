"use client";

import { useState, useTransition } from "react";
import { useLneHistorico } from "@/app/sefix/hooks/useLneHistorico";
import type { Ambito } from "@/lib/sefix/seriesUtils";
import GeoFilter, { type GeoInfo } from "./GeoFilter";
import DynamicTextBlock from "./DynamicTextBlock";
import G1TrendChart from "./charts/G1TrendChart";
import G2BarChart from "./charts/G2BarChart";
import G3SexChart from "./charts/G3SexChart";

// ──────────────────────────────────────────────
// Helpers de UI
// ──────────────────────────────────────────────
function ChartSkeleton({ height = 300 }: { height?: number }) {
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
    <div className="mb-3 text-center">
      <h3 className="text-base font-semibold text-black-eske">{title}</h3>
      {subtitle && (
        <p className="text-xs text-black-eske-60 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center py-24" role="status" aria-live="polite">
      <div className="w-10 h-10 border-4 border-gray-eske-20 border-t-blue-eske rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-black-eske-10 mb-1">Cargando datos de la consulta</p>
      <p className="text-xs text-black-eske-60">Por favor, espera.</p>
    </div>
  );
}

// ──────────────────────────────────────────────
// Construir subtítulo de alcance de consulta
// ──────────────────────────────────────────────
function buildSubtitulo(ambito: Ambito, geoInfo: GeoInfo): string {
  if (ambito === "extranjero") return "Ámbito: Residentes en el Extranjero";

  const secCount = geoInfo.secciones?.length ?? (geoInfo.seccion !== "Todas" ? 1 : 0);
  const secLabel = secCount > 1 ? "Secciones" : "Sección";

  const parts = [
    `Estado: ${geoInfo.entidad}`,
    `Distrito: ${geoInfo.distrito}`,
    `Municipio: ${geoInfo.municipio}`,
    `${secLabel}: ${geoInfo.seccion}`,
  ];
  return parts.join(" — ");
}

// ──────────────────────────────────────────────
// Vista principal
// ──────────────────────────────────────────────
export default function HistoricoView() {
  // Estado comprometido (committed) — lo que usa el hook
  const [ambito, setAmbito] = useState<Ambito>("nacional");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [geoInfo, setGeoInfo] = useState<GeoInfo>({
    entidad: "Nacional",
    distrito: "Todos",
    municipio: "Todos",
    seccion: "Todas",
  });

  // Spinner al consultar
  const [isPending, startTransition] = useTransition();

  const { isLoading, error, availableYears, g1Data, g2Data, g3SexData, nbLatest, texts } =
    useLneHistorico(ambito, selectedYear, geoInfo);

  const busy = isLoading || isPending;

  // Año efectivo para encabezados
  const displayYear =
    selectedYear ?? availableYears[availableYears.length - 1] ?? new Date().getFullYear();

  const ambitoLabel = ambito === "nacional" ? "Nacional" : "Extranjero";
  const yearRange =
    availableYears.length >= 2
      ? `${availableYears[0]}–${availableYears[availableYears.length - 1]}`
      : String(displayYear);

  const subtituloGeo = buildSubtitulo(ambito, geoInfo);

  // G1: ¿hay proyección? (año actual con meses incompletos)
  const hasProjection = (g1Data?.projected.length ?? 0) > 0;
  const g1Title = hasProjection
    ? `Proyección ${displayYear} — Padrón y LNE ${ambitoLabel}`
    : `Evolución ${displayYear} — Padrón y LNE ${ambitoLabel}`;
  const g1Subtitle = busy
    ? "Cargando..."
    : g1Data?.latestFecha
    ? `${subtituloGeo} — Último corte: ${g1Data.latestFecha}${hasProjection ? ". Línea punteada = proyección a diciembre." : "."}`
    : subtituloGeo;

  // ── Callback de GeoFilter ──
  const handleConsultar = (newAmbito: Ambito, newYear: number, newGeoInfo: GeoInfo) => {
    startTransition(() => {
      setAmbito(newAmbito);
      setSelectedYear(newYear);
      setGeoInfo(newGeoInfo);
    });
  };

  // Sin datos después de cargar (filtro demasiado específico o sin cobertura)
  const noData = !isLoading && !isPending && availableYears.length === 0;

  if (noData) {
    return (
      <div className="space-y-8">
        <GeoFilter
          ambito={ambito}
          selectedYear={displayYear}
          availableYears={availableYears}
          onConsultar={handleConsultar}
        />
        <div className="flex flex-col items-center py-20 text-center" role="status">
          <p className="text-sm font-medium text-black-eske-10 mb-1">Sin datos para este filtro</p>
          <p className="text-xs text-black-eske-60 max-w-sm">
            No se encontraron registros históricos para{" "}
            <strong>{geoInfo.municipio !== "Todos" ? geoInfo.municipio : geoInfo.entidad}</strong>.
            Intenta con un filtro menos restrictivo.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" role="alert">
        <div className="w-12 h-12 mb-3 rounded-full bg-red-eske-10 flex items-center justify-center" aria-hidden="true">
          <svg className="w-6 h-6 text-red-eske" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm text-black-eske-10 font-medium">Error al cargar los datos históricos</p>
        <p className="text-xs text-black-eske-60 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filtros */}
      <GeoFilter
        ambito={ambito}
        selectedYear={displayYear}
        availableYears={availableYears}
        onConsultar={handleConsultar}
      />

      {/* Estado de carga: spinner visible durante todo el proceso (isPending + isLoading) */}
      {busy ? (
        <LoadingState />
      ) : (
        /* Contenido: solo se muestra cuando hay datos listos */
        <div>
          {/* Layout: gráficas + análisis textual */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">

            {/* Columna izquierda: gráficas */}
            <div className="space-y-10">

              {/* G1 — Proyección / Evolución del año */}
              <div>
                <SectionHeader title={g1Title} subtitle={g1Subtitle} />
                {!g1Data ? (
                  <ChartSkeleton height={320} />
                ) : (
                  <G1TrendChart data={g1Data} />
                )}
                <p className="text-[11px] text-black-eske-60 mt-2 text-center">
                  Fuente: INE. Estadística de Padrón Electoral y Lista Nominal del Electorado
                </p>
              </div>

              {/* G2 — Evolución anual */}
              <div>
                <SectionHeader
                  title={`Evolución Anual (${yearRange}) — Padrón y LNE ${ambitoLabel}`}
                  subtitle={subtituloGeo}
                />
                {g2Data.length === 0 ? (
                  <ChartSkeleton height={300} />
                ) : (
                  <G2BarChart data={g2Data} />
                )}
                <p className="text-[11px] text-black-eske-60 mt-2 text-center">
                  Fuente: INE. Estadística de Padrón Electoral y Lista Nominal del Electorado
                </p>
              </div>

              {/* G3 — Evolución anual por sexo */}
              <div>
                <SectionHeader
                  title={`Evolución Anual por Sexo (${yearRange}) — ${ambitoLabel}`}
                  subtitle={`${subtituloGeo}${ambito === "nacional" ? ". Lista estimada por proporcionalidad del Padrón." : ""}`}
                />
                {g3SexData.length === 0 ? (
                  <ChartSkeleton height={320} />
                ) : (
                  <G3SexChart data={g3SexData} nbLatest={nbLatest} />
                )}
                <p className="text-[11px] text-black-eske-60 mt-2 text-center">
                  Fuente: INE. Estadística de Padrón Electoral y Lista Nominal del Electorado
                </p>
              </div>

            </div>

            {/* Columna derecha: análisis textual */}
            <div className="lg:sticky lg:top-24">
              <h3 className="text-sm font-semibold text-black-eske-10 uppercase tracking-wide mb-3">
                Análisis del período
              </h3>
              {!texts ? (
                <div className="space-y-3">
                  {[80, 120, 100, 90, 80].map((h, i) => (
                    <div key={i} className="rounded-md bg-gray-eske-10 animate-pulse" style={{ height: h }} />
                  ))}
                </div>
              ) : (
                <DynamicTextBlock texts={texts} />
              )}
              <p className="mt-4 text-[11px] text-black-eske-60 leading-relaxed">
                Fuente: DERFE — Dirección Ejecutiva del Registro Federal de Electores, INE.
                Datos oficiales del Padrón Electoral y Lista Nominal.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
