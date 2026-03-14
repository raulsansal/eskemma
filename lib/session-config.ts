// lib/session-config.ts

/**
 * Configuración centralizada de la cookie de sesión.
 * Modificar aquí afecta a todo el sistema de autenticación por cookie.
 */
export const SESSION_CONFIG = {
  /** Nombre de la cookie HTTP-only de sesión */
  COOKIE_NAME: "eskemma-session",

  /**
   * Duración máxima de la sesión en segundos.
   * Firebase session cookies admiten entre 5 minutos y 14 días.
   * Usamos 5 días (432 000 s) como balance entre seguridad y UX.
   */
  MAX_AGE_SECONDS: 60 * 60 * 24 * 5, // 5 días

  /** Opciones de la cookie enviadas en el header Set-Cookie */
  COOKIE_OPTIONS: {
    httpOnly: true,
    /**
     * secure: true solo en producción.
     * En desarrollo (http://localhost) debe ser false o el navegador rechaza la cookie.
     */
    secure: process.env.NODE_ENV === "production",
    /**
     * sameSite "lax" protege de CSRF y es compatible con los redirects
     * de OAuth (Google, Facebook). "strict" rompería esos flujos.
     */
    sameSite: "lax" as const,
    path: "/",
  },
} as const;
