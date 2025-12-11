// components/componentsHome/LoginModal.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import Button from "../Button";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  onOpenRegisterModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterModal: () => void;
}) {
  const { loginUser, signInWithGoogle, setIsLoginModalOpen } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ username: "", password: "" });
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.username.trim()) {
        throw new Error("El nombre de usuario o correo es obligatorio.");
      }

      await loginUser(formData.username, formData.password);
      onClose();
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error.message);

      if (error.message.includes("registrado con Google") || 
          error.message.includes("contraseña configurada")) {
        setError(
          "Este usuario se registró con Google. Por favor, usa el botón de 'Iniciar sesión con Google' a continuación."
        );
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    
    signInWithGoogle()
      .then(() => {
        onClose();
      })
      .catch((error: any) => {
        console.error("Error al iniciar sesión con Google:", error.message);
        setError(
          "Ocurrió un error al iniciar sesión con Google. Inténtalo de nuevo."
        );
      });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-md p-6 relative overflow-y-auto max-h-[80vh]">
        {/* Botón de Cierre */}
        <button
          className="absolute top-4 right-4 text-black-eske hover:text-red-eske transition-colors duration-300"
          onClick={() => {
            onClose();
            setError(null);
            setFormData({ username: "", password: "" });
          }}
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
          Iniciar sesión
        </h2>

        {/* Formulario de inicio de sesión */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[16px] font-medium text-black-eske mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Correo o nombre de usuario"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
            />
          </div>

          <div>
            <label className="block text-[16px] font-medium text-black-eske mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Contraseña"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
            />
          </div>

          {/* Mensaje de error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Botón de inicio de sesión - CORREGIDO: agregado type="submit" */}
          <Button
            label={loading ? "CARGANDO..." : "INICIAR SESIÓN"}
            variant="primary"
            disabled={loading}
            type="submit"
          />
        </form>

        {/* Separador */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500">O</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Mensaje informativo */}
        <p className="text-[14px] text-black-eske text-center mb-3 px-2">
          <span className="font-medium text-bluegreen-eske">
            ¿Te registraste con tu cuenta de Google?
          </span>
          <br />
          Inicia sesión con el siguiente botón.
        </p>

        {/* Botón de inicio de sesión con Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full text-[16px] bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          INICIAR SESIÓN CON GOOGLE
        </button>

        {/* Enlaces adicionales */}
        <p className="text-[14px] mt-4 text-black-eske text-center">
          Al iniciar sesión acepto las{" "}
          <Link
            href="/condiciones-de-uso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bluegreen-eske underline hover:text-bluegreen-eske-70"
          >
            condiciones de uso
          </Link>{" "}
          y{" "}
          <Link
            href="/politica-de-privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bluegreen-eske underline hover:text-bluegreen-eske-70"
          >
            políticas de privacidad
          </Link>{" "}
          de Eskemma.
        </p>

        {/* Enlace para registrarse */}
        <hr className="border-gray-300 my-4" />

        <p className="text-[14px] text-black-eske text-center">
          ¿Aún no te has registrado?{" "}
          <span
            className="text-bluegreen-eske underline cursor-pointer hover:text-bluegreen-eske-70"
            onClick={() => {
              onClose();
              onOpenRegisterModal();
              setError(null);
              setFormData({ username: "", password: "" });
            }}
          >
            Registrarme
          </span>
        </p>

        {/* Enlace para recuperar contraseña */}
        <p className="text-[14px] text-black-eske text-center mt-2">
          ¿No recuerdas tu contraseña?{" "}
          <button
            onClick={() => {
              onClose();
              window.location.href = "/recover-password";
            }}
            className="text-bluegreen-eske underline cursor-pointer hover:text-bluegreen-eske-70 bg-transparent border-none p-0"
          >
            Recuperar contraseña
          </button>
        </p>
      </div>
    </div>
  );
}