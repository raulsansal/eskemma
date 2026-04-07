"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { G3Point } from "@/lib/sefix/seriesUtils";

const FMT = new Intl.NumberFormat("es-MX");
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : FMT.format(v);

// Colores del design system Eskemma para distinguir años
const YEAR_COLORS = [
  "var(--color-bluegreen-eske)",
  "var(--color-blue-eske)",
  "var(--color-orange-eske)",
  "var(--color-green-eske)",
  "var(--color-yellow-eske-70)",
  "var(--color-red-eske)",
  "var(--color-bluegreen-eske-40)",
  "var(--color-blue-eske-60)",
  "var(--color-orange-eske-60)",
];

interface Props {
  data: G3Point[];
  years: number[];
}

export default function G3MultiYearChart({ data, years }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          tickFormatter={fmtM}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
          width={60}
        />
        <Tooltip
          formatter={(value, name) => [FMT.format(Number(value)), String(name)]}
          contentStyle={{
            fontSize: 12,
            borderColor: "var(--color-gray-eske-20)",
            borderRadius: 6,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {years.map((year, i) => (
          <Line
            key={year}
            type="monotone"
            dataKey={String(year)}
            stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
