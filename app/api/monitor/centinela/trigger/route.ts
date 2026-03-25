// app/api/monitor/centinela/trigger/route.ts
// POST /api/monitor/centinela/trigger
// Dispara un ciclo de scraping manual en Firebase Cloud Function.
// Body: { configId: string }
// Responde con { jobId } inmediatamente; el scraping corre en background.

import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // TODO (Fase 1): Validar configId, crear centinela_jobs en Firestore,
  //               llamar a Firebase Cloud Function scrapeAndAnalyze vía HTTP
  void request; // evitar warning de parámetro no utilizado
  return NextResponse.json({ status: "not_implemented" }, { status: 501 });
}
