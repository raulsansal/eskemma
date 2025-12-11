// components/componentsHome/SignInModal.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
import VerifyEmailModal from "./VerifyEmailModal";
import AcceptTermsModal from "./AcceptTermsModal";
import Button from "../Button";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal: () => void;
}

export default function SignInModal({ isOpen, onClose, onOpenLoginModal }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isAcceptTermsModalOpen, setIsAcceptTermsModalOpen] = useState(false); // NUEVO: Estado para modal de términos

  const {
    registerUser,
    signInWithGoogle,
    isVerifyEmailModalOpen,
    setIsVerifyEmailModalOpen,
    setIsSignInModalOpen,
  } = useAuth();

  const isEmailAlreadyRegistered = async (email: string): Promise<boolean> => {
    const auth = getAuth();
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      return false;
    }
  };

  const validateForm = async () => {
    if (!email.includes("@")) {
      alert("Por favor, ingresa un correo electrónico válido.");
      return false;
    }

    if (password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return false;
    }

    // Validar aceptación de términos - AHORA con modal
    if (!acceptedTerms) {
      setIsAcceptTermsModalOpen(true); // Mostrar modal en lugar de alert
      return false;
    }

    const isRegistered = await isEmailAlreadyRegistered(email);
    if (isRegistered) {
      alert("Este correo ya está registrado. Intenta iniciar sesión.");
      return false;
    }

    return true;
  };

  const handleRegisterWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await validateForm())) return;

    try {
      await registerUser(email, password);
      onClose();
    } catch (error: any) {
      console.error("Error al registrar usuario:", error.message);

      if (error.code === "auth/weak-password") {
        alert("La contraseña es demasiado débil. Usa al menos 6 caracteres.");
      } else {
        alert("Error al registrar usuario. Inténtalo de nuevo.");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    // Validar aceptación de términos antes de Google Sign In - AHORA con modal
    if (!acceptedTerms) {
      setIsAcceptTermsModalOpen(true); // Mostrar modal en lugar de alert
      return;
    }

    try {
      setIsSignInModalOpen(false);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Error al registrar con Google:", error.message);
      alert("Error al registrar con Google. Inténtalo de nuevo.");
    }
  };

  const handleLoginClick = () => {
    onClose();
    onOpenLoginModal();
  };

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setAcceptedTerms(false);
    }
  }, [isOpen]);

  if (!isOpen && !isVerifyEmailModalOpen) return null;

  return (
    <>
      {/* Modal de Registro */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isOpen ? "" : "hidden"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <div
          className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-md p-6 relative overflow-y-auto max-h-[80vh]"
          style={{ marginTop: "20px" }}
        >
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
            Registro
          </h2>

          {/* Contenedor con scroll */}
          <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
            {/* Botón de Google */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-red-500 text-white py-2 rounded mb-4 hover:bg-red-600 transition-colors duration-300"
            >
              REGISTRARME CON GOOGLE
            </button>

            {/* Separador */}
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-gray-500">O</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <form onSubmit={handleRegisterWithEmail} className="space-y-4">
              {/* Correo Electrónico */}
              <div>
                <label className="block text-[16px] font-medium text-black-eske mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-[16px] font-medium text-black-eske mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
                />
              </div>

              {/* Checkbox de aceptación de términos */}
              <div className="flex items-start gap-2 mt-4">
                <input
                  type="checkbox"
                  id="acceptTermsSignIn"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 accent-bluegreen-eske"
                  required
                />
                <label htmlFor="acceptTermsSignIn" className="text-[14px] text-black-eske">
                  Acepto las{" "}
                  <Link
                    href="/condiciones-de-uso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bluegreen-eske underline hover:text-bluegreen-eske-70"
                  >
                    Condiciones de Uso
                  </Link>
                  {" "}y la{" "}
                  <Link
                    href="/politica-de-privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bluegreen-eske underline hover:text-bluegreen-eske-70"
                  >
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              {/* Botón Registrar */}
              <Button
                label="REGISTRARME"
                variant="primary"
                type="submit"
                disabled={!acceptedTerms}
              />

              {/* Separador */}
              <hr className="border-gray-300 my-4" />

              {/* Iniciar Sesión */}
              <p className="text-[16px] text-black-eske text-center">
                ¿Ya te has registrado?{" "}
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="text-bluegreen-eske-60 underline cursor-pointer bg-transparent border-none p-0 hover:text-bluegreen-eske"
                >
                  Inicia sesión
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Verificación de Correo */}
      <VerifyEmailModal
        isOpen={isVerifyEmailModalOpen}
        onClose={() => setIsVerifyEmailModalOpen(false)}
      />

      {/* NUEVO: Modal de Aceptación de Términos */}
      <AcceptTermsModal
        isOpen={isAcceptTermsModalOpen}
        onClose={() => setIsAcceptTermsModalOpen(false)}
      />
    </>
  );
}