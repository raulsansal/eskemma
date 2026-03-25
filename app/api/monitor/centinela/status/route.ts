// app/api/monitor/centinela/status/route.ts
// GET /api/monitor/centinela/status
// Retorna el estado del job de scraping más reciente.
// Parámetros: ?jobId=X
// Polled por el cliente para mostrar progreso en la UI.

import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // TODO (Fase 1): Leer centinela_jobs desde Firestore por jobId
  void request; // evitar warning de parámetro no utilizado
  return NextResponse.json({ status: "not_implemented" }, { status: 501 });
}
