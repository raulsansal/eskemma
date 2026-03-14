// lib/server/session.server.ts
// Fase 5 — Utilidad para leer la sesión del usuario en Server Components.
//
// Solo puede importarse en archivos sin "use client".
// Uso:
//   import { getServerSession } from "@/lib/server/session.server";
//   const session = await getServerSession();
//   const role = session?.role ?? null;

import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { SESSION_CONFIG } from "@/lib/session-config";
import type { SessionPayload } from "@/types/session.types";

/**
 * Lee la cookie de sesión del request actual y retorna el payload verificado.
 * Retorna null si no hay sesión activa o si la cookie es inválida/expirada.
 *
 * Solo disponible en Server Components, Route Handlers y Server Actions.
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_CONFIG.COOKIE_NAME)?.value;

  if (!cookieValue) return null;

  const { session } = await getSession(cookieValue);
  return session;
}
