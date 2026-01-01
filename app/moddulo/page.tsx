// app/moddulo/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import WhatIsModduloModal from "@/app/components/moddulo/WhatIsModduloModal";
import UpgradeModduloModal from "@/app/components/moddulo/UpgradeModduloModal";
import { MODDULO_APPS_CATALOG, MODDULO_CATEGORIES, getCategoryColor } from "@/lib/moddulo-apps";
import { getPlanTier, canAccessModduloApp } from "@/types/subscription.types";
import type { ModduloAppWithStatus, ModduloAppCategory } from "@/types/moddulo.types";

export default function ModduloHubPage() {
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ModduloAppCategory | "all">("all");
  const [selectedPlan, setSelectedPlan] = useState<"all" | "BASIC" | "PREMIUM" | "PROFESSIONAL">("all");
  const [showWhatIsModal, setShowWhatIsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedAppForUpgrade, setSelectedAppForUpgrade] = useState<ModduloAppWithStatus | null>(null);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  // Calcular apps con estado según el plan del usuario
  const appsWithStatus: ModduloAppWithStatus[] = useMemo(() => {
    const userPlan = user?.subscriptionPlan;

    return MODDULO_APPS_CATALOG.map((app) => {
      const hasAccess = canAccessModduloApp(userPlan, app.slug);
      const isComingSoon = app.comingSoon;

      let status: "active" | "locked" | "coming-soon";
      if (isComingSoon) {
        status = "coming-soon";
      } else if (hasAccess) {
        status = "active";
      } else {
        status = "locked";
      }

      return {
        ...app,
        status,
        requiresUpgrade: !hasAccess && !isComingSoon,
        requiredTier: !hasAccess && !isComingSoon ? app.tier : undefined,
      };
    });
  }, [user]);

  // Filtrar apps por categoría y plan seleccionados
  const filteredApps = useMemo(() => {
    let filtered = appsWithStatus;

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter((app) => app.category === selectedCategory);
    }

    // Filtrar por plan
    if (selectedPlan !== "all") {
      filtered = filtered.filter((app) => app.tier === selectedPlan);
    }

    return filtered;
  }, [appsWithStatus, selectedCategory, selectedPlan]);

  // Agrupar apps por categoría
  const appsByCategory = useMemo(() => {
    const grouped: Record<string, ModduloAppWithStatus[]> = {};
    MODDULO_CATEGORIES.forEach((cat) => {
      grouped[cat.id] = appsWithStatus.filter((app) => app.category === cat.id);
    });
    return grouped;
  }, [appsWithStatus]);

  // Contar apps por plan
  const appsByPlan = useMemo(() => {
    return {
      BASIC: appsWithStatus.filter(app => app.tier === "BASIC").length,
      PREMIUM: appsWithStatus.filter(app => app.tier === "PREMIUM").length,
      PROFESSIONAL: appsWithStatus.filter(app => app.tier === "PROFESSIONAL").length,
    };
  }, [appsWithStatus]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = appsWithStatus.length;
    const available = appsWithStatus.filter((app) => app.status === "active").length;
    const locked = appsWithStatus.filter((app) => app.status === "locked").length;
    const comingSoon = appsWithStatus.filter((app) => app.status === "coming-soon").length;

    return { total, available, locked, comingSoon };
  }, [appsWithStatus]);

  // Handler para abrir modal de upgrade
  const handleUpgradeClick = (app: ModduloAppWithStatus) => {
    setSelectedAppForUpgrade(app);
    setShowUpgradeModal(true);
  };

  // Helper para obtener nombre del plan
  const getPlanName = (tier: string) => {
    switch (tier) {
      case "BASIC":
        return "Básico";
      case "PREMIUM":
        return "Premium";
      case "PROFESSIONAL":
        return "Profesional";
      default:
        return "Usuario";
    }
  };

  // Componente de Card Individual
  const AppCard = ({ app }: { app: ModduloAppWithStatus }) => {
    const categoryColor = getCategoryColor(app.category);
    const isLocked = app.status === "locked";
    const isComingSoon = app.status === "coming-soon";
    const isActive = app.status === "active";
    const showTooltip = true; // Tooltip para TODAS las apps (visitantes y usuarios)
    const [showMobileDetails, setShowMobileDetails] = useState(false);

    const getBadgeColor = () => {
      switch (app.tier) {
        case "BASIC":
          return "bg-blue-500 text-white-eske";
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
          flex flex-col items-center text-center
          bg-white-eske
          rounded-lg
          shadow-md
          p-5 max-sm:p-4
          transition-all duration-300
          ${isActive ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer" : ""}
          ${isLocked || isComingSoon ? "opacity-70" : ""}
          h-full
          max-w-[240px] mx-auto
        `}
        onMouseEnter={() => showTooltip && setHoveredApp(app.id)}
        onMouseLeave={() => setHoveredApp(null)}
        role="article"
        aria-label={`${app.name} - ${app.shortDescription}`}
      >
        {/* Barra de color superior */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
          style={{ backgroundColor: categoryColor }}
          aria-hidden="true"
        />

        {/* Ícono */}
        <div className="relative w-16 h-16 max-sm:w-14 max-sm:h-14 mb-3 max-sm:mb-2">
          <Image
            src={app.icon}
            alt=""
            fill
            className={`
              object-contain
              transition-transform duration-300 ease-in-out
              ${isActive ? "hover:scale-110" : ""}
              ${isLocked || isComingSoon ? "grayscale" : ""}
            `}
            aria-hidden="true"
          />
        </div>

        {/* Nombre */}
        <h3 className="text-lg max-sm:text-base font-semibold text-bluegreen-eske mb-2 max-sm:mb-1">
          {app.name}
        </h3>

        {/* Descripción corta */}
        <p className="text-xs max-sm:text-[11px] font-light text-gray-eske-90 mb-3 max-sm:mb-2 flex-grow line-clamp-2">
          {app.shortDescription}
        </p>

        {/* Botón "i" de información (solo mobile/tablet) */}
        {showTooltip && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMobileDetails(!showMobileDetails);
            }}
            className="lg:hidden absolute top-2 right-2 w-6 h-6 rounded-full bg-bluegreen-eske text-white-eske flex items-center justify-center text-xs font-bold hover:bg-bluegreen-eske/80 transition-colors z-10"
            aria-label="Ver más información"
          >
            i
          </button>
        )}

        {/* Badge de "Abrir" */}
        <span
          className={`
            ${getBadgeColor()}
            w-full
            px-4 py-2 max-sm:px-3 max-sm:py-1.5
            rounded-lg
            text-sm max-sm:text-xs
            font-semibold
            mb-2
            block
          `}
          aria-label={`Plan ${app.tier}`}
        >
          Abrir
        </span>

        {/* Estados especiales */}
        {(isComingSoon || isLocked) && (
          <div className="mt-1">
            {isComingSoon && (
              <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                Próximamente
              </span>
            )}
            {isLocked && (
              <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
        )}

        {/* Tooltip Desktop - Para TODAS las apps */}
        {showTooltip && hoveredApp === app.id && (
          <div
            className="
              hidden lg:block
              absolute
              bottom-12 sm:bottom-14 lg:bottom-16
              left-1/2
              -translate-x-1/2
              z-[9999]
              w-[280px] xl:w-[300px]
              bg-bluegreen-eske
              rounded-lg
              shadow-2xl
              border-2 border-bluegreen-eske
              p-4
              pointer-events-none
              animate-fadeIn
            "
            role="tooltip"
            style={{ backgroundColor: 'rgb(0, 105, 136)', opacity: 0.98 }}
          >
            {/* Flecha apuntando hacia abajo al botón */}
            <div
              className="
                absolute
                top-full
                left-1/2 -translate-x-1/2
                w-0 h-0
                border-l-8 border-l-transparent
                border-r-8 border-r-transparent
                border-t-8
              "
              style={{ borderTopColor: 'rgb(0, 105, 136)' }}
              aria-hidden="true"
            />
            {/* Contenido del tooltip */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="relative w-10 h-10 flex-shrink-0 bg-white-eske rounded-lg p-1">
                  <Image src={app.icon} alt="" fill className="object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white-eske mb-0.5 leading-tight">
                    {app.name}
                  </h4>
                  <p className="text-[11px] text-white-eske/80 leading-snug">{app.shortDescription}</p>
                </div>
              </div>

              <div className="border-t border-white-eske/20 pt-2.5">
                <p className="text-xs text-white-eske/90 mb-2.5 leading-relaxed">
                  {app.fullDescription}
                </p>

                <ul className="space-y-1.5" role="list">
                  {app.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start gap-1.5 text-xs text-white-eske/90">
                      <svg
                        className="w-4 h-4 text-orange-eske flex-shrink-0 mt-0.5"
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
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles Mobile/Tablet */}
        {showMobileDetails && showTooltip && (
          <div
            className="lg:hidden fixed inset-0 bg-black-eske/70 z-[99999] flex items-end sm:items-center justify-center p-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMobileDetails(false);
            }}
          >
            <div
              className="bg-white-eske rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ opacity: 1 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-bluegreen-eske text-white-eske p-4 rounded-t-2xl sm:rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-white-eske rounded-lg p-1.5">
                    <Image src={app.icon} alt="" fill className="object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{app.name}</h3>
                    <p className="text-xs opacity-80">{app.shortDescription}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileDetails(false)}
                  className="text-white-eske hover:bg-white-eske/10 rounded-full p-2 transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-bluegreen-eske mb-2 text-sm">Descripción</h4>
                  <p className="text-sm text-gray-eske-90 leading-relaxed">
                    {app.fullDescription}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-bluegreen-eske mb-3 text-sm">Características</h4>
                  <ul className="space-y-2">
                    {app.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-eske-90">
                        <svg
                          className="w-5 h-5 text-orange-eske flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
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

                <div className="flex items-center justify-between pt-4 border-t border-gray-eske-20">
                  <span className={`${getBadgeColor()} px-4 py-2 rounded-lg text-xs font-semibold`}>
                    Plan {app.tier === "BASIC" ? "Básico" : app.tier === "PREMIUM" ? "Premium" : "Profesional"}
                  </span>
                  {isActive && (
                    <Link
                      href={`/moddulo/${app.slug}`}
                      className="bg-bluegreen-eske text-white-eske px-6 py-2 rounded-lg text-sm font-semibold hover:bg-bluegreen-eske/90 transition-colors"
                    >
                      Abrir App
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    );

    // Envolver en Link si está activa
    if (isActive) {
      return (
        <Link href={`/moddulo/${app.slug}`} className="block h-full">
          {cardContent}
        </Link>
      );
    }

    // Si está bloqueada, hacer clic abre modal
    if (isLocked) {
      return (
        <div onClick={() => handleUpgradeClick(app)} className="cursor-pointer h-full">
          {cardContent}
        </div>
      );
    }

    // Si está "coming soon", solo mostrar (con tooltip)
    return cardContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bluegreen-eske border-t-transparent" />
          <p className="mt-4 text-gray-eske-70">Cargando Moddulo...</p>
        </div>
      </div>
    );
  }

  const userName = user?.name || user?.displayName || "";
  const currentTier = getPlanTier(user?.subscriptionPlan);
  const planName = getPlanName(currentTier);

  return (
    <main className="min-h-screen bg-gray-eske-10">
      {/* Hero Section con estadísticas integradas */}
      <section
        className="relative min-h-[320px] max-sm:min-h-[280px] w-full flex items-center justify-center bg-bluegreen-eske overflow-hidden"
        aria-labelledby="hero-title"
      >
        {/* Imagen de fondo */}
        <Image
          src="/images/yanmin_yang.jpg"
          alt="Imagen de fondo"
          fill
          style={{ objectFit: "cover" }}
          className="object-cover"
          priority
          aria-hidden="true"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-bluegreen-eske opacity-80" aria-hidden="true" />

        {/* Contenido del Hero */}
        <div className="relative z-10 text-center text-white-eske px-4 sm:px-6 md:px-8 max-w-screen-xl mx-auto w-full py-12 max-sm:py-8">
          {user ? (
            <>
              <h1 id="hero-title" className="text-[38px] max-sm:text-2xl leading-tight font-bold mb-3 max-sm:mb-2">
                {userName}, te damos la bienvenida a Moddulo
              </h1>
              <p className="text-[20px] max-sm:text-base leading-relaxed font-light mb-6 max-sm:mb-4">
                Tu ecosistema de apps políticas impulsadas por IA
              </p>

              {/* Información de usuario y estadísticas integradas */}
              <div className="bg-white-eske/10 backdrop-blur-sm rounded-lg p-4 max-sm:p-3 max-w-4xl mx-auto border border-white-eske/20">
                {/* Línea 1: Usuario y Plan */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-3 max-sm:mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm max-sm:text-xs font-light">Usuario:</span>
                    <span className="font-semibold text-base max-sm:text-sm">{userName}</span>
                  </div>
                  <span className="hidden sm:inline text-white-eske/40">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm max-sm:text-xs font-light">Plan:</span>
                    <span className="font-semibold text-base max-sm:text-sm">{planName}</span>
                  </div>
                </div>

                {/* Línea 2: Estadísticas */}
                <div className="flex flex-wrap items-center justify-center gap-3 max-sm:gap-2 text-sm max-sm:text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true"></div>
                    <span className="font-medium">{stats.available}</span>
                    <span className="font-light">Apps disponibles</span>
                  </div>
                  <span className="text-white-eske/40">|</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true"></div>
                    <span className="font-medium">{stats.locked}</span>
                    <span className="font-light">Apps bloqueadas</span>
                  </div>
                  <span className="text-white-eske/40 max-sm:hidden">|</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" aria-hidden="true"></div>
                    <span className="font-medium">{stats.comingSoon}</span>
                    <span className="font-light">Próximamente</span>
                  </div>
                  <span className="text-white-eske/40">|</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400" aria-hidden="true"></div>
                    <span className="font-medium">{stats.total}</span>
                    <span className="font-light">Total Apps</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 id="hero-title" className="text-[42px] max-sm:text-3xl leading-tight font-bold mb-4 max-sm:mb-3">
                Bienvenido a Moddulo
              </h1>
              <p className="text-[20px] max-sm:text-base leading-relaxed font-light mb-6 max-sm:mb-4">
                Tu ecosistema de apps políticas impulsadas por IA
              </p>
              <button
                onClick={() => setShowWhatIsModal(true)}
                className="
                  inline-block
                  bg-orange-eske
                  text-white-eske
                  px-8 max-sm:px-6
                  py-4 max-sm:py-3
                  rounded-lg
                  font-medium
                  hover:bg-orange-eske-70
                  transition-all duration-300
                  focus-ring-primary
                  text-base max-sm:text-sm
                "
              >
                ¿QUÉ INCLUYE MODDULO?
              </button>
            </>
          )}
        </div>
      </section>

      {/* Descripción */}
      <section className="bg-gray-eske-10 py-12 max-sm:py-8 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-3xl max-sm:text-2xl font-semibold text-center text-bluegreen-eske mb-6 max-sm:mb-4">
            Herramientas profesionales para tu proyecto político
          </h2>
          <p className="text-lg max-sm:text-base font-light text-center text-black-eske max-w-3xl mx-auto">
            Accede a un ecosistema de aplicaciones especializadas, potenciadas por inteligencia artificial.
          </p>
        </div>
      </section>

      {/* Filtros por Categoría */}
      <section className="bg-white-eske border-y border-gray-eske-20 sticky top-0 z-40 shadow-sm">
        <div className="w-[90%] mx-auto max-w-screen-xl py-6 max-sm:py-4">
          {/* Filtros por Categoría */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-eske-70 mb-2 text-center">Filtrar por categoría</p>
            <div className="flex flex-wrap justify-center gap-3 max-sm:gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`
                  px-6 py-3 max-sm:px-4 max-sm:py-2
                  rounded-lg
                  font-medium
                  text-sm max-sm:text-xs
                  transition-all duration-300
                  focus-ring-primary
                  ${
                    selectedCategory === "all"
                      ? "bg-bluegreen-eske text-white-eske shadow-md"
                      : "bg-gray-eske-10 text-gray-eske-70 hover:bg-gray-eske-20"
                  }
                `}
                aria-pressed={selectedCategory === "all"}
              >
                Todas ({appsWithStatus.length})
              </button>
              {MODDULO_CATEGORIES.map((category) => {
                const count = appsByCategory[category.id]?.length || 0;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      px-6 py-3 max-sm:px-4 max-sm:py-2
                      rounded-lg
                      font-medium
                      text-sm max-sm:text-xs
                      transition-all duration-300
                      focus-ring-primary
                      ${
                        selectedCategory === category.id
                          ? "text-white-eske shadow-md"
                          : "bg-gray-eske-10 text-gray-eske-70 hover:bg-gray-eske-20"
                      }
                    `}
                    style={{
                      backgroundColor:
                        selectedCategory === category.id ? category.color : undefined,
                    }}
                    aria-pressed={selectedCategory === category.id}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtros por Plan */}
          <div>
            <p className="text-xs font-semibold text-gray-eske-70 mb-2 text-center">Filtrar por plan</p>
            <div className="flex flex-wrap justify-center gap-3 max-sm:gap-2">
              <button
                onClick={() => setSelectedPlan("all")}
                className={`
                  px-6 py-3 max-sm:px-4 max-sm:py-2
                  rounded-lg
                  font-medium
                  text-sm max-sm:text-xs
                  transition-all duration-300
                  focus-ring-primary
                  ${
                    selectedPlan === "all"
                      ? "bg-bluegreen-eske text-white-eske shadow-md"
                      : "bg-gray-eske-10 text-gray-eske-70 hover:bg-gray-eske-20"
                  }
                `}
                aria-pressed={selectedPlan === "all"}
              >
                Todos ({appsWithStatus.length})
              </button>
              <button
                onClick={() => setSelectedPlan("BASIC")}
                className={`
                  px-6 py-3 max-sm:px-4 max-sm:py-2
                  rounded-lg
                  font-medium
                  text-sm max-sm:text-xs
                  transition-all duration-300
                  focus-ring-primary
                  ${
                    selectedPlan === "BASIC"
                      ? "bg-blue-500 text-white-eske shadow-md"
                      : "bg-gray-eske-10 text-gray-eske-70 hover:bg-gray-eske-20"
                  }
                `}
                aria-pressed={selectedPlan === "BASIC"}
              >
                Básico ({appsByPlan.BASIC})
              </button>
              <button
                onClick={() => setSelectedPlan("PREMIUM")}
                className={`
                  px-6 py-3 max-sm:px-4 max-sm:py-2
                  rounded-lg
                  font-medium
                  text-sm max-sm:text-xs
                  transition-all duration-300
                  focus-ring-primary
                  ${
                    selectedPlan === "PREMIUM"
                      ? "bg-orange-eske text-white-eske shadow-md"
                      : "bg-gray-eske-10 text-gray-eske-70 hover:bg-gray-eske-20"
                  }
                `}
                aria-pressed={selectedPlan === "PREMIUM"}
              >
                Premium ({appsByPlan.PREMIUM})
              </button>
              <button
                onClick={() => setSelectedPlan("PROFESSIONAL")}
                className={`
                  px-6 py-3 max-sm:px-4 max-sm:py-2
                  rounded-lg
                  font-medium
                  text-sm max-sm:text-xs
                  transition-all duration-300
                  focus-ring-primary
                  ${
                    selectedPlan === "PROFESSIONAL"
                      ? "bg-green-600 text-white-eske shadow-md"
                      : "bg-gray-eske-10 text-gray-eske-70 hover:bg-gray-eske-20"
                  }
                `}
                aria-pressed={selectedPlan === "PROFESSIONAL"}
              >
                Profesional ({appsByPlan.PROFESSIONAL})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Apps */}
      <section className="bg-gray-eske-10 py-12 max-sm:py-8 px-4 sm:px-6 md:px-8">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          {selectedCategory === "all" && selectedPlan === "all" ? (
            // Vista por categorías (sin filtros)
            <div className="space-y-16 max-sm:space-y-12">
              {MODDULO_CATEGORIES.map((category) => {
                const categoryApps = appsByCategory[category.id] || [];
                if (categoryApps.length === 0) return null;

                return (
                  <div key={category.id}>
                    {/* Header de categoría */}
                    <div className="mb-8 max-sm:mb-6">
                      <h2
                        className="text-3xl max-sm:text-2xl font-semibold mb-2"
                        style={{ color: category.color }}
                      >
                        {category.name}
                      </h2>
                      <p className="text-base max-sm:text-sm text-gray-eske-70 font-light">
                        {category.description}
                      </p>
                    </div>

                    {/* Grid de apps */}
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-sm:gap-5"
                      role="list"
                      aria-label={`${categoryApps.length} aplicaciones en ${category.name}`}
                    >
                      {categoryApps.map((app) => (
                        <AppCard key={app.id} app={app} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Vista filtrada
            <div>
              {filteredApps.length > 0 ? (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-sm:gap-5"
                  role="list"
                  aria-label={`${filteredApps.length} aplicaciones`}
                >
                  {filteredApps.map((app) => (
                    <AppCard key={app.id} app={app} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-eske-60 text-lg mb-2">
                    No hay apps con los filtros seleccionados
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedPlan("all");
                    }}
                    className="text-bluegreen-eske hover:underline text-sm"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-eske-20 py-12 max-sm:py-8 px-4 sm:px-6 md:px-8 text-center">
        <div className="w-[90%] mx-auto max-w-screen-xl">
          <h2 className="text-2xl max-sm:text-xl font-semibold text-black-eske mb-4 max-sm:mb-3">
            ¿Necesitas más herramientas?
          </h2>
          <p className="text-lg max-sm:text-base font-light text-black-eske mb-8 max-sm:mb-6">
            Mejora tu plan para acceder a todas las aplicaciones profesionales.
          </p>
          <Link
            href="/#suscripciones"
            className="
              inline-block
              bg-orange-eske
              text-white-eske
              px-8 max-sm:px-6
              py-4 max-sm:py-3
              rounded-lg
              font-medium
              hover:bg-orange-eske-70
              transition-all duration-300
              focus-ring-primary
              text-base max-sm:text-sm
            "
          >
            VER PLANES
          </Link>
        </div>
      </section>

      {/* Modales */}
      <WhatIsModduloModal isOpen={showWhatIsModal} onClose={() => setShowWhatIsModal(false)} />

      {selectedAppForUpgrade && (
        <UpgradeModduloModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setSelectedAppForUpgrade(null);
          }}
          currentTier={currentTier}
          requiredTier={selectedAppForUpgrade.requiredTier || "PREMIUM"}
          appName={selectedAppForUpgrade.name}
        />
      )}
    </main>
  );
}
