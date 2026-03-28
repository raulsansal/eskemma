"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type {
  CentinelaProject,
  CoverageStatus,
  DimensionCode,
  ReliabilityLevel,
} from "@/types/centinela.types";

const DIMENSION_LABELS: Record<DimensionCode, string> = {
  P: "Político",
  E: "Económico",
  S: "Social",
  T: "Tecnológico",
  L: "Legal / Ambiental",
};

const RELIABILITY_LABELS: Record<ReliabilityLevel, string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

type StatusIndicator = "green" | "yellow" | "red";

const STATUS_CONFIG: Record<
  StatusIndicator,
  { label: string; color: string; bg: string; icon: string }
> = {
  green: {
    label: "Cobertura buena",
    color: "text-green-eske",
    bg: "bg-green-eske/10",
    icon: "🟢",
  },
  yellow: {
    label: "Fuentes automáticas",
    color: "text-yellow-eske",
    bg: "bg-yellow-eske/10",
    icon: "🟡",
  },
  red: {
    label: "Datos con baja confiabilidad",
    color: "text-red-eske",
    bg: "bg-red-eske/10",
    icon: "🔴",
  },
};

export default function DatosPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [project, setProject] = useState<CentinelaProject | null>(null);
  const [coverage, setCoverage] = useState<CoverageStatus[]>([]);
  const [canTrigger, setCanTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual data form
  const [manualContent, setManualContent] = useState("");
  const [manualDimension, setManualDimension] = useState<DimensionCode>("P");
  const [manualSource, setManualSource] = useState("");
  const [manualReliability, setManualReliability] =
    useState<ReliabilityLevel>("MEDIUM");
  const [savingManual, setSavingManual] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch("/api/monitor/centinela/project");
      if (!res.ok) throw new Error("Error al cargar proyectos");
      const data = (await res.json()) as {
        projects: (CentinelaProject & { id: string })[];
      };
      const found = data.projects.find((p) => p.id === projectId);
      if (found) setProject(found);
    } catch {
      setError("No se pudo cargar el proyecto.");
    }
  }, [projectId]);

  const loadCoverage = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/monitor/centinela/project/${projectId}/coverage`
      );
      if (!res.ok) throw new Error();
      const data = (await res.json()) as {
        coverage: CoverageStatus[];
        canTriggerAnalysis: boolean;
      };
      setCoverage(data.coverage);
      setCanTrigger(data.canTriggerAnalysis);
    } catch {
      // Silent — coverage is non-blocking
    }
  }, [projectId]);

  useEffect(() => {
    Promise.all([loadProject(), loadCoverage()]).finally(() =>
      setLoading(false)
    );
  }, [loadProject, loadCoverage]);

  async function handleSaveManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualContent.trim()) return;

    setSavingManual(true);
    setManualSuccess(false);

    try {
      const res = await fetch(
        `/api/monitor/centinela/project/${projectId}/data-source`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: manualContent.trim(),
            dimensionCode: manualDimension,
            source: manualSource.trim() || "Carga manual",
            reliabilityLevel: manualReliability,
          }),
        }
      );

      if (!res.ok) throw new Error("Error al guardar");

      setManualContent("");
      setManualSource("");
      setManualSuccess(true);
      setTimeout(() => setManualSuccess(false), 3000);
      // Refresh coverage after adding data
      await loadCoverage();
    } catch {
      setError("No se pudo guardar el dato.");
    } finally {
      setSavingManual(false);
    }
  }

  async function handleTrigger() {
    if (!canTrigger || triggering) return;
    setTriggering(true);
    setError(null);

    try {
      const res = await fetch("/api/monitor/centinela/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) throw new Error("Error al iniciar análisis");
      const { jobId } = (await res.json()) as { jobId: string };
      router.push(`/monitor/centinela/${projectId}/analisis?jobId=${jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setTriggering(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-eske-10 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-bluegreen-eske border-t-transparent
          rounded-full animate-spin" aria-label="Cargando" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-eske-10">
      {/* Header */}
      <div className="bg-bluegreen-eske text-white px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/monitor/centinela")}
            className="text-sm text-white/70 hover:text-white mb-2 flex items-center
              gap-1 transition-colors"
            aria-label="Volver a Centinela"
          >
            ← Centinela
          </button>
          <h1 className="text-2xl font-semibold">
            {project?.nombre ?? "Proyecto"}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Etapa 4 — Recolección de datos
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Coverage semaphore */}
        <section aria-labelledby="coverage-heading">
          <h2
            id="coverage-heading"
            className="text-lg font-semibold text-black-eske mb-4"
          >
            Semáforo de cobertura
          </h2>
          <div className="bg-white-eske rounded-xl shadow-sm border border-gray-eske-20 overflow-hidden">
            {coverage.length === 0 ? (
              <div className="p-6 text-sm text-gray-eske-60 text-center">
                Sin datos aún. Agrega fuentes para ver el estado de cobertura.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-eske-10 bg-gray-eske-10">
                    <th className="text-left px-4 py-3 font-medium text-gray-eske-70">
                      Dimensión
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-eske-70">
                      Estado
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-eske-70">
                      Fuentes
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-eske-70">
                      Confianza
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.map((c) => {
                    const config = STATUS_CONFIG[c.status];
                    return (
                      <tr
                        key={c.code}
                        className="border-b border-gray-eske-10 last:border-0"
                      >
                        <td className="px-4 py-3 font-medium text-black-eske">
                          <span className="text-xs text-bluegreen-eske font-bold mr-2">
                            {c.code}
                          </span>
                          {DIMENSION_LABELS[c.code]}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                              "text-xs font-medium",
                              config.bg,
                              config.color,
                            ].join(" ")}
                          >
                            <span aria-hidden="true">{config.icon}</span>
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-eske-70">
                          {c.variablesWithData}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-eske-20 rounded-full max-w-24">
                              <div
                                className={[
                                  "h-1.5 rounded-full transition-all",
                                  c.confidence >= 60
                                    ? "bg-green-eske"
                                    : c.confidence >= 40
                                    ? "bg-yellow-eske"
                                    : "bg-red-eske",
                                ].join(" ")}
                                style={{ width: `${c.confidence}%` }}
                                role="progressbar"
                                aria-valuenow={c.confidence}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                            <span className="text-xs text-gray-eske-60 w-10">
                              {c.confidence}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Manual data form */}
        <section aria-labelledby="manual-heading">
          <h2
            id="manual-heading"
            className="text-lg font-semibold text-black-eske mb-4"
          >
            Agregar dato manualmente
          </h2>
          <div className="bg-white-eske rounded-xl shadow-sm border border-gray-eske-20 p-6">
            <p className="text-sm text-gray-eske-70 mb-5">
              Encuestas propias, notas de campo, entrevistas u otros datos
              que la IA no puede recopilar automáticamente.
            </p>
            <form onSubmit={handleSaveManual} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="manual-content"
                  className="text-sm font-medium text-black-eske"
                >
                  Contenido
                </label>
                <textarea
                  id="manual-content"
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="Pega aquí el texto de la encuesta, nota de campo o entrevista…"
                  rows={4}
                  className="px-3 py-2.5 border border-gray-eske-30 rounded-lg text-sm
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske
                    placeholder:text-gray-eske-50 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="manual-dim"
                    className="text-sm font-medium text-black-eske"
                  >
                    Dimensión
                  </label>
                  <select
                    id="manual-dim"
                    value={manualDimension}
                    onChange={(e) =>
                      setManualDimension(e.target.value as DimensionCode)
                    }
                    className="px-3 py-2 border border-gray-eske-30 rounded-lg text-sm
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske
                      bg-white-eske"
                  >
                    {(["P", "E", "S", "T", "L"] as DimensionCode[]).map(
                      (code) => (
                        <option key={code} value={code}>
                          {code} — {DIMENSION_LABELS[code]}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="manual-source"
                    className="text-sm font-medium text-black-eske"
                  >
                    Fuente
                  </label>
                  <input
                    id="manual-source"
                    type="text"
                    value={manualSource}
                    onChange={(e) => setManualSource(e.target.value)}
                    placeholder="ej. Encuesta propia, Entrevista…"
                    className="px-3 py-2 border border-gray-eske-30 rounded-lg text-sm
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske
                      placeholder:text-gray-eske-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="manual-reliability"
                    className="text-sm font-medium text-black-eske"
                  >
                    Confiabilidad
                  </label>
                  <select
                    id="manual-reliability"
                    value={manualReliability}
                    onChange={(e) =>
                      setManualReliability(e.target.value as ReliabilityLevel)
                    }
                    className="px-3 py-2 border border-gray-eske-30 rounded-lg text-sm
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske
                      bg-white-eske"
                  >
                    {(["HIGH", "MEDIUM", "LOW"] as ReliabilityLevel[]).map(
                      (level) => (
                        <option key={level} value={level}>
                          {RELIABILITY_LABELS[level]}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {manualSuccess && (
                <p className="text-sm text-green-eske bg-green-eske/10 px-3 py-2 rounded-lg">
                  ✓ Dato guardado. El semáforo ha sido actualizado.
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingManual || !manualContent.trim()}
                  className="px-5 py-2.5 bg-bluegreen-eske text-white rounded-lg
                    text-sm font-medium hover:bg-bluegreen-eske-60 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingManual ? "Guardando…" : "Guardar dato"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Automatic sources info */}
        <section aria-labelledby="auto-heading">
          <h2
            id="auto-heading"
            className="text-lg font-semibold text-black-eske mb-4"
          >
            Fuentes automáticas
          </h2>
          <div className="bg-white-eske rounded-xl shadow-sm border border-gray-eske-20 p-6">
            <p className="text-sm text-gray-eske-70 mb-3">
              Al ejecutar el análisis, Centinela recopila automáticamente datos
              de las siguientes fuentes públicas para el territorio configurado:
            </p>
            <ul className="text-sm text-gray-eske-70 list-none flex flex-col gap-1.5">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bluegreen-eske shrink-0" aria-hidden="true" />
                Google News — noticias recientes del territorio
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bluegreen-eske shrink-0" aria-hidden="true" />
                DOF — Diario Oficial de la Federación (decretos, normas)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bluegreen-eske shrink-0" aria-hidden="true" />
                INEGI — indicadores económicos y sociales
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bluegreen-eske shrink-0" aria-hidden="true" />
                Banxico — series financieras y monetarias
              </li>
            </ul>
            <p className="text-xs text-bluegreen-eske mt-3 font-medium">
              Puedes ejecutar el análisis con solo estas fuentes automáticas.
              Los datos manuales que agregues arriba enriquecen el análisis,
              pero no son obligatorios.
            </p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-eske bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Trigger */}
        <div className="flex flex-col items-center gap-3 py-4">
          {!canTrigger && coverage.length > 0 && (
            <p className="text-sm text-red-eske text-center max-w-md">
              Una o más dimensiones tienen datos con baja confiabilidad (&lt;40%).
              Revisa o elimina esos datos antes de continuar.
            </p>
          )}
          <button
            type="button"
            onClick={handleTrigger}
            disabled={!canTrigger || triggering}
            className="px-8 py-3 bg-orange-eske text-white rounded-xl text-base
              font-semibold hover:bg-orange-eske-60 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {triggering ? "Iniciando análisis…" : "Ejecutar análisis IA"}
          </button>
          <p className="text-xs text-gray-eske-60 text-center max-w-sm">
            El análisis puede tardar 2-3 minutos. Serás redirigido
            automáticamente al completarse.
          </p>
        </div>
      </div>
    </div>
  );
}
