// app/newsletter/confirm/ConfirmContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Link de confirmación inválido");
      return;
    }

    confirmSubscription(token);
  }, [searchParams]);

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
        
        // Redirigir después de 20 segundos
        setTimeout(() => {
          router.push("/blog");
        }, 20000); // ✅ 20 segundos
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
    <main className="min-h-screen bg-gray-eske-10 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white-eske rounded-lg shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bluegreen-eske mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Confirmando suscripción...
            </h1>
            <p className="text-gray-600">Por favor, espera un momento</p>
          </>
        )}

        {status === "success" && (
          <>
            <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-bluegreen-eske mb-3">
              ¡Suscripción confirmada!
            </h1>
            <p className="text-gray-700 mb-4 leading-relaxed">{message}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                📧 Recibirás "El Baúl de Fouché" con nuestros mejores artículos sobre estrategia política
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Serás redirigido al blog en 20 segundos...
            </p>
            <Link href="/blog" className="inline-block px-6 py-3 bg-bluegreen-eske text-white-eske rounded-lg hover:bg-bluegreen-eske-70 transition-colors font-medium">
              Ir al blog ahora →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Error al confirmar
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/blog" className="block px-6 py-3 bg-bluegreen-eske text-white-eske rounded-lg hover:bg-bluegreen-eske-70 transition-colors font-medium">
                Volver al blog
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}