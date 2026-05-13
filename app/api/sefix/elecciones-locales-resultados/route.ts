// app/api/sefix/elecciones-locales-resultados/route.ts
// Resultados electorales locales filtrados por estado, año, cargo y geografía.
import { NextRequest, NextResponse } from "next/server";
import {
  getResultadosLocalesFiltered,
  getResultadosLocalesAvailableYears,
  getResultadosLocalesYearsForCargo,
} from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado") ?? "";
    const cargo = searchParams.get("cargo") ?? "dip_loc";
    const anioParam = searchParams.get("anio");
    const allYears = searchParams.get("all_years") === "true";

    if (!estado) {
      return NextResponse.json(
        { error: "Parámetro 'estado' requerido" },
        { status: 400 }
      );
    }

    // Años disponibles para un estado dado (cascade estado → años)
    if (searchParams.has("available_years")) {
      const years = await getResultadosLocalesAvailableYears(estado);
      return NextResponse.json({ availableYears: years });
    }

    // Años disponibles para un cargo dado (para gráfica histórica G3)
    if (searchParams.has("years_for_cargo")) {
      const years = await getResultadosLocalesYearsForCargo(cargo);
      return NextResponse.json({ availableYears: years });
    }

    const tipoEleccion = searchParams.get("tipo") ?? undefined;
    const principio = searchParams.get("principio") ?? undefined;
    const cabecera = searchParams.get("cabecera") ?? undefined;
    const municipio = searchParams.get("municipio") ?? undefined;
    const seccionesParam = searchParams.get("secciones") ?? "";
    const partidosParam = searchParams.get("partidos") ?? "";
    const secciones = seccionesParam ? seccionesParam.split(",").filter(Boolean) : [];
    const partidos = partidosParam ? partidosParam.split(",").filter(Boolean) : [];

    // Todos los años disponibles para el estado+cargo (gráfica histórica)
    if (allYears) {
      const years = await getResultadosLocalesAvailableYears(estado);
      const settled = await Promise.allSettled(
        years.map((y) =>
          getResultadosLocalesFiltered({
            estadoNombre: estado,
            cargoKey: cargo,
            anioInput: y,
            tipoEleccion,
            principio,
            cabecera,
            municipio,
            secciones,
            partidos: partidos.length > 0 ? partidos : undefined,
          })
        )
      );
      const resultados = settled
        .filter(
          (r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof getResultadosLocalesFiltered>>>> =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value)
        .sort((a, b) => a.anio - b.anio);
      return NextResponse.json({ resultados });
    }

    if (!anioParam) {
      return NextResponse.json(
        { error: "Parámetro 'anio' requerido" },
        { status: 400 }
      );
    }

    const anio = parseInt(anioParam);
    if (isNaN(anio)) {
      return NextResponse.json({ error: "Parámetro 'anio' inválido" }, { status: 400 });
    }

    const resultados = await getResultadosLocalesFiltered({
      estadoNombre: estado,
      cargoKey: cargo,
      anioInput: anio,
      tipoEleccion,
      principio,
      cabecera,
      municipio,
      secciones,
      partidos: partidos.length > 0 ? partidos : undefined,
    });

    if (!resultados) {
      return NextResponse.json(
        { error: `No se encontraron resultados para ${estado} / ${cargo} / ${anio}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ resultados });
  } catch (error) {
    console.error("[sefix/elecciones-locales-resultados] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener resultados electorales locales" },
      { status: 500 }
    );
  }
}
