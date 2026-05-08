// app/api/sefix/elecciones-geo/route.ts
// Cascade geográfico para filtros de Elecciones Federales.
import { NextRequest, NextResponse } from "next/server";
import { getEleccionesGeo, getEleccionesMetadata } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nivel = searchParams.get("nivel") as "distritos" | "municipios" | "secciones" | "metadata";
    const anioParam = searchParams.get("anio");
    const cargo = searchParams.get("cargo") ?? "dip";
    const estado = searchParams.get("estado") ?? "";

    if (!anioParam) {
      return NextResponse.json({ error: "Parámetro 'anio' requerido" }, { status: 400 });
    }

    const anio = parseInt(anioParam);
    if (isNaN(anio)) {
      return NextResponse.json({ error: "Parámetro 'anio' inválido" }, { status: 400 });
    }

    if (nivel === "metadata") {
      const cabecera = searchParams.get("cabecera") ?? undefined;
      const metadata = await getEleccionesMetadata(anio, cargo, estado || undefined, cabecera);
      return NextResponse.json({ metadata });
    }

    if (!["distritos", "municipios", "secciones"].includes(nivel)) {
      return NextResponse.json({ error: "Parámetro 'nivel' inválido" }, { status: 400 });
    }

    if (!estado) {
      return NextResponse.json({ opciones: [] });
    }

    const cabecera = searchParams.get("cabecera") ?? undefined;
    const municipio = searchParams.get("municipio") ?? undefined;

    const opciones = await getEleccionesGeo(nivel, anio, cargo, estado, cabecera, municipio);
    return NextResponse.json({ opciones });
  } catch (error) {
    console.error("[sefix/elecciones-geo] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener datos geográficos" },
      { status: 500 }
    );
  }
}
