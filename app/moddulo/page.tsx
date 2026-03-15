// app/moddulo/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ModduloPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/");
      } else {
        // Redirigir temporalmente a la lista de proyectos mientras se construye el hub
        router.replace("/moddulo/proyecto");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-eske-10">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-bluegreen-eske border-t-transparent" />
        <p className="mt-4 text-gray-eske-60 text-sm">Cargando Moddulo...</p>
      </div>
    </div>
  );
}
