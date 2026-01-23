// app/moddulo/proyecto/[projectId]/fundacion/exploracion/page.tsx
"use client";

import React, { useState } from "react";
import {
  useStrategyContext,
  usePhaseData,
} from "@/app/moddulo/components/StrategyContextProvider";
import {
  PHASE_METADATA,
  LAYER_METADATA,
  type ExploracionData,
  type QuantitativeInsight,
  type QualitativeInsight,
  type DataSource,
  type ElectoralContext,
} from "@/types/strategy-context.types";

// ============================================================
// CONSTANTES
// ============================================================

const PHASE = "exploracion";
const LAYER = "fundacion";
const phaseInfo = PHASE_METADATA[PHASE];
const layerInfo = LAYER_METADATA[LAYER];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ExploracionPage() {
  const {
    project,
    completePhase,
    loading: contextLoading,
  } = useStrategyContext();
  const { data, updateData, isDirty } = usePhaseData<ExploracionData>(PHASE);

  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "cuantitativo" | "cualitativo" | "contexto" | "fuentes"
  >("cuantitativo");

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleCompletePhase = async () => {
    // Validar campos mínimos
    const hasQuantitative =
      data?.quantitativeInsights && data.quantitativeInsights.length > 0;
    const hasQualitative =
      data?.qualitativeInsights && data.qualitativeInsights.length > 0;

    if (!hasQuantitative && !hasQualitative) {
      alert(
        "Por favor agrega al menos un insight cuantitativo o cualitativo antes de continuar.",
      );
      return;
    }

    setIsCompleting(true);
    const result = await completePhase(PHASE);

    if (!result.success) {
      alert(result.error || "Error al completar la fase");
    }
    setIsCompleting(false);
  };

  // ============================================================
  // HANDLERS DE DATOS
  // ============================================================

  const addQuantitativeInsight = (insight: QuantitativeInsight) => {
    const current = data?.quantitativeInsights || [];
    updateData({ quantitativeInsights: [...current, insight] });
  };

  const removeQuantitativeInsight = (index: number) => {
    const current = data?.quantitativeInsights || [];
    updateData({ quantitativeInsights: current.filter((_, i) => i !== index) });
  };

  const addQualitativeInsight = (insight: QualitativeInsight) => {
    const current = data?.qualitativeInsights || [];
    updateData({ qualitativeInsights: [...current, insight] });
  };

  const removeQualitativeInsight = (index: number) => {
    const current = data?.qualitativeInsights || [];
    updateData({ qualitativeInsights: current.filter((_, i) => i !== index) });
  };

  const updateElectoralContext = (updates: Partial<ElectoralContext>) => {
    const current = data?.electoralContext || {
      mainCompetitors: [],
      keyIssues: [],
    };
    updateData({ electoralContext: { ...current, ...updates } });
  };

  const addSource = (source: DataSource) => {
    const current = data?.sources || [];
    updateData({ sources: [...current, source] });
  };

  const removeSource = (index: number) => {
    const current = data?.sources || [];
    updateData({ sources: current.filter((_, i) => i !== index) });
  };

  // ============================================================
  // CÁLCULO DE PROGRESO
  // ============================================================

  const calculateProgress = (): number => {
    if (!data) return 0;

    let completed = 0;
    const total = 4;

    if (data.quantitativeInsights?.length > 0) completed++;
    if (data.qualitativeInsights?.length > 0) completed++;
    if ((data?.electoralContext?.keyIssues?.length ?? 0) > 0) completed++;
    if (data.sources?.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();
  const isPhaseCompleted = project?.completedPhases.includes(PHASE);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-eske-60 mb-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: layerInfo.color }}
          />
          <span>{layerInfo.name}</span>
          <span>•</span>
          <span>Fase 2 de 9</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-bluegreen-eske flex items-center gap-3">
              <span className="text-3xl">{phaseInfo.icon}</span>
              {phaseInfo.name}
            </h1>
            <p className="text-gray-eske-70 mt-1">{phaseInfo.description}</p>
            <p className="text-sm text-gray-eske-50 mt-2 italic">
              Pregunta clave: {phaseInfo.question}
            </p>
          </div>

          {isPhaseCompleted && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium shrink-0">
              ✓ Completada
            </span>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-eske-60">Progreso de la fase</span>
            <span className="font-medium" style={{ color: layerInfo.color }}>
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-eske-10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: layerInfo.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Apps integradas */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>🔗 Apps disponibles:</strong> Puedes usar{" "}
          <span className="font-semibold">Centro de Escucha</span> y{" "}
          <span className="font-semibold">Síntesis Legislativa</span> para
          obtener datos.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-eske-20 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            {
              id: "cuantitativo",
              label: "Datos Cuantitativos",
              count: data?.quantitativeInsights?.length || 0,
            },
            {
              id: "cualitativo",
              label: "Insights Cualitativos",
              count: data?.qualitativeInsights?.length || 0,
            },
            { id: "contexto", label: "Contexto Electoral" },
            {
              id: "fuentes",
              label: "Fuentes",
              count: data?.sources?.length || 0,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? "border-bluegreen-eske text-bluegreen-eske"
                    : "border-transparent text-gray-eske-60 hover:text-gray-eske-80"
                }
              `}
            >
              {tab.label}
              {"count" in tab &&
                typeof tab.count === "number" &&
                tab.count > 0 && (
                  <span
                    className={`
                  px-1.5 py-0.5 text-xs rounded-full
                  ${activeTab === tab.id ? "bg-bluegreen-eske/20" : "bg-gray-eske-20"}
                `}
                  >
                    {tab.count}
                  </span>
                )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="space-y-6">
        {activeTab === "cuantitativo" && (
          <TabCuantitativo
            insights={data?.quantitativeInsights || []}
            onAdd={addQuantitativeInsight}
            onRemove={removeQuantitativeInsight}
          />
        )}
        {activeTab === "cualitativo" && (
          <TabCualitativo
            insights={data?.qualitativeInsights || []}
            onAdd={addQualitativeInsight}
            onRemove={removeQualitativeInsight}
          />
        )}
        {activeTab === "contexto" && (
          <TabContexto
            context={data?.electoralContext}
            onChange={updateElectoralContext}
          />
        )}
        {activeTab === "fuentes" && (
          <TabFuentes
            sources={data?.sources || []}
            onAdd={addSource}
            onRemove={removeSource}
          />
        )}
      </div>

      {/* Footer con acciones */}
      <div className="mt-8 pt-6 border-t border-gray-eske-20 flex items-center justify-between">
        <div className="text-sm text-gray-eske-50">
          {isDirty ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-eske rounded-full" />
              Guardando automáticamente...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Todos los cambios guardados
            </span>
          )}
        </div>

        {!isPhaseCompleted && (
          <button
            onClick={handleCompletePhase}
            disabled={isCompleting || progress < 50}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
              ${
                progress >= 50
                  ? "bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90 shadow-sm"
                  : "bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed"
              }
            `}
          >
            {isCompleting ? (
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
                Completando...
              </>
            ) : (
              <>
                Completar y continuar
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
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB: DATOS CUANTITATIVOS
// ============================================================

interface TabCuantitativoProps {
  insights: QuantitativeInsight[];
  onAdd: (insight: QuantitativeInsight) => void;
  onRemove: (index: number) => void;
}

function TabCuantitativo({ insights, onAdd, onRemove }: TabCuantitativoProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<QuantitativeInsight>>({});

  const handleSubmit = () => {
    if (!form.metric?.trim() || !form.value) return;

    onAdd({
      metric: form.metric.trim(),
      value: form.value,
      source: form.source?.trim() || "No especificada",
      date: form.date,
      trend: form.trend,
    });

    setForm({});
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Datos Cuantitativos</h3>
          <p className="text-sm text-gray-eske-50">
            Métricas, estadísticas y datos numéricos relevantes
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors"
          >
            + Agregar dato
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-eske-10 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                Métrica <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.metric || ""}
                onChange={(e) => setForm({ ...form, metric: e.target.value })}
                placeholder="Ej: Intención de voto"
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                Valor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.value || ""}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="Ej: 45%"
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                Fuente
              </label>
              <input
                type="text"
                value={form.source || ""}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Ej: Encuesta Mitofsky"
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                Tendencia
              </label>
              <select
                value={form.trend || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    trend: e.target.value as QuantitativeInsight["trend"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent bg-white-eske"
              >
                <option value="">Seleccionar...</option>
                <option value="up">↑ Al alza</option>
                <option value="down">↓ A la baja</option>
                <option value="stable">→ Estable</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setForm({});
              }}
              className="px-4 py-2 text-gray-eske-70 hover:bg-gray-eske-20 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.metric?.trim() || !form.value}
              className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors disabled:bg-gray-eske-20 disabled:text-gray-eske-50"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Lista de insights */}
      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-eske-80">
                    {insight.metric}
                  </span>
                  {insight.trend && (
                    <span
                      className={`text-sm ${
                        insight.trend === "up"
                          ? "text-green-600"
                          : insight.trend === "down"
                            ? "text-red-600"
                            : "text-gray-eske-50"
                      }`}
                    >
                      {insight.trend === "up"
                        ? "↑"
                        : insight.trend === "down"
                          ? "↓"
                          : "→"}
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-bluegreen-eske">
                  {insight.value}
                </p>
                <p className="text-xs text-gray-eske-50 mt-1">
                  Fuente: {insight.source}
                  {insight.date && ` • ${insight.date}`}
                </p>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="p-1.5 text-gray-eske-40 hover:text-red-500 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-eske-50">
          <p>No hay datos cuantitativos agregados</p>
          <p className="text-sm mt-1">
            Agrega métricas como encuestas, estadísticas, indicadores, etc.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: INSIGHTS CUALITATIVOS
// ============================================================

interface TabCualitativoProps {
  insights: QualitativeInsight[];
  onAdd: (insight: QualitativeInsight) => void;
  onRemove: (index: number) => void;
}

function TabCualitativo({ insights, onAdd, onRemove }: TabCualitativoProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<QualitativeInsight>>({});

  const handleSubmit = () => {
    if (!form.insight?.trim() || !form.category) return;

    onAdd({
      category: form.category,
      insight: form.insight.trim(),
      source: form.source?.trim() || "No especificada",
      relevance: form.relevance || "medium",
    });

    setForm({});
    setShowForm(false);
  };

  const categoryLabels: Record<QualitativeInsight["category"], string> = {
    opinion: "Opinión",
    perception: "Percepción",
    sentiment: "Sentimiento",
    narrative: "Narrativa",
  };

  const relevanceLabels: Record<QualitativeInsight["relevance"], string> = {
    high: "Alta",
    medium: "Media",
    low: "Baja",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">
            Insights Cualitativos
          </h3>
          <p className="text-sm text-gray-eske-50">
            Opiniones, percepciones y narrativas del entorno
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors"
          >
            + Agregar insight
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-eske-10 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as QualitativeInsight["category"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent bg-white-eske"
              >
                <option value="">Seleccionar...</option>
                <option value="opinion">Opinión pública</option>
                <option value="perception">Percepción ciudadana</option>
                <option value="sentiment">Sentimiento general</option>
                <option value="narrative">Narrativa mediática</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                Relevancia
              </label>
              <select
                value={form.relevance || "medium"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    relevance: e.target
                      .value as QualitativeInsight["relevance"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent bg-white-eske"
              >
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-eske-80 mb-1">
              Insight <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.insight || ""}
              onChange={(e) => setForm({ ...form, insight: e.target.value })}
              placeholder="Describe el hallazgo o insight..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-eske-80 mb-1">
              Fuente
            </label>
            <input
              type="text"
              value={form.source || ""}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="Ej: Focus group zona norte"
              className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setForm({});
              }}
              className="px-4 py-2 text-gray-eske-70 hover:bg-gray-eske-20 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.insight?.trim() || !form.category}
              className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors disabled:bg-gray-eske-20 disabled:text-gray-eske-50"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Lista de insights */}
      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-bluegreen-eske/10 text-bluegreen-eske text-xs font-medium rounded">
                    {categoryLabels[insight.category]}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      insight.relevance === "high"
                        ? "bg-red-100 text-red-700"
                        : insight.relevance === "low"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Relevancia {relevanceLabels[insight.relevance]}
                  </span>
                </div>
                <p className="text-gray-eske-80">{insight.insight}</p>
                <p className="text-xs text-gray-eske-50 mt-2">
                  Fuente: {insight.source}
                </p>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="p-1.5 text-gray-eske-40 hover:text-red-500 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-eske-50">
          <p>No hay insights cualitativos agregados</p>
          <p className="text-sm mt-1">
            Agrega opiniones, percepciones y narrativas relevantes
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: CONTEXTO ELECTORAL
// ============================================================

interface TabContextoProps {
  context: ElectoralContext | undefined;
  onChange: (updates: Partial<ElectoralContext>) => void;
}

function TabContexto({ context, onChange }: TabContextoProps) {
  const [newCompetitor, setNewCompetitor] = useState("");
  const [newIssue, setNewIssue] = useState("");

  const addCompetitor = () => {
    if (!newCompetitor.trim()) return;
    const current = context?.mainCompetitors || [];
    if (!current.includes(newCompetitor.trim())) {
      onChange({ mainCompetitors: [...current, newCompetitor.trim()] });
    }
    setNewCompetitor("");
  };

  const removeCompetitor = (index: number) => {
    const current = context?.mainCompetitors || [];
    onChange({ mainCompetitors: current.filter((_, i) => i !== index) });
  };

  const addIssue = () => {
    if (!newIssue.trim()) return;
    const current = context?.keyIssues || [];
    if (!current.includes(newIssue.trim())) {
      onChange({ keyIssues: [...current, newIssue.trim()] });
    }
    setNewIssue("");
  };

  const removeIssue = (index: number) => {
    const current = context?.keyIssues || [];
    onChange({ keyIssues: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Fecha de elección */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Fecha de elección (si aplica)
          </label>
          <input
            type="date"
            value={context?.electionDate || ""}
            onChange={(e) => onChange({ electionDate: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Participación esperada (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={context?.expectedTurnout || ""}
            onChange={(e) =>
              onChange({
                expectedTurnout: parseInt(e.target.value) || undefined,
              })
            }
            placeholder="Ej: 65"
            className="w-full px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
          />
        </div>
      </div>

      {/* Competidores principales */}
      <div>
        <label className="block text-sm font-medium text-gray-eske-80 mb-2">
          Competidores principales
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addCompetitor())
            }
            placeholder="Nombre del competidor"
            className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
          />
          <button
            onClick={addCompetitor}
            disabled={!newCompetitor.trim()}
            className="px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg font-medium hover:bg-bluegreen-eske/90 transition-colors disabled:bg-gray-eske-20 disabled:text-gray-eske-50"
          >
            Agregar
          </button>
        </div>
        {context?.mainCompetitors && context.mainCompetitors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {context.mainCompetitors.map((competitor, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm"
              >
                {competitor}
                <button
                  onClick={() => removeCompetitor(index)}
                  className="hover:text-red-900"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Temas clave */}
      <div>
        <label className="block text-sm font-medium text-gray-eske-80 mb-2">
          Temas clave de la agenda
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newIssue}
            onChange={(e) => setNewIssue(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addIssue())
            }
            placeholder="Ej: Seguridad, Economía, Salud..."
            className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
          />
          <button
            onClick={addIssue}
            disabled={!newIssue.trim()}
            className="px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg font-medium hover:bg-bluegreen-eske/90 transition-colors disabled:bg-gray-eske-20 disabled:text-gray-eske-50"
          >
            Agregar
          </button>
        </div>
        {context?.keyIssues && context.keyIssues.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {context.keyIssues.map((issue, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bluegreen-eske/10 text-bluegreen-eske rounded-full text-sm"
              >
                {issue}
                <button
                  onClick={() => removeIssue(index)}
                  className="hover:text-bluegreen-eske/70"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB: FUENTES
// ============================================================

interface TabFuentesProps {
  sources: DataSource[];
  onAdd: (source: DataSource) => void;
  onRemove: (index: number) => void;
}

function TabFuentes({ sources, onAdd, onRemove }: TabFuentesProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<DataSource>>({});

  const handleSubmit = () => {
    if (!form.name?.trim() || !form.type) return;

    onAdd({
      name: form.name.trim(),
      type: form.type,
      url: form.url?.trim(),
      date: form.date,
    });

    setForm({});
    setShowForm(false);
  };

  const typeLabels: Record<DataSource["type"], string> = {
    survey: "Encuesta",
    "social-media": "Redes sociales",
    news: "Noticias",
    official: "Fuente oficial",
    academic: "Académica",
    internal: "Interna",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Fuentes de Datos</h3>
          <p className="text-sm text-gray-eske-50">
            Registra las fuentes utilizadas para la exploración
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors"
          >
            + Agregar fuente
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-eske-10 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Encuesta Mitofsky Mayo 2025"
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as DataSource["type"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent bg-white-eske"
              >
                <option value="">Seleccionar...</option>
                <option value="survey">Encuesta</option>
                <option value="social-media">Redes sociales</option>
                <option value="news">Noticias / Medios</option>
                <option value="official">Fuente oficial</option>
                <option value="academic">Académica / Investigación</option>
                <option value="internal">Interna / Propia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                URL (opcional)
              </label>
              <input
                type="url"
                value={form.url || ""}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={form.date || ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setForm({});
              }}
              className="px-4 py-2 text-gray-eske-70 hover:bg-gray-eske-20 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name?.trim() || !form.type}
              className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors disabled:bg-gray-eske-20 disabled:text-gray-eske-50"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Lista de fuentes */}
      {sources.length > 0 ? (
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div
              key={index}
              className="bg-white-eske border border-gray-eske-20 rounded-lg p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="px-2 py-1 bg-gray-eske-10 text-gray-eske-70 text-xs font-medium rounded">
                  {typeLabels[source.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-eske-80 truncate">
                    {source.name}
                  </p>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-bluegreen-eske hover:underline truncate block"
                    >
                      {source.url}
                    </a>
                  )}
                </div>
                {source.date && (
                  <span className="text-xs text-gray-eske-50 shrink-0">
                    {source.date}
                  </span>
                )}
              </div>
              <button
                onClick={() => onRemove(index)}
                className="p-1.5 text-gray-eske-40 hover:text-red-500 transition-colors shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-eske-50">
          <p>No hay fuentes registradas</p>
          <p className="text-sm mt-1">
            Agrega las fuentes de donde obtuviste los datos
          </p>
        </div>
      )}
    </div>
  );
}
