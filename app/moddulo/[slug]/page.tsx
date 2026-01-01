// app/moddulo/[slug]/page.tsx
"use client";

import React from "react";
import { useParams, notFound } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAppBySlug } from "@/lib/moddulo-apps";
import { canAccessModduloApp } from "@/types/subscription.types";
import UnderConstructionApp from "@/app/components/moddulo/UnderConstructionApp";
import Link from "next/link";

export default function ModduloAppPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user, loading } = useAuth();

  // Buscar la app en el catálogo
  const app = getAppBySlug(slug);

  // Si no existe la app, 404
  if (!app) {
    notFound();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bluegreen-eske border-t-transparent" />
          <p className="mt-4 text-gray-eske-70">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar acceso
  const hasAccess = canAccessModduloApp(user?.subscriptionPlan, app.slug);

  // Si no tiene acceso, redirigir al hub con mensaje
  if (!hasAccess && !app.comingSoon) {
    return (
      <div className="min-h-screen bg-gray-eske-10 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white-eske rounded-lg shadow-lg p-8 max-sm:p-6 text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 max-sm:w-12 max-sm:h-12 mx-auto text-orange-eske"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl max-sm:text-xl font-bold text-black-eske mb-3">
            Acceso Restringido
          </h1>
          <p className="text-base max-sm:text-sm text-gray-eske-70 mb-6">
            Esta app requiere el plan <strong>{app.tier}</strong>.
          </p>
          <div className="space-y-3">
            <Link
              href="/#suscripciones"
              className="
                block
                w-full
                bg-orange-eske
                text-white-eske
                px-6 py-3 max-sm:py-2.5
                rounded-lg
                font-medium
                text-base max-sm:text-sm
                hover:bg-orange-eske-60
                transition-colors
                focus-ring-primary
              "
            >
              Ver Planes
            </Link>
            <Link
              href="/moddulo"
              className="
                block
                w-full
                bg-gray-eske-10
                text-gray-eske-80
                px-6 py-2.5 max-sm:py-2
                rounded-lg
                font-medium
                text-sm max-sm:text-xs
                hover:bg-gray-eske-20
                transition-colors
                focus-ring-primary
              "
            >
              Volver al Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si la app está "Coming Soon" o aún no desarrollada, mostrar página de construcción
  // NOTA: Aquí iría la lógica para determinar si la app está desarrollada
  // Por ahora, todas las apps no "comingSoon" mostrarán construcción excepto las que se desarrollen
  
  return (
    <UnderConstructionApp
      appName={app.name}
      appIcon={app.icon}
      isComingSoon={app.comingSoon}
    />
  );
}
