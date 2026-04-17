"use client";

/**
 * Gráficas O1-O3 — Desglose Origen (Vista Semanal)
 *
 * O1: Top-N estados de origen por LNE (barras horizontales)
 * O2: Padrón vs LNE por entidad de origen (barras agrupadas)
 * O3: Evolución semanal por entidad de origen (con proyección separada)
 */

import { useState, useMemo } from "react";
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
  ResponsiveContainer,
} from "recharts";

import type { SemanalSerieRow } from "@/app/sefix/hooks/useLneSemanalesSerie";
import type { Ambito } from "@/lib/sefix/seriesUtils";
import { computeSemanalesProyeccion } from "@/lib/sefix/semanalUtils";

const FMT = new Intl.NumberFormat("es-MX");
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : FMT.format(v);

// Abreviaturas para los estados de origen
const ABREV: Record<string, string> = {
  aguascalientes: "AGS", baja_california: "BC", baja_california_sur: "BCS",
  campeche: "CAMP", chiapas: "CHIS", chihuahua: "CHIH", ciudad_de_mexico: "CDMX",
  coahuila: "COAH", colima: "COL", durango: "DGO", guanajuato: "GTO",
  guerrero: "GRO", hidalgo: "HGO", jalisco: "JAL", estado_de_mexico: "MEX",
  michoacan: "MICH", morelos: "MOR", nayarit: "NAY", nuevo_leon: "NL",
  oaxaca: "OAX", puebla: "PUE", queretaro: "QRO", quintana_roo: "QROO",
  san_luis_potosi: "SLP", sinaloa: "SIN", sonora: "SON", tabasco: "TAB",
  tamaulipas: "TAMPS", tlaxcala: "TLAX", veracruz: "VER", yucatan: "YUC",
  zacatecas: "ZAC",
  pad87: "E87", pad88: "E88",
};

function extractOrigenData(
  data: Record<string, number>,
  topN = 15
): { name: string; lista: number; padron: number }[] {
  const entries: { name: string; lista: number; padron: number }[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (!key.startsWith("ln_") && !key.startsWith("pad_")) continue;
    if (!key.startsWith("ln_")) continue;
    const estado = key.replace("ln_", "");
    const padronKey = `pad_${estado}`;
    entries.push({
      name: ABREV[estado] ?? estado.toUpperCase().slice(0, 6),
      lista: val,
      padron: data[padronKey] ?? 0,
    });
  }

  return entries
    .filter((e) => e.lista > 0)
    .sort((a, b) => b.lista - a.lista)
    .slice(0, topN);
}

// ──────────────────────────────────────────────
// O1 — Top-N estados de origen (LNE)
// ──────────────────────────────────────────────
interface Props {
  data: Record<string, number>;
  topN?: number;
  ambito?: Ambito;
}

export function O1HeatmapChart({ data, topN = 15, ambito = "nacional" }: Props) {
  const col = ambito === "extranjero" ? "#0163a4" : "var(--color-blue-eske)";
  const chartData = extractOrigenData(data, topN);

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, topN * 22)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 20, left: 40, bottom: 0 }}
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
          width={44}
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
        />
        <Tooltip
          formatter={(v) => [FMT.format(Number(v)), "Lista Nominal"]}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Bar dataKey="lista" fill={col} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// O2 — Padrón vs LNE por entidad de origen
