"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLneSemanal } from "@/app/sefix/hooks/useLneSemanal";
import { ESTADOS_LIST } from "@/lib/sefix/constants";
import type { Ambito } from "@/lib/sefix/seriesUtils";

import { E2GroupBarsChart, E4RangeChart } from "./charts/EdadCharts";
import { S1PyramidChart, S2AgeSexChart, S4ParticipacionChart } from "./charts/SexoCharts";
import { O1HeatmapChart, O2PadronLneChart } from "./charts/OrigenCharts";

type SemanalDesglose = "edad" | "sexo" | "origen";

// ──────────────────────────────────────────────
// Utilidades de UI
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
    <div className="mb-3">
      <h3 className="text-base font-semibold text-black-eske">{title}</h3>
      {subtitle && <p className="text-xs text-black-eske-60 mt-0.5">{subtitle}</p>}
    </div>
  );
}

/** Detecta si un chart con desglose por sexo tendría todos los valores en cero */
function allSexValuesZero(data: Record<string, number>, rangos: string[]): boolean {
  return rangos.every(
    (r) => (data[`lista_${r}_hombres`] ?? 0) === 0 && (data[`lista_${r}_mujeres`] ?? 0) === 0
  );
}

const RANGOS_EDAD = [
  "18", "19", "20_24", "25_29", "30_34", "35_39",
  "40_44", "45_49", "50_54", "55_59", "60_64", "65_y_mas",
];

// ──────────────────────────────────────────────
// Sub-panel Edad
// ──────────────────────────────────────────────
interface PanelProps {
  ambito: Ambito;
  corte?: string;
  entidad?: string;
  onFechasLoaded?: (fechas: string[]) => void;
}

