// app/newsletter/unsubscribe/UnsubscribeContent.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const UNSUBSCRIBE_REASONS = [
  "Recibo demasiados emails.",
  "El contenido no es lo que esperaba.",
  "Nunca me suscribí a esta lista.",
  "Prefiero seguirlos en redes sociales.",
  "El diseño de los emails no me convence.",
];

export default function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"form" | "loading" | "success">("form");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Por favor, ingresa tu email");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          reasons: selectedReasons,
          otherReason: otherReason.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);

        setTimeout(() => {
          router.push("/blog");
        }, 10000);
      } else {
        setStatus("form");
        setError(data.message || "Algo no salió bien. ¿Intentas de nuevo?");
      }
    } catch (error) {
      setStatus("form");
      setError("Hubo un problema al procesar tu solicitud");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* FORMULARIO */}
        {status === "form" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Header con diseño atractivo */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-bluegreen-eske to-bluegreen-eske-70 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
                El Baúl de Fouché
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                <span className="italic">Nous sommes désolés!</span> 😢
              </h1>
              <p className="text-xl text-gray-600 font-medium mb-2">
                Sentimos mucho que te vayas
              </p>
            </div>

            {/* Mensaje principal */}
            <div className="bg-blue-50 border-l-4 border-bluegreen-eske rounded-lg p-6 mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                Sentimos que quieras dejarnos. Ojalá podamos hacer algo para
                evitarlo. Si no es así, en cualquier caso,{" "}
                <strong>gracias por el tiempo que nos dedicaste</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Queremos pedirte un último favor: si nos cuentas{" "}
                <strong>por qué te vas</strong>, será más fácil para nosotros
                ofrecer un mejor producto a nuestros suscriptores. Y quién
                sabe... tal vez podamos hacer que te quedes con nosotros. 🤔
              </p>
            </div>

            <form onSubmit={handleUnsubscribe} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirma tu email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent transition-all"
                />
              </div>

              {/* Razones */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  ¿Por qué decides desuscribirte? (opcional, pero muy valioso
                  para nosotros)
                </p>
                <div className="space-y-2">
                  {UNSUBSCRIBE_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedReasons.includes(reason)}
                        onChange={() => handleReasonToggle(reason)}
                        className="mt-0.5 h-5 w-5 text-bluegreen-eske border-gray-300 rounded focus:ring-bluegreen-eske cursor-pointer"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                        {reason}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Otra razón */}
              <div>
                <label
                  htmlFor="otherReason"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ¿Hay algo más que quieras decirnos? 💭
                </label>
                <textarea
                  id="otherReason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Cuéntanos lo que piensas... Toda opinión es bienvenida"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tu feedback nos ayuda a mejorar. No te llevará más de un
                  minuto. 🙏
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                >
                  Confirmar cancelación
                </button>
                <Link
                  href="/blog"
                  className="flex-1 text-center border-2 border-bluegreen-eske text-bluegreen-eske font-semibold py-3 px-6 rounded-lg hover:bg-bluegreen-eske hover:text-white transition-all"
                >
                  ¡Me quedo! 🎉
                </Link>
              </div>

              {/* Nota final */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Recuerda: siempre puedes volver cuando quieras. Te estaremos
                  esperando. ❤️
                </p>
              </div>
            </form>
          </div>
        )}

        {/* LOADING */}
        {status === "loading" && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-bluegreen-eske mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Procesando tu solicitud...
            </h2>
            <p className="text-gray-600">Un momento por favor</p>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center">
              {/* Icon */}
              <div className="mb-6">
                <svg
                  className="w-20 h-20 text-orange-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Suscripción cancelada
              </h2>

              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {message}
              </p>

              {/* Mensaje final con toque personal */}
              <div className="bg-gradient-to-br from-bluegreen-eske-10 to-blue-50 border border-bluegreen-eske-30 rounded-xl p-6 mb-8">
                <p className="text-gray-800 font-medium mb-3">
                  💙 <strong>Gracias por tu contribución</strong>
                </p>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  Tu opinión nos ayuda a crear mejores contenidos para quienes
                  se quedan. Si alguna vez cambias de opinión, las puertas del
                  Baúl siempre están abiertas para ti.
                </p>
                <p className="text-gray-600 text-sm italic">
                  "Un político sabio aprende más de sus críticos que de sus
                  aduladores"
                  <span className="text-xs block mt-1">
                    - Adaptado de Fouché
                  </span>
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-500">
                  Serás redirigido al blog en 10 segundos...
                </p>
              </div>

              {/* Botones finales */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/blog"
                  className="flex-1 text-center px-6 py-3 bg-gradient-to-r from-bluegreen-eske to-bluegreen-eske-70 text-white rounded-lg hover:from-bluegreen-eske-70 hover:to-bluegreen-eske transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  Explorar el blog
                </Link>
                <Link
                  href="/blog"
                  className="flex-1 text-center border-2 border-bluegreen-eske text-bluegreen-eske font-semibold py-3 px-6 rounded-lg hover:bg-bluegreen-eske-10 transition-all"
                >
                  Volver al inicio
                </Link>
              </div>

              {/* Opción de re-suscripción */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  ¿Cambiaste de opinión?
                </p>
                <button
                  onClick={() => router.push("/blog")}
                  className="text-bluegreen-eske hover:text-bluegreen-eske-70 font-medium text-sm underline transition-colors"
                >
                  Suscribirme de nuevo →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
