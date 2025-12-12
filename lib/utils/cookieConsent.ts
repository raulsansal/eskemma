// lib/utils/cookieConsent.ts

/**
 * Interfaz para el consentimiento de cookies
 */
export interface CookieConsent {
  essential: boolean; // Siempre true
  analytics: boolean;
  marketing: boolean;
  timestamp: string; // ISO timestamp del consentimiento
}

/**
 * Clave para localStorage
 */
const COOKIE_CONSENT_KEY = "eskemma_cookie_consent";

/**
 * Evento personalizado para notificar cambios en el consentimiento
 */
const CONSENT_CHANGE_EVENT = "cookieConsentChanged";

/**
 * Obtener el consentimiento actual del usuario
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading cookie consent:", error);
    return null;
  }
}

/**
 * Verificar si el usuario ya ha dado consentimiento
 */
export function hasGivenConsent(): boolean {
  return getCookieConsent() !== null;
}

/**
 * Guardar el consentimiento del usuario
 */
export function saveCookieConsent(consent: Omit<CookieConsent, "timestamp">): void {
  if (typeof window === "undefined") return;

  const fullConsent: CookieConsent = {
    ...consent,
    essential: true, // Siempre forzar a true
    timestamp: new Date().toISOString(),
  };

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent));
    
    // Disparar evento personalizado para notificar el cambio
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { 
      detail: fullConsent 
    }));

    // Aplicar las preferencias inmediatamente
    applyConsent(fullConsent);
  } catch (error) {
    console.error("Error saving cookie consent:", error);
  }
}

/**
 * Aceptar todas las cookies
 */
export function acceptAllCookies(): void {
  saveCookieConsent({
    essential: true,
    analytics: true,
    marketing: true,
  });
}

/**
 * Aceptar solo cookies esenciales
 */
export function acceptEssentialOnly(): void {
  saveCookieConsent({
    essential: true,
    analytics: false,
    marketing: false,
  });
}

/**
 * Rechazar todas las cookies opcionales
 */
export function rejectAllCookies(): void {
  acceptEssentialOnly();
}

/**
 * Eliminar el consentimiento guardado
 */
export function clearCookieConsent(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    
    // Disparar evento de cambio
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { 
      detail: null 
    }));
  } catch (error) {
    console.error("Error clearing cookie consent:", error);
  }
}

/**
 * Reabrir el banner de cookies
 * Útil para permitir al usuario cambiar sus preferencias
 */
export function reopenCookieBanner(): void {
  if (typeof window === "undefined") return;

  // Eliminar el consentimiento actual
  clearCookieConsent();
  
  // Recargar la página para mostrar el banner
  // Nota: El banner aparecerá automáticamente porque hasGivenConsent() devolverá false
  window.location.reload();
}

/**
 * Aplicar el consentimiento cargando/descargando scripts según las preferencias
 */
function applyConsent(consent: CookieConsent): void {
  if (typeof window === "undefined") return;

  // Cookies Analíticas (Google Analytics)
  if (consent.analytics) {
    loadGoogleAnalytics();
  } else {
    removeGoogleAnalytics();
  }

  // Cookies de Marketing (Facebook Pixel, Google Ads)
  if (consent.marketing) {
    loadMarketingScripts();
  } else {
    removeMarketingScripts();
  }
}

/**
 * Cargar Google Analytics
 */
function loadGoogleAnalytics(): void {
  if (typeof window === "undefined") return;

  // Verificar si ya está cargado
  if ((window as any).gtag) {
    console.debug("Google Analytics already loaded");
    return;
  }

  // Tu ID de Google Analytics (reemplazar con el tuyo)
  const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // TODO: Reemplazar con tu ID real

  // Crear script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.id = "ga-script";
  document.head.appendChild(script);

  // Inicializar gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true, // Anonimizar IP para GDPR
  });

  console.debug("Google Analytics loaded");
}

/**
 * Remover Google Analytics
 */
function removeGoogleAnalytics(): void {
  if (typeof window === "undefined") return;

  // Remover script de Google Analytics
  const gaScript = document.getElementById("ga-script");
  if (gaScript) {
    gaScript.remove();
  }

  // Limpiar gtag
  delete (window as any).gtag;
  delete (window as any).dataLayer;

  // Eliminar cookies de Google Analytics
  deleteCookie("_ga");
  deleteCookie("_ga_*");
  deleteCookie("_gid");

  console.debug("Google Analytics removed");
}

