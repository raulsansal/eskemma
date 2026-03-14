// app/api/admin/sync-claims/route.ts
// Fase 7 — Sincronización masiva de Custom Claims con roles de Firestore.
// Solo accesible para admins. Itera todos los documentos de la colección
// "users" y actualiza el Custom Claim "role" en Firebase Auth.

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Se requieren permisos de administrador" }, { status: 403 });
    }

    const usersSnapshot = await adminDb.collection("users").get();

    let synced = 0;
    const errors: Array<{ uid: string; error: string }> = [];

    const tasks = usersSnapshot.docs.map(async (doc) => {
      const uid = doc.id;
      const data = doc.data();
      const role = data?.role;

      if (!role) return;

      try {
        await adminAuth.setCustomUserClaims(uid, { role });
        synced++;
      } catch (err: any) {
        errors.push({ uid, error: err.message || "Error desconocido" });
      }
    });

    await Promise.all(tasks);

    console.log(`✅ [sync-claims] Sincronizados: ${synced}, Errores: ${errors.length}`);

    return NextResponse.json({
      success: true,
      synced,
      errors,
      message: `${synced} usuarios sincronizados correctamente.`,
    });
  } catch (error: any) {
    console.error("❌ [sync-claims] Error en sincronización masiva:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
