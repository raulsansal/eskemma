// app/components/componentsHome/AcceptTermsModal.tsx
"use client";
import Link from "next/link";
import Button from "../Button";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface AcceptTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AcceptTermsModal({ isOpen, onClose }: AcceptTermsModalProps) {
  // Hooks de accesibilidad
  const modalRef = useFocusTrap(isOpen);
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accept-terms-title"
        className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-md p-6 relative"
      >
        {/* Botón de Cierre */}
        <button
          className="absolute top-4 right-4 text-black-eske hover:text-red-eske transition-colors duration-300 focus-ring-primary rounded"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Título */}
        <h2 id="accept-terms-title" className="text-xl font-bold text-orange-eske text-center mb-6">
          Aceptación de términos requerida
        </h2>

        {/* Mensaje */}
        <p className="text-[16px] text-black-eske text-center mb-4">
          Para continuar con tu registro, debes aceptar las{" "}
          <Link
            href="/condiciones-de-uso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bluegreen-eske underline hover:text-bluegreen-eske-70 font-medium focus-ring-primary rounded"
          >
            Condiciones de Uso
            <span className="sr-only"> (se abre en nueva ventana)</span>
          </Link>
          {" "}y la{" "}
          <Link
            href="/politica-de-privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bluegreen-eske underline hover:text-bluegreen-eske-70 font-medium focus-ring-primary rounded"
          >
            Política de Privacidad
            <span className="sr-only"> (se abre en nueva ventana)</span>
          </Link>{" "}
          de Eskemma.
        </p>

        <p className="text-[16px] text-black-eske-20 text-center mb-6">
          Por favor, marca la casilla de aceptación en el formulario de registro para continuar.
        </p>

        {/* Botón Entendido */}
        <Button
          label="ENTENDIDO"
          variant="primary"
          onClick={onClose}
        />
      </div>
    </div>
  );
}