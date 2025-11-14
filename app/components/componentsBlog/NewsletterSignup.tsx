// app/components/componentsBlog/NewsletterSignup.tsx
"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // TODO: Implementar integración con servicio de newsletter
    // Por ahora, simular envío
    setTimeout(() => {
      setStatus("success");
      setMessage("¡Gracias por suscribirte!");
      setEmail("");
      
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-br from-bluegreen-eske to-bluegreen-eske-70 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-white-eske mb-2 flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        Newsletter
      </h3>
      <p className="text-white-eske/90 text-sm mb-4">
        Recibe nuestros artículos directamente en tu correo
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          disabled={status === "loading" || status === "success"}
          className="w-full px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-800 placeholder-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full bg-white text-bluegreen-eske font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Enviando..." : status === "success" ? "✓ Suscrito" : "Suscribirse"}
        </button>

        {message && (
          <p className={`text-sm text-center ${status === "success" ? "text-white" : "text-red-200"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}