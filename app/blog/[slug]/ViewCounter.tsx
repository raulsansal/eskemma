// app/blog/[slug]/ViewCounter.tsx
"use client";

import { useEffect, useRef } from "react";

interface ViewCounterProps {
  postId: string;
  slug: string;
}

export default function ViewCounter({ postId, slug }: ViewCounterProps) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    // Prevenir ejecución múltiple en desarrollo (React StrictMode)
    if (hasIncremented.current) return;

    const incrementView = async () => {
      try {
        // 1. Verificar si ya vio este post en esta sesión
        const viewedPosts = JSON.parse(
          localStorage.getItem("viewedPosts") || "[]"
        );

        if (viewedPosts.includes(postId)) {
          console.log(`⏭️ Post ${slug} ya fue visto en esta sesión`);
          return;
        }

        // 2. Incrementar vista en Firestore
        const response = await fetch("/api/posts/increment-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });

        if (!response.ok) {
          throw new Error("Error al incrementar vista");
        }

        // 3. Marcar como visto en localStorage
        viewedPosts.push(postId);
        localStorage.setItem("viewedPosts", JSON.stringify(viewedPosts));

        console.log(`✅ Vista contabilizada para post: ${slug}`);
        hasIncremented.current = true;
      } catch (error) {
        console.error("Error al incrementar vista:", error);
      }
    };

    // Ejecutar después de 2 segundos (usuario realmente leyó)
    const timer = setTimeout(incrementView, 2000);

    return () => clearTimeout(timer);
  }, [postId, slug]);

  return null; // No renderiza nada visible
}