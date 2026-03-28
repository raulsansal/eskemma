// app/api/monitor/centinela/project/route.ts
// GET  /api/monitor/centinela/project  — list user's projects
// POST /api/monitor/centinela/project  — create new project (E1-E2)

import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { CentinelaProject } from "@/types/centinela.types";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const snap = await adminDb
    .collection("centinela_projects")
    .where("userId", "==", session.uid)
    .where("isActive", "==", true)
    .get();

  type ProjectDoc = CentinelaProject & { id: string };
  const projects: ProjectDoc[] = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as ProjectDoc))
    .sort((a, b) => {
      const aTime = (a.createdAt as { _seconds?: number })?._seconds ?? 0;
      const bTime = (b.createdAt as { _seconds?: number })?._seconds ?? 0;
      return bTime - aTime;
    });

  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<CentinelaProject>;
  const { nombre, tipo, territorio, horizonte, alertas } = body;

  if (!nombre || !tipo || !territorio || !horizonte) {
    return NextResponse.json(
      { error: "nombre, tipo, territorio y horizonte son requeridos" },
      { status: 400 }
    );
  }

  const validTypes = ["electoral", "gubernamental", "legislativo", "ciudadano"];
  if (!validTypes.includes(tipo)) {
    return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
  }

  const projectRef = adminDb.collection("centinela_projects").doc();
  const now = FieldValue.serverTimestamp();

  await projectRef.set({
    userId: session.uid,
    nombre,
    tipo,
    territorio,
    horizonte,
    isActive: true,
    alertas: alertas ?? {
      vectorRiesgoUmbral: 70,
      notificarEmail: false,
      notificarInApp: true,
    },
    currentStage: 3, // ready to configure variables
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ projectId: projectRef.id }, { status: 201 });
}
