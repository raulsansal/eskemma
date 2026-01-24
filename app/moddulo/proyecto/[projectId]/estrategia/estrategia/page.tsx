// app/moddulo/proyecto/[projectId]/estrategia/estrategia/page.tsx
"use client";

import React, { useState } from "react";
import {
  useStrategyContext,
  usePhaseData,
} from "@/app/moddulo/components/StrategyContextProvider";
import {
  PHASE_METADATA,
  LAYER_METADATA,
  type EstrategiaData,
  type StrategicObjective,
  type CentralNarrative,
  type Positioning,
  type CompetitorPosition,
  type StrategicSegment,
} from "@/types/strategy-context.types";

// ============================================================
// CONSTANTES
// ============================================================

const PHASE = "estrategia";
const LAYER = "estrategia";
const phaseInfo = PHASE_METADATA[PHASE];
const layerInfo = LAYER_METADATA[LAYER];

const OBJECTIVE_TYPES: Record<
  StrategicObjective["type"],
  { label: string; color: string }
> = {
  awareness: { label: "Conocimiento", color: "bg-blue-100 text-blue-800" },
  persuasion: { label: "Persuasión", color: "bg-purple-100 text-purple-800" },
  mobilization: {
    label: "Movilización",
    color: "bg-orange-100 text-orange-800",
  },
  conversion: { label: "Conversión", color: "bg-green-100 text-green-800" },
};

