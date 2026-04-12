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

const FMT = new Intl.NumberFormat("es-MX");
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : FMT.format(v);

const COLORS_NACIONAL = { padron: "#00304A", lista: "#8B0000", padronLabel: "Padrón Nacional", listaLabel: "Lista Nacional" };
const COLORS_EXTRANJERO = { padron: "#7206b4ff", lista: "#0163a4ff", padronLabel: "Padrón Extranjero", listaLabel: "Lista Extranjero" };

interface Props {
  data: G2Point[];
  ambito?: Ambito;
}

export default function G2BarChart({ data, ambito = "nacional" }: Props) {
  const C = ambito === "extranjero" ? COLORS_EXTRANJERO : COLORS_NACIONAL;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          tickFormatter={fmtM}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
          width={56}
          domain={([dataMin, dataMax]: readonly [number, number]) => {
            const pad = (dataMax - dataMin) * 0.12;
            return [Math.round(dataMin - pad), Math.round(dataMax + pad * 0.3)] as [number, number];
          }}
        />
        <Tooltip
          formatter={(value, name) => [
            FMT.format(Number(value)),
            name === "padron" ? C.padronLabel : C.listaLabel,
          ]}
          itemSorter={(item) => -(item.value as number)}
          contentStyle={{
            fontSize: 12,
            borderColor: "var(--color-gray-eske-20)",
            borderRadius: 6,
          }}
        />
        <Legend
          formatter={(v) => (v === "padron" ? C.padronLabel : C.listaLabel)}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Line
          type="linear"
          dataKey="padron"
          stroke={C.padron}
          strokeWidth={2}
          dot={{ r: 4, fill: C.padron }}
          activeDot={{ r: 5 }}
          name="padron"
        />
        <Line
          type="linear"
          dataKey="lista"
          stroke={C.lista}
          strokeWidth={2}
          dot={{ r: 4, fill: C.lista }}
          activeDot={{ r: 5 }}
          name="lista"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
