// app/api/sefix/resultados/route.ts
// Devuelve resultados electorales federales agregados por estado
import { NextRequest, NextResponse } from "next/server";
import {
  getResultadosByEstado,
  getResultadosAllYears,
  getResultadosAvailableYears,
} from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const cargo = searchParams.get("cargo") ?? "diputados";
    const anioParam = searchParams.get("anio");
    const allYears = searchParams.get("all_years") === "true";

    // Listar años disponibles (sin estado requerido)
    if (searchParams.has("available_years")) {
      const years = await getResultadosAvailableYears(cargo);
      return NextResponse.json({ availableYears: years });
    }

    // Todos los años para gráfica histórica
    if (allYears) {
      const resultados = await getResultadosAllYears(estado ?? "", cargo);
      return NextResponse.json({ resultados });
    }

    // Año específico o el más reciente
    const anio = anioParam ? parseInt(anioParam) : undefined;
    const resultados = await getResultadosByEstado(estado ?? "", cargo, anio);

    if (!resultados) {
      return NextResponse.json(
        { error: `No se encontraron resultados para ${estado} / ${cargo}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ resultados });
  } catch (error) {
    console.error("[sefix/resultados] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener resultados electorales" },
      { status: 500 }
    );
  }
}