function EdadPanel({ ambito, corte, entidad, onFechasLoaded }: PanelProps) {
  const { isLoading, error, data, fecha, availableFechas } =
    useLneSemanal("edad", ambito, corte, entidad ?? null);

  useEffect(() => {
    if (availableFechas.length > 0) onFechasLoaded?.(availableFechas);
  }, [availableFechas, onFechasLoaded]);

  if (error) return <p className="text-sm text-red-eske py-8 text-center">{error}</p>;

  const sinSexoPorEdad = data ? allSexValuesZero(data, RANGOS_EDAD) : false;

  return (
    <div className="space-y-10">
      <p className="text-xs text-black-eske-60">
        Corte semanal: <strong>{fecha || "—"}</strong>
      </p>

      <div>
        <SectionHeader title="E2 — Lista Nominal por grupo etario" />
        {isLoading || !data ? (
          <ChartSkeleton height={260} />
        ) : (
          <E2GroupBarsChart data={data} />
        )}
      </div>

      <div>
        <SectionHeader
          title="E4 — Lista Nominal por rango de edad"
          subtitle={
            sinSexoPorEdad
              ? "Desglose por sexo no disponible en vista nacional. Selecciona una entidad para activarlo."
              : "Diferenciado por sexo (hombres / mujeres)."
          }
        />
        {isLoading || !data ? (
          <ChartSkeleton height={300} />
        ) : (
          <E4RangeChart data={data} />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-panel Sexo
// ──────────────────────────────────────────────
function SexoPanel({ ambito, corte, entidad, onFechasLoaded }: PanelProps) {
  // S1 y S2 necesitan columnas de sexo dentro de cada rango etario
  const {
    isLoading: loadingEdad,
    error: errorEdad,
    data: dataEdad,
    fecha,
    availableFechas,
  } = useLneSemanal("edad", ambito, corte, entidad ?? null);

  // S4 necesita los totales H/M/NB
  const { isLoading: loadingSexo, data: dataSexo } =
    useLneSemanal("sexo", ambito, corte, entidad ?? null);

  useEffect(() => {
    if (availableFechas.length > 0) onFechasLoaded?.(availableFechas);
  }, [availableFechas, onFechasLoaded]);

  if (errorEdad) return <p className="text-sm text-red-eske py-8 text-center">{errorEdad}</p>;

  const sinSexoPorEdad = dataEdad ? allSexValuesZero(dataEdad, RANGOS_EDAD) : false;

  return (
    <div className="space-y-10">
      <p className="text-xs text-black-eske-60">
        Corte semanal: <strong>{fecha || "—"}</strong>
      </p>

      <div>
        <SectionHeader
          title="S1 — Pirámide poblacional"
          subtitle={
            sinSexoPorEdad
              ? "Pirámide por sexo no disponible en vista nacional. Selecciona una entidad para activarla."
              : "Hombres a la izquierda, mujeres a la derecha. Lista Nominal por rango etario."
          }
        />
        {loadingEdad || !dataEdad ? (
          <ChartSkeleton height={360} />
        ) : (
          <S1PyramidChart data={dataEdad} />
        )}
      </div>

      <div>
        <SectionHeader
          title="S2 — Lista Nominal por grupo etario y sexo"
          subtitle={sinSexoPorEdad ? "Desglose por sexo no disponible en vista nacional." : undefined}
        />
        {loadingEdad || !dataEdad ? (
          <ChartSkeleton height={280} />
        ) : (
          <S2AgeSexChart data={dataEdad} />
        )}
      </div>

      <div>
        <SectionHeader
          title="S4 — Padrón Electoral vs Lista Nominal por sexo"
          subtitle="Compara la tasa de inclusión en la Lista Nominal para cada sexo."
        />
        {loadingSexo || !dataSexo ? (
          <ChartSkeleton height={280} />
        ) : (
          <S4ParticipacionChart data={dataSexo} />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-panel Origen
// ──────────────────────────────────────────────
function OrigenPanel({ ambito, corte, entidad, onFechasLoaded }: PanelProps) {
  const [topN, setTopN] = useState(15);
  const { isLoading, error, data, fecha, availableFechas } =
    useLneSemanal("origen", ambito, corte, entidad ?? null);

  useEffect(() => {
    if (availableFechas.length > 0) onFechasLoaded?.(availableFechas);
  }, [availableFechas, onFechasLoaded]);

  if (error) return <p className="text-sm text-red-eske py-8 text-center">{error}</p>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <p className="text-xs text-black-eske-60">
          Corte semanal: <strong>{fecha || "—"}</strong>
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="topn-select" className="text-xs text-black-eske-60">
            Mostrar:
          </label>
          <select
            id="topn-select"
            value={topN}
            onChange={(e) => setTopN(parseInt(e.target.value))}
            className="text-xs border border-gray-eske-30 rounded px-2 py-1 bg-white-eske text-black-eske focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-eske"
          >
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={32}>Todos (34)</option>
          </select>
        </div>
      </div>

      <div>
        <SectionHeader
          title="O1 — Lista Nominal por entidad de origen"
          subtitle="Ciudadanos registrados según su estado de nacimiento, ordenados de mayor a menor."
        />
        {isLoading || !data ? (
          <ChartSkeleton height={topN * 22 + 60} />
        ) : (
          <O1HeatmapChart data={data} topN={topN} />
        )}
      </div>

      <div>
        <SectionHeader title="O2 — Padrón Electoral vs Lista Nominal por entidad de origen" />
        {isLoading || !data ? (
          <ChartSkeleton height={topN * 22 + 60} />
        ) : (
          <O2PadronLneChart data={data} topN={topN} />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Vista principal Semanal
// ──────────────────────────────────────────────
const DESGLOSES: { id: SemanalDesglose; label: string }[] = [
  { id: "sexo", label: "Desglose Sexo" },
  { id: "edad", label: "Desglose Edad" },
  { id: "origen", label: "Desglose Origen" },
];

export default function SemanalView() {
  const [desglose, setDesglose] = useState<SemanalDesglose>("sexo");
  const [ambito, setAmbito] = useState<Ambito>("nacional");
  const [entidad, setEntidad] = useState("");
  const [corte, setCorte] = useState<string | undefined>(undefined);
  const [availableFechas, setAvailableFechas] = useState<string[]>([]);

  // Solo actualizar fechas disponibles si el array es más grande que el actual
  const handleFechasLoaded = useCallback((fechas: string[]) => {
    setAvailableFechas((prev) =>
      fechas.length > prev.length ? fechas : prev
    );
  }, []);

  // Etiqueta de corte formateada
  const corteLabel = useMemo(() => {
    if (!corte) return "Más reciente";
    const [y, m, d] = corte.split("-");
    return `${d}/${m}/${y}`;
  }, [corte]);

  const panelProps: PanelProps = {
    ambito,
    corte,
    entidad: entidad || undefined,
    onFechasLoaded: handleFechasLoaded,
  };

  return (
    <div className="space-y-6">
      {/* ── Barra de filtros ── */}
      <div className="p-4 bg-gray-eske-10 rounded-lg border border-gray-eske-20 space-y-3">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">

          {/* Ámbito */}
          <fieldset>
            <legend className="text-xs font-semibold text-black-eske-10 mb-1">
              Ámbito
            </legend>
            <div className="flex gap-3">
              {(["nacional", "extranjero"] as Ambito[]).map((a) => (
                <label
                  key={a}
                  className="flex items-center gap-1.5 cursor-pointer text-sm"
                >
                  <input
                    type="radio"
                    name="semanal-ambito"
                    value={a}
                    checked={ambito === a}
                    onChange={() => setAmbito(a)}
                    className="accent-blue-eske"
                  />
                  <span className="capitalize">{a}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Entidad */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="semanal-entidad"
              className="text-xs font-semibold text-black-eske-10"
            >
              Entidad (opcional)
            </label>
            <select
              id="semanal-entidad"
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              className="text-sm border border-gray-eske-30 rounded-md px-2 py-1.5 bg-white-eske text-black-eske focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske min-w-[180px]"
            >
              <option value="">— Nacional —</option>
              {ESTADOS_LIST.map((e) => (
                <option key={e.key} value={e.nombre}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Corte (fecha) */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="semanal-corte"
              className="text-xs font-semibold text-black-eske-10"
            >
              Corte semanal
            </label>
            <select
              id="semanal-corte"
              value={corte ?? ""}
              onChange={(e) =>
                setCorte(e.target.value || undefined)
              }
              disabled={availableFechas.length === 0}
              className="text-sm border border-gray-eske-30 rounded-md px-2 py-1.5 bg-white-eske text-black-eske focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
            >
              <option value="">{corteLabel}</option>
              {availableFechas.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Desglose */}
          <div className="flex flex-col gap-1 ml-auto">
            <span className="text-xs font-semibold text-black-eske-10 mb-1">
              Desglose
            </span>
            <div className="flex gap-2">
              {DESGLOSES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDesglose(d.id)}
                  className={[
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border",
                    desglose === d.id
                      ? "bg-blue-eske text-white-eske border-blue-eske"
                      : "bg-white-eske text-black-eske-60 border-gray-eske-30 hover:border-blue-eske hover:text-blue-eske",
                  ].join(" ")}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel activo ── */}
      {desglose === "edad" && <EdadPanel {...panelProps} />}
      {desglose === "sexo" && <SexoPanel {...panelProps} />}
      {desglose === "origen" && <OrigenPanel {...panelProps} />}

      {/* Fuente */}
      <p className="text-[11px] text-black-eske-60">
        Fuente: DERFE — Dirección Ejecutiva del Registro Federal de Electores, INE.
        Datos del Padrón Electoral y Lista Nominal.
        {entidad && ` Filtrado por entidad: ${entidad}.`}
      </p>
    </div>
  );
}
