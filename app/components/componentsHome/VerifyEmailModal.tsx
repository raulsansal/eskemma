// components/VerifyEmailModal.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { auth, db } from "../../../firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function VerifyEmailModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { 
    user, 
    isVerifyEmailModalOpen, 
    setIsVerifyEmailModalOpen,
    setIsCompleteRegisterModalOpen 
  } = useAuth();
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // Función para actualizar emailVerified en Firestore
  const updateEmailVerifiedInFirestore = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        emailVerified: true,
        updatedAt: new Date(),
      });
      console.log("Campo emailVerified actualizado en Firestore.");
    } catch (error) {
      console.error("Error al actualizar emailVerified en Firestore:", error);
    }
  };

  // Polling para verificar si el correo fue verificado
  useEffect(() => {
    if (!isOpen && !isVerifyEmailModalOpen) return;

    const checkEmailVerification = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // Recargar el usuario para obtener el estado más reciente
        await currentUser.reload();
        
        // Verificar si el correo ya fue verificado
        if (currentUser.emailVerified) {
          // Actualizar emailVerified en Firestore
          await updateEmailVerifiedInFirestore(currentUser.uid);
          
          // Cerrar este modal
          setIsVerifyEmailModalOpen(false);
          onClose();
          
          // Abrir el modal de completar registro
          setIsCompleteRegisterModalOpen(true);
        }
      } catch (error) {
        console.error("Error al verificar el estado del correo:", error);
      }
    };

    // Verificar cada 3 segundos
    const intervalId = setInterval(checkEmailVerification, 3000);

    // Limpiar el intervalo cuando el modal se cierre
    return () => clearInterval(intervalId);
  }, [isOpen, isVerifyEmailModalOpen, onClose, setIsVerifyEmailModalOpen, setIsCompleteRegisterModalOpen]);

  // Función para verificar manualmente
  const handleCheckVerification = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("No se pudo encontrar tu cuenta. Intenta iniciar sesión nuevamente.");
      return;
    }

    try {
      setIsCheckingVerification(true);
      await currentUser.reload();
      
      if (currentUser.emailVerified) {
        // Actualizar emailVerified en Firestore
        await updateEmailVerifiedInFirestore(currentUser.uid);
        
        // Cerrar este modal
        setIsVerifyEmailModalOpen(false);
        onClose();
        
        // Abrir el modal de completar registro
        setIsCompleteRegisterModalOpen(true);
      } else {
        alert("Aún no hemos detectado la verificación. Por favor, revisa tu correo y haz clic en el enlace.");
      }
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      alert("Error al verificar. Intenta de nuevo.");
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // Función para reenviar el correo de verificación
  const handleResendVerificationEmail = async () => {
    if (!user || !user.email) {
      alert("No se pudo encontrar tu cuenta. Intenta iniciar sesión nuevamente.");
      onClose();
      return;
    }

    try {
      setIsResendingEmail(true);
      await sendEmailVerification(user);
      alert("Correo de verificación reenviado. Por favor, revisa tu bandeja de entrada.");
    } catch (error: any) {
      console.error("Error al reenviar el correo de verificación:", error.message);

      if (error.code === "auth/too-many-requests") {
        alert("Demasiados intentos recientes. Inténtalo de nuevo más tarde.");
      } else {
        alert("Error al reenviar el correo de verificación. Inténtalo de nuevo.");
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
      <div className="bg-white-eske rounded-lg shadow-lg w-full max-w-md p-6 relative">
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
          Por favor, revisa tu bandeja de entrada (o en tu carpeta de correos no
          deseados) y haz clic en el enlace que te hemos enviado para continuar
          con tu registro.
        </p>

        {/* Indicador de verificación automática */}
        <div className="bg-blue-100 border-l-4 border-blue-eske p-3 mb-4">
          <p className="text-sm text-blue-800">
            🔄 Verificando automáticamente cada 3 segundos...
          </p>
        </div>

        {/* Botón para verificar manualmente */}
        <button
          onClick={handleCheckVerification}
          disabled={isCheckingVerification}
          className={`w-full bg-bluegreen-eske text-white-eske py-2 rounded cursor-pointer hover:bg-bluegreen-eske-70 transition-colors duration-300 mb-3 ${
            isCheckingVerification ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isCheckingVerification ? "VERIFICANDO..." : "YA VERIFIQUÉ MI CORREO"}
        </button>

        {/* Botón para Reenviar Correo */}
        <button
          onClick={handleResendVerificationEmail}
          disabled={isResendingEmail}
          className={`w-full bg-blue-eske text-white-eske py-2 rounded cursor-pointer hover:bg-blue-eske-60 transition-colors duration-300 mb-3 ${
            isResendingEmail ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isResendingEmail ? "Reenviando..." : "REENVIAR CORREO"}
        </button>

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-black-eske py-2 rounded hover:bg-gray-400 transition-colors duration-300"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
}