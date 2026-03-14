// types/session.types.ts

import type { UserRole, SubscriptionPlan, SubscriptionStatus } from "./subscription.types";

/**
 * Datos almacenados en la cookie de sesión de Firebase.
 * Se obtienen al verificar la cookie con adminAuth.verifySessionCookie().
 */
export interface SessionPayload {
  uid: string;
  email: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  emailVerified: boolean;
  iat: number; // issued at  (Unix timestamp en segundos)
  exp: number; // expires at (Unix timestamp en segundos)
}

/**
 * Resultado de createSession().
 */
export interface CreateSessionResult {
  success: boolean;
  cookieValue?: string;
  error?: string;
}

/**
 * Resultado de getSession().
 */
export interface GetSessionResult {
  session: SessionPayload | null;
  error?: string;
}
