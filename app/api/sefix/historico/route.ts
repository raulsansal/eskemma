// app/api/sefix/historico/route.ts
// Devuelve la serie mensual del Padrón y LNE desde 2017.
// El primer request puede tardar ~30s (procesa ~100 archivos en paralelo).
// Resultado cacheado 30 min en memoria del proceso.

import { NextRequest, NextResponse } from "next/server";
import { getHistoricoSeries } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam) : null;

    const allSeries = await getHistoricoSeries();

    const data = year ? allSeries.filter((m) => m.year === year) : allSeries;

    const availableYears = [...new Set(allSeries.map((m) => m.year))].sort(
      (a, b) => a - b
    );

    // Cache-Control: el browser y Vercel Edge cachean 30 min para no disparar
    // el procesamiento pesado de Storage en cada visita (stale-while-revalidate
    // permite servir la respuesta vieja mientras se regenera en background)
    return NextResponse.json(
      { data, availableYears },
      {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    console.error("[sefix/historico] Error:", err);
    return NextResponse.json(
      { error: "Error al procesar los datos históricos" },
      { status: 500 }
    );
  }
}