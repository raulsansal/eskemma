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
import type { Ambito, G2Point } from "@/lib/sefix/seriesUtils";
import { useDarkMode } from "@/app/hooks/useDarkMode";

const FMT = new Intl.NumberFormat("es-MX");
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : FMT.format(v);

const COLORS_NACIONAL = {
  padron: { light: "#00304A", dark: "#4791B3" },
  lista:  { light: "#8B0000", dark: "#D16B6B" },
  padronLabel: "Padrón Nacional",
  listaLabel:  "Lista Nacional",
};
const COLORS_EXTRANJERO = {
  padron: { light: "#7206b4", dark: "#B05DD6" },
  lista:  { light: "#0163a4", dark: "#4791B3" },
  padronLabel: "Padrón Extranjero",
  listaLabel:  "Lista Extranjero",
};

interface Props {
  data: G2Point[];
  ambito?: Ambito;
}

export default function G2BarChart({ data, ambito = "nacional" }: Props) {
  const isDark = useDarkMode();
  const palette = ambito === "extranjero" ? COLORS_EXTRANJERO : COLORS_NACIONAL;
  const padronColor = isDark ? palette.padron.dark : palette.padron.light;
  const listaColor  = isDark ? palette.lista.dark  : palette.lista.light;

  const gridStroke = isDark ? "rgba(255,255,255,0.07)" : "var(--color-gray-eske-20)";
  const tickFill   = isDark ? "#C7D6E0" : "var(--color-black-eske-10)";

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: tickFill }}
        />
        <YAxis
          tickFormatter={fmtM}
          tick={{ fontSize: 11, fill: tickFill }}
          width={56}
          domain={([dataMin, dataMax]: readonly [number, number]) => {
            const pad = (dataMax - dataMin) * 0.12;
            return [Math.round(dataMin - pad), Math.round(dataMax + pad * 0.3)] as [number, number];
          }}
        />
        <Tooltip
          formatter={(value, name) => [
            FMT.format(Number(value)),
            name === "padron" ? palette.padronLabel : palette.listaLabel,
          ]}
          itemSorter={(item) => -(item.value as number)}
          labelStyle={{ color: "#2b2b2b" }}
          contentStyle={{
            fontSize: 12,
            borderColor: "var(--color-gray-eske-20)",
            borderRadius: 6,
          }}
        />
        <Legend
          formatter={(v) => (v === "padron" ? palette.padronLabel : palette.listaLabel)}
          wrapperStyle={{ fontSize: 12, color: isDark ? "#4791B3" : undefined }}
        />
        <Line
          type="linear"
          dataKey="padron"
          stroke={padronColor}
          strokeWidth={2}
          dot={{ r: 4, fill: padronColor }}
          activeDot={{ r: 5 }}
          name="padron"
        />
        <Line
          type="linear"
          dataKey="lista"
          stroke={listaColor}
          strokeWidth={2}
          dot={{ r: 4, fill: listaColor }}
          activeDot={{ r: 5 }}
          name="lista"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
