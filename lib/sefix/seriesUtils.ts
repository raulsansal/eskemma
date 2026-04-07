// lib/sefix/seriesUtils.ts
// Funciones puras para transformar series históricas del Padrón Electoral.
// Sin dependencias de React ni de Firebase — 100% testeables en aislamiento.

import type { HistoricoMes } from "./storage";

// ============================================================
// TIPOS DE SALIDA
// ============================================================

export type Ambito = "nacional" | "extranjero";

export interface MesPoint {
  /** "Ene 2024" */
  label: string;
  month: number;
  year: number;
  padron: number;
  lista: number;
  hombres: number;
  mujeres: number;
}

export interface G1Data {
  actual: MesPoint[];
  /** Puntos proyectados desde el último mes real hasta diciembre */
  projected: MesPoint[];
  currentYear: number;
  latestFecha: string;
}

export interface G2Point {
  year: number;
  padron: number;
  lista: number;
}

export interface G3Point {
  /** "Ene" (solo nombre del mes, sin año) */
  mes: string;
  monthIndex: number;
  [year: string]: number | string;
}

export interface G3SexPoint {
  year: number;
  padronHombres: number;
  padronMujeres: number;
  /** Estimado: listaNacional × (padronHombres / padronNacional) */
  listaHombres: number;
  /** Estimado: listaNacional × (padronMujeres / padronNacional) */
  listaMujeres: number;
}

export interface HistoricoTexts {
  titulo: string;
  alcance: string;
  resumen: string;
  evolucion: string;
  sexo: string;
}

// ============================================================
// HELPERS
// ============================================================

const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function mesLabel(month: number, year: number): string {
  return `${MESES[month - 1]} ${year}`;
}

function pick(m: HistoricoMes, ambito: Ambito): { padron: number; lista: number } {
  return ambito === "nacional"
    ? { padron: m.padronNacional, lista: m.listaNacional }
    : { padron: m.padronExtranjero, lista: m.listaExtranjero };
}

function fmt(n: number): string {
  return new Intl.NumberFormat("es-MX").format(n);
}

function pct(a: number, b: number): string {
  if (b === 0) return "0.0";
  return (((a - b) / b) * 100).toFixed(1);
}

// ============================================================
// PROYECCIÓN (tasa de crecimiento promedio mensual)
// ============================================================

export function computeProjection(
  actual: MesPoint[],
  targetMonth = 12
): MesPoint[] {
  if (actual.length < 2) return [];
  const last = actual[actual.length - 1];
  if (last.month >= targetMonth) return [];

  const deltas = actual
    .slice(1)
    .map((p, i) => p.lista - actual[i].lista);
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;

  const projected: MesPoint[] = [];
  for (let mo = last.month + 1; mo <= targetMonth; mo++) {
    const steps = mo - last.month;
    projected.push({
      label: mesLabel(mo, last.year),
      month: mo,
      year: last.year,
      padron: Math.round(last.padron + avgDelta * steps * (last.padron / last.lista)),
      lista: Math.round(last.lista + avgDelta * steps),
      hombres: 0,
      mujeres: 0,
    });
  }
  return projected;
}

// ============================================================
// G1 — Serie del año en curso + proyección
// ============================================================

export function computeG1Data(
  series: HistoricoMes[],
  year: number,
  ambito: Ambito
): G1Data {
  const yearData = series
    .filter((m) => m.year === year)
    .sort((a, b) => a.month - b.month);

  const actual: MesPoint[] = yearData.map((m) => ({
    label: mesLabel(m.month, m.year),
    month: m.month,
    year: m.year,
    ...pick(m, ambito),
    hombres: m.padronHombres,
    mujeres: m.padronMujeres,
  }));

  const projected = computeProjection(actual);
  const latestFecha = yearData[yearData.length - 1]?.fecha ?? "";

  return { actual, projected, currentYear: year, latestFecha };
}

// ============================================================
// G2 — Un punto por año (último mes disponible)
// ============================================================

export function computeG2Data(
  series: HistoricoMes[],
  ambito: Ambito
): G2Point[] {
  const byYear = new Map<number, HistoricoMes>();
  for (const m of series) {
    const existing = byYear.get(m.year);
    if (!existing || m.month > existing.month) {
      byYear.set(m.year, m);
    }
  }
  return Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, m]) => ({ year, ...pick(m, ambito) }));
}

// ============================================================
// G3 — Todos los meses de todos los años (para comparación)
// ============================================================

