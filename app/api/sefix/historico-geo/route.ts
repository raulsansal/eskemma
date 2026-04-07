// app/api/sefix/historico-geo/route.ts
// Devuelve la serie mensual histórica filtrada por entidad, distrito, municipio y/o secciones.
//
// Usa JSON pre-generados por scripts/pregenerate-sefix.ts almacenados en Firebase Storage.
// Descarga 2 archivos pequeños por entidad (~300-800ms) — sin polling, sin timeouts.

import { NextRequest, NextResponse } from "next/server";
import { getHistoricoSeriesGeo } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entidad = searchParams.get("entidad") ?? undefined;
    const distritoNombre = searchParams.get("distrito") ?? undefined;
    const municipioNombre = searchParams.get("municipio") ?? undefined;
    const seccionesParam = searchParams.get("secciones");
    const secciones = seccionesParam ? seccionesParam.split(",").filter(Boolean) : undefined;
    const yearParam = searchParams.get("year");
    const selectedYear = yearParam ? parseInt(yearParam, 10) : undefined;

    if (!entidad) {
      return NextResponse.json(
        { error: "Parámetro 'entidad' requerido" },
        { status: 400 }
      );
    }

    const data = await getHistoricoSeriesGeo(
      { entidad, distritoNombre, municipioNombre, secciones },
      selectedYear
    );

    if (data.length === 0) {
      return NextResponse.json(
        {
          error: "Sin datos pre-generados para esta entidad. Ejecutar scripts/pregenerate-sefix.ts.",
          entidad,
        },
        { status: 404 }
      );
    }

    const availableYears = [...new Set(data.map((m) => m.year))].sort((a, b) => a - b);

    return NextResponse.json(
      { status: "ready", data, availableYears },
      {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    console.error("[sefix/historico-geo] Error:", err);
    return NextResponse.json(
      { error: "Error al procesar datos históricos geográficos" },
      { status: 500 }
    );
  }
}
