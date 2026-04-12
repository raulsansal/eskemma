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
import type { Ambito, G3SexPoint } from "@/lib/sefix/seriesUtils";

const FMT = new Intl.NumberFormat("es-MX");
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : FMT.format(v);

// Colores fidelizados al Shiny original — Nacional
const COLORS_NACIONAL = {
  padronMujeres: "#C0306A",
  listaMujeres: "#8B1A3D",
  padronHombres: "#003F8A",
  listaHombres: "#001A5E",
};
// Colores fidelizados al Shiny original — Extranjero
const COLORS_EXTRANJERO = {
  padronMujeres: "#7206b4ff",
  listaMujeres: "#7f24f7ff",
  padronHombres: "#0163a4ff",
  listaHombres: "#1d7fe9ff",
};

const LEGEND_LABELS: Record<string, string> = {
  padronMujeres: "Padrón Mujeres",
  listaMujeres: "Lista Mujeres",
  padronHombres: "Padrón Hombres",
  listaHombres: "Lista Hombres",
};

interface Props {
  data: G3SexPoint[];
  ambito?: Ambito;
  /** Dato NB del último corte semanal — fallback si historico no tiene NB */
  nbLatest?: { padron: number; lista: number } | null;
  /** Etiqueta de alcance para la card NB (ej. "JALISCO", "COLOTLAN", "Nacional") */
  nbScope?: string;
}

export default function G3SexChart({ data, ambito = "nacional", nbLatest, nbScope = "Nacional" }: Props) {
  const C = ambito === "extranjero" ? COLORS_EXTRANJERO : COLORS_NACIONAL;
  const latest = data[data.length - 1];
  const latestYear = latest?.year;
  // Card visible si hay dato histórico NB O semanal NB
  const nbAnnual = data.filter((d) => d.padronNoBinario > 0);
  const hasNb = nbAnnual.length > 0 || (nbLatest != null && nbLatest.padron > 0);
  // Prefer historico NB (más confiable: mismo corte que la serie); semanal como fallback
  const latestHistoricoNb = latest?.padronNoBinario > 0
    ? { padron: latest.padronNoBinario, lista: latest.listaNoBinario }
    : null;
  const nbDisplay = latestHistoricoNb ?? nbLatest ?? null;
  const [nbHovered, setNbHovered] = useState(false);

  // Tabla de desglose: combina datos históricos anuales con el dato semanal del año más reciente.
  // Si el año más reciente no tiene NB en la serie histórica pero sí en el semanal, lo incluye.
  const nbTableRows = (() => {
    const rows: { year: number; padron: number; lista: number }[] = nbAnnual.map((d) => ({
      year: d.year,
      padron: d.padronNoBinario,
      lista: d.listaNoBinario,
    }));
    if (nbLatest && nbLatest.padron > 0 && latestYear) {
      const alreadyCovered = rows.some((r) => r.year === latestYear);
      if (!alreadyCovered) {
        rows.push({ year: latestYear, padron: nbLatest.padron, lista: nbLatest.lista });
      }
    }
    return rows.sort((a, b) => b.year - a.year);
  })();

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
            stroke={C.padronMujeres}
            strokeWidth={2}
            dot={{ r: 3, fill: C.padronMujeres }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="linear"
            dataKey="listaMujeres"
            stroke={C.listaMujeres}
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* Hombres */}
          <Line
            type="linear"
            dataKey="padronHombres"
            stroke={C.padronHombres}
            strokeWidth={2}
            dot={{ r: 3, fill: C.padronHombres }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="linear"
            dataKey="listaHombres"
            stroke={C.listaHombres}
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Card No Binario — z-index bajo para que el tooltip Recharts quede encima */}
      {hasNb && nbDisplay && (
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
              Padrón:{" "}
              <span className="font-medium text-black-eske">{FMT.format(nbDisplay.padron)}</span>
            </p>
            <p className="text-black-eske-60">
              Lista:{" "}
              <span className="font-medium text-black-eske">{FMT.format(nbDisplay.lista)}</span>
            </p>
            {nbTableRows.length > 0 && (
              <p className="text-black-eske-40 mt-1 italic">(Ver desglose)</p>
            )}
          </div>

          {/* Popover de detalle — muestra evolución anual cuando hay datos históricos */}
          {nbHovered && nbTableRows.length > 0 && (
            <div
              className="absolute top-full left-0 mt-1 w-56 bg-white-eske border border-gray-eske-20 rounded-md shadow-lg p-3 text-xs"
              style={{ zIndex: 40 }}
            >
              <p className="font-semibold text-black-eske mb-2 border-b border-gray-eske-20 pb-1">
                No Binario — {nbScope}
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
                  {nbTableRows.map((r) => (
                    <tr key={r.year}>
                      <td className="pr-2 text-black-eske-60">{r.year}</td>
                      <td className="pr-2 text-black-eske">{FMT.format(r.padron)}</td>
                      <td className="text-black-eske">{FMT.format(r.lista)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-black-eske-40 mt-2 italic leading-relaxed">
                Último corte de cada año disponible.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
