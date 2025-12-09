// app/contact/page.tsx

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";

export default function ContactoPage() {
  const { user, setIsSignInModalOpen, setIsLoginModalOpen } = useAuth();

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // ✅ Verificar si el usuario está autenticado con roles válidos
  const isAuthenticatedUser =
    user &&
    [
      "visitor",
      "registered",
      "user",
      "basic",
      "premium",
      "grupal",
      "unsubscribed-basic",
      "unsubscribed-premium",
      "unsubscribed-grupal",
      "expired",
      "admin",
    ].includes(user.role || "");

  // ✅ Prellenar datos si el usuario está autenticado (solo la primera vez)
  useEffect(() => {
    if (isAuthenticatedUser && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    } else {
      // Limpiar campos si el usuario cierra sesión
      setFormData((prev) => ({
        ...prev,
        name: "",
        email: "",
      }));
    }
  }, [user?.uid]); // ✅ Solo se ejecuta cuando cambia el usuario (login/logout)

  // Manejar cambios en el formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setSubmitStatus({
        type: "error",
        message: "Por favor, completa todos los campos.",
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: "error",
        message: "Por favor, ingresa un correo electrónico válido.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      console.log("📤 Enviando mensaje a la API...");

      // ✅ ENVIAR A LA API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          userId: user?.uid || null,
          userRole: user?.role || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al enviar el mensaje");
      }

      console.log("✅ Mensaje guardado con ID:", data.messageId);

      setSubmitStatus({
        type: "success",
        message: "¡Mensaje enviado exitosamente! Te responderemos pronto.",
      });

      // Limpiar solo el mensaje (mantener nombre y email)
      setFormData((prev) => ({
        ...prev,
        message: "",
      }));

      // Hacer scroll hacia arriba para que vean el mensaje de éxito
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("❌ Error al enviar mensaje:", error);
      setSubmitStatus({
        type: "error",
        message:
          error.message ||
          "Ocurrió un error al enviar el mensaje. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Abrir modal de registro (SignInModal)
  const handleOpenSignUp = () => {
    setIsSignInModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-white-eske">
      {/* Hero Section - Responsiva */}
      <section className="relative h-[250px] sm:h-[200px] md:h-[200px] w-full flex items-center bg-bluegreen-eske overflow-hidden">
        {/* Imagen de Fondo */}
        <Image
          src="/images/yanmin_yang.jpg"
          alt="Hero Background"
          fill
          style={{ objectFit: "cover" }}
          className="absolute inset-0 z-0"
          priority
        />

        {/* Overlay con opacidad */}
        <div className="absolute inset-0 bg-bluegreen-eske opacity-75 z-10"></div>

        {/* Contenedor Principal */}
        <div className="relative z-20 w-full max-w-screen-xl mx-auto flex items-center h-full">
          {/* Imagen de Persona Sonriendo (Izquierda) - Solo en desktop */}
          <div className="hidden md:block md:w-1/2 relative h-full">
            <Image
              src="/images/womanContact.jpg"
              alt="Persona Sonriendo"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
              priority
            />
          </div>

          {/* Contenido del Hero (Derecha en desktop, centrado en móvil) */}
          <div className="w-full md:w-1/2 px-4 sm:px-6 md:px-8 flex flex-col justify-center text-center md:text-left py-4">
            <h1 className="text-2xl sm:text-[26px] md:text-[28px] leading-tight font-bold text-white-eske">
              Estamos aquí para escucharte
            </h1>
            <p className="mt-2 text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-light text-white-eske">
              Facilitamos tu contacto con nosotros.{" "}
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Resolvemos tus dudas y construimos juntos.
            </p>
          </div>
        </div>
      </section>

      {/* Sección: ¿Para qué puedes contactarnos? */}
      <section className="bg-gray-eske-10 py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-8">
            ¿Para qué puedes contactarnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Item 1 */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/icons/icon_Consultoria.svg"
                alt="Consultoría Política"
                width={60}
                height={60}
                className="mb-4 transition-transform duration-300 ease-in-out hover:scale-130"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Contratar Servicios
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Si deseas contratar nuestros servicios.
              </p>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/icons/icon_Info.svg"
                alt="Pedir Información"
                width={60}
                height={60}
                className="mb-4 transition-transform duration-300 ease-in-out hover:scale-130"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Pedir Información
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Para resolver dudas sobre nuestros productos o servicios.
              </p>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/icons/icon_Blog.svg"
                alt="Publicar en el Blog"
                width={60}
                height={60}
                className="mb-4 transition-transform duration-300 ease-in-out hover:scale-130"
              />
              <h3 className="text-xl font-semibold text-bluegreen-eske mb-2">
                Publicar en el Blog
              </h3>
              <p className="text-[16px] font-light text-gray-eske-90">
                Si tienes contenido relevante para nuestro blog.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: ¿Cómo puedes contactarnos? */}
      <section className="bg-white-eske py-12 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-semibold text-center text-bluegreen-eske mb-8">
            ¿Cómo puedes contactarnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Datos de Contacto */}
            <div className="space-y-4">
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">Teléfono:</span>{" "}
                +52 55 5555 5555
              </p>
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">Email:</span>{" "}
                contacto@eskemma.com
              </p>
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">
                  Dirección:
                </span>{" "}
                Av. Reforma #222, CDMX, México
              </p>
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">
                  Horario de Atención:
                </span>{" "}
                Lunes a Viernes, 9:00 - 18:00
              </p>
              <p className="text-lg font-light text-black-eske">
                <span className="font-bold text-bluegreen-eske">
                  Tiempo de Respuesta:
                </span>{" "}
                24 horas hábiles
              </p>
            </div>

            {/* Formulario */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-2xl font-semibold text-bluegreen-eske mb-4">
                  Escríbenos
                </h3>

                {/* ✅ Mensaje de éxito/error global */}
                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${
                      submitStatus.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {submitStatus.message}
                    </p>
                  </div>
                )}

                {/* Campo: Nombre */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-black-eske font-medium mb-1"
                  >
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-bluegreen-eske focus:ring focus:ring-bluegreen-eske-20 px-3 py-2 transition-colors bg-white"
                    placeholder="Tu nombre completo"
                  />
                  {/* ✅ Mensaje informativo para usuarios autenticados */}
                  {isAuthenticatedUser && formData.name && (
                    <p className="text-xs text-gray-400 mt-1">
                      ℹ️ Prellenado con tu información de perfil (puedes
                      editarlo)
                    </p>
                  )}
                </div>

                {/* Campo: Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-black-eske font-medium mb-1"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-bluegreen-eske focus:ring focus:ring-bluegreen-eske-20 px-3 py-2 transition-colors bg-white"
                    placeholder="tu@email.com"
                  />
                  {/* ✅ Mensaje informativo para usuarios autenticados */}
                  {isAuthenticatedUser && formData.email && (
                    <p className="text-xs text-gray-400 mt-1">
                      ℹ️ Prellenado con tu información de perfil (puedes
                      editarlo)
                    </p>
                  )}
                </div>

                {/* Campo: Mensaje */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-black-eske font-medium mb-1"
                  >
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-bluegreen-eske focus:ring focus:ring-bluegreen-eske-20 px-3 py-2"
                    placeholder="Escribe tu mensaje aquí..."
                  ></textarea>
                </div>

                {/* ✅ Mensaje para usuarios NO autenticados */}
                {!isAuthenticatedUser && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-center">
                    <p className="text-sm text-blue-800">
                      ¿No tienes cuenta?{" "}
                      <button
                        type="button"
                        onClick={handleOpenSignUp}
                        className="text-bluegreen-eske font-semibold underline hover:text-bluegreen-eske-70 transition-colors"
                      >
                        Regístrate aquí
                      </button>
                    </p>
                  </div>
                )}

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-eske text-white-eske px-6 py-3 rounded-lg font-medium hover:bg-orange-eske-70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "ENVIANDO..." : "ENVIAR MENSAJE"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

