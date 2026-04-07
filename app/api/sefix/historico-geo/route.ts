// app/api/sefix/historico-geo/route.ts
// Devuelve la serie mensual histórica filtrada por entidad, distrito, municipio y/o secciones.
// Primera carga puede tardar ~20-30s (procesa ~100 archivos CSV). Resultado cacheado 30 min.

import { NextRequest, NextResponse } from "next/server";
import { getHistoricoSeriesGeo } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entidad = searchParams.get("entidad") ?? undefined;
    // Nombres de distrito y municipio (cabecera_distrital / nombre_municipio del CSV)
    // Son más estables entre archivos históricos que los CVEs
    const distritoNombre = searchParams.get("distrito") ?? undefined;
    const municipioNombre = searchParams.get("municipio") ?? undefined;
    const seccionesParam = searchParams.get("secciones");
    const secciones = seccionesParam ? seccionesParam.split(",").filter(Boolean) : undefined;

    if (!entidad) {
      return NextResponse.json(
        { error: "Parámetro 'entidad' requerido" },
        { status: 400 }
      );
    }

    const data = await getHistoricoSeriesGeo({ entidad, distritoNombre, municipioNombre, secciones });
    const availableYears = [...new Set(data.map((m) => m.year))].sort((a, b) => a - b);

    return NextResponse.json(
      { data, availableYears },
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
