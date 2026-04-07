// app/api/sefix/prewarm-entidad/route.ts
// Construye el caché persistente de filas históricas para una entidad específica.
// Debe llamarse UNA VEZ por entidad (o cuando se suban nuevos archivos históricos).
// La primera llamada es lenta (~30-120s); deja el resultado en Firebase Storage
// para que las consultas futuras de historico-geo sean rápidas (~1-3s).
//
// Uso: GET /api/sefix/prewarm-entidad?entidad=JALISCO
//      GET /api/sefix/prewarm-entidad?all=1  (pre-calienta todas las entidades)

import { NextRequest, NextResponse } from "next/server";
import { prewarmEntidad, prewarmAllEntidades } from "@/lib/sefix/storage";

export const dynamic = "force-dynamic";
// Sin límite de tiempo — la carga completa puede tardar varios minutos
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entidad = searchParams.get("entidad");
  const all = searchParams.get("all");

  try {
    if (all === "1") {
      const results = await prewarmAllEntidades();
      return NextResponse.json({ ok: true, results });
    }

    if (!entidad) {
      return NextResponse.json(
        { error: "Parámetro 'entidad' requerido, o usa 'all=1' para pre-calentar todas." },
        { status: 400 }
      );
    }

    const count = await prewarmEntidad(entidad);
    return NextResponse.json({ ok: true, entidad, rowCount: count });
  } catch (err) {
    console.error("[sefix/prewarm-entidad] Error:", err);
    return NextResponse.json(
      { error: "Error al pre-calentar entidad", detail: String(err) },
      { status: 500 }
    );
  }
}
