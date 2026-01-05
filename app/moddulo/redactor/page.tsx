// app/moddulo/redactor/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RedactorForm from "./components/RedactorForm";
import PostPreview from "./components/PostPreview";
import FreemiumBanner from "./components/FreemiumBanner";
import type { RedactorInput, RedactorOutput, RedactorUsage } from "@/types/redactor.types";
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

  // Calcular límites según plan
  const userPlan = user?.subscriptionPlan || null;
  const limits = getPlanLimits(userPlan);
  const isFreemium = isFreemiumUser(userPlan);
  const isLimitReached = isFreemium && usageInfo && usageInfo.totalGenerations >= 2;

  // Cargar uso del usuario al montar
  useEffect(() => {
    if (user && isFreemium) {
      loadUsageInfo();
    }
  }, [user, isFreemium]);

  /**
   * Cargar información de uso desde Firestore
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
   * Handler para generar posts
   */
  const handleGenerate = async (input: RedactorInput) => {
    // Verificar límite freemium
    if (isLimitReached) {
      setError(MESSAGES.FREEMIUM_LIMIT_REACHED);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // TODO: Implementar en Fase 3 - Integración con Claude API
      // Por ahora, simulamos una respuesta

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Output simulado con variantes según el plan
      const numVariantes = limits.maxVariantes; // 2 para freemium, 3 para planes pagados
      const numHashtags = limits.maxHashtags;   // 3 para freemium, 5 para planes pagados

      const allVariantes = [
        {
          id: "var-1",
          titulo: "Invirtiendo en el futuro de nuestros niños",
          texto: `La educación es la base del progreso. Por eso propongo aumentar el presupuesto educativo en zonas rurales, garantizar acceso a tecnología y capacitar a nuestros maestros. Juntos construiremos un México más justo. #EducaciónParaTodos`,
          caracteresUsados: 245,
        },
        {
          id: "var-2",
          titulo: "Educación de calidad: un derecho, no un privilegio",
          texto: `Cada niño merece la misma oportunidad de aprender. Trabajaremos para eliminar la brecha educativa entre el campo y la ciudad, con infraestructura moderna y maestros bien preparados. El cambio empieza en las aulas. #FuturoEducativo`,
          caracteresUsados: 258,
        },
        {
          id: "var-3",
          titulo: "Compromiso con la educación rural",
          texto: `Las comunidades rurales necesitan las mismas oportunidades educativas que las ciudades. Mi compromiso: internet en todas las escuelas, becas para maestros rurales y equipamiento moderno. La educación transforma vidas. #MéxicoEducado`,
          caracteresUsados: 265,
        },
      ];

      const allHashtags = [
        "#EducaciónParaTodos",
        "#FuturoEducativo",
        "#MéxicoEducado",
        "#EducaciónRural",
        "#InversiónEducativa",
      ];

      const mockOutput: RedactorOutput = {
        variantes: allVariantes.slice(0, numVariantes),
        hashtags: allHashtags.slice(0, numHashtags),
        imagenDescripcion: "Niños sonrientes en un aula rural con tecnología moderna y maestros atentos",
      };

      setCurrentOutput(mockOutput);
      setSelectedVarianteId(mockOutput.variantes[0].id);

      // Actualizar uso
      if (isFreemium && usageInfo) {
        setUsageInfo({
          ...usageInfo,
          totalGenerations: usageInfo.totalGenerations + 1,
          lastGeneration: new Date(),
        });
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
  if (loading) {
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
            <div>
              <h1 className="text-3xl max-sm:text-2xl font-bold text-bluegreen-eske">
                Redactor Político
              </h1>
              <p className="text-sm text-gray-eske-70">
                Genera posts profesionales con IA para tus redes sociales
              </p>
            </div>
          </div>

          {/* Plan badge */}
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
              disabled={isLimitReached || false}
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
