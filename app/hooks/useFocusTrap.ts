// app/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react';

/**
 * Hook para atrapar el focus dentro de un modal
 * Cumple con WCAG 2.4.3 (Focus Order)
 * 
 * @param isActive - Si el trap está activo (modal abierto)
 * @returns ref para el contenedor del modal
 * 
 * @example
 * const modalRef = useFocusTrap(isOpen);
 * return <div ref={modalRef}>...</div>
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Guardar el elemento enfocado antes de abrir el modal
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Obtener todos los elementos enfocables
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Enfocar el primer elemento después de un pequeño delay para asegurar que el modal esté renderizado
    setTimeout(() => {
      firstFocusable?.focus();
    }, 10);

    // Función para atrapar el Tab
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Tab + Shift: ir hacia atrás
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab: ir hacia adelante
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    // Agregar listener
    document.addEventListener('keydown', handleTab);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleTab);
      // Retornar focus al elemento anterior
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}