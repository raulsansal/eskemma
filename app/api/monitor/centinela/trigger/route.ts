// app/api/monitor/centinela/trigger/route.ts
// POST /api/monitor/centinela/trigger
// Body: { configId: string }
// Responde inmediatamente con { jobId } sin esperar al Cloud Function.
// El Cloud Function corre en segundo plano y actualiza el job en Firestore.

import {type NextRequest, NextResponse} from "next/server";
import {getSessionFromRequest} from "@/lib/server/auth-helpers";
import {adminDb} from "@/lib/firebase-admin";
import {FieldValue} from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({error: "No autorizado"}, {status: 401});
  }

  const body = (await request.json()) as {configId?: string};
  const {configId} = body;

  if (!configId) {
    return NextResponse.json({error: "configId es requerido"}, {status: 400});
  }

  // Verificar que la configuración pertenece al usuario en sesión
  const configSnap = await adminDb
    .collection("centinela_configs")
    .doc(configId)
    .get();

  if (!configSnap.exists || configSnap.data()?.userId !== session.uid) {
    return NextResponse.json(
      {error: "Configuración no encontrada"},
      {status: 404}
    );
  }

  const functionsUrl = process.env.FIREBASE_FUNCTIONS_URL;
  if (!functionsUrl) {
    return NextResponse.json(
      {error: "FIREBASE_FUNCTIONS_URL no configurado"},
      {status: 500}
    );
  }

  // 1. Crear el job en Firestore antes de llamar al CF
  const jobRef = adminDb.collection("centinela_jobs").doc();
  const jobId = jobRef.id;
  await jobRef.set({
    configId,
    userId: session.uid,
    status: "pending",
    startedAt: FieldValue.serverTimestamp(),
  });

  // 2. Llamar al CF sin esperar la respuesta (fire and forget)
  //    El CF actualizará el job a "running" → "completed" | "failed"
  fetch(`${functionsUrl}/scrapeAndAnalyze`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({configId, userId: session.uid, jobId}),
  }).catch((err) => {
    console.error("[trigger] CF call failed:", err);
  });

  // 3. Responder inmediatamente con el jobId
  return NextResponse.json({jobId, articlesCount: 0});
}
