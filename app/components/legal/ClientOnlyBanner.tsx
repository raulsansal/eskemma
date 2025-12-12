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
 * Soluciona problemas de hidratación con localStorage
 */
export default function ClientOnlyBanner() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Solo renderizar después de que el componente esté montado
  if (!isMounted) {
    return null;
  }

  return <CookieBanner />;
}