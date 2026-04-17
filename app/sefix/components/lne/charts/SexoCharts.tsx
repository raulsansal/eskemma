"use client";

/**
 * Gráficas S1-S4 — Desglose Sexo (Vista Semanal)
 *
 * S1: Pirámide poblacional (hombres izquierda / mujeres derecha por rango etario)
 * S2: LNE por grupos etarios × sexo (barras agrupadas)
 * S3: Proyección H vs M (con proyección separada real/punteada)
 * S4: Participación por sexo (barras H / M / NB)
 */

import { useState, Fragment } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import type { SemanalSerieRow } from "@/app/sefix/hooks/useLneSemanalesSerie";
import type { Ambito } from "@/lib/sefix/seriesUtils";
import { computeSemanalesProyeccion } from "@/lib/sefix/semanalUtils";

const FMT = new Intl.NumberFormat("es-MX");
const fmtK = (v: number) =>
  Math.abs(v) >= 1_000_000
    ? `${(Math.abs(v) / 1_000_000).toFixed(1)}M`
    : FMT.format(Math.abs(v));

const RANGOS = [
  "18", "19", "20_24", "25_29", "30_34", "35_39",
  "40_44", "45_49", "50_54", "55_59", "60_64", "65_y_mas",
];
const RANGOS_LABELS: Record<string, string> = {
  "18": "18", "19": "19", "20_24": "20-24", "25_29": "25-29",
  "30_34": "30-34", "35_39": "35-39", "40_44": "40-44", "45_49": "45-49",
  "50_54": "50-54", "55_59": "55-59", "60_64": "60-64", "65_y_mas": "65+",
};

const GRUPOS = [
  { id: "jovenes", label: "Jóvenes", rangos: ["18", "19", "20_24", "25_29"] },
  { id: "adultos", label: "Adultos", rangos: ["30_34", "35_39", "40_44", "45_49", "50_54", "55_59"] },
  { id: "mayores", label: "Mayores", rangos: ["60_64", "65_y_mas"] },
];

// ──────────────────────────────────────────────
// S1 — Pirámide poblacional
// ──────────────────────────────────────────────
interface DataAmbitoProps {
  data: Record<string, number>;
  ambito?: Ambito;
}

