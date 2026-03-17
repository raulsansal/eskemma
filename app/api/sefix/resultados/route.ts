// app/api/sefix/resultados/route.ts
// Devuelve resultados electorales federales agregados por estado
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";
import { getResultadosByEstado } from "@/lib/sefix/storage";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const cargo = searchParams.get("cargo") ?? "diputados";
    const anioParam = searchParams.get("anio");
    const anio = anioParam ? parseInt(anioParam) : undefined;

    if (!estado) {
      return NextResponse.json(
        { error: "Parámetro 'estado' requerido" },
        { status: 400 }
      );
    }

    const resultados = await getResultadosByEstado(estado, cargo, anio);

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
