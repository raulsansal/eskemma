// app/blog/[slug]/SaveForLater.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/firebase/firebaseConfig";

interface SaveForLaterProps {
  postId: string;
  postTitle: string;
  postSlug: string;
}

export default function SaveForLater({
  postId,
  postTitle,
  postSlug,
}: SaveForLaterProps) {
  const { user, setIsLoginModalOpen } = useAuth(); // ✅ AGREGAR setIsLoginModalOpen
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // ✅ NUEVO ESTADO

  // Verificar si el post está guardado al montar el componente
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setIsCheckingStatus(false);
          return;
        }

        const token = await currentUser.getIdToken();
        const response = await fetch(`/api/posts/save?postId=${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error("Error al verificar estado guardado:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkSavedStatus();
  }, [user, postId]);

  const handleSave = async () => {
    // ✅ MOSTRAR MODAL SI NO HAY USUARIO
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setShowLoginPrompt(true);
        return;
      }

      const token = await currentUser.getIdToken();
      const action = isSaved ? "unsave" : "save";

      const response = await fetch("/api/posts/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          action,
          postTitle,
          postSlug,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar post");
      }

      const data = await response.json();
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error al guardar/quitar post:", error);
      alert("Error al procesar la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-pulse flex items-center gap-2 text-gray-600">
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
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <span className="text-sm">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ MODAL DE LOGIN PROMPT */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }} // ✅ OPACIDAD 60%
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cierre */}
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-red-500 transition-colors"
              onClick={() => setShowLoginPrompt(false)}
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

            {/* Contenido */}
            <div className="text-center">
              {/* Icono */}
              <div className="mb-4 flex justify-center">
                <svg
                  className="w-16 h-16 text-bluegreen-eske"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-black-eske mb-4">
                Debes iniciar sesión para guardar posts
              </h3>

              <p className="text-black-eske-80 mb-6">
                Si aún no tienes tu usuario y contraseña, te invitamos a
                registrarte en nuestra comunidad de Eskemma.
              </p>

              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setIsLoginModalOpen(true);
                }}
                className="w-full px-6 py-3 bg-bluegreen-eske text-white rounded-lg hover:bg-bluegreen-eske-70 transition-colors font-semibold"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN GUARDAR */}
      <div className="flex items-center justify-center py-6 border-t border-gray-eske-20">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-300 ${
            isSaved
              ? "bg-bluegreen-eske text-white border-bluegreen-eske hover:bg-bluegreen-eske-70"
              : "bg-white-eske border-gray-eske-30 text-gray-700 hover:border-bluegreen-eske hover:text-bluegreen-eske"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <svg
            className={`w-6 h-6 transition-transform duration-300 ${
              isSaved ? "scale-110" : "scale-100"
            }`}
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <span className="font-semibold">
            {isSaved ? "Guardado" : "Guardar para leer después"}
          </span>
        </button>
      </div>
    </>
  );
}
