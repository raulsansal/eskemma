// components/componentsHome/LoginModal.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

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
  const { loginUser, signInWithGoogle, signInWithFacebook, setIsLoginModalOpen } =
    useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Limpiar el formulario cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setFormData({ username: "", password: "" });
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Limpiar cualquier error anterior

    try {
      // Usar loginUser del contexto
      await loginUser(formData.username, formData.password);
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error.message);
      console.log("Error recibido en LoginModal:", {
        code: error.code,
        message: error.message,
      });
      // Mostrar mensaje de error basado en el mensaje recibido
      setError(
        error.message === "Nombre de usuario o contraseña incorrectos."
          ? error.message
          : "Ocurrió un error al iniciar sesión. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div
        className="bg-white-eske rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-y-auto max-h-[80vh]"
        style={{ marginTop: "20px" }}
      >
        {/* Botón de Cierre */}
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-red-eske transition-colors duration-300"
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

        {/* Botón de Google */}
        <button
          onClick={signInWithGoogle}
          className="w-full bg-red-500 text-white py-2 rounded mb-4 hover:bg-red-600 transition-colors duration-300"
        >
          INICIAR SESIÓN CON GOOGLE
        </button>

        {/* Botón de Facebook */}
        <button
          onClick={signInWithFacebook}
          className="w-full bg-blue-700 text-white py-2 rounded mb-4 hover:bg-blue-800 transition-colors duration-300"
        >
          INICIAR SESIÓN CON FACEBOOK
        </button>

        {/* Separador */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500">O</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Formulario de inicio de sesión con correo electrónico */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[18px] font-medium text-black-eske mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
            />
          </div>

          <div>
            <label className="block text-[18px] font-medium text-black-eske mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-[18px] bg-bluegreen-eske text-white-eske py-2 rounded transition-colors duration-300 ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-bluegreen-eske-60"
            }`}
          >
            {loading ? "Cargando..." : "INICIAR SESIÓN"}
          </button>

          <p className="text-[14px] mt-4 text-black-eske text-center">
            Al iniciar sesión acepto las{" "}
            <Link
              href="/condiciones-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bluegreen-eske underline"
            >
              condiciones de uso
            </Link>{" "}
            y{" "}
            <Link
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bluegreen-eske underline"
            >
              políticas de privacidad
            </Link>{" "}
            de Eskemma.
          </p>

          <hr className="border-gray-300 my-4" />

          <p className="text-[14px] text-gray-700 text-center">
            ¿Aún no te has registrado?{" "}
            <span
              className="text-bluegreen-eske underline cursor-pointer"
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

          <p className="text-[14px] text-black-eske text-center">
            ¿No recuerdas tu contraseña?{" "}
            <Link
              href="/recuperar-contraseña"
              className="text-bluegreen-eske underline"
            >
              Recuperar contraseña
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}