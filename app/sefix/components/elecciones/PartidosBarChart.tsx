"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { PARTY_COLORS, PARTY_COLORS_DARK, PARTIDO_LABELS } from "@/lib/sefix/eleccionesConstants";
import type { ResultadosEleccionesData } from "@/types/sefix.types";
import { useDarkMode } from "@/app/hooks/useDarkMode";

const FMT = new Intl.NumberFormat("es-MX");
const FMT_PCT = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});

interface Props {
  data: ResultadosEleccionesData;
}

export default function PartidosBarChart({ data }: Props) {
  const isDark = useDarkMode();
  const gridStroke = isDark ? "rgba(255,255,255,0.07)" : "var(--color-gray-eske-20)";
  const tickFill = isDark ? "#C7D6E0" : "var(--color-black-eske-10)";

  function getColor(partido: string) {
    return isDark
      ? (PARTY_COLORS_DARK[partido] ?? PARTY_COLORS[partido] ?? PARTY_COLORS.DEFAULT)
      : (PARTY_COLORS[partido] ?? PARTY_COLORS.DEFAULT);
  }

  const chartData = data.partidos.map((p) => ({
    key: p.partido,
    name: PARTIDO_LABELS[p.partido] ?? p.partido,
    votos: p.votos,
    porcentaje: p.porcentaje,
  }));

  // Ancho dinámico para etiquetas largas (coaliciones)
  const maxLabelLen = Math.max(...chartData.map((d) => d.name.length));
  const yAxisWidth = Math.max(60, Math.min(maxLabelLen * 6.5, 140));
  const height = Math.max(300, chartData.length * 28 + 60);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 72, left: 4, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
            : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k`
            : String(v)
          }
          tick={{ fontSize: 10, fill: tickFill }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={yAxisWidth}
          tick={{ fontSize: 10, fill: tickFill }}
        />
        <Tooltip
          formatter={(value, _name, props) => [
            `${FMT.format(Number(value))} votos (${FMT_PCT.format(props.payload?.porcentaje ?? 0)}%)`,
            props.payload?.name ?? "",
          ]}
          labelStyle={{ color: "#2b2b2b" }}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Bar dataKey="votos" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, fill: tickFill, formatter: (v: unknown) => `${FMT_PCT.format(chartData.find(d => d.votos === Number(v))?.porcentaje ?? 0)}%` }}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={getColor(entry.key)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
