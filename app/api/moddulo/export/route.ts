// app/api/moddulo/export/route.ts
// TODO: Adaptar a la nueva arquitectura ModduloProject
// El generador de exportación (lib/export/) requiere migración completa de tipos
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Exportación no disponible en esta versión" },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: "Exportación no disponible en esta versión",
  });
}
