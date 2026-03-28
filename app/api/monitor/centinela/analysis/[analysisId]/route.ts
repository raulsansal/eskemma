// app/api/monitor/centinela/analysis/[analysisId]/route.ts
// GET /api/monitor/centinela/analysis/[analysisId]
// Returns a PestlAnalysisV2 document from centinela_analyses.

import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";
import { adminDb } from "@/lib/firebase-admin";

interface RouteContext {
  params: Promise<{ analysisId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { analysisId } = await context.params;

  const snap = await adminDb
    .collection("centinela_analyses")
    .doc(analysisId)
    .get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Análisis no encontrado" }, { status: 404 });
  }

  const data = snap.data()!;

  // Verify that the analysis belongs to a project owned by the user
  const projectSnap = await adminDb
    .collection("centinela_projects")
    .doc(data.projectId as string)
    .get();

  if (!projectSnap.exists || projectSnap.data()?.userId !== session.uid) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  return NextResponse.json({ analysis: { id: snap.id, ...data } });
}