export function computeG3Data(
  series: HistoricoMes[],
  ambito: Ambito,
  years?: number[]
): G3Point[] {
  const availableYears = years ?? [...new Set(series.map((m) => m.year))].sort();

  // Pivot: un objeto por mes (1-12), con una propiedad por año
  const byMonth = new Map<number, G3Point>();
  for (let i = 1; i <= 12; i++) {
    byMonth.set(i, { mes: MESES[i - 1], monthIndex: i });
  }

  for (const m of series) {
    if (!availableYears.includes(m.year)) continue;
    const point = byMonth.get(m.month);
    if (point) {
      const { lista } = pick(m, ambito);
      point[String(m.year)] = lista;
    }
  }

  return Array.from(byMonth.values());
}

// ============================================================
// G3 SEX — Un punto por año, desglosado por sexo (H/M)
// ============================================================

export function computeG3SexData(series: HistoricoMes[]): G3SexPoint[] {
  // Igual que computeG2Data: el último mes disponible de cada año
  const byYear = new Map<number, HistoricoMes>();
  for (const m of series) {
    const existing = byYear.get(m.year);
    if (!existing || m.month > existing.month) byYear.set(m.year, m);
  }
  return Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, m]) => {
      const total = m.padronNacional;
      const ratioH = total > 0 ? m.padronHombres / total : 0.5;
      const ratioM = total > 0 ? m.padronMujeres / total : 0.5;
      return {
        year,
        padronHombres: m.padronHombres,
        padronMujeres: m.padronMujeres,
        listaHombres: Math.round(m.listaNacional * ratioH),
        listaMujeres: Math.round(m.listaNacional * ratioM),
      };
    });
}

// ============================================================
// TEXTS — 5 bloques de análisis dinámico (Vista Histórica)
// ============================================================

export function generateHistoricoTexts(
  series: HistoricoMes[],
  year: number,
  ambito: Ambito
): HistoricoTexts {
  const yearData = series
    .filter((m) => m.year === year)
    .sort((a, b) => a.month - b.month);

  const allData = series.sort((a, b) => a.fecha.localeCompare(b.fecha));

  const titulo =
    ambito === "nacional"
      ? `Análisis del Padrón Electoral y Lista Nominal — ${year}`
      : `Análisis de Residentes en el Extranjero — ${year}`;

  const alcance =
    ambito === "nacional" ? "Datos nacionales" : "Datos de Residentes en el Extranjero";

  // Bloque 2: resumen del último mes
  let resumen = "";
  if (yearData.length > 0) {
    const ultimo = yearData[yearData.length - 1];
    const { padron, lista } = pick(ultimo, ambito);
    const mesNombre = MESES[ultimo.month - 1];
    const tasaInclusion = padron > 0 ? ((lista / padron) * 100).toFixed(1) : "0.0";
    resumen = `Al mes de ${mesNombre} de ${year}, el Padrón Electoral totaliza ${fmt(padron)} ciudadanos, de los cuales ${fmt(lista)} están incluidos en la Lista Nominal, representando una tasa de inclusión del ${tasaInclusion}%.`;
  }

  // Bloque 3: evolución general (primero vs último año disponible)
  let evolucion = "";
  if (allData.length >= 2) {
    const primero = allData[0];
    const ultimo = allData[allData.length - 1];
    const { padron: p0, lista: l0 } = pick(primero, ambito);
    const { padron: p1, lista: l1 } = pick(ultimo, ambito);
    const dirPadron = p1 >= p0 ? "Crecimiento" : "Reducción";
    const dirLista = l1 >= l0 ? "crecimiento" : "reducción";
    evolucion = `${dirPadron} del ${Math.abs(parseFloat(pct(p1, p0)))}% en el Padrón y ${dirLista} del ${Math.abs(parseFloat(pct(l1, l0)))}% en la Lista Nominal entre ${primero.fecha.slice(0, 7)} y ${ultimo.fecha.slice(0, 7)}.`;
  }

  // Bloque 4: predominio de sexo (evalúa TODOS los meses del año)
  let sexo = "";
  if (yearData.length > 0 && ambito === "nacional") {
    const totalH = yearData.reduce((s, m) => s + m.padronHombres, 0);
    const totalM = yearData.reduce((s, m) => s + m.padronMujeres, 0);
    const hDominates = yearData.filter((m) => m.padronHombres > m.padronMujeres).length;
    const constant = hDominates === yearData.length || hDominates === 0;
    const dominante = totalH >= totalM ? "hombres" : "mujeres";
    if (constant) {
      sexo = `Con presencia constante de ${dominante} a lo largo del período.`;
    } else {
      sexo = `Con mayor presencia de ${dominante} la mayor parte del período.`;
    }
  }

  return { titulo, alcance, resumen, evolucion, sexo };
}
