// lib/server/auth-helpers.ts
// Fase 6 — Helper de autenticación para API Route Handlers.
//
// Uso:
//   import { getSessionFromRequest } from "@/lib/server/auth-helpers";
//   const session = await getSessionFromRequest(request);
//   if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

import { type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { SESSION_CONFIG } from "@/lib/session-config";
import type { SessionPayload } from "@/types/session.types";

/**
 * Lee la cookie de sesión del request entrante y retorna el payload verificado.
 * Retorna null si no hay cookie, si es inválida o si expiró.
 *
 * Solo para uso en Route Handlers (app/api/**).
 * Para Server Components usa getServerSession() de lib/server/session.server.ts.
 */
export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  const cookieValue = request.cookies.get(SESSION_CONFIG.COOKIE_NAME)?.value;
  if (!cookieValue) return null;
  const { session } = await getSession(cookieValue);
  return session;
}
