// app/api/sefix/semanal-tabla/route.ts
// Devuelve filas paginadas del corte semanal para la tabla de la vista Semanal.
// Parámetros:
//   tipo=sexo|edad|origen  (requerido)
//   ambito=nacional|extranjero  (default: nacional)
//   corte=YYYY-MM-DD  (opcional)
//   entidad=NOMBRE  (opcional)
//   page=1  pageSize=50  search=texto  download=true

import { NextRequest, NextResponse } from "next/server";
import { getSemanalTablaRows } from "@/lib/sefix/storage";
import type { SemanalTipo, SemanalGeoFilter } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Extrae el campo de texto principal según tipo para búsqueda */
function textKey(tipo: SemanalTipo): string {
  if (tipo === "sexo")   return "rango";
  if (tipo === "edad")   return "rango";
  return "origen"; // origen
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const tipo = sp.get("tipo") as SemanalTipo | null;
  if (!tipo || !["sexo", "edad", "origen"].includes(tipo)) {
    return NextResponse.json(
      { error: "Parámetro 'tipo' inválido. Usar: sexo | edad | origen" },
      { status: 400 }
    );
  }

  const ambito  = (sp.get("ambito") ?? "nacional") as "nacional" | "extranjero";
  const corte   = sp.get("corte")   ?? undefined;
  const entidad = sp.get("entidad") ?? undefined;

  const cveDistrito  = sp.get("cvd")       ?? undefined;
  const cveMunicipio = sp.get("cvm")       ?? undefined;
  const seccionesRaw = sp.get("secciones") ?? "";
  const secciones    = seccionesRaw ? seccionesRaw.split(",").filter(Boolean) : undefined;
  const geo: SemanalGeoFilter | undefined =
    (cveDistrito || cveMunicipio || secciones?.length)
      ? { cveDistrito, cveMunicipio, secciones }
      : undefined;

  const page     = Math.max(1, parseInt(sp.get("page")     ?? "1",  10));
  const pageSize = Math.min(200, Math.max(1, parseInt(sp.get("pageSize") ?? "50", 10)));
  const search   = (sp.get("search") ?? "").toLowerCase().trim();
  const download = sp.get("download") === "true";

  try {
    let { rows, fecha } = await getSemanalTablaRows({ tipo, ambito, corte, entidad, geo });

    if (search) {
      const key = textKey(tipo);
      rows = rows.filter((r) =>
        String(r[key] ?? "").toLowerCase().includes(search)
      );
    }

    const total = rows.length;

    if (download) {
      const header = buildCsvHeader(tipo);
      const csv = header + rows.map((r) => buildCsvRow(r, tipo)).join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sefix_semanal_${tipo}_${ambito}_${fecha}.csv"`,
        },
      });
    }

    const start = (page - 1) * pageSize;
    const paged = rows.slice(start, start + pageSize);

    return NextResponse.json(
      { rows: paged, total, page, pageSize, fecha },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("[semanal-tabla]", err);
    return NextResponse.json({ error: "Error al cargar datos de tabla semanal" }, { status: 500 });
  }
}

function buildCsvHeader(tipo: SemanalTipo): string {
  if (tipo === "sexo")  return "Rango de Edad,Padrón H,Padrón M,Padrón No Binario,LNE Hombres,LNE Mujeres,LNE No Binario,Tasa H,Tasa M,Tasa No Binario\n";
  if (tipo === "edad")  return "Rango de Edad,Padrón Electoral,Lista Nominal,Tasa de Inclusión\n";
  return "Entidad de Origen,Lista Nominal,Padrón Electoral,Padrón − LNE\n";
}

function buildCsvRow(r: Record<string, string | number>, tipo: SemanalTipo): string {
  if (tipo === "sexo")  return `${r.rango},${r.padron_h},${r.padron_m},${r.padron_nb},${r.lne_hombres},${r.lne_mujeres},${r.lne_nb},${r.tasa_h},${r.tasa_m},${r.tasa_nb}`;
  if (tipo === "edad")  return `${r.rango},${r.padron},${r.lista},${r.tasa}`;
  return `${r.origen},${r.lne},${r.padron},${r.diferencia}`;
}
