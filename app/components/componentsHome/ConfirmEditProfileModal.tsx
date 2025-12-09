// components/componentsHome/ConfirmEditProfileModal.tsx
"use client";
import { useRouter } from "next/navigation";
import Button from "../Button";

export default function ConfirmEditProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  // Redirigir al usuario a la última página visitada
  const handleAccept = () => {
    const lastVisitedPage = localStorage.getItem("lastVisitedPage") || "/";
    router.push(lastVisitedPage);
    onClose(); // Cerrar el modal
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-md p-4 relative">
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

        {/* Contenido del Modal */}
        <h2 className="text-xl font-medium text-bluegreen-eske text-center mb-6">
          Perfil actualizado correctamente
        </h2>

        {/* Contenedor del Botón Centrado */}
        <div className="flex justify-center">
          <Button
            label="ACEPTAR"
            variant="primary"
            onClick={handleAccept}
          />
        </div>
      </div>
    </div>
  );
}