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

const FMT = new Intl.NumberFormat("es-MX");
const FMT_PCT = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

interface PartidosBarChartProps {
  data: ResultadosChartData;
}

export default function PartidosBarChart({ data }: PartidosBarChartProps) {
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
          stroke="var(--color-gray-eske-20)"
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
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={50}
          tick={{ fontSize: 11, fill: "var(--color-black-eske)" }}
        />
        <Tooltip
          formatter={(value, name) => [
            `${FMT.format(Number(value))} votos (${FMT_PCT.format(
              chartData.find((d) => d.name === String(name))?.porcentaje ?? 0
            )}%)`,
            String(name),
          ]}
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
              fill={PARTY_COLORS[entry.name] ?? PARTY_COLORS.DEFAULT}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
