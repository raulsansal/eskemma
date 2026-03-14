// app/api/admin/sync-claims/[uid]/route.ts
// Fase 7 — Sincronización individual de Custom Claim para un usuario específico.
// Útil para aplicar cambios de rol inmediatamente sin correr la sincronización masiva.

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Se requieren permisos de administrador" }, { status: 403 });
    }

    const { uid } = await params;

    if (!uid) {
      return NextResponse.json({ error: "UID es requerido" }, { status: 400 });
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Usuario no encontrado en Firestore" }, { status: 404 });
    }

    const role = userDoc.data()?.role;

    if (!role) {
      return NextResponse.json(
        { error: "El usuario no tiene campo 'role' en Firestore" },
        { status: 422 }
      );
    }

    await adminAuth.setCustomUserClaims(uid, { role });

    console.log(`✅ [sync-claims/${uid}] Custom Claim sincronizado: role=${role}`);

    return NextResponse.json({
      success: true,
      uid,
      role,
      message: `Custom Claim sincronizado correctamente. El usuario verá el cambio en su próxima petición.`,
    });
  } catch (error: any) {
    console.error("❌ [sync-claims/uid] Error al sincronizar claims:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
