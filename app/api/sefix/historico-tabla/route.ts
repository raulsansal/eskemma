// app/api/sefix/historico-tabla/route.ts
// Devuelve filas por sección para la Tabla de Datos del panel Histórico.
// Soporta paginación server-side, búsqueda y descarga CSV.

import { NextRequest, NextResponse } from "next/server";
import { getHistoricoTablaRows } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const ambito = (sp.get("ambito") ?? "nacional") as "nacional" | "extranjero";
  const entidad       = sp.get("entidad")  ?? undefined;
  const year          = parseInt(sp.get("year") ?? String(new Date().getFullYear()), 10);
  const distritoNombre  = sp.get("distrito")  ?? undefined;
  const municipioNombre = sp.get("municipio") ?? undefined;
  const seccionesParam  = sp.get("secciones");
  const secciones = seccionesParam ? seccionesParam.split(",").filter(Boolean) : undefined;

  const page     = Math.max(1, parseInt(sp.get("page")     ?? "1",  10));
  const pageSize = Math.min(100, Math.max(1, parseInt(sp.get("pageSize") ?? "10", 10)));
  const search   = (sp.get("search") ?? "").toLowerCase().trim();
  const download = sp.get("download") === "true";

  try {
    let rows = await getHistoricoTablaRows({
      ambito, entidad, year, distritoNombre, municipioNombre, secciones,
    });

    if (search) {
      rows = rows.filter(
        (r) =>
          r.entidad.toLowerCase().includes(search) ||
          r.cabecera.toLowerCase().includes(search) ||
          r.municipio.toLowerCase().includes(search) ||
          r.seccion.includes(search)
      );
    }

    const total = rows.length;

    if (download) {
      const pCol = ambito === "nacional" ? "Padrón Nacional" : "Padrón Extranjero";
      const lCol = ambito === "nacional" ? "Lista Nacional"  : "Lista Extranjero";
      const header = `Año,Entidad,Cabecera Distrital,Municipio,Sección,${pCol},Padrón H,Padrón M,Padrón NB,${lCol},Lista H,Lista M,Lista NB\n`;
      const csv =
        header +
        rows
          .map(
            (r) =>
              `${r.year},${r.entidad},"${r.cabecera}","${r.municipio}",${r.seccion},${r.padron},${r.padronH},${r.padronM},${r.padronNB},${r.lista},${r.listaH},${r.listaM},${r.listaNB}`
          )
          .join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sefix_historico_${ambito}_${year}.csv"`,
        },
      });
    }

    const start = (page - 1) * pageSize;
    const paginatedRows = rows.slice(start, start + pageSize);

    return NextResponse.json(
      { rows: paginatedRows, total, page, pageSize },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
    );
  } catch (error) {
    console.error("[historico-tabla]", error);
    return NextResponse.json({ error: "Error al cargar tabla de datos" }, { status: 500 });
  }
}
