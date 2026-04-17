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
  getDistritosPorEntidadSemanal,
  getMunicipiosPorDistritoSemanal,
  getSeccionesPorMunicipioSemanal,
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
    const source = searchParams.get("source"); // "semanal" → uses pre-generated geo.json

    if (!nivel) {
      return NextResponse.json({ error: "Parámetro 'nivel' requerido" }, { status: 400 });
    }

    if (nivel === "distrito") {
      if (!entidad) return NextResponse.json({ error: "Se requiere 'entidad'" }, { status: 400 });
      let opciones;
      if (source === "semanal") {
        opciones = await getDistritosPorEntidadSemanal(entidad);
      } else if (year) {
        opciones = await getDistritosPorEntidadYear(entidad, year);
      } else {
        opciones = await getDistritosPorEntidad(entidad);
      }
      return NextResponse.json({ opciones });
    }

    if (nivel === "municipio") {
      if (!entidad || !distrito)
        return NextResponse.json({ error: "Se requieren 'entidad' y 'distrito'" }, { status: 400 });
      let opciones;
      if (source === "semanal") {
        opciones = await getMunicipiosPorDistritoSemanal(entidad, distrito);
      } else if (year) {
        opciones = await getMunicipiosPorDistritoYear(entidad, distrito, year);
      } else {
        opciones = await getMunicipiosPorDistrito(entidad, distrito);
      }
      return NextResponse.json({ opciones });
    }

    if (nivel === "seccion") {
      if (!entidad || !municipio)
        return NextResponse.json({ error: "Se requieren 'entidad' y 'municipio'" }, { status: 400 });
      let secciones;
      if (source === "semanal") {
        secciones = await getSeccionesPorMunicipioSemanal(entidad, municipio);
      } else if (year) {
        secciones = await getSeccionesPorMunicipioYear(entidad, municipio, year);
      } else {
        secciones = await getSeccionesPorMunicipio(entidad, municipio);
      }
      return NextResponse.json({ opciones: secciones.map((s) => ({ cve: s, nombre: s })) });
    }

    return NextResponse.json({ error: "Nivel inválido. Usar: distrito | municipio | seccion" }, { status: 400 });
  } catch (err) {
    console.error("[sefix/territorios] Error:", err);
    return NextResponse.json({ error: "Error al obtener territorios" }, { status: 500 });
  }
}
