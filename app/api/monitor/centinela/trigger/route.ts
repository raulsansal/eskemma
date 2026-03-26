// app/api/monitor/centinela/trigger/route.ts
// POST /api/monitor/centinela/trigger
// Dispara un ciclo de scraping manual en Firebase Cloud Function.
// Body: { configId: string }
// Responde con { jobId } una vez que el Cloud Function completa el scraping.

import {type NextRequest, NextResponse} from "next/server";
import {getSessionFromRequest} from "@/lib/server/auth-helpers";
import {adminDb} from "@/lib/firebase-admin";

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

  // Llamar Cloud Function y esperar resultado
  // El tiempo esperado de scraping es < 30s para la mayoría de territorios
  let cfResponse: Response;
  try {
    cfResponse = await fetch(`${functionsUrl}/scrapeAndAnalyze`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({configId, userId: session.uid}),
      signal: AbortSignal.timeout(55000), // 55s — margen bajo el límite de Vercel
    });
  } catch (error) {
    console.error("[trigger] Error al llamar Cloud Function:", error);
    return NextResponse.json(
      {error: "No se pudo conectar con el servicio de scraping"},
      {status: 502}
    );
  }

  if (!cfResponse.ok) {
    const errorBody = (await cfResponse.json().catch(() => ({}))) as {
      error?: string;
    };
    return NextResponse.json(
      {error: errorBody.error || "Error en el servicio de scraping"},
      {status: 502}
    );
  }

  const data = (await cfResponse.json()) as {
    jobId: string;
    articlesCount: number;
  };

  return NextResponse.json({
    jobId: data.jobId,
    articlesCount: data.articlesCount,
  });
}
