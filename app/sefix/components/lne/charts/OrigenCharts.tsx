"use client";

/**
 * Gráficas O1-O3 — Desglose Origen (Vista Semanal)
 *
 * O1: Top-N estados de origen por LNE (barras horizontales)
 * O2: Padrón vs LNE por entidad de origen (barras agrupadas)
 * O3: Proyección por entidad de origen — stub hasta series pre-agregadas
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
    if (!key.startsWith("ln_")) continue; // solo procesar lista
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
}

export function O1HeatmapChart({ data, topN = 15 }: Props) {
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
        <Bar dataKey="lista" fill="var(--color-blue-eske)" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// O2 — Padrón vs LNE por entidad de origen
// ──────────────────────────────────────────────
export function O2PadronLneChart({ data, topN = 15 }: Props) {
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
        <Bar dataKey="padron" fill="var(--color-bluegreen-eske-40)" radius={[0, 3, 3, 0]} />
        <Bar dataKey="lista" fill="var(--color-blue-eske)" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
