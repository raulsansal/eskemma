"use client";

/**
 * Gráficas E1-E4 — Desglose Edad (Vista Semanal)
 *
 * E1: Serie temporal Padrón+LNE por rango etario (con proyección separada)
 * E2: Barras horizontales LNE por grupos etarios con valor + porcentaje
 * E3: Serie temporal Padrón+LNE por grupo etario (con proyección)
 * E4: Padrón vs LNE por rango de edad individual (corte único)
 */

import { useState, Fragment } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { useEscapeKey } from "@/app/hooks/useEscapeKey";
import { useFocusTrap } from "@/app/hooks/useFocusTrap";

import type { SemanalSerieRow } from "@/app/sefix/hooks/useLneSemanalesSerie";
import type { Ambito } from "@/lib/sefix/seriesUtils";
import {
  RANGOS_EDAD,
  ETIQ_RANGOS,
  GRUPOS_ETARIOS,
  type RangoEdad,
  type GrupoKey,
  colorRangoPad,
  colorRangoLne,
  colorTotalPad,
  colorTotalLne,
  COLOR_E3_PAD_NAC,
  COLOR_E3_LNE_NAC,
  COLOR_E3_PAD_EXT,
  COLOR_E3_LNE_EXT,
  computeSemanalesProyeccion,
  computeProyeccionGrupo,
} from "@/lib/sefix/semanalUtils";

const FMT = new Intl.NumberFormat("es-MX");
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : FMT.format(v);

// Labels cortos para el eje X de E4
const RANGOS_LABELS: Record<string, string> = {
  "18": "18", "19": "19", "20_24": "20-24", "25_29": "25-29",
  "30_34": "30-34", "35_39": "35-39", "40_44": "40-44", "45_49": "45-49",
  "50_54": "50-54", "55_59": "55-59", "60_64": "60-64", "65_y_mas": "65+",
};

// Grupos para E2 — claves deben coincidir con GrupoKey de semanalUtils (en-dash)
const GRUPOS: { key: GrupoKey; rangos: string[] }[] = [
  { key: "Jóvenes (18–29)", rangos: ["18", "19", "20_24", "25_29"] },
  { key: "Adultos (30–59)", rangos: ["30_34", "35_39", "40_44", "45_49", "50_54", "55_59"] },
  { key: "Mayores (60+)",   rangos: ["60_64", "65_y_mas"] },
];

// ──────────────────────────────────────────────
// Helper: obtiene el valor de un rango manejando ambos formatos de datos:
//   - Series CSV:   lista_18 / padron_18  (columna de total directa)
//   - Aggregate:    lista_18_hombres + lista_18_mujeres + lista_18_no_binario
// ──────────────────────────────────────────────
function rangoTotal(
  data: Record<string, number>,
  r: string,
  prefix: "lista" | "padron"
): number {
  const direct = data[`${prefix}_${r}`];
  if (direct !== undefined && direct > 0) return direct;
  return (
    (data[`${prefix}_${r}_hombres`]    ?? 0) +
    (data[`${prefix}_${r}_mujeres`]    ?? 0) +
    (data[`${prefix}_${r}_no_binario`] ?? 0)
  );
}

function sumGroup(
  data: Record<string, number>,
  rangos: string[],
  prefix: "lista" | "padron"
): number {
  return rangos.reduce((acc, r) => acc + rangoTotal(data, r, prefix), 0);
}

// ──────────────────────────────────────────────
// E2 — LNE por grupos etarios (barras horizontales + valor y %)
// ──────────────────────────────────────────────
interface E2Props {
  data: Record<string, number>;
  ambito?: Ambito;
}

