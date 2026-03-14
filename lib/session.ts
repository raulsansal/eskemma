// lib/session.ts

import { adminAuth, adminDb } from "./firebase-admin";
import { SESSION_CONFIG } from "./session-config";
import type {
  SessionPayload,
  CreateSessionResult,
  GetSessionResult,
} from "../types/session.types";
import type { UserRole, SubscriptionPlan, SubscriptionStatus } from "../types/subscription.types";

/**
 * Crea una session cookie de Firebase a partir de un ID token del cliente.
 *
 * Flujo esperado:
 *   1. Cliente hace login con Firebase SDK → obtiene idToken con getIdToken()
 *   2. Cliente llama a POST /api/auth/session con el idToken en el body
 *   3. El API route llama a createSession(idToken)
 *   4. El API route escribe la cookie con cookieValue y COOKIE_OPTIONS
 *
 * @param idToken - ID token de Firebase obtenido en el cliente
 */
export async function createSession(idToken: string): Promise<CreateSessionResult> {
  try {
    const expiresIn = SESSION_CONFIG.MAX_AGE_SECONDS * 1000; // Firebase espera ms

    const cookieValue = await adminAuth.createSessionCookie(idToken, { expiresIn });

    return { success: true, cookieValue };
  } catch (error) {
    console.error("[session] Error al crear session cookie:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al crear sesión",
    };
  }
}

/**
 * Verifica y decodifica la session cookie.
 * Comprueba también revocación (checkRevoked = true), por lo que si el usuario
 * cierra sesión en otro dispositivo o un admin revoca el token, la cookie queda inválida.
 *
 * @param cookieValue - Valor crudo de la cookie leído del header Cookie
 */
export async function getSession(cookieValue: string): Promise<GetSessionResult> {
  try {
    // verifySessionCookie(cookie, checkRevoked)
    const decoded = await adminAuth.verifySessionCookie(cookieValue, true);

    // Leer datos adicionales del usuario desde Firestore para obtener
    // role, subscriptionPlan y subscriptionStatus actualizados.
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data();

    const session: SessionPayload = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      emailVerified: decoded.email_verified ?? false,
      role: (userData?.role as UserRole) ?? "visitor",
      subscriptionPlan: (userData?.subscriptionPlan as SubscriptionPlan) ?? null,
      subscriptionStatus: (userData?.subscriptionStatus as SubscriptionStatus) ?? null,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    return { session };
  } catch (error) {
    // Token expirado, revocado o malformado — sesión inválida
    return { session: null };
  }
}

/**
 * Retorna las opciones necesarias para expirar la cookie en el navegador.
 * El API route que llame a esto debe escribir una cookie vacía con estas opciones.
 *
 * Uso:
 *   const opts = deleteSession();
 *   response.cookies.set(SESSION_CONFIG.COOKIE_NAME, "", opts);
 */
export function deleteSession() {
  return {
    ...SESSION_CONFIG.COOKIE_OPTIONS,
    maxAge: 0,
  };
}
