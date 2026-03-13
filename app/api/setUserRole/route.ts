// app/api/setUserRole/route.ts
// ✅ FASE 0: Protegido con verificación de token Firebase Admin
// Cambios: se agregó verificación de Authorization header y validación de rol admin
// antes de permitir la asignación de custom claims.

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    // ─────────────────────────────────────────────────────────────
    // FASE 0 — NUEVO: Verificar token de autorización
    // ─────────────────────────────────────────────────────────────
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ [setUserRole] Sin token de autorización");
      return NextResponse.json(
        { error: "No autorizado: se requiere token de autenticación" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    let callerUid: string;
    let callerRole: string | undefined;

    try {
      // Verificar el token con Firebase Admin y obtener claims del caller
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      callerUid = decodedToken.uid;
      callerRole = decodedToken.role as string | undefined;

      console.log("🔐 [setUserRole] Caller verificado:", {
        uid: callerUid,
        role: callerRole,
      });
    } catch (tokenError) {
      console.error("❌ [setUserRole] Token inválido:", tokenError);
      return NextResponse.json(
        { error: "No autorizado: token inválido o expirado" },
        { status: 401 }
      );
    }

    // FASE 0 — NUEVO: Solo admins pueden asignar roles
    // Excepción: un usuario puede actualizar su PROPIO rol (necesario
    // durante el flujo de onAuthStateChanged para sincronizar claims).
    const body = await request.json();
    const { uid, role } = body;

    const isSelfUpdate = callerUid === uid;
    const isAdmin = callerRole === "admin";

    if (!isAdmin && !isSelfUpdate) {
      console.error("❌ [setUserRole] Acceso denegado:", {
        callerUid,
        callerRole,
        targetUid: uid,
      });
      return NextResponse.json(
        { error: "Prohibido: no tienes permisos para asignar roles a otros usuarios" },
        { status: 403 }
      );
    }

    // FASE 0 — NUEVO: Un usuario no-admin solo puede asignarse roles
    // permitidos (no puede auto-asignarse "admin")
    const adminOnlyRoles = ["admin"];
    if (!isAdmin && adminOnlyRoles.includes(role)) {
      console.error("❌ [setUserRole] Intento de auto-asignar rol restringido:", {
        callerUid,
        role,
      });
      return NextResponse.json(
        { error: "Prohibido: no puedes asignarte ese rol" },
        { status: 403 }
      );
    }
    // ─────────────────────────────────────────────────────────────
    // FIN bloque FASE 0
    // ─────────────────────────────────────────────────────────────

    // Validaciones existentes de parámetros
    if (!uid || !role) {
      console.error("Faltan parámetros requeridos:", { uid, role });
      return NextResponse.json(
        { error: "Faltan parámetros requeridos (uid, role)" },
        { status: 400 }
      );
    }

    if (typeof role !== "string" || role.trim() === "") {
      console.error("El valor del rol no es válido:", { role });
      return NextResponse.json(
        { error: "El valor del rol no es válido. Debe ser un string no vacío." },
        { status: 400 }
      );
    }

    if (typeof uid !== "string" || uid.trim() === "") {
      console.error("El valor del UID no es válido:", { uid });
      return NextResponse.json(
        { error: "El valor del UID no es válido. Debe ser un string no vacío." },
        { status: 400 }
      );
    }

    // Asignar el Custom Claim
    await adminAuth.setCustomUserClaims(uid, { role });

    console.log("✅ [setUserRole] Rol asignado correctamente:", { uid, role, asignadoPor: callerUid });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error al asignar el rol:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error inesperado al asignar el rol." },
      { status: 500 }
    );
  }
}