export function E2GroupBarsChart({ data, ambito = "nacional" }: E2Props) {
  const palPad = ambito === "extranjero" ? COLOR_E3_PAD_EXT : COLOR_E3_PAD_NAC;
  const chartData = GRUPOS.map((g) => ({
    name: g.key,
    lista: sumGroup(data, g.rangos, "lista"),
    padron: sumGroup(data, g.rangos, "padron"),
    color: palPad[g.key] ?? "#277592",
  }));
  const total = chartData.reduce((s, d) => s + d.lista, 0);

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 160, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={fmtM}
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
        />
        <Tooltip
          cursor={false}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const padron = payload.find((p) => p.dataKey === "padron");
            const lista  = payload.find((p) => p.dataKey === "lista");
            return (
              <div style={{ fontSize: 12, background: "white", border: "1px solid var(--color-gray-eske-20)", borderRadius: 6, padding: "8px 12px" }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
                {padron && <p>Padrón Electoral: {FMT.format(Number(padron.value))}</p>}
                {lista  && <p>Lista Nominal: {FMT.format(Number(lista.value))}</p>}
              </div>
            );
          }}
        />
        <Bar dataKey="padron" shape={() => null} legendType="none" />
        <Bar
          dataKey="lista"
          shape={({ x, y, width, height, color }: {
            x?: number; y?: number; width?: number; height?: number; color?: string;
          }) => (
            <rect
              x={x ?? 0} y={y ?? 0}
              width={Math.max(0, width ?? 0)} height={Math.max(0, height ?? 0)}
              fill={color ?? "#277592"} rx={3} ry={3}
            />
          )}
        >
          <LabelList
            dataKey="lista"
            position="right"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={(props: any) => {
              const { x, y, width, height, value } = props;
              const pct = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : "0.0";
              return (
                <text
                  x={Number(x) + Number(width) + 8}
                  y={Number(y) + Number(height) / 2 + 4}
                  fontSize={11}
                  fill="var(--color-black-eske)"
                >
                  {FMT.format(Number(value))}  ({pct}%)
                </text>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// Helpers compartidos E1 / E3
// ──────────────────────────────────────────────
function fmtFecha(iso: string): string {
  const [, m, d] = iso.split("-");
  const meses = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10)]}`;
}

/** Modal de metodología de proyección */
function MetodologiaModal({ onClose }: { onClose: () => void }) {
  const modalRef = useFocusTrap(true);
  useEscapeKey(true, onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-semanal-metodologia-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black-eske/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={modalRef as React.RefObject<HTMLDivElement>}
        className="relative w-full max-w-md bg-white-eske rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-eske-20">
          <h2
            id="modal-semanal-metodologia-title"
            className="text-base font-semibold text-bluegreen-eske flex items-center gap-2"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Metodología de Proyección
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de metodología"
            className="text-black-eske-60 hover:text-black-eske transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 text-sm text-black-eske leading-relaxed max-h-[70vh] overflow-y-auto">
          <p>
            La proyección utiliza un{" "}
            <strong>modelo de tasa de crecimiento semanal compuesto</strong>{" "}
            basado en los cortes semanales disponibles del año en curso.
          </p>

          <div>
            <p className="font-semibold text-bluegreen-eske mb-2">Pasos del cálculo:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li><strong>Datos base:</strong> Cortes semanales del año actual.</li>
              <li><strong>Tasa de crecimiento:</strong> Tasa semanal compuesta entre el primer y último corte disponibles.</li>
              <li><strong>Proyección:</strong> Se aplica la tasa hasta diciembre.</li>
              <li><strong>Visualización:</strong> Líneas punteadas = valores proyectados.</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-bluegreen-eske mb-2">Fórmula:</p>
            <div className="bg-gray-eske-10 rounded-lg p-3 border-l-4 border-bluegreen-eske font-mono text-xs space-y-1">
              <p>Tasa = (Valor_final / Valor_inicial)^(1/(n−1)) − 1</p>
              <p>Proyección(i) = Último_valor × (1 + Tasa)^i</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-orange-eske mb-2 flex items-center gap-1">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Consideraciones:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Asume una tasa de crecimiento <strong>constante</strong>.</li>
              <li>Es una <strong>estimación estadística</strong>, no un dato oficial.</li>
              <li>Proyecta hasta <strong>diciembre</strong> del año en curso.</li>
              <li>Los datos oficiales del INE prevalecen sobre la proyección.</li>
            </ul>
          </div>

          <p className="text-xs text-black-eske-60 text-center border-t border-gray-eske-20 pt-3">
            Esta es una herramienta de referencia. Los datos oficiales son los publicados por el INE.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-eske-20 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-bluegreen-eske text-white-eske text-sm font-semibold rounded-lg hover:bg-bluegreen-eske-80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske focus-visible:ring-offset-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// E1 — Serie temporal Padrón y LNE (con proyección separada)
// ──────────────────────────────────────────────
interface E1Props {
  serie: SemanalSerieRow[];
  ambito: Ambito;
}

export function E1SerieChart({ serie, ambito }: E1Props) {
  const [rangosActivos, setRangosActivos] = useState<Set<RangoEdad>>(new Set(RANGOS_EDAD));
  const [showModal, setShowModal] = useState(false);

  const todosActivos = rangosActivos.size === RANGOS_EDAD.length;

  function toggleRango(r: RangoEdad) {
    setRangosActivos((prev) => {
      const next = new Set(prev);
      if (next.has(r)) { next.delete(r); } else { next.add(r); }
      return next;
    });
  }

  if (serie.length < 2) {
    return (
      <p className="text-sm text-black-eske-60 text-center py-6">
        Sin datos de serie temporal suficientes para proyección (se necesitan al menos 2 cortes).
      </p>
    );
  }

  const colPad = colorTotalPad(ambito);
  const colLne = colorTotalLne(ambito);

  // Colores proyección
  const colPadProy = ambito === "extranjero" ? "#a854e8" : "#6BA4C6";
  const colLneProy = ambito === "extranjero" ? "#4d9de8" : "#E05F7F";

  type ChartPoint = Record<string, number | string | undefined>;
  let chartData: ChartPoint[];

  if (todosActivos) {
    // Modo total: 4 líneas (real + proyectadas), separadas visualmente
    const proy = computeSemanalesProyeccion(serie, "padron_total", "lista_total");
    chartData = proy.map((p) => ({
      label: fmtFecha(p.fecha),
      // Datos reales: solo en puntos no proyectados
      padron:      p.proyectado ? undefined : p.padron,
      lista:       p.proyectado ? undefined : p.lista,
      // Proyección: solo en puntos proyectados
      padronProy:  p.proyectado ? p.padron : undefined,
      listaProy:   p.proyectado ? p.lista  : undefined,
    }));
  } else {
    // Modo rango: 4 líneas por rango (real sólidas + proyección punteada)
    const rangosArr = RANGOS_EDAD.filter((r) => rangosActivos.has(r));
    const proyMap = new Map<RangoEdad, ReturnType<typeof computeSemanalesProyeccion>>();
    for (const r of rangosArr) {
      proyMap.set(r, computeSemanalesProyeccion(serie, `padron_${r}`, `lista_${r}`));
    }
    const pRef = proyMap.get(rangosArr[0]) ?? [];
    chartData = pRef.map((p, idx) => {
      const point: ChartPoint = { label: fmtFecha(p.fecha) };
      for (const r of rangosArr) {
        const proy = proyMap.get(r)!;
        const pt = proy[idx];
        if (!pt) continue;
        if (!pt.proyectado) {
          point[`padron_${r}`]     = pt.padron;
          point[`lista_${r}`]      = pt.lista;
        } else {
          point[`padronProy_${r}`] = pt.padron;
          point[`listaProy_${r}`]  = pt.lista;
        }
      }
      return point;
    });
  }

  // Y-axis: domain desde el mínimo real observado
  const allNumericE1 = chartData.flatMap((p) =>
    Object.values(p).filter((v): v is number => typeof v === "number" && v > 0)
  );
  const yMinE1 = allNumericE1.length > 0
    ? Math.floor(Math.min(...allNumericE1) * 0.97)
    : 0;

  return (
    <>
      {showModal && <MetodologiaModal onClose={() => setShowModal(false)} />}

      {/* Widget: selector de rangos */}
      <div className="mb-4 rounded-lg border border-gray-eske-20 bg-gray-eske-10 p-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-black-eske-60 mb-2">Rangos de edad:</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {RANGOS_EDAD.map((r) => (
                <label key={r} className="flex items-center gap-1 cursor-pointer text-xs text-black-eske-80">
                  <input
                    type="checkbox"
                    checked={rangosActivos.has(r)}
                    onChange={() => toggleRango(r)}
                    className="accent-blue-eske"
                  />
                  {ETIQ_RANGOS[r]}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0 pt-4">
            <button
              onClick={() => setRangosActivos(new Set(RANGOS_EDAD))}
              className="px-2 py-1 text-xs rounded border border-gray-eske-30 bg-white-eske text-black-eske-60 hover:border-blue-eske hover:text-blue-eske whitespace-nowrap"
            >
              ↺ Restablecer
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-bluegreen-eske border border-bluegreen-eske-30 rounded hover:bg-bluegreen-eske-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske whitespace-nowrap"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Metodología
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
            interval={6}
          />
          <YAxis
            tickFormatter={fmtM}
            tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
            width={64}
            domain={[yMinE1, "auto"]}
          />
          <Tooltip
            formatter={(v, name) => [FMT.format(Number(v)), String(name)]}
            itemSorter={(item) => -(item.value as number)}
            contentStyle={{ fontSize: 11, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />

          {todosActivos ? (
            <>
              {/* Datos reales — líneas sólidas */}
              <Line dataKey="padron"    name="Padrón Total"       stroke={colPad}    strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line dataKey="lista"     name="LNE Total"          stroke={colLne}    strokeWidth={2.5} dot={false} connectNulls={false} />
              {/* Proyección — líneas punteadas, separadas visualmente */}
              <Line dataKey="padronProy" name="Proyección Padrón" stroke={colPadProy} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
              <Line dataKey="listaProy"  name="Proyección LNE"   stroke={colLneProy} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
            </>
          ) : (
            RANGOS_EDAD.filter((r) => rangosActivos.has(r)).map((r, i) => (
              <Fragment key={r}>
                <Line dataKey={`padron_${r}`}     name={`Padrón ${ETIQ_RANGOS[r]}`}        stroke={colorRangoPad(i, ambito)} strokeWidth={2}   dot={false} connectNulls={false} />
                <Line dataKey={`lista_${r}`}      name={`LNE ${ETIQ_RANGOS[r]}`}           stroke={colorRangoLne(i, ambito)} strokeWidth={2}   dot={false} connectNulls={false} />
                <Line dataKey={`padronProy_${r}`} name={`Proy. Padrón ${ETIQ_RANGOS[r]}`}  stroke={colorRangoPad(i, ambito)} strokeWidth={1.5} strokeDasharray="6 3" strokeOpacity={0.7} dot={false} connectNulls={false} />
                <Line dataKey={`listaProy_${r}`}  name={`Proy. LNE ${ETIQ_RANGOS[r]}`}     stroke={colorRangoLne(i, ambito)} strokeWidth={1.5} strokeDasharray="6 3" strokeOpacity={0.7} dot={false} connectNulls={false} />
              </Fragment>
            ))
          )}
        </LineChart>
      </ResponsiveContainer>

      <p className="text-[11px] text-black-eske-60 text-center mt-1">
        Líneas punteadas = proyección estimada hasta diciembre.
      </p>
    </>
  );
}

// ──────────────────────────────────────────────
// E3 — Serie temporal por grupo etario (con proyección)
// ──────────────────────────────────────────────
interface E3Props {
  serie: SemanalSerieRow[];
  ambito: Ambito;
}

export function E3GruposSerieChart({ serie, ambito }: E3Props) {
  const grupoKeys = Object.keys(GRUPOS_ETARIOS) as GrupoKey[];
  const [gruposActivos, setGruposActivos] = useState<Set<GrupoKey>>(new Set(grupoKeys));
  const [showModal, setShowModal] = useState(false);

  function toggleGrupo(g: GrupoKey) {
    setGruposActivos((prev) => {
      const next = new Set(prev);
      if (next.has(g)) { next.delete(g); } else { next.add(g); }
      return next;
    });
  }

  if (serie.length < 2) {
    return (
      <p className="text-sm text-black-eske-60 text-center py-6">
        Sin datos suficientes para proyección por grupo etario.
      </p>
    );
  }

  const palPad = ambito === "extranjero" ? COLOR_E3_PAD_EXT : COLOR_E3_PAD_NAC;
  const palLne = ambito === "extranjero" ? COLOR_E3_LNE_EXT : COLOR_E3_LNE_NAC;

  const gruposAct = grupoKeys.filter((g) => gruposActivos.has(g));
  const proyMap = new Map<GrupoKey, ReturnType<typeof computeProyeccionGrupo>>();
  for (const g of gruposAct) {
    proyMap.set(g, computeProyeccionGrupo(serie, GRUPOS_ETARIOS[g]));
  }

  const pRef = proyMap.get(gruposAct[0]) ?? [];
  const chartData = pRef.map((p, idx) => {
    const point: Record<string, number | string | undefined> = {
      label: fmtFecha(p.fecha),
    };
    for (const g of gruposAct) {
      const proy = proyMap.get(g)!;
      const prj = proy[idx];
      if (!prj) continue;
      if (!prj.proyectado) {
        point[`pad_${g}`] = prj.padron;
        point[`lne_${g}`] = prj.lista;
      } else {
        point[`padProy_${g}`] = prj.padron;
        point[`lneProy_${g}`] = prj.lista;
      }
    }
    return point;
  });

  // Y-axis: domain desde el mínimo real observado
  const allNumericE3 = chartData.flatMap((p) =>
    Object.values(p).filter((v): v is number => typeof v === "number" && v > 0)
  );
  const yMinE3 = allNumericE3.length > 0
    ? Math.floor(Math.min(...allNumericE3) * 0.97)
    : 0;

  return (
    <>
      {showModal && <MetodologiaModal onClose={() => setShowModal(false)} />}

      {/* Widget: selector de grupos */}
      <div className="mb-4 rounded-lg border border-gray-eske-20 bg-gray-eske-10 p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-black-eske-60 mb-2">Grupos etarios:</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {grupoKeys.map((g) => (
                <label key={g} className="flex items-center gap-1 cursor-pointer text-xs text-black-eske-80">
                  <input
                    type="checkbox"
                    checked={gruposActivos.has(g)}
                    onChange={() => toggleGrupo(g)}
                    className="accent-blue-eske"
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => setGruposActivos(new Set(grupoKeys))}
              className="px-2 py-1 text-xs rounded border border-gray-eske-30 bg-white-eske text-black-eske-60 hover:border-blue-eske hover:text-blue-eske whitespace-nowrap"
            >
              ↺ Restablecer
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-bluegreen-eske border border-bluegreen-eske-30 rounded hover:bg-bluegreen-eske-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske whitespace-nowrap"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Metodología
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
            interval={6}
          />
          <YAxis
            tickFormatter={fmtM}
            tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
            width={64}
            domain={[yMinE3, "auto"]}
          />
          <Tooltip
            formatter={(v, name) => [FMT.format(Number(v)), String(name)]}
            itemSorter={(item) => -(item.value as number)}
            contentStyle={{ fontSize: 11, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />

          {gruposAct.map((g) => (
            <Fragment key={g}>
              <Line dataKey={`pad_${g}`}     name={`Padrón ${g}`}         stroke={palPad[g] ?? "#277592"} strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line dataKey={`lne_${g}`}     name={`LNE ${g}`}             stroke={palLne[g] ?? "#003E66"} strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line dataKey={`padProy_${g}`} name={`Proy. Padrón ${g}`}    stroke={palPad[g] ?? "#277592"} strokeWidth={2}   strokeDasharray="6 3" strokeOpacity={0.7} dot={false} connectNulls={false} />
              <Line dataKey={`lneProy_${g}`} name={`Proy. LNE ${g}`}       stroke={palLne[g] ?? "#003E66"} strokeWidth={2}   strokeDasharray="6 3" strokeOpacity={0.7} dot={false} connectNulls={false} />
            </Fragment>
          ))}
        </LineChart>
      </ResponsiveContainer>

      <p className="text-[11px] text-black-eske-60 text-center mt-1">
        Líneas punteadas = proyección estimada hasta diciembre.
      </p>
    </>
  );
}

// ──────────────────────────────────────────────
// E4 — Padrón vs LNE por rango de edad (corte único)
// ──────────────────────────────────────────────
interface E4Props {
  data: Record<string, number>;
}

export function E4RangeChart({ data }: E4Props) {
  const chartData = RANGOS_EDAD.map((r) => ({
    name: RANGOS_LABELS[r],
    padron: rangoTotal(data, r, "padron"),
    lista:  rangoTotal(data, r, "lista"),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          tickFormatter={fmtM}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
          width={60}
        />
        <Tooltip
          formatter={(v, n) => [FMT.format(Number(v)), n === "padron" ? "Padrón Electoral" : "Lista Nominal"]}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
          cursor={false}
        />
        <Legend
          formatter={(v) => v === "padron" ? "Padrón Electoral" : "Lista Nominal"}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="padron" name="padron" fill="var(--color-blue-eske-60)"  radius={[3, 3, 0, 0]} />
        <Bar dataKey="lista"  name="lista"  fill="var(--color-red-eske-30)"   radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
