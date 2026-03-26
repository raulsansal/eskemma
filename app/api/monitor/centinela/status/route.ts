// app/api/monitor/centinela/status/route.ts
// GET /api/monitor/centinela/status?jobId=X
// Retorna el estado actual de un job de scraping.
// Usado por el cliente para polling hasta que el job complete o falle.

import {type NextRequest, NextResponse} from "next/server";
import {getSessionFromRequest} from "@/lib/server/auth-helpers";
import {adminDb} from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({error: "No autorizado"}, {status: 401});
  }

  const jobId = request.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({error: "jobId es requerido"}, {status: 400});
  }

  const jobSnap = await adminDb
    .collection("centinela_jobs")
    .doc(jobId)
    .get();

  if (!jobSnap.exists) {
    return NextResponse.json({error: "Job no encontrado"}, {status: 404});
  }

  const job = jobSnap.data()!;

  // Solo el dueño puede consultar el estado de su job
  if (job.userId !== session.uid) {
    return NextResponse.json({error: "Sin permisos"}, {status: 403});
  }

  return NextResponse.json({
    status: job.status as string,
    startedAt: job.startedAt ?? null,
    completedAt: job.completedAt ?? null,
    rawDataId: job.rawDataId ?? null,
    error: job.error ?? null,
  });
}
