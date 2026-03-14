// app/api/auth/session/route.ts
// Fase 2 — APIs de autenticación con cookies
//
// POST   /api/auth/session  → crea la cookie de sesión (login)
// DELETE /api/auth/session  → elimina la cookie de sesión (logout)
// GET    /api/auth/session  → lee la sesión activa (para Server Components y diagnóstico)

import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, deleteSession } from "@/lib/session";
import { SESSION_CONFIG } from "@/lib/session-config";

// ─────────────────────────────────────────────────────────────
// POST — Crear sesión
// Body: { idToken: string }
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string" || idToken.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Se requiere idToken" },
        { status: 400 }
      );
    }

    const result = await createSession(idToken);

    if (!result.success || !result.cookieValue) {
      console.error("[POST /api/auth/session] Error al crear sesión:", result.error);
      return NextResponse.json(
        { success: false, error: "No se pudo crear la sesión" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set(
      SESSION_CONFIG.COOKIE_NAME,
      result.cookieValue,
      {
        ...SESSION_CONFIG.COOKIE_OPTIONS,
        maxAge: SESSION_CONFIG.MAX_AGE_SECONDS,
      }
    );

    console.log("✅ [POST /api/auth/session] Sesión creada correctamente");
    return response;
  } catch (error) {
    console.error("❌ [POST /api/auth/session] Error inesperado:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE — Destruir sesión
// Sin body. Expira la cookie en el navegador.
// ─────────────────────────────────────────────────────────────
export async function DELETE() {
  try {
    const cookieOptions = deleteSession();

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set(SESSION_CONFIG.COOKIE_NAME, "", cookieOptions);

    console.log("✅ [DELETE /api/auth/session] Sesión eliminada correctamente");
    return response;
  } catch (error) {
    console.error("❌ [DELETE /api/auth/session] Error inesperado:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// GET — Leer sesión activa
// Lee la cookie del request y retorna los datos de sesión.
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const cookieValue = request.cookies.get(SESSION_CONFIG.COOKIE_NAME)?.value;

    if (!cookieValue) {
      return NextResponse.json(
        { session: null },
        { status: 401 }
      );
    }

    const { session, error } = await getSession(cookieValue);

    if (!session) {
      console.warn("[GET /api/auth/session] Cookie inválida o expirada:", error);
      // Limpiar cookie inválida del navegador
      const response = NextResponse.json({ session: null }, { status: 401 });
      response.cookies.set(SESSION_CONFIG.COOKIE_NAME, "", deleteSession());
      return response;
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error("❌ [GET /api/auth/session] Error inesperado:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