export function S1PyramidChart({ data, ambito = "nacional" }: DataAmbitoProps) {
  const colH = ambito === "extranjero" ? "#0163a4" : "var(--color-blue-eske-60)";
  const colM = ambito === "extranjero" ? "#7206b4" : "var(--color-red-eske-30)";

  const chartData = RANGOS.map((r) => ({
    age: RANGOS_LABELS[r],
    hombres: -(data[`lista_${r}_hombres`] ?? 0),
    mujeres: data[`lista_${r}_mujeres`] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        data={chartData}
        layout="vertical"
        stackOffset="sign"
        margin={{ top: 8, right: 20, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={fmtK}
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
        />
        <YAxis
          type="category"
          dataKey="age"
          width={44}
          tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
        />
        <Tooltip
          formatter={(v) => [FMT.format(Math.abs(Number(v))), ""]}
          labelFormatter={(label) => `Edad: ${label}`}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Legend
          formatter={(v) => (v === "hombres" ? "Hombres" : "Mujeres")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="hombres" fill={colH} radius={[0, 3, 3, 0]} stackId="a" />
        <Bar dataKey="mujeres" fill={colM} radius={[3, 0, 0, 3]} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// S2 — LNE por grupos etarios × sexo
// ──────────────────────────────────────────────
export function S2AgeSexChart({ data, ambito = "nacional" }: DataAmbitoProps) {
  const colH = ambito === "extranjero" ? "#0163a4" : "var(--color-blue-eske-60)";
  const colM = ambito === "extranjero" ? "#7206b4" : "var(--color-red-eske-30)";

  const chartData = GRUPOS.map((g) => ({
    grupo: g.label,
    hombres: g.rangos.reduce((s, r) => s + (data[`lista_${r}_hombres`] ?? 0), 0),
    mujeres: g.rangos.reduce((s, r) => s + (data[`lista_${r}_mujeres`] ?? 0), 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
        <XAxis dataKey="grupo" tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }} />
        <YAxis
          tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
          width={60}
        />
        <Tooltip
          formatter={(v, n) => [FMT.format(Number(v)), n === "hombres" ? "Hombres" : "Mujeres"]}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="hombres" fill={colH} radius={[3, 3, 0, 0]} />
        <Bar dataKey="mujeres" fill={colM} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// S3 — Serie temporal por sexo (con proyección)
// ──────────────────────────────────────────────
interface S3Props {
  serie: SemanalSerieRow[];
  ambito: Ambito;
  dataSexo: Record<string, number>;
}

function getSexosS3(ambito: Ambito) {
  const isExt = ambito === "extranjero";
  return [
    {
      key: "hombres",
      label: "Hombres",
      colorPad: isExt ? "#0163a4" : "#003F8A",
      colorLne: isExt ? "#2480d4" : "#001A5E",
    },
    {
      key: "mujeres",
      label: "Mujeres",
      colorPad: isExt ? "#7206b4" : "#C0306A",
      colorLne: isExt ? "#8b2bd6" : "#8B1A3D",
    },
  ] as const;
}

function fmtFechaSexo(iso: string): string {
  const [, m, d] = iso.split("-");
  const meses = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10)]}`;
}

export function S3SexoSerieChart({ serie, ambito, dataSexo }: S3Props) {
  const SEXOS_S3 = getSexosS3(ambito);
  const [activos, setActivos] = useState<Set<string>>(new Set(["hombres", "mujeres"]));

  const nbPadron = (dataSexo["padron_no_binario"] as number) ?? 0;
  const nbLista  = (dataSexo["lista_no_binario"]  as number) ?? 0;
  const FMT_NB = new Intl.NumberFormat("es-MX");

  function toggle(key: string) {
    setActivos((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  }

  if (serie.length < 2) {
    return (
      <p className="text-sm text-black-eske-60 text-center py-6">
        Sin datos de serie temporal suficientes para proyección.
      </p>
    );
  }

  // Construir datos del chart con proyección separada por clave
  const sexosAct = SEXOS_S3.filter(({ key }) => activos.has(key));
  const proyMap = new Map<string, ReturnType<typeof computeSemanalesProyeccion>>();
  for (const { key } of sexosAct) {
    proyMap.set(key, computeSemanalesProyeccion(serie, `padron_${key}`, `lista_${key}`));
  }

  const pRef = proyMap.get(sexosAct[0]?.key ?? "hombres") ?? [];
  const chartData = pRef.map((p, idx) => {
    const point: Record<string, number | string | undefined> = {
      label: fmtFechaSexo(p.fecha),
    };
    for (const { key } of sexosAct) {
      const proy = proyMap.get(key)!;
      const pt = proy[idx];
      if (!pt) continue;
      if (!pt.proyectado) {
        point[`pad_${key}`] = pt.padron;
        point[`lne_${key}`] = pt.lista;
      } else {
        point[`padProy_${key}`] = pt.padron;
        point[`lneProy_${key}`] = pt.lista;
      }
    }
    return point;
  });

  const fmtM = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : FMT.format(v);

  const allNumeric = chartData.flatMap((p) =>
    Object.values(p).filter((v): v is number => typeof v === "number" && v > 0)
  );
  const yMin = allNumeric.length > 0 ? Math.floor(Math.min(...allNumeric) * 0.97) : 0;

  return (
    <div className="relative">
      {/* Card NB flotante */}
      {(nbPadron > 0 || nbLista > 0) && (
        <div className="absolute top-0 left-0 z-10 bg-white-eske border border-gray-eske-20 rounded-lg shadow-sm px-3 py-2 text-xs">
          <p className="font-semibold text-black-eske-60 mb-1">No Binario</p>
          <p className="text-black-eske">Padrón: <strong>{FMT_NB.format(nbPadron)}</strong></p>
          <p className="text-black-eske">LNE: <strong>{FMT_NB.format(nbLista)}</strong></p>
        </div>
      )}

      {/* Widget checkboxes */}
      <div className="mb-4 rounded-lg border border-gray-eske-20 bg-gray-eske-10 p-3">
        <div className="flex items-center gap-4">
          <p className="text-[11px] font-semibold text-black-eske-60">Mostrar:</p>
          {SEXOS_S3.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-1 cursor-pointer text-xs text-black-eske-80">
              <input
                type="checkbox"
                checked={activos.has(key)}
                onChange={() => toggle(key)}
                className="accent-blue-eske"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--color-black-eske-10)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={fmtM}
            tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
            width={64}
            domain={[yMin, "auto"]}
          />
          <Tooltip
            formatter={(v, name) => [FMT.format(Number(v)), String(name)]}
            itemSorter={(item) => -(item.value as number)}
            contentStyle={{ fontSize: 11, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />

          {sexosAct.map(({ key, label, colorPad, colorLne }) => (
            <Fragment key={key}>
              <Line dataKey={`pad_${key}`}     name={`Padrón ${label}`}         stroke={colorPad} strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line dataKey={`lne_${key}`}     name={`LNE ${label}`}            stroke={colorLne} strokeWidth={2.5} dot={false} connectNulls={false} />
              <Line dataKey={`padProy_${key}`} name={`Proy. Padrón ${label}`}   stroke={colorPad} strokeWidth={2}   strokeDasharray="6 3" strokeOpacity={0.7} dot={false} connectNulls={false} />
              <Line dataKey={`lneProy_${key}`} name={`Proy. LNE ${label}`}      stroke={colorLne} strokeWidth={2}   strokeDasharray="6 3" strokeOpacity={0.7} dot={false} connectNulls={false} />
            </Fragment>
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-black-eske-60 text-center mt-1">
        Líneas punteadas = proyección estimada hasta diciembre.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────
// S4 — Participación por sexo (Padrón vs LNE)
// ──────────────────────────────────────────────
export function S4ParticipacionChart({ data, ambito = "nacional" }: DataAmbitoProps) {
  const colPad = ambito === "extranjero" ? "#7206b4" : "var(--color-bluegreen-eske-40)";
  const colLne = ambito === "extranjero" ? "#0163a4" : "var(--color-blue-eske)";

  const chartData = [
    {
      sexo: "Hombres",
      padron: data.padron_hombres ?? 0,
      lista: data.lista_hombres ?? 0,
    },
    {
      sexo: "Mujeres",
      padron: data.padron_mujeres ?? 0,
      lista: data.lista_mujeres ?? 0,
    },
    {
      sexo: "No Binario",
      padron: data.padron_no_binario ?? 0,
      lista: data.lista_no_binario ?? 0,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-eske-20)" />
        <XAxis dataKey="sexo" tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }} />
        <YAxis
          tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
          tick={{ fontSize: 11, fill: "var(--color-black-eske-10)" }}
          width={60}
        />
        <Tooltip
          formatter={(v, n) => [FMT.format(Number(v)), n === "padron" ? "Padrón Electoral" : "Lista Nominal"]}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "var(--color-gray-eske-20)" }}
        />
        <Legend
          formatter={(v) => (v === "padron" ? "Padrón Electoral" : "Lista Nominal")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="padron" fill={colPad} radius={[3, 3, 0, 0]} />
        <Bar dataKey="lista"  fill={colLne} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
