// lib/sefix/eleccionesTextUtils.ts
// Funciones puras de generación de texto dinámico para Elecciones Federales.
// Equivalente a elecciones_federales_server_text_analysis.R (versión R Shiny).
import { ResultadosEleccionesData, EleccionesFilterParams } from "@/types/sefix.types";
import { CARGO_DISPLAY_LABELS } from "@/lib/sefix/eleccionesConstants";

function fmtNum(n: number): string {
  return n.toLocaleString("es-MX");
}

function fmtPct(n: number): string {
  return n.toFixed(2) + "%";
}

// ============================================================
// TÍTULO DINÁMICO
// ============================================================

export function generateTitulo(
  anio: number,
  cargo: string,
  tipo: string
): { anio: string; cargo: string; esExtraordinaria: boolean } {
  const esExtraordinaria = tipo === "EXTRAORDINARIA";
  return {
    anio: String(anio),
    cargo: CARGO_DISPLAY_LABELS[cargo] ?? cargo,
    esExtraordinaria,
  };
}

// ============================================================
// ALCANCE DEL ANÁLISIS
// ============================================================

export function generateAlcance(params: EleccionesFilterParams): string {
  const { estado, cabecera, municipio, secciones } = params;

  if (!estado) return "Nivel nacional";

  const parts: string[] = [`Estado: ${estado}`];
  if (cabecera) parts.push(`Distrito: ${cabecera}`);
  if (municipio) parts.push(`Municipio: ${municipio}`);
  if (secciones.length > 0) {
    parts.push(`Secciones: ${secciones.join(", ")}`);
  }
  return parts.join(" — ");
}

// ============================================================
// RESUMEN GENERAL
// ============================================================

export function generateResumenGeneral(
  data: ResultadosEleccionesData,
  params: EleccionesFilterParams
): string {
  const { anio, cargo, estado, cabecera, municipio, secciones } = params;
  const cargoLabel = (CARGO_DISPLAY_LABELS[cargo] ?? cargo).toLowerCase();

  let geo = "a nivel nacional";
  if (estado) {
    if (secciones.length > 0) {
      const secStr = secciones.slice(0, 5).join(", ") + (secciones.length > 5 ? "…" : "");
      geo = `en las secciones ${secStr} del municipio de ${municipio ?? ""}${cabecera ? `, distrito ${cabecera}` : ""} de ${estado}`;
    } else if (municipio) {
      geo = `en el municipio de ${municipio}${cabecera ? `, distrito ${cabecera}` : ""} de ${estado}`;
    } else if (cabecera) {
      geo = `en el distrito ${cabecera} de ${estado}`;
    } else {
      geo = `en el estado de ${estado}`;
    }
  }

  return `Los resultados para la elección de ${cargoLabel}s del año ${anio} ${geo} muestran un total de <strong>${fmtNum(data.totalVotos)}</strong> votos.`;
}

// ============================================================
// FUERZA PARTIDISTA (top 3 con diferencias %)
// ============================================================

export function generateFuerzaPartidista(
  data: ResultadosEleccionesData
): string | null {
  // Excluir vot_nul y no_reg del ranking
  const ranking = data.partidos
    .filter((p) => p.partido !== "vot_nul" && p.partido !== "no_reg")
    .slice(0, 3);

  if (ranking.length < 2) return null;

  const fmt = (p: typeof ranking[0]) =>
    `<strong>${p.partido}</strong>: ${fmtPct(p.porcentaje)}`;

  const diff12 = (ranking[0].porcentaje - ranking[1].porcentaje).toFixed(2);
  let text = `La diferencia entre el primer lugar (${fmt(ranking[0])}) y el segundo (${fmt(ranking[1])}) fue de <strong>${diff12} puntos porcentuales</strong>`;

  if (ranking.length >= 3) {
    const diff23 = (ranking[1].porcentaje - ranking[2].porcentaje).toFixed(2);
    text += `; y la diferencia entre este y el tercer lugar (${fmt(ranking[2])}) fue de <strong>${diff23} puntos porcentuales</strong>`;
  }

  return text + ".";
}

// ============================================================
// PARTICIPACIÓN ELECTORAL EN CASCADA
// ============================================================

export function generateParticipacion(
  data: ResultadosEleccionesData,
  params: EleccionesFilterParams
): string[] {
  const { estado, cabecera, municipio, secciones } = params;
  const pnivel = data.participacionPorNivel;
  const lines: string[] = [];

  if (pnivel.nacional !== undefined) {
    lines.push(
      `La tasa global de participación, a nivel nacional, fue de <strong>${fmtPct(pnivel.nacional)}</strong>.`
    );
  }

  if (estado && pnivel.estatal !== undefined) {
    lines.push(
      `La tasa global de participación en <strong>${estado}</strong> fue de <strong>${fmtPct(pnivel.estatal)}</strong>.`
    );
  }

  if (cabecera && pnivel.distrital !== undefined) {
    lines.push(
      `La tasa global de participación en el distrito <strong>${cabecera}</strong> fue de <strong>${fmtPct(pnivel.distrital)}</strong>.`
    );
  }

  if (municipio && pnivel.municipal !== undefined) {
    lines.push(
      `La tasa global de participación en <strong>${municipio}</strong> fue de <strong>${fmtPct(pnivel.municipal)}</strong>.`
    );
  }

  if (secciones.length > 0 && pnivel.seccional !== undefined) {
    lines.push(
      `La tasa global de participación en las secciones seleccionadas fue de <strong>${fmtPct(pnivel.seccional)}</strong>.`
    );
  }

  return lines;
}
