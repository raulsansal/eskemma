"use client"; // Indica que este es un Client Component

import { useState } from "react";

// Definir el tipo del estado de errores
type Errors = {
  [key: string]: string | undefined; // Permitir que los valores sean 'string' o 'undefined'
};

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  topic: string;
  dateTime: string;
  file?: File | null;
}

interface ScheduleDateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (data: { fullName: string; email: string; dateTime: string }) => void; // Tipar correctamente
}

export default function ScheduleDate({ isOpen, onClose, onSubmitSuccess }: ScheduleDateProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    topic: "",
    dateTime: "",
    file: null,
  });

  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Limpiar errores previos mientras el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, file }));
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Introduce un correo electrónico válido.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono de contacto es requerido.";
    } else if (!/^\+?[0-9]{7,15}$/.test(formData.phone)) {
      newErrors.phone =
        "Introduce un número de teléfono válido (mínimo 7 dígitos).";
    }

    if (!formData.topic.trim()) {
      newErrors.topic = "El tema de interés es requerido.";
    }

    if (!formData.dateTime.trim()) {
      newErrors.dateTime = "La fecha y hora son requeridas.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Datos del formulario:", formData);

      // Notificar al padre que el formulario fue enviado correctamente
      onSubmitSuccess({
        fullName: formData.fullName,
        email: formData.email,
        dateTime: formData.dateTime,
      });

      // Cerrar el modal de agendar asesoría
      onClose();
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
        <h2 className="text-[24px] font-bold text-bluegreen-eske text-center mb-6">
          Agendar asesoría
        </h2>

        {/* Descripción */}
        <p className="text-[16px] text-gray-700 font-semibold text-center mb-4">
          Sesión de 30 minutos de asesoría gratuita en línea.
        </p>

        <p className="text-[16px] text-gray-700 text-center mb-6">
          Para agendar, favor de llenar el siguiente formulario:
        </p>

        {/* Contenedor con scroll */}
        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre completo */}
            <div>
              <label
                className="block text-left text-[16px] font-medium text-gray-700 mb-1"
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
                className={`w-full px-3 py-2 border ${
                  errors.fullName ? "border-red-60" : "border-gray-300"
                } rounded focus:outline-none focus:border-blue-eske`}
              />
              {errors.fullName && (
                <p className="text-[8px] text-red-60 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-left text-[16px] font-medium text-gray-700 mb-1"
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
                required
                className={`w-full px-3 py-2 border ${
                  errors.email ? "border-red-60" : "border-gray-300"
                } rounded focus:outline-none focus:border-blue-eske`}
              />
              {errors.email && (
                <p className="text-[8px] text-red-60 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Teléfono de contacto */}
            <div>
              <label
                className="block text-left text-[16px] font-medium text-gray-700 mb-1"
                htmlFor="phone"
              >
                Teléfono de contacto
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="^\+?[0-9]{7,15}$"
                title="Introduce un número de teléfono válido (mínimo 7 dígitos)."
                className={`w-full px-3 py-2 border ${
                  errors.phone ? "border-red-60" : "border-gray-300"
                } rounded focus:outline-none focus:border-blue-eske`}
              />
              {errors.phone && (
                <p className="text-[8px] text-red-60 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Tema de interés */}
            <div>
              <label
                className="block text-left text-[16px] font-medium text-gray-700 mb-1"
                htmlFor="topic"
              >
                Tema de interés
              </label>
              <textarea
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                rows={4}
                required
                className={`w-full px-3 py-2 border ${
                  errors.topic ? "border-red-60" : "border-gray-300"
                } rounded focus:outline-none focus:border-blue-eske resize-none`}
              />
              {errors.topic && (
                <p className="text-[8px] text-red-60 mt-1">{errors.topic}</p>
              )}
            </div>

            {/* Fecha y hora */}
            <div>
              <label
                className="block text-left text-[16px] font-medium text-gray-700 mb-1"
                htmlFor="dateTime"
              >
                Seleccionar fecha y hora
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-eske"
                />
              </div>
              {errors.dateTime && (
                <p className="text-[8px] text-red-60 mt-1">{errors.dateTime}</p>
              )}
            </div>

            {/* Adjuntar documento (opcional) */}
            <div>
              <label
                className="block text-left text-[16px] font-medium text-gray-700 mb-1"
                htmlFor="file"
              >
                Adjuntar documento (opcional)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="flex items-center space-x-2 cursor-pointer bg-gray-100 px-3 py-2 rounded border border-gray-300 hover:bg-gray-200 transition-colors duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L19 15"
                    />
                  </svg>
                  <span className="text-10px text-gray-700">
                    {formData.file ? formData.file.name : "Seleccionar archivo"}
                  </span>
                </label>
              </div>
            </div>

            {/* Botón AGENDAR */}
            <button
              type="submit"
              className="w-full bg-bluegreen-eske text-white-eske py-2 rounded hover:bg-bluegreen-eske-60 transition-colors duration-300"
            >
              AGENDAR
            </button>

            {/* Términos y condiciones */}
            <p className="text-[14px] text-gray-700 text-center mt-4">
              Consultar{" "}
              <a
                href="/terminos-y-condiciones"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-eske underline"
              >
                términos y condiciones de las asesorías en línea.
              </a>
            </p>

            {/* Condiciones de uso y política de privacidad */}
            <p className="text-[14px] text-gray-700 text-center mt-2">
              Al agendar la cita acepto las{" "}
              <a
                href="/condiciones-de-uso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-eske underline"
              >
                condiciones de uso
              </a>{" "}
              y{" "}
              <a
                href="/politica-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-eske underline"
              >
                política de privacidad
              </a>{" "}
              de Eskemma.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}