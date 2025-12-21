// app/newsletter/confirm/ConfirmContent.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ConfirmContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(20);
  const hasConfirmed = useRef(false);

  useEffect(() => {
    if (hasConfirmed.current) return;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Link de confirmación inválido");
      return;
    }

    hasConfirmed.current = true;
    confirmSubscription(token);
  }, [searchParams]);

  // Countdown y cierre automático
  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.close();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status]);

  const confirmSubscription = async (token: string) => {
    try {
      const response = await fetch("/api/newsletter/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.message || "Error al confirmar suscripción");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Error al procesar la confirmación");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* LOADING */}
        {status === "loading" && (
          <div role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-bluegreen-eske mx-auto mb-6" aria-hidden="true"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Confirmando suscripción...
            </h1>
            <p className="text-gray-600">Por favor, espera un momento</p>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div role="status" aria-live="polite">
            <div className="mb-6" aria-hidden="true">
              <svg 
                className="w-20 h-20 text-green-eske mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-bluegreen-eske mb-4">
              ¡Suscripción confirmada!
            </h1>

            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {message}
            </p>

            <div className="bg-gradient-to-br from-bluegreen-eske-10 to-blue-50 border border-bluegreen-eske-30 rounded-xl p-6 mb-6">
              <p className="text-gray-800 font-medium mb-2">
                <strong>¡Te damos la bienvenida al Baúl de Fouché!</strong>
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Recibirás nuestros mejores artículos sobre análisis político, estrategia electoral y comunicación política directamente en tu correo.
              </p>
            </div>

            <div 
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
              role="note"
            >
              <p className="text-sm text-gray-700">
                <strong>Revisa tu bandeja de entrada</strong> para ver el email de bienvenida con más detalles sobre lo que puedes esperar.
              </p>
            </div>

            <div className="space-y-3">
              <p 
                className="text-sm text-gray-500"
                role="timer"
                aria-live="polite"
              >
                Esta ventana se cerrará automáticamente en <strong>{countdown}</strong> segundo{countdown !== 1 ? 's' : ''}...
              </p>
              <button
                onClick={() => window.close()}
                className="text-bluegreen-eske hover:text-bluegreen-eske-70 font-medium text-sm underline transition-colors focus-ring-primary rounded"
                aria-label="Cerrar ventana ahora"
              >
                Cerrar ahora
              </button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div role="alert" aria-live="assertive">
            <div className="mb-6" aria-hidden="true">
              <svg 
                className="w-20 h-20 text-red-eske mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Error al confirmar
            </h1>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>

            <div 
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
              role="note"
            >
              <p className="text-sm text-yellow-800">
                <strong>¿Qué puedo hacer?</strong><br/>
                El enlace puede haber expirado o ya fue usado. Intenta suscribirte de nuevo desde el blog.
              </p>
            </div>

            <div className="space-y-3">
              <Link 
                href="/blog" 
                className="inline-block px-6 py-3 bg-bluegreen-eske text-white rounded-lg hover:bg-bluegreen-eske-70 transition-colors font-medium shadow-md hover:shadow-lg focus-ring-primary"
                aria-label="Ir al blog de Eskemma"
              >
                Ir al blog
              </Link>
              <p className="text-sm text-gray-500" aria-hidden="true">o</p>
              <button
                onClick={() => window.close()}
                className="text-gray-600 hover:text-gray-800 font-medium text-sm underline transition-colors focus-ring-primary rounded"
                aria-label="Cerrar esta ventana"
              >
                Cerrar esta ventana
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
