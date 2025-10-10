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
  const { loginUser, setIsLoginModalOpen } = useAuth();
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
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // En el handleSubmit del LoginModal, actualiza el manejo de errores:
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
      setError(error.message); // Usa el mensaje específico de la función loginUser
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
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-y-auto max-h-[80vh]"
        style={{ marginTop: "20px" }}
      >
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-red-500 transition-colors duration-300"
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

        <h2 className="text-2xl font-bold text-bluegreen-eske text-center mb-6">
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[18px] font-medium text-black mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[18px] font-medium text-black mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-[18px] bg-bluegreen-eske text-white-eske py-2 rounded hover:bg-bluegreen-eske-70 transition-colors duration-300 cursor-pointer"              
            }`}
          >
            {loading ? "Cargando..." : "INICIAR SESIÓN"}
          </button>

          <p className="text-[14px] mt-4 text-black text-center">
            Al iniciar sesión acepto las{" "}
            <Link
              href="/condiciones-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              condiciones de uso
            </Link>{" "}
            y{" "}
            <Link
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              políticas de privacidad
            </Link>{" "}
            de Eskemma.
          </p>

          <hr className="border-gray-300 my-4" />

          <p className="text-[14px] text-gray-700 text-center">
            ¿Aún no te has registrado?{" "}
            <span
              className="text-blue-600 underline cursor-pointer"
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

          <p className="text-[14px] text-black text-center">
            ¿No recuerdas tu contraseña?{" "}
            <button
              onClick={() => {
                onClose();
                window.location.href = "/recover-password";
              }}
              className="text-blue-600 underline cursor-pointer"
            >
              Recuperar contraseña
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
