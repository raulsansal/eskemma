"use client";

/**
 * Gráficas S1-S4 — Desglose Sexo (Vista Semanal)
 *
 * S1: Pirámide poblacional (hombres izquierda / mujeres derecha por rango etario)
 * S2: LNE por grupos etarios × sexo (barras agrupadas)
 * S3: Proyección H vs M (usa series pre-agregadas — stub en Fase 3)
 * S4: Participación por sexo (barras H / M / NB)
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
const fmtK = (v: number) =>
  Math.abs(v) >= 1_000_000
    ? `${(Math.abs(v) / 1_000_000).toFixed(1)}M`
    : FMT.format(Math.abs(v));

const RANGOS = [
  "18", "19", "20_24", "25_29", "30_34", "35_39",
  "40_44", "45_49", "50_54", "55_59", "60_64", "65_y_mas",
];
const RANGOS_LABELS: Record<string, string> = {
  "18": "18", "19": "19", "20_24": "20-24", "25_29": "25-29",
  "30_34": "30-34", "35_39": "35-39", "40_44": "40-44", "45_49": "45-49",
  "50_54": "50-54", "55_59": "55-59", "60_64": "60-64", "65_y_mas": "65+",
};

const GRUPOS = [
  { id: "jovenes", label: "Jóvenes", rangos: ["18", "19", "20_24", "25_29"] },
  { id: "adultos", label: "Adultos", rangos: ["30_34", "35_39", "40_44", "45_49", "50_54", "55_59"] },
  { id: "mayores", label: "Mayores", rangos: ["60_64", "65_y_mas"] },
];

// ──────────────────────────────────────────────
// S1 — Pirámide poblacional
// ──────────────────────────────────────────────
interface DataProps {
  data: Record<string, number>;
}

export function S1PyramidChart({ data }: DataProps) {
  // Hombres como valores negativos (apuntan a la izquierda)
  const chartData = RANGOS.map((r) => ({
    age: RANGOS_LABELS[r],
    hombres: -(data[`lista_${r}_hombres`] ?? 0),
    mujeres: data[`lista_${r}_mujeres`] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        data={chartData}
        layout="vertical"
        stackOffset="sign"
        margin={{ top: 8, right: 20, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={fmtK}
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          type="category"
          dataKey="age"
          width={44}
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
        />
        <Tooltip
          formatter={(v) => [FMT.format(Math.abs(Number(v))), ""]}
          labelFormatter={(label) => `Edad: ${label}`}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Legend
          formatter={(v) => (v === "hombres" ? "Hombres" : "Mujeres")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="hombres" fill="var(--color-blue-eske-60)" radius={[0, 3, 3, 0]} stackId="a" />
        <Bar dataKey="mujeres" fill="var(--color-red-eske-30)" radius={[3, 0, 0, 3]} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// S2 — LNE por grupos etarios × sexo
// ──────────────────────────────────────────────
export function S2AgeSexChart({ data }: DataProps) {
  const chartData = GRUPOS.map((g) => ({
    grupo: g.label,
    hombres: g.rangos.reduce((s, r) => s + (data[`lista_${r}_hombres`] ?? 0), 0),
    mujeres: g.rangos.reduce((s, r) => s + (data[`lista_${r}_mujeres`] ?? 0), 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
        <XAxis dataKey="grupo" tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }} />
        <YAxis
          tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
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

// ──────────────────────────────────────────────
// S4 — Participación por sexo (Padrón vs LNE)
// ──────────────────────────────────────────────
export function S4ParticipacionChart({ data }: DataProps) {
  const chartData = [
    {
      sexo: "Hombres",
      padron: data.padron_hombres ?? 0,
      lista: data.lista_hombres ?? 0,
    },
    {
      sexo: "Mujeres",
      padron: data.padron_mujeres ?? 0,
      lista: data.lista_mujeres ?? 0,
    },
    {
      sexo: "No Binario",
      padron: data.padron_no_binario ?? 0,
      lista: data.lista_no_binario ?? 0,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
        <XAxis dataKey="sexo" tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }} />
        <YAxis
          tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
          width={60}
        />
        <Tooltip
          formatter={(v, n) => [FMT.format(Number(v)), n === "padron" ? "Padrón Electoral" : "Lista Nominal"]}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Legend
          formatter={(v) => (v === "padron" ? "Padrón Electoral" : "Lista Nominal")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="padron" fill="var(--color-bluegreen-eske-40)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="lista" fill="var(--color-blue-eske)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
