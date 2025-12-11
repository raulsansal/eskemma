// lib/utils/cookieConsent.ts
/**
 * Helper para gestión de consentimiento de cookies
 * Cumplimiento GDPR/CCPA/LFPDPPP
 */

export interface CookieConsent {
  essential: boolean;    // Siempre true (no se puede desactivar)
  analytics: boolean;    // Google Analytics (opcional)
  marketing: boolean;    // Facebook Pixel, Google Ads (opcional)
  timestamp: number;     // Fecha de consentimiento
  version: string;       // Versión de política (para re-consentimiento)
}

const STORAGE_KEY = 'eskemma_cookie_consent';
const CURRENT_VERSION = '1.0.0'; // Incrementar cuando cambies la política de cookies

/**
 * Valores por defecto del consentimiento
 */
const DEFAULT_CONSENT: CookieConsent = {
  essential: true,      // Siempre activas
  analytics: false,     // Desactivadas por defecto
  marketing: false,     // Desactivadas por defecto
  timestamp: Date.now(),
  version: CURRENT_VERSION,
};

/**
 * Obtiene el consentimiento actual del localStorage
 */
export const getCookieConsent = (): CookieConsent | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const consent: CookieConsent = JSON.parse(stored);
    
    // Verificar si la versión cambió (requiere re-consentimiento)
    if (consent.version !== CURRENT_VERSION) {
      console.log('🔄 Versión de política de cookies cambió, requiere re-consentimiento');
      return null;
    }
    
    return consent;
  } catch (error) {
    console.error('❌ Error al leer consentimiento de cookies:', error);
    return null;
  }
};

/**
 * Guarda el consentimiento en localStorage
 */
export const saveCookieConsent = (consent: Partial<CookieConsent>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const fullConsent: CookieConsent = {
      ...DEFAULT_CONSENT,
      ...consent,
      essential: true, // Siempre true, no se puede desactivar
      timestamp: Date.now(),
      version: CURRENT_VERSION,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullConsent));
    console.log('✅ Consentimiento de cookies guardado:', fullConsent);
    
    // Disparar evento personalizado para que otros componentes reaccionen
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: fullConsent }));
  } catch (error) {
    console.error('❌ Error al guardar consentimiento de cookies:', error);
  }
};

/**
 * Acepta todas las cookies (essential + analytics + marketing)
 */
export const acceptAllCookies = (): void => {
  saveCookieConsent({
    essential: true,
    analytics: true,
    marketing: true,
  });
};

/**
 * Acepta solo cookies esenciales (rechaza analytics y marketing)
 */
export const acceptEssentialOnly = (): void => {
  saveCookieConsent({
    essential: true,
    analytics: false,
    marketing: false,
  });
};

/**
 * Elimina el consentimiento (para testing o reset)
 */
export const clearCookieConsent = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Consentimiento de cookies eliminado');
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: null }));
  } catch (error) {
    console.error('❌ Error al eliminar consentimiento de cookies:', error);
  }
};

/**
 * Verifica si el usuario ha dado consentimiento
 */
export const hasGivenConsent = (): boolean => {
  return getCookieConsent() !== null;
};

/**
 * Verifica si una categoría específica está permitida
 */
export const isCategoryAllowed = (category: keyof CookieConsent): boolean => {
  const consent = getCookieConsent();
  if (!consent) return false;
  
  // Si la categoría no existe en el objeto, retornar false
  if (typeof consent[category] !== 'boolean') return false;
  
  return consent[category];
};

/**
 * Hook para escuchar cambios en el consentimiento
 * Uso: useEffect(() => { onCookieConsentChange((consent) => console.log(consent)); }, []);
 */
export const onCookieConsentChange = (callback: (consent: CookieConsent | null) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CookieConsent | null>;
    callback(customEvent.detail);
  };
  
  window.addEventListener('cookieConsentChanged', handler);
  
  // Retornar función de cleanup
  return () => {
    window.removeEventListener('cookieConsentChanged', handler);
  };
};

/**
 * Obtiene estadísticas del consentimiento (para debug/admin)
 */
export const getConsentStats = (): {
  hasConsent: boolean;
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
  daysAgo: number;
} | null => {
  const consent = getCookieConsent();
  if (!consent) return null;
  
  const daysAgo = Math.floor((Date.now() - consent.timestamp) / (1000 * 60 * 60 * 24));
  
  return {
    hasConsent: true,
    essential: consent.essential,
    analytics: consent.analytics,
    marketing: consent.marketing,
    version: consent.version,
    daysAgo,
  };
};