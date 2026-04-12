// app/api/sefix/serie-historico/route.ts
// Sirve la serie histórica nacional completa (con datos NB) como JSON.
// Delega a getHistoricoSeries() que lee los archivos _base.csv reales desde Storage.
// Cache-Control 30 min: la función de storage tiene su propia caché en memoria.

import { NextResponse } from "next/server";
import { getHistoricoSeries } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const data = await getHistoricoSeries();

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("[serie-historico] Error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los datos históricos" },
      { status: 500 }
    );
  }
}
