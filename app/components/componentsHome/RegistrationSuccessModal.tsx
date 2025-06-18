// components/componentsHome/RegistrationSuccessModal.tsx
"use client";
import { useAuth } from "../../../context/AuthContext";

export default function RegistrationSuccessModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { setIsLoginModalOpen } = useAuth(); // Función para abrir el modal de inicio de sesión

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="bg-white-eske rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Botón de Cierre */}
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-red-eske transition-colors duration-300"
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
          ¡Registro completado con éxito!
        </h2>

        {/* Mensaje */}
        <p className="text-[16px] text-black-eske font-semibold text-center mb-6">
          ¡Gracias por completar el Registro!
        </p>
        <p className="text-[16px] text-black-eske text-center mb-6">
          Ya puedes iniciar sesión y comenzar a explorar el ecosistema digital para tu proyecto político.
        </p>

        {/* Botón Iniciar Sesión */}
        <button
          onClick={() => {
            onClose(); // Cerrar el modal actual
            setIsLoginModalOpen(true); // Abrir el modal de inicio de sesión
          }}
          className="w-full bg-bluegreen-eske text-white-eske py-2 rounded hover:bg-bluegreen-eske-70 transition-colors duration-300"
        >
          INICIAR SESIÓN
        </button>
      </div>
    </div>
  );
}