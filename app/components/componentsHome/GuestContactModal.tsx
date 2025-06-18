import { useState } from "react";

interface GuestContactFormData {
  fullName: string;
  email: string;
  message: string;
}

export default function GuestContactModal({
  isOpen,
  onClose,
  onOpenLoginModal, // Función para abrir el modal de inicio de sesión
  onOpenRegisterModal, // Función para abrir el modal de registro
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal: () => void; // Prop para abrir el modal de inicio de sesión
  onOpenRegisterModal: () => void; // Prop para abrir el modal de registro
}) {
  const [formData, setFormData] = useState<GuestContactFormData>({
    fullName: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<{ email?: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validación específica para el campo 'fullName' (permite letras, acentos, diéresis, espacios y ñ)
    if (name === "fullName") {
      const isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value);
      if (!isValid) return; // Si no es válido, no actualizamos el estado
    }

    // Limpiar errores previos mientras el usuario escribe
    if (name === "email" && errors.email) {
      setErrors({ ...errors, email: undefined });
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      setErrors({ ...errors, email: "Introduce un correo electrónico válido." });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar el correo electrónico antes de enviar el formulario
    if (!validateEmail(formData.email)) {
      return;
    }

    // Aquí puedes agregar la lógica para enviar el mensaje al servidor
    console.log("Datos del formulario de contacto:", formData);
    onClose(); // Cerrar el modal después de enviar
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
        <h2 className="text-3xl font-bold text-bluegreen-eske text-center mb-6">
          Contacto
        </h2>

        {/* Texto de invitación */}
        <p className="text-[16px] text-black-eske text-center mb-4">
          Te invitamos a registrarte en la comunidad de Eskemma
        </p>

        {/* Enlace "Registrarme" */}
        <p className="text-center mb-6 text-[16px]">
          <button
            className="text-bluegreen-eske underline focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              onClose(); // Cerrar el modal de contacto
              onOpenRegisterModal(); // Abrir el modal de registro
            }}
          >
            Registrarme
          </button>
        </p>

        {/* Contenedor con scroll */}
        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre completo */}
            <div>
              <label
                className="block text-[16px] font-medium text-black-eske mb-1"
                htmlFor="fullName"
              >
                Nombre completo
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                title="Introduce tu nombre completo, incluyendo acentos y espacios."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
              />
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-[16px] font-medium text-black-eske mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => validateEmail(formData.email)} // Validar cuando el campo pierde el foco
                required
                title="Introduce un correo electrónico válido."
                className={`w-full px-3 py-2 border ${
                  errors.email ? "border-red-60" : "border-gray-300"
                } rounded focus:outline-none focus:border-blue-eske`}
              />
              {errors.email && (
                <p className="text-8px text-red-60 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Mensaje */}
            <div>
              <label
                className="block text-[16px] font-medium text-black-eske mb-1"
                htmlFor="message"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4} // Altura inicial moderada
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske resize-none" // Desactivar el resize manual
              />
            </div>

            {/* Botón Enviar */}
            <button
              type="submit"
              className="w-full bg-white-eske text-black-eske text-medium py-2 rounded border border-gray-300 hover:bg-bluegreen-eske hover:text-white-eske transition-colors duration-300 cursor-pointer"
            >
              ENVIAR
            </button>

            {/* Separador */}
            <hr className="border-gray-300 my-4" />

            {/* Enlace "¿Ya te has registrado?" */}
            <p className="text-[14px] text-black-eske text-center">
              ¿Ya te has registrado?{" "}
              <button
                className="text-bluegreen-eske underline focus:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  onClose(); // Cerrar el modal de contacto
                  onOpenLoginModal(); // Abrir el modal de inicio de sesión
                }}
              >
                Inicia Sesión
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}