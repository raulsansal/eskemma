// app/api/monitor/centinela/trigger/route.ts
// POST /api/monitor/centinela/trigger
// Body: { projectId: string }
// Creates a job in Firestore and calls the CF without waiting (fire-and-forget).
// Returns { jobId } immediately.

import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as { projectId?: string };
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId es requerido" }, { status: 400 });
  }

  // Verify the project belongs to the user
  const projectSnap = await adminDb
    .collection("centinela_projects")
    .doc(projectId)
    .get();

  if (!projectSnap.exists || projectSnap.data()?.userId !== session.uid) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const functionsUrl = process.env.FIREBASE_FUNCTIONS_URL;
  if (!functionsUrl) {
    return NextResponse.json(
      { error: "FIREBASE_FUNCTIONS_URL no configurado" },
      { status: 500 }
    );
  }

  // 1. Pre-create job document
  const jobRef = adminDb.collection("centinela_jobs").doc();
  const jobId = jobRef.id;
  await jobRef.set({
    projectId,
    userId: session.uid,
    status: "pending",
    startedAt: FieldValue.serverTimestamp(),
  });

  // 2. Fire-and-forget: CF updates job asynchronously
  const cfUrl = `${functionsUrl}/scrapeAndAnalyze`;
  console.log(`[trigger] Calling CF: ${cfUrl} — jobId: ${jobId}`);

  fetch(cfUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, userId: session.uid, jobId }),
  })
    .then(async (cfRes) => {
      const text = await cfRes.text().catch(() => "(no body)");
      console.log(`[trigger] CF responded ${cfRes.status}: ${text.slice(0, 200)}`);
    })
    .catch((err) => {
      console.error("[trigger] CF call failed:", err);
    });

  // 3. Return immediately
  return NextResponse.json({ jobId });
}
