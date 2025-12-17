// components/CompleteRegisterModal.tsx
"use client";
import { useAuth } from "../../../context/AuthContext";
import Button from "../Button";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useEscapeKey } from "../../hooks/useEscapeKey";

export default function CompleteRegisterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isCompleteRegisterModalOpen, setIsRegisterModalOpen } = useAuth();

  // Hooks de accesibilidad
  const modalRef = useFocusTrap(isOpen || isCompleteRegisterModalOpen);
  useEscapeKey(isOpen || isCompleteRegisterModalOpen, onClose);

  // Usar tanto la prop isOpen como el estado del contexto
  if (!isOpen && !isCompleteRegisterModalOpen) return null;

  const handleContinue = () => {
    setIsRegisterModalOpen(true); // Abrir el modal RegisterModal
    onClose(); // Cerrar el modal CompleteRegisterModal
  };

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
        aria-labelledby="complete-register-title"
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
        <h2 id="complete-register-title" className="text-2xl font-bold text-bluegreen-eske text-center mb-6">
          ¡Correo verificado con éxito!
        </h2>

        {/* Mensaje */}
        <p className="text-[18px] text-black-eske text-center mb-6">
          ¡Gracias por verificar tu correo electrónico!
        </p>
        <p className="text-[18px] text-black-eske text-center mb-6">
          Ahora puedes completar tu registro proporcionando información adicional de tu perfil.
        </p>

        {/* Botón Continuar */}
        <Button
          label="CONTINUAR"
          variant="primary"
          onClick={handleContinue}
        />
      </div>
    </div>
  );
}