const STANCE_OPTIONS: Record<StrategicSegment["currentStance"], string> = {
  supporter: "Apoyo",
  leaning: "Inclinado",
  undecided: "Indeciso",
  opposition: "Oposición",
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function EstrategiaPage() {
  const { project, completePhase } = useStrategyContext();
  const { data, updateData, isDirty } = usePhaseData<EstrategiaData>(PHASE);

  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "objetivos" | "narrativa" | "posicionamiento" | "segmentos"
  >("objetivos");

  // ============================================================
  // HANDLERS DE DATOS
  // ============================================================

  // Objetivo principal
  const updateMainObjective = (value: string) => {
    updateData({ mainObjective: value });
  };

  // Objetivos específicos
  const addObjective = (objective: StrategicObjective) => {
    const current = data?.specificObjectives || [];
    updateData({ specificObjectives: [...current, objective] });
  };

  const removeObjective = (index: number) => {
    const current = data?.specificObjectives || [];
    updateData({ specificObjectives: current.filter((_, i) => i !== index) });
  };

  // Narrativa central
  const updateNarrative = (updates: Partial<CentralNarrative>) => {
    const current: CentralNarrative = data?.centralNarrative || {
      headline: "",
      subheadline: "",
      story: "",
      emotionalAppeal: "",
      callToAction: "",
    };
    updateData({ centralNarrative: { ...current, ...updates } });
  };

  // Posicionamiento
  const updatePositioning = (updates: Partial<Positioning>) => {
    const current: Positioning = data?.positioning || {
      category: "",
      differentiation: "",
      targetPerception: "",
      competitors: [],
    };
    updateData({ positioning: { ...current, ...updates } });
  };

  const addCompetitor = (competitor: CompetitorPosition) => {
    const current = data?.positioning?.competitors || [];
    updatePositioning({ competitors: [...current, competitor] });
  };

  const removeCompetitor = (index: number) => {
    const current = data?.positioning?.competitors || [];
    updatePositioning({ competitors: current.filter((_, i) => i !== index) });
  };

  // Segmentos estratégicos
  const addSegment = (segment: StrategicSegment) => {
    const current = data?.strategicSegments || [];
    updateData({ strategicSegments: [...current, segment] });
  };

  const removeSegment = (index: number) => {
    const current = data?.strategicSegments || [];
    updateData({ strategicSegments: current.filter((_, i) => i !== index) });
  };

  const updateSegment = (index: number, updates: Partial<StrategicSegment>) => {
    const current = data?.strategicSegments || [];
    const updated = current.map((seg, i) =>
      i === index ? { ...seg, ...updates } : seg,
    );
    updateData({ strategicSegments: updated });
  };

  // ============================================================
  // COMPLETAR FASE
  // ============================================================

  const handleCompletePhase = async () => {
    // Validaciones
    if (!data?.mainObjective?.trim()) {
      alert("Por favor define el objetivo principal.");
      setActiveTab("objetivos");
      return;
    }

    if (!data?.centralNarrative?.headline?.trim()) {
      alert("Por favor define al menos el titular de la narrativa central.");
      setActiveTab("narrativa");
      return;
    }

    setIsCompleting(true);
    const result = await completePhase(PHASE);
    if (!result.success) alert(result.error || "Error al completar la fase");
    setIsCompleting(false);
  };

  // ============================================================
  // CÁLCULO DE PROGRESO
  // ============================================================

  const calculateProgress = (): number => {
    if (!data) return 0;
    let completed = 0;
    const total = 5;

    if (data.mainObjective?.trim()) completed++;
    if ((data.specificObjectives?.length ?? 0) > 0) completed++;
    if (
      data.centralNarrative?.headline?.trim() &&
      data.centralNarrative?.story?.trim()
    )
      completed++;
    if (data.positioning?.differentiation?.trim()) completed++;
    if ((data.strategicSegments?.length ?? 0) > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();
  const isPhaseCompleted = project?.completedPhases.includes(PHASE);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-eske-60 mb-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: layerInfo.color }}
          />
          <span>{layerInfo.name}</span>
          <span>•</span>
          <span>Fase 4 de 9</span>
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
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-800">
          <strong>🔗 App disponible:</strong> Usa{" "}
          <span className="font-semibold">El Estratega</span> para generar
          estrategias con IA.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-eske-20 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            { id: "objetivos", label: "Objetivos" },
            { id: "narrativa", label: "Narrativa Central" },
            { id: "posicionamiento", label: "Posicionamiento" },
            {
              id: "segmentos",
              label: "Segmentos",
              count: data?.strategicSegments?.length || 0,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-bluegreen-eske text-bluegreen-eske"
                  : "border-transparent text-gray-eske-60 hover:text-gray-eske-80"
              }`}
            >
              {tab.label}
              {"count" in tab &&
                typeof tab.count === "number" &&
                tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id ? "bg-bluegreen-eske/20" : "bg-gray-eske-20"}`}
                  >
                    {tab.count}
                  </span>
                )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "objetivos" && (
          <TabObjetivos
            mainObjective={data?.mainObjective}
            objectives={data?.specificObjectives || []}
            onUpdateMain={updateMainObjective}
            onAdd={addObjective}
            onRemove={removeObjective}
          />
        )}
        {activeTab === "narrativa" && (
          <TabNarrativa
            narrative={data?.centralNarrative}
            onChange={updateNarrative}
          />
        )}
        {activeTab === "posicionamiento" && (
          <TabPosicionamiento
            positioning={data?.positioning}
            onChange={updatePositioning}
            onAddCompetitor={addCompetitor}
            onRemoveCompetitor={removeCompetitor}
          />
        )}
        {activeTab === "segmentos" && (
          <TabSegmentos
            segments={data?.strategicSegments || []}
            onAdd={addSegment}
            onRemove={removeSegment}
            onUpdate={updateSegment}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-eske-20 flex items-center justify-between">
        <div className="text-sm text-gray-eske-50">
          {isDirty ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-eske rounded-full" />
              Guardando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Guardado
            </span>
          )}
        </div>
        {!isPhaseCompleted && (
          <button
            onClick={handleCompletePhase}
            disabled={isCompleting || progress < 40}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              progress >= 40
                ? "bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90"
                : "bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed"
            }`}
          >
            {isCompleting ? "Procesando..." : "Completar y continuar →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB: OBJETIVOS
// ============================================================

interface TabObjetivosProps {
  mainObjective: string | undefined;
  objectives: StrategicObjective[];
  onUpdateMain: (value: string) => void;
  onAdd: (objective: StrategicObjective) => void;
  onRemove: (index: number) => void;
}

function TabObjetivos({
  mainObjective,
  objectives,
  onUpdateMain,
  onAdd,
  onRemove,
}: TabObjetivosProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<StrategicObjective>>({});

  const handleSubmit = () => {
    if (!form.description?.trim() || !form.type) return;
    onAdd({
      description: form.description.trim(),
      type: form.type,
      metric: form.metric?.trim() || "",
      target: form.target?.trim() || "",
      deadline: form.deadline,
    });
    setForm({});
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Objetivo principal */}
      <div>
        <label className="block text-sm font-medium text-gray-eske-80 mb-2">
          Objetivo Principal <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-eske-50 mb-2">
          ¿Cuál es el gran objetivo que quieres lograr con este proyecto?
        </p>
        <textarea
          value={mainObjective || ""}
          onChange={(e) => onUpdateMain(e.target.value)}
          placeholder="Ej: Ganar la elección a gobernador con al menos 45% de los votos"
          rows={3}
          className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent resize-none"
        />
      </div>

      {/* Objetivos específicos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium text-gray-eske-80">
              Objetivos Específicos
            </h3>
            <p className="text-xs text-gray-eske-50">
              Metas medibles que contribuyen al objetivo principal
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
          >
            + Agregar
          </button>
        </div>

        {objectives.length > 0 ? (
          <div className="space-y-3">
            {objectives.map((obj, index) => (
              <div
                key={index}
                className="bg-gray-eske-10 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${OBJECTIVE_TYPES[obj.type].color}`}
                    >
                      {OBJECTIVE_TYPES[obj.type].label}
                    </span>
                    {obj.deadline && (
                      <span className="text-xs text-gray-eske-50">
                        📅 {obj.deadline}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-eske-80 font-medium">
                    {obj.description}
                  </p>
                  {(obj.metric || obj.target) && (
                    <p className="text-sm text-gray-eske-60 mt-1">
                      {obj.metric && <span>Métrica: {obj.metric}</span>}
                      {obj.metric && obj.target && <span> • </span>}
                      {obj.target && <span>Meta: {obj.target}</span>}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="text-gray-eske-40 hover:text-red-500 shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-eske-50">
            Sin objetivos específicos agregados
          </p>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">
              Agregar Objetivo Específico
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe el objetivo..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={form.type || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as StrategicObjective["type"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske"
                  >
                    <option value="">Seleccionar...</option>
                    {Object.entries(OBJECTIVE_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={form.deadline || ""}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Métrica
                  </label>
                  <input
                    type="text"
                    value={form.metric || ""}
                    onChange={(e) =>
                      setForm({ ...form, metric: e.target.value })
                    }
                    placeholder="Ej: % de reconocimiento"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Meta
                  </label>
                  <input
                    type="text"
                    value={form.target || ""}
                    onChange={(e) =>
                      setForm({ ...form, target: e.target.value })
                    }
                    placeholder="Ej: 70%"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm({});
                }}
                className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.description?.trim() || !form.type}
                className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: NARRATIVA CENTRAL
// ============================================================

interface TabNarrativaProps {
  narrative: CentralNarrative | undefined;
  onChange: (updates: Partial<CentralNarrative>) => void;
}

function TabNarrativa({ narrative, onChange }: TabNarrativaProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">
          Narrativa Central
        </h3>
        <p className="text-sm text-gray-eske-50 mb-4">
          Define la historia y mensaje central de tu campaña
        </p>
      </div>

      <div className="grid gap-6">
        {/* Headline */}
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Titular / Slogan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={narrative?.headline || ""}
            onChange={(e) => onChange({ headline: e.target.value })}
            placeholder="Ej: Un futuro para todos"
            className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske"
          />
        </div>

        {/* Subheadline */}
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Subtítulo
          </label>
          <input
            type="text"
            value={narrative?.subheadline || ""}
            onChange={(e) => onChange({ subheadline: e.target.value })}
            placeholder="Frase que complementa el titular"
            className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg"
          />
        </div>

        {/* Story */}
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Historia / Narrativa <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-eske-50 mb-2">
            La historia que conecta tu propuesta con la audiencia
          </p>
          <textarea
            value={narrative?.story || ""}
            onChange={(e) => onChange({ story: e.target.value })}
            placeholder="Cuenta la historia de tu campaña: el problema, tu visión, y cómo llegarás ahí..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg resize-none"
          />
        </div>

        {/* Emotional Appeal */}
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Apelación Emocional
          </label>
          <p className="text-xs text-gray-eske-50 mb-2">
            ¿Qué emoción quieres despertar?
          </p>
          <input
            type="text"
            value={narrative?.emotionalAppeal || ""}
            onChange={(e) => onChange({ emotionalAppeal: e.target.value })}
            placeholder="Ej: Esperanza, orgullo, indignación justa, unidad..."
            className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg"
          />
        </div>

        {/* Call to Action */}
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Llamado a la Acción
          </label>
          <input
            type="text"
            value={narrative?.callToAction || ""}
            onChange={(e) => onChange({ callToAction: e.target.value })}
            placeholder="Ej: Únete al cambio, Vota por el futuro..."
            className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg"
          />
        </div>
      </div>

      {/* Preview */}
      {narrative?.headline && (
        <div className="mt-6 p-6 bg-linear-to-br from-bluegreen-eske to-bluegreen-eske/80 rounded-xl text-white-eske">
          <p className="text-xs uppercase tracking-wide opacity-70 mb-2">
            Vista previa
          </p>
          <h2 className="text-2xl font-bold mb-1">{narrative.headline}</h2>
          {narrative.subheadline && (
            <p className="text-lg opacity-90 mb-3">{narrative.subheadline}</p>
          )}
          {narrative.callToAction && (
            <span className="inline-block px-4 py-2 bg-white-eske/20 rounded-lg text-sm font-medium">
              {narrative.callToAction}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: POSICIONAMIENTO
// ============================================================

interface TabPosicionamientoProps {
  positioning: Positioning | undefined;
  onChange: (updates: Partial<Positioning>) => void;
  onAddCompetitor: (competitor: CompetitorPosition) => void;
  onRemoveCompetitor: (index: number) => void;
}

function TabPosicionamiento({
  positioning,
  onChange,
  onAddCompetitor,
  onRemoveCompetitor,
}: TabPosicionamientoProps) {
  const [showCompForm, setShowCompForm] = useState(false);
  const [compForm, setCompForm] = useState<Partial<CompetitorPosition>>({});

  const handleAddCompetitor = () => {
    if (!compForm.name?.trim()) return;
    onAddCompetitor({
      name: compForm.name.trim(),
      currentPosition: compForm.currentPosition?.trim() || "",
      ourAdvantage: compForm.ourAdvantage?.trim() || "",
    });
    setCompForm({});
    setShowCompForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">
          Posicionamiento Estratégico
        </h3>
        <p className="text-sm text-gray-eske-50 mb-4">
          Define cómo quieres ser percibido frente a la competencia
        </p>
      </div>

      <div className="grid gap-6">
        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Categoría
          </label>
          <p className="text-xs text-gray-eske-50 mb-2">
            ¿En qué categoría compites?
          </p>
          <input
            type="text"
            value={positioning?.category || ""}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder="Ej: Candidatos de centro-izquierda, Gobiernos progresistas..."
            className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg"
          />
        </div>

        {/* Diferenciación */}
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Diferenciación <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-eske-50 mb-2">
            ¿Qué te hace único frente a los demás?
          </p>
          <textarea
            value={positioning?.differentiation || ""}
            onChange={(e) => onChange({ differentiation: e.target.value })}
            placeholder="Describe qué te diferencia de la competencia..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg resize-none"
          />
        </div>

        {/* Percepción objetivo */}
        <div>
          <label className="block text-sm font-medium text-gray-eske-80 mb-1">
            Percepción Objetivo
          </label>
          <p className="text-xs text-gray-eske-50 mb-2">
            ¿Cómo quieres que te perciba tu audiencia?
          </p>
          <input
            type="text"
            value={positioning?.targetPerception || ""}
            onChange={(e) => onChange({ targetPerception: e.target.value })}
            placeholder="Ej: El candidato más preparado y cercano a la gente"
            className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg"
          />
        </div>
      </div>

      {/* Competidores */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-eske-80">
            Análisis de Competidores
          </h4>
          <button
            onClick={() => setShowCompForm(true)}
            className="px-3 py-1.5 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
          >
            + Agregar
          </button>
        </div>

        {(positioning?.competitors?.length ?? 0) > 0 ? (
          <div className="space-y-3">
            {positioning?.competitors?.map((comp, index) => (
              <div
                key={index}
                className="bg-red-50 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-red-800">{comp.name}</p>
                  {comp.currentPosition && (
                    <p className="text-sm text-red-700 mt-1">
                      Posición: {comp.currentPosition}
                    </p>
                  )}
                  {comp.ourAdvantage && (
                    <p className="text-sm text-green-700 mt-1">
                      ✓ Nuestra ventaja: {comp.ourAdvantage}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveCompetitor(index)}
                  className="text-red-400 hover:text-red-600 shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-gray-eske-50 bg-gray-eske-10 rounded-lg">
            Sin competidores agregados
          </p>
        )}
      </div>

      {/* Modal Competidor */}
      {showCompForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">
              Agregar Competidor
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={compForm.name || ""}
                  onChange={(e) =>
                    setCompForm({ ...compForm, name: e.target.value })
                  }
                  placeholder="Nombre del competidor"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Posición actual
                </label>
                <input
                  type="text"
                  value={compForm.currentPosition || ""}
                  onChange={(e) =>
                    setCompForm({
                      ...compForm,
                      currentPosition: e.target.value,
                    })
                  }
                  placeholder="¿Cómo se posiciona actualmente?"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Nuestra ventaja
                </label>
                <input
                  type="text"
                  value={compForm.ourAdvantage || ""}
                  onChange={(e) =>
                    setCompForm({ ...compForm, ourAdvantage: e.target.value })
                  }
                  placeholder="¿Qué ventaja tenemos sobre este competidor?"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCompForm(false);
                  setCompForm({});
                }}
                className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCompetitor}
                disabled={!compForm.name?.trim()}
                className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: SEGMENTOS ESTRATÉGICOS
// ============================================================

interface TabSegmentosProps {
  segments: StrategicSegment[];
  onAdd: (segment: StrategicSegment) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<StrategicSegment>) => void;
}

function TabSegmentos({
  segments,
  onAdd,
  onRemove,
  onUpdate,
}: TabSegmentosProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<StrategicSegment>>({});
  const [newChannel, setNewChannel] = useState("");

  const handleSubmit = () => {
    if (!form.name?.trim()) return;
    onAdd({
      name: form.name.trim(),
      size: form.size || 0,
      priority: form.priority || 1,
      currentStance: form.currentStance || "undecided",
      targetStance: form.targetStance || "supporter",
      keyMessage: form.keyMessage?.trim() || "",
      channels: form.channels || [],
    });
    setForm({});
    setShowForm(false);
  };

  const addChannelToForm = () => {
    if (!newChannel.trim()) return;
    const current = form.channels || [];
    setForm({ ...form, channels: [...current, newChannel.trim()] });
    setNewChannel("");
  };

  const removeChannelFromForm = (index: number) => {
    const current = form.channels || [];
    setForm({ ...form, channels: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">
            Segmentos Estratégicos
          </h3>
          <p className="text-sm text-gray-eske-50">
            Define los grupos objetivo y cómo abordarlos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar segmento
        </button>
      </div>

      {segments.length > 0 ? (
        <div className="space-y-4">
          {segments.map((segment, index) => (
            <div
              key={index}
              className="bg-white-eske border border-gray-eske-20 rounded-lg p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h4 className="font-semibold text-gray-eske-80">
                    {segment.name}
                  </h4>
                  <p className="text-xs text-gray-eske-50">
                    Tamaño: {segment.size.toLocaleString()} • Prioridad:{" "}
                    {segment.priority}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="text-gray-eske-40 hover:text-red-500 shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Stance journey */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    segment.currentStance === "supporter"
                      ? "bg-green-100 text-green-800"
                      : segment.currentStance === "opposition"
                        ? "bg-red-100 text-red-800"
                        : segment.currentStance === "leaning"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {STANCE_OPTIONS[segment.currentStance]}
                </span>
                <span className="text-gray-eske-40">→</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    segment.targetStance === "supporter"
                      ? "bg-green-100 text-green-800"
                      : segment.targetStance === "opposition"
                        ? "bg-red-100 text-red-800"
                        : segment.targetStance === "leaning"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {STANCE_OPTIONS[segment.targetStance]}
                </span>
              </div>

              {segment.keyMessage && (
                <p className="text-sm text-gray-eske-70 mb-2">
                  <span className="font-medium">Mensaje:</span>{" "}
                  {segment.keyMessage}
                </p>
              )}

              {segment.channels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {segment.channels.map((ch, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-eske-10 text-gray-eske-60 rounded text-xs"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay segmentos definidos</p>
          <p className="text-sm text-gray-eske-40">
            Agrega segmentos para definir tu estrategia por audiencia
          </p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-eske-80 mb-4">
              Agregar Segmento
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Jóvenes urbanos 18-35"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Tamaño estimado
                  </label>
                  <input
                    type="number"
                    value={form.size || ""}
                    onChange={(e) =>
                      setForm({ ...form, size: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Número de personas"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Prioridad (1-5)
                  </label>
                  <select
                    value={form.priority || 1}
                    onChange={(e) =>
                      setForm({ ...form, priority: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Posición actual
                  </label>
                  <select
                    value={form.currentStance || "undecided"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        currentStance: e.target
                          .value as StrategicSegment["currentStance"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske"
                  >
                    {Object.entries(STANCE_OPTIONS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Posición objetivo
                  </label>
                  <select
                    value={form.targetStance || "supporter"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        targetStance: e.target
                          .value as StrategicSegment["targetStance"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske"
                  >
                    {Object.entries(STANCE_OPTIONS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Mensaje clave
                </label>
                <textarea
                  value={form.keyMessage || ""}
                  onChange={(e) =>
                    setForm({ ...form, keyMessage: e.target.value })
                  }
                  placeholder="Mensaje específico para este segmento"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Canales
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addChannelToForm())
                    }
                    placeholder="Ej: Instagram, Radio..."
                    className="flex-1 px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                  <button
                    onClick={addChannelToForm}
                    disabled={!newChannel.trim()}
                    className="px-3 py-2 bg-gray-eske-20 rounded-lg disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                {(form.channels?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.channels?.map((ch, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-bluegreen-eske/10 text-bluegreen-eske rounded text-xs flex items-center gap-1"
                      >
                        {ch}
                        <button
                          onClick={() => removeChannelFromForm(i)}
                          className="hover:text-red-500"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm({});
                  setNewChannel("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name?.trim()}
                className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
