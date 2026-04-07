"use client";

/**
 * Gráficas E1-E4 — Desglose Edad (Vista Semanal)
 *
 * E1: Serie temporal LNE por rango etario (requiere series pre-agregadas)
 * E2: Barras horizontales LNE por grupos etarios (corte único)
 * E3: Proyección por grupo etario (usa datos E1)
 * E4: Barras por rango de edad individual (corte único)
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
  Cell,
} from "recharts";

const FMT = new Intl.NumberFormat("es-MX");
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : FMT.format(v);

// Rangos etarios individuales
const RANGOS_EDAD = [
  "18", "19", "20_24", "25_29", "30_34", "35_39",
  "40_44", "45_49", "50_54", "55_59", "60_64", "65_y_mas",
];

const RANGOS_LABELS: Record<string, string> = {
  "18": "18", "19": "19", "20_24": "20-24", "25_29": "25-29",
  "30_34": "30-34", "35_39": "35-39", "40_44": "40-44", "45_49": "45-49",
  "50_54": "50-54", "55_59": "55-59", "60_64": "60-64", "65_y_mas": "65+",
};

// Grupos etarios (E2 / E3)
const GRUPOS = [
  { id: "jovenes", label: "Jóvenes (18-29)", rangos: ["18", "19", "20_24", "25_29"] },
  { id: "adultos", label: "Adultos (30-59)", rangos: ["30_34", "35_39", "40_44", "45_49", "50_54", "55_59"] },
  { id: "mayores", label: "Mayores (60+)", rangos: ["60_64", "65_y_mas"] },
];

const GRUPO_COLORS = [
  "var(--color-blue-eske)",
  "var(--color-bluegreen-eske)",
  "var(--color-orange-eske)",
];

// ──────────────────────────────────────────────
// Helper: suma rangos de un grupo desde el objeto de datos
// ──────────────────────────────────────────────
function sumGroup(
  data: Record<string, number>,
  rangos: string[],
  prefix: "lista" | "padron"
): number {
  return rangos.reduce(
    (acc, r) => acc + (data[`${prefix}_${r}`] ?? 0),
    0
  );
}

// ──────────────────────────────────────────────
// E2 — LNE por grupos etarios (barras horizontales)
// ──────────────────────────────────────────────
interface E2Props {
  data: Record<string, number>;
}

export function E2GroupBarsChart({ data }: E2Props) {
  const chartData = GRUPOS.map((g) => ({
    name: g.label,
    lista: sumGroup(data, g.rangos, "lista"),
    padron: sumGroup(data, g.rangos, "padron"),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 20, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={fmtM}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
        />
        <Tooltip
          formatter={(v, n) => [FMT.format(Number(v)), n === "padron" ? "Padrón" : "Lista Nominal"]}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Legend
          formatter={(v) => (v === "padron" ? "Padrón Electoral" : "Lista Nominal")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="padron" fill="var(--color-bluegreen-eske-40)" radius={[0, 3, 3, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={GRUPO_COLORS[i % GRUPO_COLORS.length]} opacity={0.6} />
          ))}
        </Bar>
        <Bar dataKey="lista" fill="var(--color-blue-eske)" radius={[0, 3, 3, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={GRUPO_COLORS[i % GRUPO_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// E4 — Barras por rango de edad individual (corte único)
// ──────────────────────────────────────────────
export function E4RangeChart({ data }: E2Props) {
  const chartData = RANGOS_EDAD.map((r) => ({
    name: RANGOS_LABELS[r],
    hombres: data[`lista_${r}_hombres`] ?? 0,
    mujeres: data[`lista_${r}_mujeres`] ?? 0,
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
          formatter={(v, n) => [FMT.format(Number(v)), n === "hombres" ? "Hombres" : "Mujeres"]}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="hombres" fill="var(--color-blue-eske-60)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="mujeres" fill="var(--color-red-eske-30)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
