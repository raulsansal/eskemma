// app/moddulo/onboarding/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { createProject } from "@/lib/strategy-context";
import {
  CAMPAIGN_TYPE_LABELS,
  USER_ROLE_LABELS,
  JURISDICTION_LEVEL_LABELS,
  type CampaignType,
  type UserRole,
  type JurisdictionLevel,
  type ProjectMode,
  type Jurisdiction,
} from "@/types/strategy-context.types";

// ============================================================
// DATOS DE PAÍSES IBEROAMERICANOS
// ============================================================

const COUNTRIES = [
  { code: "MX", name: "México" },
  { code: "ES", name: "España" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Perú" },
  { code: "EC", name: "Ecuador" },
  { code: "VE", name: "Venezuela" },
  { code: "GT", name: "Guatemala" },
  { code: "BO", name: "Bolivia" },
  { code: "DO", name: "República Dominicana" },
  { code: "HN", name: "Honduras" },
  { code: "PY", name: "Paraguay" },
  { code: "SV", name: "El Salvador" },
  { code: "NI", name: "Nicaragua" },
  { code: "CR", name: "Costa Rica" },
  { code: "PA", name: "Panamá" },
  { code: "UY", name: "Uruguay" },
  { code: "PR", name: "Puerto Rico" },
  { code: "BR", name: "Brasil" },
  { code: "PT", name: "Portugal" },
];

// ============================================================
// TIPOS LOCALES
// ============================================================

interface OnboardingData {
  projectName: string;
  projectDescription: string;
  mode: ProjectMode | null;
  campaignType: CampaignType | null;
  userRole: UserRole | null;
  jurisdiction: Partial<Jurisdiction>;
}

type Step =
  | "mode"
  | "basics"
  | "campaign"
  | "role"
  | "jurisdiction"
  | "confirm";

const STEPS: Step[] = [
  "mode",
  "basics",
  "campaign",
  "role",
  "jurisdiction",
  "confirm",
];

const STEP_LABELS: Record<Step, string> = {
  mode: "Modo",
  basics: "Datos",
  campaign: "Tipo",
  role: "Rol",
  jurisdiction: "Ubicación",
  confirm: "Confirmar",
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>("mode");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    projectName: "",
    projectDescription: "",
    mode: null,
    campaignType: null,
    userRole: null,
    jurisdiction: {
      country: "MX",
      countryName: "México",
      level: "federal",
    },
  });

  // Handlers de navegación
  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const goToStep = (step: Step) => {
    const targetIndex = STEPS.indexOf(step);
    const currentIndex = STEPS.indexOf(currentStep);
    // Solo permitir ir a pasos anteriores o el actual
    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  // Submit del formulario
  const handleSubmit = async () => {
    if (!user?.uid) {
      setError("Debes iniciar sesión para crear un proyecto");
      return;
    }

    if (!data.mode || !data.campaignType || !data.userRole) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    if (!data.projectName.trim()) {
      setError("El nombre del proyecto es requerido");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const projectId = await createProject({
        userId: user.uid,
        projectName: data.projectName.trim(),
        projectDescription: data.projectDescription.trim() || undefined,
        mode: data.mode,
        campaignType: data.campaignType,
        jurisdiction: data.jurisdiction as Jurisdiction,
        userRole: data.userRole,
      });

      // Redirigir al proyecto creado
      router.push(`/moddulo/proyecto/${projectId}/fundacion/proposito`);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(
        err instanceof Error ? err.message : "Error al crear el proyecto",
      );
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // ESTADOS DE CARGA Y AUTENTICACIÓN
  // ============================================================

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bluegreen-eske border-t-transparent" />
          <p className="mt-4 text-gray-eske-70">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10 p-4">
        <div className="max-w-md w-full bg-white-eske rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-bluegreen-eske/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-bluegreen-eske"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-bluegreen-eske mb-4">
            Inicia sesión para continuar
          </h1>
          <p className="text-gray-eske-70 mb-6">
            Necesitas una cuenta para crear proyectos estratégicos en Moddulo.
          </p>
          <Link
            href="/login"
            className="inline-block bg-bluegreen-eske text-white-eske px-6 py-3 rounded-lg font-medium hover:bg-bluegreen-eske/90 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-eske-10">
      {/* Header */}
      <header className="bg-bluegreen-eske text-white-eske py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/moddulo"
            className="text-sm text-white-eske/70 hover:text-white-eske mb-2 inline-flex items-center gap-1 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a Moddulo
          </Link>
          <h1 className="text-2xl font-bold">
            Crear Nuevo Proyecto Estratégico
          </h1>
          <p className="text-white-eske/80 mt-1">
            Configura tu proyecto en pocos pasos
          </p>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="bg-white-eske border-b border-gray-eske-20 py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <StepIndicator currentStep={currentStep} onStepClick={goToStep} />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white-eske rounded-lg shadow-lg p-6 md:p-8">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
              <svg
                className="w-5 h-5 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Steps */}
          {currentStep === "mode" && (
            <StepMode data={data} updateData={updateData} onNext={nextStep} />
          )}
          {currentStep === "basics" && (
            <StepBasics
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === "campaign" && (
            <StepCampaign
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === "role" && (
            <StepRole
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === "jurisdiction" && (
            <StepJurisdiction
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === "confirm" && (
            <StepConfirm
              data={data}
              onBack={prevStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================
// STEP INDICATOR
// ============================================================

interface StepIndicatorProps {
  currentStep: Step;
  onStepClick: (step: Step) => void;
}

function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isClickable = index <= currentIndex;

        return (
          <React.Fragment key={step}>
            <button
              onClick={() => isClickable && onStepClick(step)}
              disabled={!isClickable}
              className={`flex items-center ${isClickable ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${
                    isCompleted || isCurrent
                      ? "bg-bluegreen-eske text-white-eske"
                      : "bg-gray-eske-20 text-gray-eske-60"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`ml-2 text-sm hidden sm:inline transition-colors ${
                  isCompleted || isCurrent
                    ? "text-bluegreen-eske font-medium"
                    : "text-gray-eske-60"
                }`}
              >
                {STEP_LABELS[step]}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  index < currentIndex ? "bg-bluegreen-eske" : "bg-gray-eske-20"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================
// STEP PROPS INTERFACE
// ============================================================

interface StepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

// ============================================================
// STEP 1: MODE (Generador / Refinador)
// ============================================================

function StepMode({ data, updateData, onNext }: StepProps) {
  const modes: {
    id: ProjectMode;
    title: string;
    description: string;
    icon: string;
  }[] = [
    {
      id: "generador",
      title: "Modo Generador",
      description:
        "La IA te guía desde cero con preguntas estratégicas y datos contextuales para construir tu estrategia paso a paso.",
      icon: "✨",
    },
    {
      id: "refinador",
      title: "Modo Refinador",
      description:
        "Ya tienes documentos o avance previo. La IA estructura, valida y mejora tu trabajo existente.",
      icon: "📄",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-bluegreen-eske mb-2">
        ¿Cómo quieres empezar?
      </h2>
      <p className="text-gray-eske-70 mb-6">
        Selecciona el modo que mejor se adapte a tu situación actual.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => updateData({ mode: mode.id })}
            className={`
              p-6 rounded-lg border-2 text-left transition-all
              ${
                data.mode === mode.id
                  ? "border-bluegreen-eske bg-bluegreen-eske/5 shadow-md"
                  : "border-gray-eske-20 hover:border-gray-eske-40 hover:shadow-sm"
              }
            `}
          >
            <span className="text-4xl mb-4 block">{mode.icon}</span>
            <h3 className="font-semibold text-bluegreen-eske mb-2">
              {mode.title}
            </h3>
            <p className="text-sm text-gray-eske-70 leading-relaxed">
              {mode.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!data.mode}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all
            ${
              data.mode
                ? "bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90 shadow-sm"
                : "bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed"
            }
          `}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 2: BASICS (Nombre y descripción)
// ============================================================

function StepBasics({ data, updateData, onNext, onBack }: StepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-bluegreen-eske mb-2">
        Datos del proyecto
      </h2>
      <p className="text-gray-eske-70 mb-6">
        Dale un nombre a tu proyecto estratégico. Podrás cambiarlo después.
      </p>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-eske-80 mb-1.5"
          >
            Nombre del proyecto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="projectName"
            value={data.projectName}
            onChange={(e) => updateData({ projectName: e.target.value })}
            placeholder="Ej: Campaña Presidencial 2027"
            maxLength={100}
            className="w-full px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent transition-shadow"
          />
          <p className="mt-1 text-xs text-gray-eske-50">
            {data.projectName.length}/100 caracteres
          </p>
        </div>

        <div>
          <label
            htmlFor="projectDescription"
            className="block text-sm font-medium text-gray-eske-80 mb-1.5"
          >
            Descripción <span className="text-gray-eske-50">(opcional)</span>
          </label>
          <textarea
            id="projectDescription"
            value={data.projectDescription}
            onChange={(e) => updateData({ projectDescription: e.target.value })}
            placeholder="Describe brevemente el objetivo de tu proyecto..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent resize-none transition-shadow"
          />
          <p className="mt-1 text-xs text-gray-eske-50">
            {data.projectDescription.length}/500 caracteres
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-eske-70 hover:bg-gray-eske-10 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!data.projectName.trim()}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all
            ${
              data.projectName.trim()
                ? "bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90 shadow-sm"
                : "bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed"
            }
          `}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 3: CAMPAIGN TYPE
// ============================================================

function StepCampaign({ data, updateData, onNext, onBack }: StepProps) {
  const campaignTypes = Object.entries(CAMPAIGN_TYPE_LABELS) as [
    CampaignType,
    string,
  ][];

  return (
    <div>
      <h2 className="text-xl font-semibold text-bluegreen-eske mb-2">
        Tipo de proyecto
      </h2>
      <p className="text-gray-eske-70 mb-6">
        ¿Qué tipo de proyecto político vas a desarrollar?
      </p>

      <div className="grid gap-3">
        {campaignTypes.map(([type, label]) => (
          <button
            key={type}
            onClick={() => updateData({ campaignType: type })}
            className={`
              p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3
              ${
                data.campaignType === type
                  ? "border-bluegreen-eske bg-bluegreen-eske/5"
                  : "border-gray-eske-20 hover:border-gray-eske-40"
              }
            `}
          >
            <div
              className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                ${data.campaignType === type ? "border-bluegreen-eske" : "border-gray-eske-40"}
              `}
            >
              {data.campaignType === type && (
                <div className="w-2.5 h-2.5 rounded-full bg-bluegreen-eske" />
              )}
            </div>
            <span className="font-medium text-gray-eske-80">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-eske-70 hover:bg-gray-eske-10 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!data.campaignType}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all
            ${
              data.campaignType
                ? "bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90 shadow-sm"
                : "bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed"
            }
          `}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 4: USER ROLE
// ============================================================

function StepRole({ data, updateData, onNext, onBack }: StepProps) {
  const roles = Object.entries(USER_ROLE_LABELS) as [UserRole, string][];

  return (
    <div>
      <h2 className="text-xl font-semibold text-bluegreen-eske mb-2">
        Tu rol en el proyecto
      </h2>
      <p className="text-gray-eske-70 mb-6">
        ¿Cuál es tu rol principal? Esto nos ayuda a personalizar la experiencia.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {roles.map(([role, label]) => (
          <button
            key={role}
            onClick={() => updateData({ userRole: role })}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${
                data.userRole === role
                  ? "border-bluegreen-eske bg-bluegreen-eske/5"
                  : "border-gray-eske-20 hover:border-gray-eske-40"
              }
            `}
          >
            <span className="font-medium text-gray-eske-80">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-eske-70 hover:bg-gray-eske-10 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!data.userRole}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all
            ${
              data.userRole
                ? "bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90 shadow-sm"
                : "bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed"
            }
          `}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 5: JURISDICTION
// ============================================================

function StepJurisdiction({ data, updateData, onNext, onBack }: StepProps) {
  const levels = Object.entries(JURISDICTION_LEVEL_LABELS) as [
    JurisdictionLevel,
    string,
  ][];

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code);
    updateData({
      jurisdiction: {
        ...data.jurisdiction,
        country: code,
        countryName: country?.name || code,
      },
    });
  };

  const handleLevelChange = (level: JurisdictionLevel) => {
    updateData({
      jurisdiction: {
        ...data.jurisdiction,
        level,
      },
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-bluegreen-eske mb-2">
        Ubicación del proyecto
      </h2>
      <p className="text-gray-eske-70 mb-6">
        ¿Dónde se desarrollará tu proyecto político?
      </p>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-eske-80 mb-1.5"
          >
            País
          </label>
          <select
            id="country"
            value={data.jurisdiction.country || "MX"}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent bg-white-eske"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-2">
            Nivel de jurisdicción
          </label>
          <div className="grid gap-2 md:grid-cols-2">
            {levels.map(([level, label]) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all text-sm
                  ${
                    data.jurisdiction.level === level
                      ? "border-bluegreen-eske bg-bluegreen-eske/5"
                      : "border-gray-eske-20 hover:border-gray-eske-40"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-eske-70 hover:bg-gray-eske-10 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg font-medium bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90 shadow-sm transition-all"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 6: CONFIRM
// ============================================================

interface StepConfirmProps {
  data: OnboardingData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function StepConfirm({
  data,
  onBack,
  onSubmit,
  isSubmitting,
}: StepConfirmProps) {
  const summaryItems = [
    { label: "Nombre", value: data.projectName || "Sin nombre" },
    {
      label: "Modo",
      value: data.mode === "generador" ? "✨ Generador" : "📄 Refinador",
    },
    {
      label: "Tipo",
      value: data.campaignType ? CAMPAIGN_TYPE_LABELS[data.campaignType] : "-",
    },
    {
      label: "Rol",
      value: data.userRole ? USER_ROLE_LABELS[data.userRole] : "-",
    },
    {
      label: "Ubicación",
      value: `${data.jurisdiction.countryName || "México"} - ${
        data.jurisdiction.level
          ? JURISDICTION_LEVEL_LABELS[data.jurisdiction.level]
          : "Federal"
      }`,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-bluegreen-eske mb-2">
        Confirma tu proyecto
      </h2>
      <p className="text-gray-eske-70 mb-6">
        Revisa los datos antes de crear el proyecto. Podrás modificarlos
        después.
      </p>

      <div className="bg-gray-eske-10 rounded-lg p-6 space-y-4">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex justify-between items-start">
            <span className="text-sm text-gray-eske-60">{item.label}</span>
            <span className="font-medium text-right max-w-[60%]">
              {item.value}
            </span>
          </div>
        ))}
        {data.projectDescription && (
          <div className="pt-3 border-t border-gray-eske-20">
            <span className="text-sm text-gray-eske-60 block mb-1">
              Descripción
            </span>
            <p className="text-sm text-gray-eske-80">
              {data.projectDescription}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-bluegreen-eske/5 border border-bluegreen-eske/20 rounded-lg">
        <p className="text-sm text-bluegreen-eske">
          <strong>¿Qué sigue?</strong> Al crear el proyecto, serás dirigido a la
          primera fase:
          <span className="font-semibold"> Propósito</span>, donde definirás la
          intención central de tu proyecto.
        </p>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-eske-70 hover:bg-gray-eske-10 transition-colors disabled:opacity-50"
        >
          Atrás
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg font-medium bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90 shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creando proyecto...
            </>
          ) : (
            <>
              Crear Proyecto
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
