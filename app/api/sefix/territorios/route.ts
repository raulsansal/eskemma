// app/api/sefix/territorios/route.ts
// Cascade geográfica: distritos, municipios, secciones.
// Sin auth: /sefix es público. Caché 30 min en storage.ts.

import { NextRequest, NextResponse } from "next/server";
import {
  getDistritosPorEntidad,
  getMunicipiosPorDistrito,
  getSeccionesPorMunicipio,
  getDistritosPorEntidadYear,
  getMunicipiosPorDistritoYear,
  getSeccionesPorMunicipioYear,
} from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nivel = searchParams.get("nivel");
    const entidad = searchParams.get("entidad");
    const distrito = searchParams.get("distrito");
    const municipio = searchParams.get("municipio");
    const yearRaw = searchParams.get("year");
    const year = yearRaw ? parseInt(yearRaw, 10) : null;

    if (!nivel) {
      return NextResponse.json({ error: "Parámetro 'nivel' requerido" }, { status: 400 });
    }

    if (nivel === "distrito") {
      if (!entidad) return NextResponse.json({ error: "Se requiere 'entidad'" }, { status: 400 });
      const opciones = year
        ? await getDistritosPorEntidadYear(entidad, year)
        : await getDistritosPorEntidad(entidad);
      return NextResponse.json({ opciones });
    }

    if (nivel === "municipio") {
      if (!entidad || !distrito)
        return NextResponse.json({ error: "Se requieren 'entidad' y 'distrito'" }, { status: 400 });
      const opciones = year
        ? await getMunicipiosPorDistritoYear(entidad, distrito, year)
        : await getMunicipiosPorDistrito(entidad, distrito);
      return NextResponse.json({ opciones });
    }

    if (nivel === "seccion") {
      if (!entidad || !municipio)
        return NextResponse.json({ error: "Se requieren 'entidad' y 'municipio'" }, { status: 400 });
      const secciones = year
        ? await getSeccionesPorMunicipioYear(entidad, municipio, year)
        : await getSeccionesPorMunicipio(entidad, municipio);
      return NextResponse.json({ opciones: secciones.map((s) => ({ cve: s, nombre: s })) });
    }

    return NextResponse.json({ error: "Nivel inválido. Usar: distrito | municipio | seccion" }, { status: 400 });
  } catch (err) {
    console.error("[sefix/territorios] Error:", err);
    return NextResponse.json({ error: "Error al obtener territorios" }, { status: 500 });
  }
}
