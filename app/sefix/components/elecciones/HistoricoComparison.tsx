"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ResultadosChartData } from "@/types/sefix.types";

const FMT_PCT = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

interface HistoricoComparisonProps {
  data: ResultadosChartData[];
}

export default function HistoricoComparison({ data }: HistoricoComparisonProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    anio: d.anio,
    participacion: d.participacion,
    totalVotos: d.totalVotos,
  }));

  const avg =
    chartData.reduce((s, d) => s + d.participacion, 0) / chartData.length;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 20, left: 8, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-gray-eske-20)"
        />
        <XAxis
          dataKey="anio"
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          tickFormatter={(v) => `${FMT_PCT.format(v)}%`}
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
          domain={["auto", "auto"]}
        />
        <Tooltip
          formatter={(value) => [
            `${FMT_PCT.format(Number(value))}%`,
            "Participación",
          ]}
          contentStyle={{
            fontSize: 12,
            borderRadius: 6,
            borderColor: "var(--color-gray-eske-20)",
          }}
        />
        <ReferenceLine
          y={avg}
          stroke="var(--color-orange-eske)"
          strokeDasharray="4 3"
          label={{
            value: `Prom. ${FMT_PCT.format(avg)}%`,
            position: "insideTopRight",
            fontSize: 10,
            fill: "var(--color-orange-eske)",
          }}
        />
        <Line
          type="monotone"
          dataKey="participacion"
          stroke="var(--color-blue-eske)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-blue-eske)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
