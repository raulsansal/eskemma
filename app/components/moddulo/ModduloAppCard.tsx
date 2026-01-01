// app/components/moddulo/ModduloAppCard.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ModduloAppWithStatus } from "@/types/moddulo.types";
import { getCategoryColor } from "@/lib/moddulo-apps";

interface ModduloAppCardProps {
  app: ModduloAppWithStatus;
  onUpgradeClick?: () => void;
}

export default function ModduloAppCard({ app, onUpgradeClick }: ModduloAppCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const categoryColor = getCategoryColor(app.category);

  const isLocked = app.status === "locked";
  const isComingSoon = app.status === "coming-soon";
  const isActive = app.status === "active";

  // Determinar color de badge según tier
  const getBadgeColor = () => {
    switch (app.tier) {
      case "BASIC":
        return "bg-blue-eske text-white-eske";
      case "PREMIUM":
        return "bg-orange-eske text-white-eske";
      case "PROFESSIONAL":
        return "bg-green-600 text-white-eske";
      default:
        return "bg-gray-eske-50 text-white-eske";
    }
  };

  const cardContent = (
    <article
      className={`
        relative
        bg-white-eske
        rounded-lg
        shadow-md
        overflow-hidden
        transition-all duration-300
        ${isActive ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer" : ""}
        ${isLocked || isComingSoon ? "opacity-60" : ""}
        flex flex-col
        h-full
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="article"
      aria-label={`${app.name} - ${app.shortDescription}`}
    >
      {/* Barra de color superior */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: categoryColor }}
        aria-hidden="true"
      />

      {/* Contenido de la card */}
      <div className="p-4 max-sm:p-3 flex flex-col items-center text-center flex-grow">
        {/* Ícono */}
        <div className="relative w-16 h-16 max-sm:w-14 max-sm:h-14 mb-3 max-sm:mb-2">
          <Image
            src={app.icon}
            alt=""
            fill
            className={`object-contain ${isLocked || isComingSoon ? "grayscale" : ""}`}
            aria-hidden="true"
          />
        </div>

        {/* Nombre */}
        <h3 className="font-semibold text-base max-sm:text-sm text-black-eske mb-2 max-sm:mb-1 line-clamp-2">
          {app.name}
        </h3>

        {/* Badge de tier */}
        <span
          className={`
            ${getBadgeColor()}
            px-3 py-1 max-sm:px-2 max-sm:py-0.5
            rounded-full
            text-xs max-sm:text-[10px]
            font-medium
            mb-3 max-sm:mb-2
          `}
          aria-label={`Tier ${app.tier}`}
        >
          {app.tier}
        </span>

        {/* Badges de estado */}
        <div className="flex flex-wrap gap-2 justify-center mb-3 max-sm:mb-2">
          {isComingSoon && (
            <span
              className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs max-sm:text-[10px] font-medium"
              aria-label="Próximamente"
            >
              Próximamente
            </span>
          )}
          {isLocked && (
            <span
              className="bg-gray-eske-20 text-gray-eske-80 px-2 py-1 rounded text-xs max-sm:text-[10px] font-medium inline-flex items-center gap-1"
              aria-label="Bloqueado"
            >
              <svg
                className="w-3 h-3"
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
              Bloqueado
            </span>
          )}
        </div>

        {/* Botón de acción */}
        <button
          className={`
            w-full
            px-4 py-2 max-sm:py-1.5
            rounded-lg
            font-medium
            text-sm max-sm:text-xs
            transition-colors duration-200
            focus-ring-primary
            ${
              isActive
                ? "bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske-60"
                : isLocked
                ? "bg-orange-eske text-white-eske hover:bg-orange-eske-60"
                : "bg-gray-eske-30 text-gray-eske-70 cursor-not-allowed"
            }
          `}
          disabled={isComingSoon}
          onClick={(e) => {
            if (isLocked) {
              e.preventDefault();
              onUpgradeClick?.();
            }
          }}
          aria-label={
            isActive
              ? `Abrir ${app.name}`
              : isLocked
              ? `Mejorar plan para acceder a ${app.name}`
              : `${app.name} próximamente`
          }
        >
          {isActive ? "Abrir App" : isLocked ? "Mejorar Plan" : "Próximamente"}
        </button>
      </div>

      {/* Tooltip (solo desktop) */}
      {showTooltip && isActive && (
        <div
          className="
            hidden md:block
            absolute
            left-full ml-4
            top-0
            z-50
            w-80
            bg-white-eske
            rounded-lg
            shadow-2xl
            border border-gray-eske-20
            p-4
            pointer-events-none
          "
          role="tooltip"
          aria-hidden="false"
        >
          {/* Flecha del tooltip */}
          <div
            className="
              absolute
              right-full
              top-6
              w-0 h-0
              border-t-8 border-t-transparent
              border-b-8 border-b-transparent
              border-r-8 border-r-white-eske
            "
            aria-hidden="true"
          />

          {/* Contenido del tooltip */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image src={app.icon} alt="" fill className="object-contain" />
              </div>
              <div>
                <h4 className="font-bold text-base text-black-eske mb-1">
                  {app.name}
                </h4>
                <p className="text-sm text-gray-eske-70">{app.shortDescription}</p>
              </div>
            </div>

            <div className="border-t border-gray-eske-20 pt-3">
              <p className="text-sm text-gray-eske-80 mb-3">{app.fullDescription}</p>

              <ul className="space-y-2" role="list">
                {app.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-eske-70">
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
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
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {app.tier !== "BASIC" && (
              <div className="bg-gray-eske-10 rounded p-2 text-xs text-gray-eske-70">
                🔓 Disponible en plan {app.tier}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );

  // Si está activa, envolver en Link
  if (isActive) {
    return (
      <Link href={`/moddulo/${app.slug}`} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  // Si está bloqueada o próximamente, no envolver en Link
  return cardContent;
}
