"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function NewsletterSignup() {
  const authContext = useAuth();
  const user = authContext?.user || null;
  const setIsSignInModalOpen = authContext?.setIsSignInModalOpen || (() => {});

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [verificationLink, setVerificationLink] = useState<string | null>(null);

  const isAuthenticatedUser = Boolean(
    user &&
    ["visitor", "registered", "user", "basic", "premium", "grupal", "unsubscribed-basic", "unsubscribed-premium", "unsubscribed-grupal", "expired", "admin"].includes(user.role || "")
  );

  useEffect(() => {
    if (isAuthenticatedUser && user?.email) {
      setEmail(user.email);
      // Intentar obtener nombre del usuario
      setName(user.displayName || user.name || "");
    } else {
      setEmail("");
      setName("");
    }
  }, [user?.uid, isAuthenticatedUser, user?.email, user?.displayName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus("error");
      setMessage("Por favor, ingresa tu email");
      return;
    }

    if (!name.trim()) {
      setStatus("error");
      setMessage("Por favor, ingresa tu nombre");
      return;
    }

    setStatus("loading");
    setMessage("");
    setVerificationLink(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          userId: user?.uid || null,
          source: "blog",
          interests: [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        
        if (data.verificationLink) {
          setVerificationLink(data.verificationLink);
        }
        
        if (!isAuthenticatedUser) {
          setEmail("");
          setName("");
        }

        setTimeout(() => {
          setStatus("idle");
          setMessage("");
          setVerificationLink(null);
        }, 10000);
      } else {
        setStatus("error");
        setMessage(data.message || "Error al suscribirse");
      }
    } catch (error) {
      console.error("Error al suscribirse:", error);
      setStatus("error");
      setMessage("Error al procesar la suscripción. Inténtalo de nuevo");
    }
  };

  return (
    <div className="bg-gradient-to-br from-bluegreen-eske to-bluegreen-eske-70 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-white-eske mb-2 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Newsletter "El Baúl de Fouché"
      </h3>
      <p className="text-white-eske/90 text-sm mb-4">
        Recibe nuestros artículos directamente en tu correo
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Campo de Nombre */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          required
          disabled={status === "loading" || status === "success"}
          className="w-full px-4 py-2 rounded-lg border-0 bg-gray-eske-30 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-white hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
        />

        {/* Campo de Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          disabled={status === "loading" || status === "success"}
          className="w-full px-4 py-2 rounded-lg border-0 bg-gray-eske-30 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-white hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
        />

        {isAuthenticatedUser && email && status === "idle" && (
          <p className="text-xs text-white-eske/80 bg-white/10 rounded px-2 py-1">
            ℹ️ Usaremos los datos de tu perfil (puedes editarlos)
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full bg-white text-bluegreen-eske font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Procesando..." : status === "success" ? "✓ Solicitud enviada" : "Suscribirse"}
        </button>

        {message && (
          <div className={status === "success" ? "text-sm px-3 py-2 rounded bg-white/20 text-white" : "text-sm px-3 py-2 rounded bg-red-500/20 text-red-100"}>
            <p className="font-medium">{message}</p>
            
            {verificationLink && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-xs mb-1">⚠️ TESTING - Link de verificación:</p>
                <a href={verificationLink} target="_blank" rel="noopener noreferrer" className="text-xs underline hover:text-white break-all">
                  Hacer click aquí para confirmar
                </a>
              </div>
            )}
          </div>
        )}

        {!isAuthenticatedUser && status === "idle" && (
          <p className="text-xs text-white-eske/70 text-center mt-2">
            ¿No tienes cuenta?{" "}
            <button type="button" onClick={() => setIsSignInModalOpen(true)} className="underline hover:text-white font-medium transition-colors">
              Regístrate aquí
            </button>
          </p>
        )}
      </form>
    </div>
  );
}