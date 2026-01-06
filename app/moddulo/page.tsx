// app/moddulo/redactor/page.tsx - VERSIÓN INTEGRADA CON WIZARD
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RedactorForm from "@/app/moddulo/redactor/components/RedactorForm";
import PostPreview from "@/app/moddulo/redactor/components/PostPreview";
import FreemiumBanner from "@/app/moddulo/redactor/components/FreemiumBanner";
import ConfigWizard from "@/app/moddulo/redactor/components/ConfigWizard";
import type { 
  RedactorInput, 
  RedactorOutput, 
  RedactorUsage,
  ProjectConfiguration,
} from "@/types/redactor.types";
import { getPlanLimits, isFreemiumUser, MESSAGES } from "@/lib/redactor/constants";

export default function RedactorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Estado UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOutput, setCurrentOutput] = useState<RedactorOutput | null>(null);
  const [selectedVarianteId, setSelectedVarianteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<RedactorUsage | null>(null);
  
  // ⭐ NUEVO: Estado de configuración y wizard
  const [projectConfig, setProjectConfig] = useState<ProjectConfiguration | null>(null);
  const [showConfigWizard, setShowConfigWizard] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Calcular límites según plan
  const userPlan = user?.subscriptionPlan || null;
  const limits = getPlanLimits(userPlan);
  const isFreemium = isFreemiumUser(userPlan);
  const isLimitReached = isFreemium && usageInfo && usageInfo.totalGenerations >= 2;

  // ⭐ NUEVO: Cargar configuración al montar
  useEffect(() => {
    if (user) {
      loadProjectConfiguration();
    } else {
      // Usuarios no autenticados: verificar si hay config en localStorage
      loadVisitorConfiguration();
    }
  }, [user]);

  // Cargar uso del usuario al montar
  useEffect(() => {
    // Para usuarios autenticados freemium
    if (user && isFreemium) {
      loadUsageInfo();
    }
    // Para usuarios NO autenticados (visitantes)
    else if (!user) {
      loadVisitorUsageInfo();
    }
  }, [user, isFreemium]);

  /**
   * ⭐ NUEVO: Cargar configuración desde Firestore (usuarios autenticados)
   */
  const loadProjectConfiguration = async () => {
    if (!user) return;

    setIsLoadingConfig(true);
    
    try {
      // TODO: Implementar carga desde Firestore
      // Por ahora, simulamos que no hay configuración
      const hasConfig = false; // Temporal
      
      if (!hasConfig) {
        // Primera vez del usuario: mostrar wizard
        setShowConfigWizard(true);
      } else {
        // Cargar configuración existente
        // const config = await fetchConfigFromFirestore(user.uid);
        // setProjectConfig(config);
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      setShowConfigWizard(true); // Fallback: mostrar wizard
    } finally {
      setIsLoadingConfig(false);
    }
  };

  /**
   * ⭐ NUEVO: Cargar configuración desde localStorage (visitantes)
   */
  const loadVisitorConfiguration = () => {
    setIsLoadingConfig(true);
    
    try {
      const stored = localStorage.getItem("redactor_config");
      
      if (stored) {
        const parsed = JSON.parse(stored);
        setProjectConfig(parsed);
      } else {
        // Primera vez del visitante: mostrar wizard
        setShowConfigWizard(true);
      }
    } catch (error) {
      console.error("Error al cargar configuración de visitante:", error);
      setShowConfigWizard(true);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  /**
   * ⭐ NUEVO: Guardar configuración completada del wizard
   */
  const handleConfigComplete = async (config: Partial<ProjectConfiguration>) => {
    try {
      // Crear configuración completa
      const fullConfig: ProjectConfiguration = {
        id: user?.uid || "visitor",
        userId: user?.uid || "visitor",
        context: config.context!,
        country: config.country!,
        createdAt: new Date(),
        updatedAt: new Date(),
        electoral: config.electoral,
        governmental: config.governmental,
        guidelines: config.guidelines,
      };

      if (user) {
        // Usuario autenticado: guardar en Firestore
        // TODO: Implementar en Fase 3B
        // await saveConfigToFirestore(user.uid, fullConfig);
        console.log("Guardar en Firestore:", fullConfig);
      } else {
        // Visitante: guardar en localStorage
        localStorage.setItem("redactor_config", JSON.stringify(fullConfig));
      }

      setProjectConfig(fullConfig);
      setShowConfigWizard(false);
      
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      setError("Error al guardar configuración. Intenta de nuevo.");
    }
  };

  /**
   * ⭐ NUEVO: Abrir wizard para editar configuración
   */
  const handleEditConfig = () => {
    setShowConfigWizard(true);
  };

  /**
   * Cargar información de uso desde Firestore (usuarios autenticados)
   */
  const loadUsageInfo = async () => {
    if (!user) return;

    try {
      // TODO: Implementar en Fase 4
      // Por ahora, simulamos que el usuario no ha usado el redactor
      setUsageInfo({
        userId: user.uid,
        totalGenerations: 0,
        lastGeneration: new Date(),
        isFreemium: true,
      });
    } catch (error) {
      console.error("Error al cargar uso:", error);
    }
  };

  /**
   * Cargar información de uso desde localStorage (usuarios visitantes)
   */
  const loadVisitorUsageInfo = () => {
    try {
      const stored = localStorage.getItem("redactor_visitor_usage");
      
      if (stored) {
        const parsed = JSON.parse(stored);
        setUsageInfo({
          userId: "visitor",
          totalGenerations: parsed.totalGenerations || 0,
          lastGeneration: new Date(parsed.lastGeneration),
          isFreemium: true,
        });
      } else {
        // Primera vez del visitante
        setUsageInfo({
          userId: "visitor",
          totalGenerations: 0,
          lastGeneration: new Date(),
          isFreemium: true,
        });
      }
    } catch (error) {
      console.error("Error al cargar uso de visitante:", error);
      // En caso de error, inicializar en 0
      setUsageInfo({
        userId: "visitor",
        totalGenerations: 0,
        lastGeneration: new Date(),
        isFreemium: true,
      });
    }
  };

  /**
   * Handler para generar posts
   */
  const handleGenerate = async (input: RedactorInput) => {
    // Verificar límite freemium
    if (isLimitReached) {
      setError(MESSAGES.FREEMIUM_LIMIT_REACHED);
      return;
    }

    // ⭐ NUEVO: Verificar que hay configuración
    if (!projectConfig) {
      setError("Por favor, completa la configuración inicial primero.");
      setShowConfigWizard(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // ⭐ NUEVO: Llamar al endpoint con contexto
      const response = await fetch("/api/moddulo/redactor/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          context: projectConfig.context,
          country: projectConfig.country,
          config: projectConfig,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar posts");
      }

      const data = await response.json();
      const mockOutput: RedactorOutput = data.output;

      setCurrentOutput(mockOutput);
      setSelectedVarianteId(mockOutput.variantes[0].id);

      // Actualizar uso
      if (isFreemium) {
        if (user && usageInfo) {
          // Usuario autenticado: actualizar en memoria (luego en Firestore)
          setUsageInfo({
            ...usageInfo,
            totalGenerations: usageInfo.totalGenerations + 1,
            lastGeneration: new Date(),
          });
        } else if (!user && usageInfo) {
          // Usuario visitante: actualizar en localStorage
          const newUsage = {
            ...usageInfo,
            totalGenerations: usageInfo.totalGenerations + 1,
            lastGeneration: new Date(),
          };
          
          setUsageInfo(newUsage);
          
          // Guardar en localStorage
          localStorage.setItem("redactor_visitor_usage", JSON.stringify({
            totalGenerations: newUsage.totalGenerations,
            lastGeneration: newUsage.lastGeneration.toISOString(),
          }));
        }
      }
    } catch (error: any) {
      console.error("Error al generar posts:", error);
      setError(error.message || MESSAGES.GENERATION_ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handler para copiar al portapapeles
   */
  const handleCopy = async (texto: string) => {
    if (!limits.hasExportacion) {
      return;
    }

    try {
      await navigator.clipboard.writeText(texto);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  // Loading state
  if (loading || isLoadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bluegreen-eske border-t-transparent" />
          <p className="mt-4 text-gray-eske-70">Cargando Redactor...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-eske-10 py-8 max-sm:py-6">
      {/* ⭐ WIZARD DE CONFIGURACIÓN */}
      {showConfigWizard && (
        <ConfigWizard
          onComplete={handleConfigComplete}
          onClose={() => {
            if (projectConfig) {
              // Si ya tiene config, puede cerrar sin completar
              setShowConfigWizard(false);
            } else {
              // Si no tiene config, debe completar o irse
              router.push("/moddulo");
            }
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 max-sm:mb-6">
          <Link
            href="/moddulo"
            className="inline-flex items-center gap-2 text-bluegreen-eske hover:text-bluegreen-eske/80 transition-colors mb-4 focus-ring-primary rounded-lg px-2 py-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-semibold">Volver al Hub</span>
          </Link>

          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-bluegreen-eske rounded-lg flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white-eske"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl max-sm:text-2xl font-bold text-bluegreen-eske">
                Redactor Político
              </h1>
              <p className="text-sm text-gray-eske-70">
                Genera posts profesionales con IA para tus redes sociales
              </p>
            </div>
            
            {/* ⭐ NUEVO: Botón de configuración */}
            {projectConfig && (
              <button
                onClick={handleEditConfig}
                className="flex items-center gap-2 bg-gray-eske-10 hover:bg-gray-eske-20 text-gray-eske-80 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                title="Editar configuración"
              >
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="max-sm:hidden">Configuración</span>
              </button>
            )}
          </div>

          {/* ⭐ NUEVO: Badge de contexto y país */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Plan Básico
            </div>
            
            {projectConfig && (
              <>
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  {projectConfig.context === "electoral" ? "🗳️ Electoral" : "🏛️ Gubernamental"}
                </div>
                
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  {projectConfig.country === "mexico" ? "🇲🇽 México" : projectConfig.country}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Banner Freemium */}
        {isFreemium && usageInfo && (
          <div className="mb-6">
            <FreemiumBanner
              generationsUsed={usageInfo.totalGenerations}
              generationsLimit={2}
              isLimitReached={isLimitReached || false}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-900 p-4 rounded-r-lg mb-6"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario (1/3) */}
          <div className="lg:col-span-1">
            <RedactorForm
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
              disabled={isLimitReached || false || !projectConfig}
            />
          </div>

          {/* Preview (2/3) */}
          <div className="lg:col-span-2">
            {currentOutput ? (
              <div className="space-y-6">
                {/* Variantes */}
                <div>
                  <h2 className="text-xl font-bold text-bluegreen-eske mb-4 flex items-center gap-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Variantes generadas ({currentOutput.variantes.length})
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentOutput.variantes.map((variante) => (
                      <PostPreview
                        key={variante.id}
                        variante={variante}
                        isSelected={selectedVarianteId === variante.id}
                        onSelect={() => setSelectedVarianteId(variante.id)}
                        onCopy={() => handleCopy(variante.texto)}
                        canExport={limits.hasExportacion}
                      />
                    ))}
                  </div>
                </div>

                {/* Hashtags e Imagen */}
                <div className="bg-white-eske rounded-lg shadow-md p-5 space-y-4">
                  {/* Hashtags */}
                  <div>
                    <h3 className="text-sm font-bold text-bluegreen-eske mb-2 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                      Hashtags sugeridos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentOutput.hashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="bg-bluegreen-eske/10 text-bluegreen-eske px-3 py-1.5 rounded-full text-sm font-medium"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Descripción de imagen */}
                  <div>
                    <h3 className="text-sm font-bold text-bluegreen-eske mb-2 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Descripción de imagen sugerida
                    </h3>
                    <p className="text-sm text-gray-eske-80 bg-gray-eske-10 p-3 rounded-lg">
                      {currentOutput.imagenDescripcion}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white-eske rounded-lg shadow-md p-12 max-sm:p-8 text-center">
                <svg
                  className="w-24 h-24 mx-auto text-gray-eske-30 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-eske-60 text-lg max-sm:text-base font-medium mb-2">
                  Comienza a generar posts
                </p>
                <p className="text-gray-eske-50 text-sm">
                  Completa el formulario y presiona "Generar Posts" para ver tus variantes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
