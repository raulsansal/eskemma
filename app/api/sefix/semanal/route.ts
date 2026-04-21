// app/api/sefix/semanal/route.ts
// Devuelve el agregado de un archivo semanal (edad | sexo | origen).
// Sin auth: /sefix es público.

import { NextRequest, NextResponse } from "next/server";
import {
  getSemanalAgregado,
  getSemanalSeccionSnapshot,
  getSemanalFechas,
  type SemanalTipo,
  type SemanalGeoFilter,
} from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo    = searchParams.get("tipo") as SemanalTipo | null;
    const ambito  = (searchParams.get("ambito") ?? "nacional") as "nacional" | "extranjero";
    const corte   = searchParams.get("corte") ?? undefined;
    const entidad = searchParams.get("entidad") ?? null;

    // Sub-state geo filter (only meaningful when entidad is set)
    const cveDistrito  = searchParams.get("cvd")      ?? undefined;
    const cveMunicipio = searchParams.get("cvm")      ?? undefined;
    const seccionesRaw = searchParams.get("secciones") ?? "";
    const secciones    = seccionesRaw ? seccionesRaw.split(",").filter(Boolean) : undefined;

    if (!tipo || !["sexo", "edad", "origen"].includes(tipo)) {
      return NextResponse.json(
        { error: "Parámetro 'tipo' inválido. Usar: sexo | edad | origen" },
        { status: 400 }
      );
    }

    // Fechas disponibles para este tipo
    const fechas = await getSemanalFechas(tipo);

    // When a sub-state geo filter is active, use section-level series snapshot
    const hasGeoFilter = !!(cveDistrito || cveMunicipio || secciones?.length);
    if (entidad && hasGeoFilter) {
      const geo: SemanalGeoFilter = { cveDistrito, cveMunicipio, secciones };
      const snapshot = await getSemanalSeccionSnapshot(entidad, tipo, ambito, geo, corte);
      if (snapshot) {
        return NextResponse.json({
          fecha:           snapshot.fecha,
          ambitos:         { nacional: snapshot.data, extranjero: {} },
          data:            snapshot.data,
          availableFechas: fechas,
        });
      }
      // Fall through to state-level if section series not yet generated
    }

    const result = await getSemanalAgregado(tipo, corte, entidad);
    if (!result) {
      return NextResponse.json(
        { error: "No se encontraron datos para los parámetros indicados" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...result, availableFechas: fechas });
  } catch (err) {
    console.error("[sefix/semanal] Error:", err);
    return NextResponse.json(
      { error: "Error al procesar los datos semanales" },
      { status: 500 }
    );
  }
}