// ──────────────────────────────────────────────
export function O2PadronLneChart({ data, topN = 15, ambito = "nacional" }: Props) {
  const colPad = ambito === "extranjero" ? "#7206b4" : "var(--color-bluegreen-eske-40)";
  const colLne = ambito === "extranjero" ? "#0163a4" : "var(--color-blue-eske)";
  const chartData = extractOrigenData(data, topN);

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, topN * 22)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 20, left: 40, bottom: 0 }}
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
          width={44}
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
        />
        <Tooltip
          formatter={(v, n) => [FMT.format(Number(v)), n === "padron" ? "Padrón" : "Lista Nominal"]}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Legend
          formatter={(v) => (v === "padron" ? "Padrón Electoral" : "Lista Nominal")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="padron" fill={colPad} radius={[0, 3, 3, 0]} />
        <Bar dataKey="lista"  fill={colLne} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// O3 — Evolución semanal por entidad de origen
// ──────────────────────────────────────────────
const ESTADOS_ORIGEN_KEYS: { key: string; label: string }[] = [
  { key: "aguascalientes",    label: "Aguascalientes" },
  { key: "baja_california",   label: "Baja California" },
  { key: "baja_california_sur", label: "Baja California Sur" },
  { key: "campeche",          label: "Campeche" },
  { key: "chiapas",           label: "Chiapas" },
  { key: "chihuahua",         label: "Chihuahua" },
  { key: "ciudad_de_mexico",  label: "Ciudad de México" },
  { key: "coahuila",          label: "Coahuila" },
  { key: "colima",            label: "Colima" },
  { key: "durango",           label: "Durango" },
  { key: "estado_de_mexico",  label: "Estado de México" },
  { key: "guanajuato",        label: "Guanajuato" },
  { key: "guerrero",          label: "Guerrero" },
  { key: "hidalgo",           label: "Hidalgo" },
  { key: "jalisco",           label: "Jalisco" },
  { key: "michoacan",         label: "Michoacán" },
  { key: "morelos",           label: "Morelos" },
  { key: "nayarit",           label: "Nayarit" },
  { key: "nuevo_leon",        label: "Nuevo León" },
  { key: "oaxaca",            label: "Oaxaca" },
  { key: "puebla",            label: "Puebla" },
  { key: "queretaro",         label: "Querétaro" },
  { key: "quintana_roo",      label: "Quintana Roo" },
  { key: "san_luis_potosi",   label: "San Luis Potosí" },
  { key: "sinaloa",           label: "Sinaloa" },
  { key: "sonora",            label: "Sonora" },
  { key: "tabasco",           label: "Tabasco" },
  { key: "tamaulipas",        label: "Tamaulipas" },
  { key: "tlaxcala",          label: "Tlaxcala" },
  { key: "veracruz",          label: "Veracruz" },
  { key: "yucatan",           label: "Yucatán" },
  { key: "zacatecas",         label: "Zacatecas" },
];

function fmtFechaOrigen(iso: string): string {
  const [, m, d] = iso.split("-");
  const meses = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10)]}`;
}

interface O3Props {
  serie: SemanalSerieRow[];
  ambito: Ambito;
}

export function O3OrigenSerieChart({ serie, ambito }: O3Props) {
  const [origenKey, setOrigenKey] = useState("jalisco");

  const colPad    = ambito === "extranjero" ? "#7206b4" : "#003F8A";
  const colLne    = ambito === "extranjero" ? "#0163a4" : "#C0306A";
  const colPadProy = ambito === "extranjero" ? "#a854e8" : "#4891B3";
  const colLneProy = ambito === "extranjero" ? "#4d9de8" : "#D3103F";

  const chartData = useMemo(() => {
    if (serie.length < 2) return [];
    const proy = computeSemanalesProyeccion(serie, `pad_${origenKey}`, `ln_${origenKey}`);
    return proy.map((p) => ({
      label:      fmtFechaOrigen(p.fecha),
      padron:     p.proyectado ? undefined : p.padron,
      lista:      p.proyectado ? undefined : p.lista,
      padronProy: p.proyectado ? p.padron   : undefined,
      listaProy:  p.proyectado ? p.lista    : undefined,
    }));
  }, [serie, origenKey]);

  const allNumeric = chartData.flatMap((p) =>
    Object.values(p).filter((v): v is number => typeof v === "number" && v > 0)
  );
  const yMin = allNumeric.length > 0 ? Math.floor(Math.min(...allNumeric) * 0.97) : 0;

  return (
    <div className="space-y-3">
      {/* Selector de origen */}
      <div className="flex items-center gap-2">
        <label htmlFor="o3-origen" className="text-xs font-semibold text-black-eske-60">
          Entidad de origen:
        </label>
        <select
          id="o3-origen"
          value={origenKey}
          onChange={(e) => setOrigenKey(e.target.value)}
          className="text-sm border border-gray-eske-30 rounded-md px-2 py-1 bg-white-eske text-black-eske focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske min-w-[200px]"
        >
          {ESTADOS_ORIGEN_KEYS.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {chartData.length < 2 ? (
        <p className="text-sm text-black-eske-60 text-center py-6">
          Sin datos suficientes de serie temporal para esta entidad de origen.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={fmtM}
                tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
                width={64}
                domain={[yMin, "auto"]}
              />
              <Tooltip
                formatter={(v, name) => [FMT.format(Number(v)), String(name)]}
                itemSorter={(item) => -(item.value as number)}
                contentStyle={{ fontSize: 11, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line dataKey="padron"     name="Padrón Electoral"    stroke={colPad}     strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line dataKey="lista"      name="Lista Nominal"        stroke={colLne}     strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line dataKey="padronProy" name="Proy. Padrón"         stroke={colPadProy} strokeWidth={2}   strokeDasharray="6 3" strokeOpacity={0.7} dot={false} connectNulls={false} />
              <Line dataKey="listaProy"  name="Proy. Lista Nominal"  stroke={colLneProy} strokeWidth={2}   strokeDasharray="6 3" strokeOpacity={0.7} dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-black-eske-60 text-center">
            Líneas punteadas = proyección estimada hasta diciembre.
          </p>
        </>
      )}
    </div>
  );
}
