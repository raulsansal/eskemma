// app/api/sefix/nb-anual/route.ts
// Devuelve el dato No Binario por año (último corte disponible) para Nacional o Extranjero.
// Se usa exclusivamente para la card/tabla NB de la Gráfica 3 en la vista Histórico.
//
// Para Nacional: agrega padronNoBinario + listaNoBinario desde los _base.csv
//   (vía getHistoricoSeries, cacheada 30 min). Fuente exacta de la autoridad electoral.
// Para Extranjero: lee __EXTRANJERO___anual.json (pre-generado por pregenerate-sefix.ts).

import { NextRequest, NextResponse } from "next/server";
import { getNBAnual } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const ambito = (request.nextUrl.searchParams.get("ambito") ?? "nacional") as
    | "nacional"
    | "extranjero";

  try {
    const data = await getNBAnual(ambito);
    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    console.error("[nb-anual] Error:", err);
    return NextResponse.json({ error: "Error al cargar datos NB anuales" }, { status: 500 });
  }
}
