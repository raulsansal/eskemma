// app/api/sefix/semanal-nb/route.ts
// Devuelve totales No Binario del último corte semanal _sexo.csv,
// filtrados por entidad, municipio (CVE) y/o secciones.
//
// Uso: GET /api/sefix/semanal-nb?entidad=JALISCO&cveMunicipio=039&secciones=411,412

import { NextRequest, NextResponse } from "next/server";
import { getSemanalNbGeo } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entidad = searchParams.get("entidad");
  const cveMunicipio = searchParams.get("cveMunicipio") ?? undefined;
  const seccionesParam = searchParams.get("secciones");
  const secciones = seccionesParam ? seccionesParam.split(",").filter(Boolean) : undefined;

  if (!entidad) {
    return NextResponse.json({ error: "Parámetro 'entidad' requerido" }, { status: 400 });
  }

  try {
    const data = await getSemanalNbGeo(entidad, cveMunicipio, secciones);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, max-age=1800" } }
    );
  } catch (err) {
    console.error("[sefix/semanal-nb] Error:", err);
    return NextResponse.json({ error: "Error al consultar datos NB" }, { status: 500 });
  }
}
