"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PARTY_COLORS } from "@/lib/sefix/constants";
import type { ResultadosChartData } from "@/types/sefix.types";
import { useDarkMode } from "@/app/hooks/useDarkMode";

const FMT = new Intl.NumberFormat("es-MX");
const FMT_PCT = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Versiones más claras de partidos con colores muy oscuros
const PARTY_COLORS_DARK: Record<string, string> = {
  PAN:    "#4791B3",
  MORENA: "#D16B6B",
  NA:     "#8B5CF6",
  FXM:    "#4ADE80",
};

interface PartidosBarChartProps {
  data: ResultadosChartData;
}

export default function PartidosBarChart({ data }: PartidosBarChartProps) {
  const isDark = useDarkMode();
  const gridStroke = isDark ? "rgba(255,255,255,0.07)" : "var(--color-gray-eske-20)";
  const tickFill   = isDark ? "#C7D6E0" : "var(--color-black-eske-10)";

  const partyFill = (name: string) =>
    isDark
      ? (PARTY_COLORS_DARK[name] ?? PARTY_COLORS[name] ?? PARTY_COLORS.DEFAULT)
      : (PARTY_COLORS[name] ?? PARTY_COLORS.DEFAULT);

  const chartData = data.partidos.map((p) => ({
    name: p.partido,
    votos: p.votos,
    porcentaje: p.porcentaje,
  }));

  const height = Math.max(280, chartData.length * 32 + 60);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 60, left: 52, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridStroke}
          horizontal={false}
        />
        <XAxis
          type="number"
          tickFormatter={(v) =>
            v >= 1_000_000
              ? `${(v / 1_000_000).toFixed(1)}M`
              : v >= 1_000
              ? `${(v / 1_000).toFixed(0)}k`
              : String(v)
          }
          tick={{ fontSize: 10, fill: tickFill }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={50}
          tick={{ fontSize: 11, fill: tickFill }}
        />
        <Tooltip
          formatter={(value, name) => [
            `${FMT.format(Number(value))} votos (${FMT_PCT.format(
              chartData.find((d) => d.name === String(name))?.porcentaje ?? 0
            )}%)`,
            String(name),
          ]}
          labelStyle={{ color: "#2b2b2b" }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 6,
            borderColor: "var(--color-gray-eske-20)",
          }}
        />
        <Bar dataKey="votos" radius={[0, 4, 4, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={partyFill(entry.name)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
