// app/api/sefix/resultados/route.ts
// Devuelve resultados electorales federales (agregados o filtrados).
import { NextRequest, NextResponse } from "next/server";
import {
  getResultadosByEstado,
  getResultadosAllYears,
  getResultadosAvailableYears,
  getResultadosFiltered,
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

    // Verificar si hay parámetros de filtro extendido
    const tipoEleccion = searchParams.get("tipo") ?? undefined;
    const principio = searchParams.get("principio") ?? undefined;
    const cabecera = searchParams.get("cabecera") ?? undefined;
    const municipio = searchParams.get("municipio") ?? undefined;
    const seccionesParam = searchParams.get("secciones") ?? "";
    const partidosParam = searchParams.get("partidos") ?? "";
    const incluirExtranjero = searchParams.get("incluirExtranjero") !== "false";
    const hasExtendedFilters = tipoEleccion || principio || cabecera || municipio || seccionesParam || partidosParam || !incluirExtranjero;

    // Todos los años para gráfica histórica
    if (allYears) {
      if (hasExtendedFilters) {
        // Con filtros extendidos: usar getResultadosFiltered por año para reflejar el alcance
        const secciones = seccionesParam ? seccionesParam.split(",").filter(Boolean) : [];
        const years = await getResultadosAvailableYears(cargo);
        const settled = await Promise.allSettled(
          years.map((y) =>
            getResultadosFiltered({
              estadoInput: estado ?? "",
              cargoInput: cargo,
              anioInput: y,
              tipoEleccion,
              principio,
              cabecera,
              municipio,
              secciones,
              incluirExtranjero,
            })
          )
        );
        const resultados = settled
          .filter(
            (r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof getResultadosFiltered>>>> =>
              r.status === "fulfilled" && r.value !== null
          )
          .map((r) => r.value)
          .sort((a, b) => a.anio - b.anio);
        return NextResponse.json({ resultados });
      }
      const resultados = await getResultadosAllYears(estado ?? "", cargo);
      return NextResponse.json({ resultados });
    }

    const anio = anioParam ? parseInt(anioParam) : undefined;

    if (hasExtendedFilters && anio) {
      const secciones = seccionesParam ? seccionesParam.split(",").filter(Boolean) : [];
      const partidos = partidosParam ? partidosParam.split(",").filter(Boolean) : [];

      const resultados = await getResultadosFiltered({
        estadoInput: estado ?? "",
        cargoInput: cargo,
        anioInput: anio,
        tipoEleccion,
        principio,
        cabecera,
        municipio,
        secciones,
        partidos: partidos.length > 0 ? partidos : undefined,
        incluirExtranjero,
      });

      if (!resultados) {
        return NextResponse.json(
          { error: `No se encontraron resultados para ${estado} / ${cargo} / ${anio}` },
          { status: 404 }
        );
      }

      return NextResponse.json({ resultados });
    }

    // Consulta básica (sin filtros extendidos)
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
