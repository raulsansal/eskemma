// app/moddulo/proyecto/nuevo/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PROJECT_TYPE_LABELS, PROJECT_TYPE_DESCRIPTIONS } from "@/types/moddulo.types";
import type { ProjectType } from "@/types/moddulo.types";

type Step = 1 | 2 | 3;

// Separated so useSearchParams is inside a Suspense boundary
function NuevoProyectoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType | null>(null);

  // Centinela integration — query params
  const centinelaProjectId = searchParams.get("centinelaProjectId");
  const centinelaProjectName = searchParams.get("centinelaProjectName");
  const centinelaProjectType = searchParams.get("centinelaProjectType") as ProjectType | null;
  const fromCentinela = searchParams.get("from") === "centinela" && !!centinelaProjectId;

  // Pre-fill if coming from Centinela
  useEffect(() => {
    if (fromCentinela) {
      if (centinelaProjectName) setName(centinelaProjectName);
      const validTypes: ProjectType[] = ["electoral", "gubernamental", "legislativo", "ciudadano"];
      if (centinelaProjectType && validTypes.includes(centinelaProjectType)) {
        setType(centinelaProjectType);
      }
    }
  }, [fromCentinela, centinelaProjectName, centinelaProjectType]);

  const projectTypes: ProjectType[] = ["electoral", "gubernamental", "legislativo", "ciudadano"];
  const canAdvanceStep1 = name.trim().length >= 3 && type !== null;

  const handleCreate = async () => {
    if (!type || !name.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/moddulo/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim(),
          description: description.trim(),
          centinelaProjectId: fromCentinela ? centinelaProjectId : undefined,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al crear el proyecto");
        return;
      }

      router.push(`/moddulo/proyecto/${data.project.id}/proposito`);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-eske-10">
      {/* Header */}
      <div className="bg-bluegreen-eske text-white-eske py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href="/moddulo/proyecto"
            className="text-white-eske/70 hover:text-white-eske text-sm flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Mis Proyectos
          </Link>
          <span className="text-white-eske/40">/</span>
          <span className="font-medium text-sm">Nuevo Proyecto</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Banner Centinela */}
        {fromCentinela && (
          <div className="mb-6 flex items-start gap-3 bg-bluegreen-eske/10 border border-bluegreen-eske/30
            rounded-xl px-4 py-3">
            <span className="text-lg shrink-0" aria-hidden="true">🛡️</span>
            <div>
              <p className="text-sm font-semibold text-bluegreen-eske-60">
                Proyecto vinculado a Centinela
              </p>
              <p className="text-xs text-gray-eske-60 mt-0.5">
                El análisis PEST-L de{" "}
                <strong>{centinelaProjectName ?? "tu proyecto Centinela"}</strong>{" "}
                estará disponible para importar en la Fase 2 — Exploración.
              </p>
            </div>
          </div>
        )}

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= s
                    ? "bg-bluegreen-eske text-white-eske"
                    : "bg-gray-eske-20 text-gray-eske-50"
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`h-0.5 w-12 transition-colors ${
                    step > s ? "bg-bluegreen-eske" : "bg-gray-eske-20"
                  }`}
                />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-eske-50">
            {step === 1 ? "Nombre y tipo" : "Confirmación"}
          </span>
        </div>

        {/* Step 1: Nombre y tipo */}
        {step === 1 && (
          <div className="bg-white-eske rounded-xl border border-gray-eske-20 p-6">
            <h1 className="text-xl font-bold text-black-eske mb-1">
              Nuevo proyecto estratégico
            </h1>
            <p className="text-black-eske-10 font-medium text-sm mb-6">
              Define el nombre y el tipo de proyecto político que vas a desarrollar.
            </p>

            {/* Nombre */}
            <div className="mb-5">
              <label htmlFor="project-name" className="block text-sm font-medium text-black-eske-10 mb-2">
                Nombre del proyecto <span className="text-red-eske">*</span>
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Campaña Municipal Guadalajara 2027"
                className="w-full px-4 py-3 rounded-lg border border-gray-eske-20
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske/30
                  focus-visible:border-bluegreen-eske text-black-eske text-sm"
                maxLength={100}
                autoFocus={!fromCentinela}
              />
              <p className="text-xs text-gray-eske-40 mt-1">{name.length}/100</p>
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <label htmlFor="project-description" className="block text-sm font-medium text-black-eske-10 mb-2">
                Descripción breve <span className="text-gray-eske-40">(opcional)</span>
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Un párrafo que contextualice el proyecto..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-gray-eske-20
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske/30
                  focus-visible:border-bluegreen-eske text-black-eske text-sm resize-none"
                maxLength={300}
              />
            </div>

            {/* Tipo de proyecto */}
            <div className="mb-6">
              <p className="text-sm font-medium text-black-eske-10 mb-3">
                Tipo de proyecto <span className="text-red-eske">*</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projectTypes.map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setType(pt)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      type === pt
                        ? "border-bluegreen-eske bg-bluegreen-eske/5"
                        : "border-gray-eske-20 hover:border-gray-eske-40"
                    }`}
                  >
                    <div className="font-bold text-black-eske text-sm mb-1">
                      {PROJECT_TYPE_LABELS[pt]}
                    </div>
                    <div className="text-xs text-black-eske-10 font-medium leading-relaxed">
                      {PROJECT_TYPE_DESCRIPTIONS[pt]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canAdvanceStep1}
              className="w-full py-3 bg-bluegreen-eske text-white-eske rounded-lg font-medium
                text-sm disabled:opacity-40 disabled:cursor-not-allowed
                hover:bg-bluegreen-eske/90 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Confirmación */}
        {step === 2 && (
          <div className="bg-white-eske rounded-xl border border-gray-eske-20 p-6">
            <h1 className="text-xl font-bold text-black-eske mb-1">
              Confirma tu proyecto
            </h1>
            <p className="text-black-eske-10 font-medium text-sm mb-6">
              Al crear el proyecto, Moddulo te guiará a través de la Fase 1 — Propósito,
              donde definirás las variables XPCTO del proyecto.
            </p>

            {/* Resumen */}
            <div className="bg-gray-eske-10 rounded-lg p-4 mb-6 space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-eske-40">Nombre</span>
                <p className="text-black-eske font-medium mt-0.5">{name}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-eske-40">Tipo</span>
                <p className="text-black-eske font-medium mt-0.5">
                  {type && PROJECT_TYPE_LABELS[type]}
                </p>
                <p className="text-gray-eske-50 text-xs mt-0.5">
                  {type && PROJECT_TYPE_DESCRIPTIONS[type]}
                </p>
              </div>
              {description && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-eske-40">Descripción</span>
                  <p className="text-black-eske-10 text-sm mt-0.5">{description}</p>
                </div>
              )}
              {fromCentinela && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-eske-40">Vinculado a Centinela</span>
                  <p className="text-bluegreen-eske text-sm font-medium mt-0.5">
                    🛡️ {centinelaProjectName ?? centinelaProjectId}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-eske/10 border border-red-eske/30 rounded-lg text-red-eske text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isCreating}
                className="flex-1 py-3 border border-gray-eske-20 text-gray-eske-60 rounded-lg
                  font-medium text-sm hover:bg-gray-eske-10 transition-colors disabled:opacity-40"
              >
                Regresar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="flex-[2] py-3 bg-bluegreen-eske text-white-eske rounded-lg font-medium
                  text-sm disabled:opacity-60 hover:bg-bluegreen-eske/90 transition-colors
                  flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white-eske/30 border-t-white-eske rounded-full animate-spin" aria-hidden="true" />
                    Creando proyecto...
                  </>
                ) : (
                  "Crear proyecto y comenzar"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NuevoProyectoPage() {
  return (
    <Suspense>
      <NuevoProyectoContent />
    </Suspense>
  );
}