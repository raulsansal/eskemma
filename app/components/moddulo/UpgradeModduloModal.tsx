// app/components/moddulo/UpgradeModduloModal.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import type { ModduloAppTier } from "@/types/moddulo.types";

interface UpgradeModduloModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: ModduloAppTier;
  requiredTier: ModduloAppTier;
  appName: string;
}

export default function UpgradeModduloModal({
  isOpen,
  onClose,
  currentTier,
  requiredTier,
  appName,
}: UpgradeModduloModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determinar información del plan sugerido
  const getPlanInfo = () => {
    if (requiredTier === "BASIC") {
      return {
        name: "Básico",
        price: "$2,899",
        appsCount: "8 apps",
        color: "bg-blue-500",
        features: [
          "Redactor Político con IA",
          "CRM especializado",
          "Dashboard de campaña",
          "Calendario político",
          "Presupuesto y FODA",
        ],
      };
    } else if (requiredTier === "PREMIUM") {
      return {
        name: "Premium",
        price: "$5,899",
        appsCount: "16 apps",
        color: "bg-orange-eske",
        features: [
          "Centro de Escucha Social",
          "Estratega IA con multi-agente",
          "Email Marketing avanzado",
          "ML Scoring en CRM",
          "Hasta 5 usuarios",
        ],
      };
    } else if (requiredTier === "PROFESSIONAL") {
      return {
        name: "Professional",
        price: "$9,899",
        appsCount: "25 apps",
        color: "bg-green-600",
        features: [
          "Sala de Crisis en tiempo real",
          "Monitor de Redes con Vision AI",
          "Territorio Digital con GIS",
          "Chatbot Inteligente 24/7",
          "Usuarios ilimitados",
        ],
      };
    }
    return null;
  };

  const planInfo = getPlanInfo();
  if (!planInfo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div
        className="
          bg-white-eske
          rounded-lg
          shadow-2xl
          w-full
          max-w-md
          max-h-[85vh]
          overflow-y-auto
          relative
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="
            absolute
            top-4 right-4
            text-white-eske
            hover:text-blue-eske-10
            transition-colors
            focus-ring-primary
            rounded-full
            p-1
            z-10
          "
          aria-label="Cerrar modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header con gradiente */}
        <div className={`${planInfo.color} text-white-eske p-6 max-sm:p-4 pr-12`}>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">App Bloqueada</span>
          </div>
          <h2
            id="upgrade-modal-title"
            className="text-2xl max-sm:text-xl font-bold mb-2"
          >
            {appName}
          </h2>
          <p className="text-white-eske opacity-90 text-sm">
            Esta app requiere el plan {planInfo.name}
          </p>
        </div>

        {/* Contenido */}
        <div className="p-6 max-sm:p-4 space-y-6">
          {/* Plan info */}
          <div className="text-center">
            <div className="mb-4">
              <span className="text-4xl max-sm:text-3xl font-bold text-black-eske">
                {planInfo.price}
              </span>
              <span className="text-gray-eske-70 text-base max-sm:text-sm"> MXN/mes</span>
            </div>
            <div className="inline-block bg-gray-eske-10 px-4 py-2 rounded-full">
              <span className="font-medium text-black-eske text-sm">
                {planInfo.appsCount} disponibles
              </span>
            </div>
          </div>

          {/* Características */}
          <div>
            <h3 className="font-bold text-base text-black-eske mb-3">
              ¿Qué obtienes con Plan {planInfo.name}?
            </h3>
            <ul className="space-y-3" role="list">
              {planInfo.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-eske-80">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3 pt-2">
            <Link
              href="/#suscripciones"
              className={`
                block
                w-full
                ${planInfo.color}
                text-white-eske
                text-center
                px-6 py-3 max-sm:py-2.5
                rounded-lg
                font-medium
                text-base max-sm:text-sm
                hover:opacity-90
                transition-opacity
                focus-ring-primary
              `}
              onClick={onClose}
            >
              Mejorar a {planInfo.name}
            </Link>

            <button
              onClick={onClose}
              className="
                block
                w-full
                bg-gray-eske-10
                text-gray-eske-80
                text-center
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
            </button>
          </div>

          {/* Nota */}
          <p className="text-xs text-gray-eske-60 text-center">
            Puedes cambiar de plan en cualquier momento desde tu perfil
          </p>
        </div>
      </div>
    </div>
  );
}
