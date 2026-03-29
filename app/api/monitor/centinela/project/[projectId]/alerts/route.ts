// app/api/monitor/centinela/project/[projectId]/alerts/route.ts
// GET — returns the 20 most recent alerts for a project (E8).

import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";
import { adminDb } from "@/lib/firebase-admin";
import type { CentinelaAlertV2 } from "@/types/centinela.types";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { projectId } = await context.params;

  // Verify project ownership
  const projectSnap = await adminDb
    .collection("centinela_projects")
    .doc(projectId)
    .get();

  if (!projectSnap.exists || projectSnap.data()?.userId !== session.uid) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const snap = await adminDb
    .collection("centinela_alerts")
    .where("projectId", "==", projectId)
    .orderBy("generadoEn", "desc")
    .limit(20)
    .get();

  const alerts: CentinelaAlertV2[] = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CentinelaAlertV2[];

  return NextResponse.json({ alerts }, { status: 200 });
}
