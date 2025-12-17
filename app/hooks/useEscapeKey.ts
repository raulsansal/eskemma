// app/hooks/useEscapeKey.ts
import { useEffect } from "react";

/**
 * Hook para cerrar modales/dropdowns con la tecla Escape
 * Cumple con WCAG 2.1.1 (Keyboard)
 *
 * @param isActive - Si el listener está activo
 * @param onClose - Función a ejecutar al presionar Escape
 *
 * @example
 * useEscapeKey(isOpen, () => setIsOpen(false));
 */
export function useEscapeKey(isActive: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isActive, onClose]);
}
