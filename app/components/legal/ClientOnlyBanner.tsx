// app/components/legal/ClientOnlyBanner.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Importar CookieBanner dinámicamente, solo en el cliente
const CookieBanner = dynamic(() => import("./CookieBanner"), {
  ssr: false, // CRÍTICO: No renderizar en el servidor
  loading: () => null, // No mostrar nada mientras carga
});

/**
 * Wrapper que asegura que CookieBanner solo se renderice en el cliente
 * 
 * PROPÓSITO:
 * - Evita problemas de hidratación con localStorage
 * - Previene discrepancias entre servidor y cliente
 * - Asegura que las preferencias de cookies solo se lean del lado del cliente
 * 
 * ACCESIBILIDAD:
 * - No afecta la accesibilidad directamente (solo es un wrapper técnico)
 * - El CookieBanner renderizado incluye todas las mejoras de accesibilidad:
 *   * Focus trap cuando está abierto
 *   * Navegación por teclado (Escape para cerrar)
 *   * ARIA labels y roles apropiados
 *   * Anuncios para screen readers
 *   * Botones con min-height táctil
 * 
 * MOBILE:
 * - Todas las optimizaciones mobile están en CookieBanner.tsx
 * - Este componente es solo un wrapper técnico sin UI propia
 */
export default function ClientOnlyBanner() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Solo renderizar después de que el componente esté montado en el cliente
  // Esto evita problemas de hidratación con localStorage
  if (!isMounted) {
    return null;
  }

  return <CookieBanner />;
}
