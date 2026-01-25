// app/moddulo/proyecto/[projectId]/estrategia/planeacion/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  useStrategyContext,
  usePhaseData,
} from "@/app/moddulo/components/StrategyContextProvider";
import {
  PHASE_METADATA,
  LAYER_METADATA,
  type PlaneacionData,
  type TimelinePhase,
  type BudgetSummary,
  type BudgetCategory,
  type BudgetItem,
  type ChecklistCategory,
  type ChecklistItem,
  type Milestone,
} from "@/types/strategy-context.types";

// ============================================================
// CONSTANTES
// ============================================================

const PHASE = "planeacion";
const LAYER = "estrategia";
const phaseInfo = PHASE_METADATA[PHASE];
const layerInfo = LAYER_METADATA[LAYER];

const MILESTONE_STATUS: Record<
  Milestone["status"],
  { label: string; color: string }
> = {
  pending: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
  "in-progress": { label: "En progreso", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completado", color: "bg-green-100 text-green-800" },
  delayed: { label: "Retrasado", color: "bg-red-100 text-red-800" },
};

const FREQUENCY_OPTIONS: Record<
  NonNullable<BudgetItem["frequency"]>,
  string
> = {
  "one-time": "Único",
  monthly: "Mensual",
  weekly: "Semanal",
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function PlaneacionPage() {
  const { project, completePhase } = useStrategyContext();
  const { data, updateData, isDirty } = usePhaseData<PlaneacionData>(PHASE);

  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "timeline" | "presupuesto" | "checklist" | "hitos"
  >("timeline");

  // ============================================================
  // HANDLERS DE DATOS
  // ============================================================

  // Timeline
  const addTimelinePhase = (phase: TimelinePhase) => {
    const current = data?.timeline || [];
    updateData({ timeline: [...current, phase] });
  };

  const removeTimelinePhase = (index: number) => {
    const current = data?.timeline || [];
    updateData({ timeline: current.filter((_, i) => i !== index) });
  };

  const updateTimelinePhase = (
    index: number,
    updates: Partial<TimelinePhase>,
  ) => {
    const current = data?.timeline || [];
    const updated = current.map((phase, i) =>
      i === index ? { ...phase, ...updates } : phase,
    );
    updateData({ timeline: updated });
  };

  // Budget
  const updateBudget = (updates: Partial<BudgetSummary>) => {
    const current: BudgetSummary = data?.budget || {
      total: 0,
      currency: "MXN",
      categories: [],
      contingency: 0,
    };
    updateData({ budget: { ...current, ...updates } });
  };

  const addBudgetCategory = (category: BudgetCategory) => {
    const current = data?.budget?.categories || [];
    updateBudget({ categories: [...current, category] });
  };

  const removeBudgetCategory = (index: number) => {
    const current = data?.budget?.categories || [];
    updateBudget({ categories: current.filter((_, i) => i !== index) });
  };

  const updateBudgetCategory = (
    index: number,
    updates: Partial<BudgetCategory>,
  ) => {
    const current = data?.budget?.categories || [];
    const updated = current.map((cat, i) =>
      i === index ? { ...cat, ...updates } : cat,
    );
    updateBudget({ categories: updated });
  };

  // Checklist
  const addChecklistCategory = (category: ChecklistCategory) => {
    const current = data?.executionChecklist || [];
    updateData({ executionChecklist: [...current, category] });
  };

  const removeChecklistCategory = (index: number) => {
    const current = data?.executionChecklist || [];
    updateData({ executionChecklist: current.filter((_, i) => i !== index) });
  };

  const toggleChecklistItem = (catIndex: number, itemIndex: number) => {
    const current = data?.executionChecklist || [];
    const updated = current.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      const items = cat.items.map((item, ii) =>
        ii === itemIndex ? { ...item, completed: !item.completed } : item,
      );
      return { ...cat, items };
    });
    updateData({ executionChecklist: updated });
  };

  const addChecklistItem = (catIndex: number, item: ChecklistItem) => {
    const current = data?.executionChecklist || [];
    const updated = current.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return { ...cat, items: [...cat.items, item] };
    });
    updateData({ executionChecklist: updated });
  };

  const removeChecklistItem = (catIndex: number, itemIndex: number) => {
    const current = data?.executionChecklist || [];
    const updated = current.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return { ...cat, items: cat.items.filter((_, ii) => ii !== itemIndex) };
    });
    updateData({ executionChecklist: updated });
  };

  // Milestones
  const addMilestone = (milestone: Milestone) => {
    const current = data?.milestones || [];
    updateData({ milestones: [...current, milestone] });
  };

  const removeMilestone = (index: number) => {
    const current = data?.milestones || [];
    updateData({ milestones: current.filter((_, i) => i !== index) });
  };

  const updateMilestone = (index: number, updates: Partial<Milestone>) => {
    const current = data?.milestones || [];
    const updated = current.map((m, i) =>
      i === index ? { ...m, ...updates } : m,
    );
    updateData({ milestones: updated });
  };

  // ============================================================
  // COMPLETAR FASE (GATE 2)
  // ============================================================

  const handleCompletePhase = async () => {
    if ((data?.timeline?.length ?? 0) === 0) {
      alert("Por favor define al menos una fase en el cronograma.");
      setActiveTab("timeline");
      return;
    }

    if ((data?.milestones?.length ?? 0) === 0) {
      alert("Por favor agrega al menos un hito importante.");
      setActiveTab("hitos");
      return;
    }

    // Confirmación especial para Gate 2
    const confirmed = confirm(
      "🚪 GATE 2: Revisión de Planeación\n\n" +
        "Al completar esta fase, pasarás a la capa de Operación.\n\n" +
        "¿Has revisado que el plan es ejecutable y el presupuesto es realista?\n\n" +
        "Presiona OK para continuar a la ejecución.",
    );

    if (!confirmed) return;

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
    const total = 4;

    if ((data.timeline?.length ?? 0) > 0) completed++;
    if ((data.budget?.categories?.length ?? 0) > 0) completed++;
    if ((data.executionChecklist?.length ?? 0) > 0) completed++;
    if ((data.milestones?.length ?? 0) > 0) completed++;

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
          <span>Fase 6 de 9</span>
          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
            🚪 Gate 2
          </span>
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

      {/* Gate Info */}
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-800">
          <strong>🚪 Gate 2 - Revisión de Planeación:</strong> Esta fase cierra
          la capa de Estrategia. Al completarla, tendrás un plan ejecutable
          listo para la operación.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-eske-20 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            {
              id: "timeline",
              label: "Cronograma",
              count: data?.timeline?.length || 0,
            },
            { id: "presupuesto", label: "Presupuesto" },
            {
              id: "checklist",
              label: "Checklist",
              count:
                data?.executionChecklist?.reduce(
                  (acc, cat) => acc + cat.items.length,
                  0,
                ) || 0,
            },
            {
              id: "hitos",
              label: "Hitos",
              count: data?.milestones?.length || 0,
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
        {activeTab === "timeline" && (
          <TabTimeline
            phases={data?.timeline || []}
            onAdd={addTimelinePhase}
            onRemove={removeTimelinePhase}
            onUpdate={updateTimelinePhase}
          />
        )}
        {activeTab === "presupuesto" && (
          <TabPresupuesto
            budget={data?.budget}
            onUpdateBudget={updateBudget}
            onAddCategory={addBudgetCategory}
            onRemoveCategory={removeBudgetCategory}
            onUpdateCategory={updateBudgetCategory}
          />
        )}
        {activeTab === "checklist" && (
          <TabChecklist
            categories={data?.executionChecklist || []}
            onAddCategory={addChecklistCategory}
            onRemoveCategory={removeChecklistCategory}
            onToggleItem={toggleChecklistItem}
            onAddItem={addChecklistItem}
            onRemoveItem={removeChecklistItem}
          />
        )}
        {activeTab === "hitos" && (
          <TabHitos
            milestones={data?.milestones || []}
            onAdd={addMilestone}
            onRemove={removeMilestone}
            onUpdate={updateMilestone}
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
            disabled={isCompleting || progress < 50}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              progress >= 50
                ? "bg-purple-600 text-white-eske hover:bg-purple-700"
                : "bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed"
            }`}
          >
            {isCompleting ? "Procesando..." : "🚪 Completar Gate 2 →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB: CRONOGRAMA
// ============================================================

interface TabTimelineProps {
  phases: TimelinePhase[];
  onAdd: (phase: TimelinePhase) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<TimelinePhase>) => void;
}

function TabTimeline({ phases, onAdd, onRemove, onUpdate }: TabTimelineProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<TimelinePhase>>({});
  const [newObjective, setNewObjective] = useState("");
  const [newDeliverable, setNewDeliverable] = useState("");

  const handleSubmit = () => {
    if (!form.name?.trim() || !form.startDate || !form.endDate) return;
    onAdd({
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      objectives: form.objectives || [],
      deliverables: form.deliverables || [],
    });
    setForm({});
    setShowForm(false);
  };

  const addObjectiveToForm = () => {
    if (!newObjective.trim()) return;
    const current = form.objectives || [];
    setForm({ ...form, objectives: [...current, newObjective.trim()] });
    setNewObjective("");
  };

  const addDeliverableToForm = () => {
    if (!newDeliverable.trim()) return;
    const current = form.deliverables || [];
    setForm({ ...form, deliverables: [...current, newDeliverable.trim()] });
    setNewDeliverable("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">
            Cronograma de Ejecución
          </h3>
          <p className="text-sm text-gray-eske-50">
            Define las fases de tu plan de acción
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar fase
        </button>
      </div>

      {phases.length > 0 ? (
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div
              key={index}
              className="bg-white-eske border border-gray-eske-20 rounded-lg p-5 shadow-sm relative"
            >
              {/* Timeline connector */}
              {index < phases.length - 1 && (
                <div className="absolute left-8 top-full w-0.5 h-4 bg-bluegreen-eske/30"></div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-bluegreen-eske/10 flex items-center justify-center text-bluegreen-eske font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-semibold text-gray-eske-80">
                      {phase.name}
                    </h4>
                    <button
                      onClick={() => onRemove(index)}
                      className="text-gray-eske-40 hover:text-red-500 shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-eske-50 mb-3">
                    📅 {new Date(phase.startDate).toLocaleDateString("es-MX")} -{" "}
                    {new Date(phase.endDate).toLocaleDateString("es-MX")}
                  </p>

                  {phase.objectives.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-eske-60 mb-1">
                        Objetivos:
                      </p>
                      <ul className="space-y-1">
                        {phase.objectives.map((obj, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-eske-70 flex items-start gap-2"
                          >
                            <span className="text-bluegreen-eske">•</span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {phase.deliverables.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-eske-60 mb-1">
                        Entregables:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {phase.deliverables.map((del, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                          >
                            {del}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">
            No hay fases en el cronograma
          </p>
          <p className="text-sm text-gray-eske-40">
            Define las etapas de ejecución de tu proyecto
          </p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-eske-80 mb-4">
              Agregar Fase del Cronograma
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Nombre de la fase *
                </label>
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Fase de lanzamiento, Precampaña..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Fecha inicio *
                  </label>
                  <input
                    type="date"
                    value={form.startDate || ""}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Fecha fin *
                  </label>
                  <input
                    type="date"
                    value={form.endDate || ""}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
              </div>

              {/* Objetivos */}
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Objetivos
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addObjectiveToForm())
                    }
                    placeholder="Agregar objetivo..."
                    className="flex-1 px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                  <button
                    onClick={addObjectiveToForm}
                    className="px-3 py-2 bg-gray-eske-20 rounded-lg"
                  >
                    +
                  </button>
                </div>
                {(form.objectives?.length ?? 0) > 0 && (
                  <ul className="space-y-1">
                    {form.objectives?.map((obj, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between px-2 py-1 bg-gray-eske-10 rounded text-sm"
                      >
                        <span>{obj}</span>
                        <button
                          onClick={() =>
                            setForm({
                              ...form,
                              objectives: form.objectives?.filter(
                                (_, idx) => idx !== i,
                              ),
                            })
                          }
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Entregables */}
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Entregables
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addDeliverableToForm())
                    }
                    placeholder="Agregar entregable..."
                    className="flex-1 px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                  <button
                    onClick={addDeliverableToForm}
                    className="px-3 py-2 bg-gray-eske-20 rounded-lg"
                  >
                    +
                  </button>
                </div>
                {(form.deliverables?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.deliverables?.map((del, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1"
                      >
                        {del}
                        <button
                          onClick={() =>
                            setForm({
                              ...form,
                              deliverables: form.deliverables?.filter(
                                (_, idx) => idx !== i,
                              ),
                            })
                          }
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
                }}
                className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !form.name?.trim() || !form.startDate || !form.endDate
                }
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
// TAB: PRESUPUESTO
// ============================================================

interface TabPresupuestoProps {
  budget: BudgetSummary | undefined;
  onUpdateBudget: (updates: Partial<BudgetSummary>) => void;
  onAddCategory: (category: BudgetCategory) => void;
  onRemoveCategory: (index: number) => void;
  onUpdateCategory: (index: number, updates: Partial<BudgetCategory>) => void;
}

function TabPresupuesto({
  budget,
  onUpdateBudget,
  onAddCategory,
  onRemoveCategory,
  onUpdateCategory,
}: TabPresupuestoProps) {
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState<Partial<BudgetCategory>>({});
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({});

  // Calcular totales
  const totalCategories = useMemo(() => {
    return (budget?.categories || []).reduce((acc, cat) => acc + cat.amount, 0);
  }, [budget?.categories]);

  const totalWithContingency = totalCategories + (budget?.contingency || 0);

  const handleAddCategory = () => {
    if (!catForm.name?.trim()) return;
    onAddCategory({
      name: catForm.name.trim(),
      amount: catForm.amount || 0,
      percentage: 0,
      items: catForm.items || [],
    });
    setCatForm({});
    setShowCatForm(false);
  };

  const addItemToForm = () => {
    if (!newItem.description?.trim()) return;
    const current = catForm.items || [];
    setCatForm({
      ...catForm,
      items: [
        ...current,
        {
          description: newItem.description.trim(),
          amount: newItem.amount || 0,
          frequency: newItem.frequency,
        },
      ],
    });
    setNewItem({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Presupuesto</h3>
          <p className="text-sm text-gray-eske-50">
            Define los recursos financieros necesarios
          </p>
        </div>
        <button
          onClick={() => setShowCatForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar categoría
        </button>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-bluegreen-eske/10 rounded-lg p-4">
          <p className="text-xs text-bluegreen-eske font-medium mb-1">
            Total Categorías
          </p>
          <p className="text-2xl font-bold text-bluegreen-eske">
            ${totalCategories.toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-100 rounded-lg p-4">
          <p className="text-xs text-orange-700 font-medium mb-1">
            Contingencia
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-orange-700">$</span>
            <input
              type="number"
              value={budget?.contingency || ""}
              onChange={(e) =>
                onUpdateBudget({ contingency: parseInt(e.target.value) || 0 })
              }
              className="w-full bg-transparent text-2xl font-bold text-orange-700 focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>
        <div className="bg-green-100 rounded-lg p-4">
          <p className="text-xs text-green-700 font-medium mb-1">
            Total General
          </p>
          <p className="text-2xl font-bold text-green-700">
            ${totalWithContingency.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Categorías */}
      {(budget?.categories?.length ?? 0) > 0 ? (
        <div className="space-y-4">
          {budget?.categories?.map((cat, index) => (
            <div
              key={index}
              className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-eske-80">
                    {cat.name}
                  </h4>
                  <span className="px-2 py-0.5 bg-bluegreen-eske/10 text-bluegreen-eske rounded text-sm font-medium">
                    ${cat.amount.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveCategory(index)}
                  className="text-gray-eske-40 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              {cat.items.length > 0 && (
                <ul className="space-y-1">
                  {cat.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm text-gray-eske-60 py-1 border-b border-gray-eske-10 last:border-0"
                    >
                      <span>{item.description}</span>
                      <span className="flex items-center gap-2">
                        ${item.amount.toLocaleString()}
                        {item.frequency && (
                          <span className="text-xs text-gray-eske-40">
                            ({FREQUENCY_OPTIONS[item.frequency]})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">
            No hay categorías de presupuesto
          </p>
          <p className="text-sm text-gray-eske-40">
            Agrega categorías como: Publicidad, Personal, Logística...
          </p>
        </div>
      )}

      {/* Modal Categoría */}
      {showCatForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-eske-80 mb-4">
              Agregar Categoría de Presupuesto
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    value={catForm.name || ""}
                    onChange={(e) =>
                      setCatForm({ ...catForm, name: e.target.value })
                    }
                    placeholder="Ej: Publicidad digital"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                    Monto total
                  </label>
                  <input
                    type="number"
                    value={catForm.amount || ""}
                    onChange={(e) =>
                      setCatForm({
                        ...catForm,
                        amount: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="$0"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-2">
                  Partidas (opcional)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    value={newItem.description || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    placeholder="Descripción"
                    className="col-span-1 px-3 py-2 border border-gray-eske-30 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={newItem.amount || ""}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        amount: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Monto"
                    className="px-3 py-2 border border-gray-eske-30 rounded-lg text-sm"
                  />
                  <div className="flex gap-1">
                    <select
                      value={newItem.frequency || ""}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          frequency: e.target.value as BudgetItem["frequency"],
                        })
                      }
                      className="flex-1 px-2 py-2 border border-gray-eske-30 rounded-lg text-sm bg-white-eske"
                    >
                      <option value="">Único</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                    <button
                      onClick={addItemToForm}
                      className="px-3 py-2 bg-gray-eske-20 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                {(catForm.items?.length ?? 0) > 0 && (
                  <ul className="space-y-1 bg-gray-eske-10 rounded-lg p-2">
                    {catForm.items?.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{item.description}</span>
                        <span className="flex items-center gap-2">
                          ${item.amount.toLocaleString()}
                          <button
                            onClick={() =>
                              setCatForm({
                                ...catForm,
                                items: catForm.items?.filter(
                                  (_, idx) => idx !== i,
                                ),
                              })
                            }
                            className="text-red-500"
                          >
                            ✕
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCatForm(false);
                  setCatForm({});
                }}
                className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!catForm.name?.trim()}
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
// TAB: CHECKLIST
// ============================================================

interface TabChecklistProps {
  categories: ChecklistCategory[];
  onAddCategory: (category: ChecklistCategory) => void;
  onRemoveCategory: (index: number) => void;
  onToggleItem: (catIndex: number, itemIndex: number) => void;
  onAddItem: (catIndex: number, item: ChecklistItem) => void;
  onRemoveItem: (catIndex: number, itemIndex: number) => void;
}

function TabChecklist({
  categories,
  onAddCategory,
  onRemoveCategory,
  onToggleItem,
  onAddItem,
  onRemoveItem,
}: TabChecklistProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingItemTo, setAddingItemTo] = useState<number | null>(null);
  const [newItemForm, setNewItemForm] = useState<Partial<ChecklistItem>>({});

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    onAddCategory({ category: newCategoryName.trim(), items: [] });
    setNewCategoryName("");
  };

  const handleAddItem = (catIndex: number) => {
    if (!newItemForm.task?.trim()) return;
    onAddItem(catIndex, {
      task: newItemForm.task.trim(),
      responsible: newItemForm.responsible?.trim(),
      dueDate: newItemForm.dueDate,
      completed: false,
      notes: newItemForm.notes?.trim(),
    });
    setNewItemForm({});
    setAddingItemTo(null);
  };

  // Calcular progreso
  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedItems = categories.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.completed).length,
    0,
  );
  const progressPercent =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">
            Checklist de Ejecución
          </h3>
          <p className="text-sm text-gray-eske-50">
            Tareas necesarias para ejecutar el plan
          </p>
        </div>
        {totalItems > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-eske-60">
              {completedItems}/{totalItems} completadas
            </p>
            <div className="w-32 h-2 bg-gray-eske-10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Agregar categoría */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          placeholder="Nueva categoría (ej: Logística, Legal, Comunicación...)"
          className="flex-1 px-4 py-2 border border-gray-eske-30 rounded-lg"
        />
        <button
          onClick={handleAddCategory}
          disabled={!newCategoryName.trim()}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20"
        >
          + Agregar
        </button>
      </div>

      {/* Categorías */}
      {categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((cat, catIndex) => (
            <div
              key={catIndex}
              className="bg-white-eske border border-gray-eske-20 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-eske-10">
                <h4 className="font-semibold text-gray-eske-80">
                  {cat.category}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setAddingItemTo(
                        addingItemTo === catIndex ? null : catIndex,
                      )
                    }
                    className="text-sm text-bluegreen-eske hover:underline"
                  >
                    + Tarea
                  </button>
                  <button
                    onClick={() => onRemoveCategory(catIndex)}
                    className="text-gray-eske-40 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Form para agregar item */}
              {addingItemTo === catIndex && (
                <div className="p-4 bg-blue-50 border-b border-gray-eske-20">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      value={newItemForm.task || ""}
                      onChange={(e) =>
                        setNewItemForm({ ...newItemForm, task: e.target.value })
                      }
                      placeholder="Tarea *"
                      className="px-3 py-2 border border-gray-eske-30 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newItemForm.responsible || ""}
                      onChange={(e) =>
                        setNewItemForm({
                          ...newItemForm,
                          responsible: e.target.value,
                        })
                      }
                      placeholder="Responsable"
                      className="px-3 py-2 border border-gray-eske-30 rounded-lg"
                    />
                    <input
                      type="date"
                      value={newItemForm.dueDate || ""}
                      onChange={(e) =>
                        setNewItemForm({
                          ...newItemForm,
                          dueDate: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-eske-30 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => {
                        setAddingItemTo(null);
                        setNewItemForm({});
                      }}
                      className="px-3 py-1.5 text-sm border border-gray-eske-30 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleAddItem(catIndex)}
                      disabled={!newItemForm.task?.trim()}
                      className="px-3 py-1.5 text-sm bg-bluegreen-eske text-white-eske rounded disabled:bg-gray-eske-20"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}

              {/* Items */}
              {cat.items.length > 0 ? (
                <ul className="divide-y divide-gray-eske-10">
                  {cat.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className={`px-4 py-3 flex items-start gap-3 ${item.completed ? "bg-green-50" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => onToggleItem(catIndex, itemIndex)}
                        className="mt-1 w-4 h-4 rounded border-gray-eske-30 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm ${item.completed ? "line-through text-gray-eske-40" : "text-gray-eske-80"}`}
                        >
                          {item.task}
                        </p>
                        {(item.responsible || item.dueDate) && (
                          <p className="text-xs text-gray-eske-50 mt-0.5">
                            {item.responsible && (
                              <span>👤 {item.responsible}</span>
                            )}
                            {item.responsible && item.dueDate && (
                              <span> • </span>
                            )}
                            {item.dueDate && (
                              <span>
                                📅{" "}
                                {new Date(item.dueDate).toLocaleDateString(
                                  "es-MX",
                                )}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveItem(catIndex, itemIndex)}
                        className="text-gray-eske-40 hover:text-red-500 shrink-0"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-6 text-center text-gray-eske-40 text-sm">
                  Sin tareas en esta categoría
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">
            No hay categorías de checklist
          </p>
          <p className="text-sm text-gray-eske-40">
            Agrega categorías para organizar las tareas
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: HITOS
// ============================================================

interface TabHitosProps {
  milestones: Milestone[];
  onAdd: (milestone: Milestone) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<Milestone>) => void;
}

function TabHitos({ milestones, onAdd, onRemove, onUpdate }: TabHitosProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Milestone>>({});
  const [newDep, setNewDep] = useState("");

  const handleSubmit = () => {
    if (!form.name?.trim() || !form.date) return;
    onAdd({
      name: form.name.trim(),
      date: form.date,
      description: form.description?.trim() || "",
      dependencies: form.dependencies || [],
      status: "pending",
    });
    setForm({});
    setShowForm(false);
  };

  const addDepToForm = () => {
    if (!newDep.trim()) return;
    const current = form.dependencies || [];
    setForm({ ...form, dependencies: [...current, newDep.trim()] });
    setNewDep("");
  };

  // Ordenar por fecha
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [milestones]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Hitos del Proyecto</h3>
          <p className="text-sm text-gray-eske-50">
            Momentos clave y fechas importantes
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar hito
        </button>
      </div>

      {sortedMilestones.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-bluegreen-eske/20"></div>

          <div className="space-y-4">
            {sortedMilestones.map((milestone, index) => {
              const originalIndex = milestones.findIndex(
                (m) => m === milestone,
              );
              return (
                <div key={originalIndex} className="relative pl-14">
                  {/* Dot */}
                  <div
                    className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                      milestone.status === "completed"
                        ? "bg-green-500 border-green-500"
                        : milestone.status === "in-progress"
                          ? "bg-blue-500 border-blue-500"
                          : milestone.status === "delayed"
                            ? "bg-red-500 border-red-500"
                            : "bg-white-eske border-bluegreen-eske"
                    }`}
                  ></div>

                  <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-eske-80">
                          {milestone.name}
                        </h4>
                        <p className="text-sm text-gray-eske-50">
                          📅{" "}
                          {new Date(milestone.date).toLocaleDateString(
                            "es-MX",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={milestone.status}
                          onChange={(e) =>
                            onUpdate(originalIndex, {
                              status: e.target.value as Milestone["status"],
                            })
                          }
                          className={`px-2 py-1 rounded text-xs font-medium ${MILESTONE_STATUS[milestone.status].color} border-0 cursor-pointer`}
                        >
                          {Object.entries(MILESTONE_STATUS).map(
                            ([key, val]) => (
                              <option key={key} value={key}>
                                {val.label}
                              </option>
                            ),
                          )}
                        </select>
                        <button
                          onClick={() => onRemove(originalIndex)}
                          className="text-gray-eske-40 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-gray-eske-60 mb-2">
                        {milestone.description}
                      </p>
                    )}
                    {milestone.dependencies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-eske-50">
                          Depende de:
                        </span>
                        {milestone.dependencies.map((dep, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay hitos definidos</p>
          <p className="text-sm text-gray-eske-40">
            Agrega los momentos clave de tu proyecto
          </p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">
              Agregar Hito
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Nombre del hito *
                </label>
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Lanzamiento de campaña, Debate..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={form.date || ""}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Descripción
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe este hito..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">
                  Dependencias
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDep}
                    onChange={(e) => setNewDep(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addDepToForm())
                    }
                    placeholder="¿De qué depende este hito?"
                    className="flex-1 px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                  <button
                    onClick={addDepToForm}
                    className="px-3 py-2 bg-gray-eske-20 rounded-lg"
                  >
                    +
                  </button>
                </div>
                {(form.dependencies?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.dependencies?.map((dep, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center gap-1"
                      >
                        {dep}
                        <button
                          onClick={() =>
                            setForm({
                              ...form,
                              dependencies: form.dependencies?.filter(
                                (_, idx) => idx !== i,
                              ),
                            })
                          }
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
                }}
                className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name?.trim() || !form.date}
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
