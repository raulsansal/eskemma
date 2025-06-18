// components/CompleteRegisterModal.tsx
"use client";
import { useAuth } from "../../../context/AuthContext"; // Importar el contexto de autenticación

export default function CompleteRegisterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { setIsRegisterModalOpen } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="bg-white-eske rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Botón de Cierre */}
        <button
          className="absolute top-4 right-4 text-black-eske hover:text-red-eske transition-colors duration-300"
          onClick={onClose}
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
        <h2 className="text-2xl font-bold text-bluegreen-eske text-center mb-6">
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
        <button
          onClick={() => {
            setIsRegisterModalOpen(true); // Abrir el modal RegisterModal
            onClose(); // Cerrar el modal CompleteRegisterModal
          }}
          className="w-full bg-bluegreen-eske text-white-eske py-2 rounded hover:bg-bluegreen-eske-6070 transition-colors duration-300 cursor-pointer"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  );
}