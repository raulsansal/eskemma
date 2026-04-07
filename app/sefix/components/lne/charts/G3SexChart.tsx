"use client";

import { useState } from "react";
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
import type { G3SexPoint } from "@/lib/sefix/seriesUtils";

const FMT = new Intl.NumberFormat("es-MX");
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : FMT.format(v);

// Colores fidelizados al Shiny original
const COLOR_MUJERES_PADRON = "#C0306A";   // rosa fuerte, sólido
const COLOR_MUJERES_LISTA  = "#8B1A3D";   // rosa oscuro, punteado
const COLOR_HOMBRES_PADRON = "#003F8A";   // azul, sólido
const COLOR_HOMBRES_LISTA  = "#001A5E";   // azul oscuro, punteado

const LEGEND_LABELS: Record<string, string> = {
  padronMujeres: "Padrón Mujeres",
  listaMujeres:  "Lista Mujeres",
  padronHombres: "Padrón Hombres",
  listaHombres:  "Lista Hombres",
};

interface Props {
  data: G3SexPoint[];
  nbLatest?: { padron: number; lista: number } | null;
}

export default function G3SexChart({ data, nbLatest }: Props) {
  const latestYear = data[data.length - 1]?.year;
  const [nbHovered, setNbHovered] = useState(false);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={320}>
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
              const pad = (dataMax - dataMin) * 0.1;
              return [Math.round(dataMin - pad), Math.round(dataMax + pad * 0.3)] as [number, number];
            }}
          />
          {/* z-index alto para que el tooltip quede sobre la card NB */}
          <Tooltip
            formatter={(value, name) => [
              FMT.format(Number(value)),
              LEGEND_LABELS[String(name)] ?? String(name),
            ]}
            itemSorter={(item) => -(item.value as number)}
            contentStyle={{
              fontSize: 12,
              borderColor: "var(--color-gray-eske-20)",
              borderRadius: 6,
            }}
            wrapperStyle={{ zIndex: 30 }}
          />
          <Legend
            formatter={(v) => LEGEND_LABELS[v] ?? v}
            wrapperStyle={{ fontSize: 12 }}
          />

          {/* Mujeres */}
          <Line
            type="linear"
            dataKey="padronMujeres"
            stroke={COLOR_MUJERES_PADRON}
            strokeWidth={2}
            dot={{ r: 3, fill: COLOR_MUJERES_PADRON }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="linear"
            dataKey="listaMujeres"
            stroke={COLOR_MUJERES_LISTA}
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* Hombres */}
          <Line
            type="linear"
            dataKey="padronHombres"
            stroke={COLOR_HOMBRES_PADRON}
            strokeWidth={2}
            dot={{ r: 3, fill: COLOR_HOMBRES_PADRON }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="linear"
            dataKey="listaHombres"
            stroke={COLOR_HOMBRES_LISTA}
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Card No Binario — z-index bajo para que el tooltip Recharts quede encima */}
      {nbLatest && (
        <div
          className="absolute top-2 left-16"
          style={{ zIndex: 10 }}
          onMouseEnter={() => setNbHovered(true)}
          onMouseLeave={() => setNbHovered(false)}
        >
          {/* Card principal */}
          <div
            className="bg-white-eske border border-purple-300 rounded-md px-3 py-2 text-xs shadow-sm cursor-default"
            aria-label="Datos No Binario"
          >
            <p className="font-semibold text-purple-700 mb-0.5">⚧ No Binario</p>
            {latestYear && (
              <p className="text-black-eske-60 font-medium">{latestYear}</p>
            )}
            <p className="text-black-eske-60">
              Padrón Nacional:{" "}
              <span className="font-medium text-black-eske">{FMT.format(nbLatest.padron)}</span>
            </p>
            <p className="text-black-eske-60">
              Lista Nacional:{" "}
              <span className="font-medium text-black-eske">{FMT.format(nbLatest.lista)}</span>
            </p>
            <p className="text-black-eske-40 mt-1 italic">(Ver desglose)</p>
          </div>

          {/* Popover de detalle al hacer hover */}
          {nbHovered && (
            <div
              className="absolute top-full left-0 mt-1 w-56 bg-white-eske border border-gray-eske-20 rounded-md shadow-lg p-3 text-xs"
              style={{ zIndex: 40 }}
            >
              <p className="font-semibold text-black-eske mb-2 border-b border-gray-eske-20 pb-1">
                Desglose anual — Nacional
              </p>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-black-eske-60">
                    <th className="pr-2 font-medium pb-1">Año</th>
                    <th className="pr-2 font-medium pb-1">Padrón</th>
                    <th className="font-medium pb-1">Lista</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pr-2 text-black-eske-60">{latestYear ?? "—"}</td>
                    <td className="pr-2 text-black-eske">{FMT.format(nbLatest.padron)}</td>
                    <td className="text-black-eske">{FMT.format(nbLatest.lista)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-black-eske-40 mt-2 italic leading-relaxed">
                Datos del último corte semanal disponible.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
