// app/api/monitor/centinela/feed/route.ts
// GET /api/monitor/centinela/feed
// Retorna el feed PEST-L más reciente para el territorio configurado.
// Consumido por Moddulo F2 para inyectar contexto en xpctoContext.

import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // TODO (Fase 4): Leer centinela_feeds desde Firestore
  // Parámetros: ?userId=X&territorio=Y
  return NextResponse.json({ status: "not_implemented" }, { status: 501 });
}
