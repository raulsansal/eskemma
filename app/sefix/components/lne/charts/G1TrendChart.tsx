"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { G1Data } from "@/lib/sefix/seriesUtils";

const FMT = new Intl.NumberFormat("es-MX");
const fmt = (v: number) => FMT.format(v);
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : FMT.format(v);

const MESES_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

interface Props {
  data: G1Data;
}


export default function G1TrendChart({ data }: Props) {
  const { actual, projected } = data;

  // Mes actual para la línea de referencia "Hoy"
  const now = new Date();
  const mesHoyLabel = `${MESES_ES[now.getMonth()]} ${now.getFullYear()}`;

  // Dataset: datos reales + proyecciones sin repetir el último punto real.
  // La línea proyectada empieza en el mes siguiente al último dato real.
  const merged: Record<string, string | number>[] = [];

  for (const p of actual) {
    merged.push({ name: p.label, lista: p.lista, padron: p.padron });
  }

  for (const p of projected) {
    merged.push({
      name: p.label,
      listaProyectada: p.lista,
      padronProyectado: p.padron,
    });
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          tickFormatter={fmtM}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
          width={56}
          domain={([dataMin, dataMax]: readonly [number, number]) => {
            const pad = (dataMax - dataMin) * 0.15;
            return [Math.round(dataMin - pad), Math.round(dataMax + pad * 0.3)] as [number, number];
          }}
        />
        <Tooltip
          content={({ payload, label }) => {
            if (!payload?.length) return null;
            // Filtrar series sin valor en este punto y ordenar mayor → menor
            const items = payload
              .filter((p) => p.value != null && Number(p.value) > 0)
              .sort((a, b) => Number(b.value) - Number(a.value));
            if (!items.length) return null;
            return (
              <div style={{
                fontSize: 12, background: "#fff", border: "1px solid var(--color-gray-eske-20)",
                borderRadius: 6, padding: "8px 12px",
              }}>
                <p style={{ fontSize: 11, color: "var(--color-black-eske-60)", marginBottom: 4 }}>
                  {label}
                </p>
                {items.map((p) => (
                  <p key={String(p.dataKey)} style={{ color: p.color, margin: "2px 0" }}>
                    {String(p.name)}: <strong>{fmt(Number(p.value))}</strong>
                  </p>
                ))}
              </div>
            );
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />

        {/* Línea vertical: mes actual */}
        <ReferenceLine
          x={mesHoyLabel}
          stroke="var(--color-black-eske-40)"
          strokeDasharray="4 2"
          label={{ value: "Hoy", position: "top", fontSize: 10, fill: "var(--color-black-eske-60)" }}
        />

        {/* Datos reales */}
        <Line
          type="linear"
          dataKey="padron"
          name="Padrón Nacional"
          stroke="#00304A"
          strokeWidth={2}
          dot={{ r: 3, fill: "#00304A" }}
          activeDot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="linear"
          dataKey="lista"
          name="Lista Nacional"
          stroke="#8B0000"
          strokeWidth={2}
          dot={{ r: 3, fill: "#8B0000" }}
          activeDot={{ r: 4 }}
          connectNulls
        />

        {/* Proyecciones (punteadas) */}
        <Line
          type="linear"
          dataKey="padronProyectado"
          name="Proyección Padrón"
          stroke="#00304A"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
          connectNulls
        />
        <Line
          type="linear"
          dataKey="listaProyectada"
          name="Proyección Lista"
          stroke="#8B0000"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
