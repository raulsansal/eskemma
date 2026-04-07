// app/api/sefix/semanal/route.ts
// Devuelve el agregado de un archivo semanal (edad | sexo | origen).
// Sin auth: /sefix es público.

import { NextRequest, NextResponse } from "next/server";
import {
  getSemanalAgregado,
  getSemanalFechas,
  type SemanalTipo,
} from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") as SemanalTipo | null;
    const corte = searchParams.get("corte") ?? undefined;
    const entidad = searchParams.get("entidad") ?? null;

    if (!tipo || !["sexo", "edad", "origen"].includes(tipo)) {
      return NextResponse.json(
        { error: "Parámetro 'tipo' inválido. Usar: sexo | edad | origen" },
        { status: 400 }
      );
    }

    // Fechas disponibles para este tipo
    const fechas = await getSemanalFechas(tipo);

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
