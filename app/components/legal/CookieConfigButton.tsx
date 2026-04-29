// app/components/legal/CookieConfigButton.tsx
"use client";

import { useState } from "react";
import { reopenCookieBanner } from "../../../lib/utils/cookieConsent";

interface CookieConfigButtonProps {
  variant?: "default" | "compact" | "light";
}

/**
 * Botón para reabrir el CookieBanner
 * Permite a los usuarios cambiar sus preferencias de cookies en cualquier momento
 * 
 * ACCESIBILIDAD:
 * - Botón con área táctil mínima (44px desktop / 40px mobile)
 * - Focus ring visible
 * - Mensaje de confirmación con z-index apropiado
 * 
 * MOBILE:
 * - 3 variantes responsive
 * - Mensaje de confirmación adaptativo
 * - Padding y texto responsive
 */
export default function CookieConfigButton({ 
  variant = "default" 
}: CookieConfigButtonProps) {
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = () => {
    // Reabrir el CookieBanner
    reopenCookieBanner();
    
    // Mostrar mensaje de confirmación
    setShowMessage(true);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  // Estilos según variante - TODOS RESPONSIVE
  const buttonStyles = {
    default: "px-6 max-sm:px-4 py-3 max-sm:py-2 bg-bluegreen-eske text-white-eske rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-colors duration-300 text-[15px] max-sm:text-[14px] shadow-md hover:shadow-lg focus-ring-primary",
    compact: "px-4 max-sm:px-3 py-2 max-sm:py-1.5 bg-bluegreen-eske text-white-eske rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-colors duration-300 text-[14px] max-sm:text-[13px] focus-ring-primary",
    light: "px-6 max-sm:px-4 py-3 max-sm:py-2 bg-white-eske dark:bg-[#18324A] text-bluegreen-eske rounded-lg font-bold hover:bg-gray-eske-10 transition-colors duration-300 text-[15px] max-sm:text-[14px] shadow-lg hover:shadow-xl focus-ring-primary border-2 border-bluegreen-eske dark:border-[#4791B3]"
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className={buttonStyles[variant]}
        aria-label="Abrir configuración de cookies"
      >
        Configurar Cookies
      </button>

      {/* Mensaje de confirmación - RESPONSIVE */}
      {showMessage && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 max-sm:mt-1.5 px-4 max-sm:px-3 py-2 max-sm:py-1.5 bg-green-eske text-white-eske rounded-lg shadow-lg text-[13px] max-sm:text-[12px] whitespace-nowrap animate-fade-in z-10"
          role="status"
          aria-live="polite"
        >
          ✅ Banner de cookies reabierto
        </div>
      )}

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