/**
 * Cargar scripts de marketing (Facebook Pixel, Google Ads)
 */
function loadMarketingScripts(): void {
  if (typeof window === "undefined") return;

  // Facebook Pixel
  loadFacebookPixel();

  // Google Ads
  loadGoogleAds();
}

/**
 * Remover scripts de marketing
 */
function removeMarketingScripts(): void {
  if (typeof window === "undefined") return;

  // Remover Facebook Pixel
  removeFacebookPixel();

  // Remover Google Ads
  removeGoogleAds();
}

/**
 * Cargar Facebook Pixel
 */
function loadFacebookPixel(): void {
  if (typeof window === "undefined") return;

  // Tu ID de Facebook Pixel (reemplazar con el tuyo)
  const FB_PIXEL_ID = "XXXXXXXXXXXXXXX"; // TODO: Reemplazar con tu ID real

  // Verificar si ya está cargado
  if ((window as any).fbq) {
    console.debug("Facebook Pixel already loaded");
    return;
  }

  // Inicializar Facebook Pixel
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (typeof f.fbq !== "undefined") return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    t.id = "fb-pixel";
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  (window as any).fbq("init", FB_PIXEL_ID);
  (window as any).fbq("track", "PageView");

  console.debug("Facebook Pixel loaded");
}

/**
 * Remover Facebook Pixel
 */
function removeFacebookPixel(): void {
  if (typeof window === "undefined") return;

  // Remover script
  const fbScript = document.getElementById("fb-pixel");
  if (fbScript) {
    fbScript.remove();
  }

  // Limpiar fbq
  delete (window as any).fbq;
  delete (window as any)._fbq;

  // Eliminar cookies de Facebook
  deleteCookie("_fbp");
  deleteCookie("fr");

  console.debug("Facebook Pixel removed");
}

/**
 * Cargar Google Ads
 */
function loadGoogleAds(): void {
  if (typeof window === "undefined") return;

  // Tu ID de Google Ads (reemplazar con el tuyo)
  const GOOGLE_ADS_ID = "AW-XXXXXXXXXX"; // TODO: Reemplazar con tu ID real

  // Crear script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  script.id = "google-ads-script";
  document.head.appendChild(script);

  // Inicializar gtag si no existe
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;

  gtag("js", new Date());
  gtag("config", GOOGLE_ADS_ID);

  console.debug("Google Ads loaded");
}

/**
 * Remover Google Ads
 */
function removeGoogleAds(): void {
  if (typeof window === "undefined") return;

  // Remover script
  const adsScript = document.getElementById("google-ads-script");
  if (adsScript) {
    adsScript.remove();
  }

  // Eliminar cookies de Google Ads
  deleteCookie("_gcl_au");

  console.debug("Google Ads removed");
}

/**
 * Eliminar una cookie específica
 */
function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;

  // Eliminar cookie del dominio actual
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

  // Eliminar cookie con wildcard (para cookies como _ga_*)
  if (name.includes("*")) {
    const prefix = name.replace("*", "");
    const cookies = document.cookie.split(";");

    cookies.forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      if (cookieName.startsWith(prefix)) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  }
}

/**
 * Obtener todas las cookies actuales (útil para debugging)
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const cookies: Record<string, string> = {};
  const cookieArray = document.cookie.split(";");

  cookieArray.forEach((cookie) => {
    const [name, value] = cookie.split("=").map((c) => c.trim());
    if (name && value) {
      cookies[name] = value;
    }
  });

  return cookies;
}

/**
 * Verificar si una categoría específica está habilitada
 */
export function isCategoryEnabled(category: "essential" | "analytics" | "marketing"): boolean {
  const consent = getCookieConsent();
  
  if (!consent) {
    // Si no hay consentimiento, solo esenciales están habilitadas
    return category === "essential";
  }

  return consent[category];
}

/**
 * Suscribirse a cambios en el consentimiento
 */
export function onConsentChange(callback: (consent: CookieConsent | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CookieConsent | null>;
    callback(customEvent.detail);
  };

  window.addEventListener(CONSENT_CHANGE_EVENT, handler);

  // Retornar función para desuscribirse
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
  };
}