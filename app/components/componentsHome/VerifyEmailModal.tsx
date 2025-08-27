// components/VerifyEmailModal.tsx
"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmailModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, isVerifyEmailModalOpen, setIsVerifyEmailModalOpen } = useAuth();
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  // Función para reenviar el correo de verificación
  const handleResendVerificationEmail = async () => {
    if (!user || !user.email) {
      alert(
        "No se pudo encontrar tu cuenta. Intenta iniciar sesión nuevamente."
      );
      onClose();
      return;
    }

    try {
      setIsResendingEmail(true);
      await sendEmailVerification(user); // Cambio aquí: usamos sendEmailVerification(user)
      alert(
        "Correo de verificación reenviado. Por favor, revisa tu bandeja de entrada."
      );
    } catch (error: any) {
      console.error(
        "Error al reenviar el correo de verificación:",
        error.message
      );

      if (error.code === "auth/too-many-requests") {
        alert("Demasiados intentos recientes. Inténtalo de nuevo más tarde.");
      } else {
        alert(
          "Error al reenviar el correo de verificación. Inténtalo de nuevo."
        );
      }
    } finally {
      setIsResendingEmail(false);
    }
  };

  if (!isOpen && !isVerifyEmailModalOpen) return null;

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
          ¡Registro exitoso!
        </h2>

        {/* Mensaje */}
        <p className="text-[18px] text-black-eske text-center mb-6">
          Hemos enviado un correo de verificación a tu dirección de email.
        </p>
        <p className="text-[16px] text-black-eske text-center mb-6">
          {" "}
          Por favor, revisa tu bandeja de entrada (o en tu carpeta de correos no
          deseados) y haz clic en el enlace que te hemos enviado para continuar
          con tu registro.
        </p>

        {/* Botón para Reenviar Correo */}
        <button
          onClick={handleResendVerificationEmail}
          disabled={isResendingEmail}
          className={`w-full bg-blue-eske text-white-eske py-2 rounded cursor-pointer hover:bg-blue-eske-60 transition-colors duration-300 ${
            isResendingEmail ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isResendingEmail
            ? "Reenviando correo..."
            : "REENVIAR CORREO DE VERIFICACIÓN"}
        </button>

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="w-full bg-bluegreen-eske text-white-eske py-2 rounded hover:bg-bluegreen-eske-70 transition-colors duration-300 mt-4"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
}
