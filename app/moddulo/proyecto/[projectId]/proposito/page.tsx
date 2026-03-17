// app/moddulo/proyecto/[projectId]/proposito/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ModduloChat from "@/app/moddulo/components/ModduloChat";
import PhaseTransitionReview from "@/app/moddulo/components/PhaseTransitionReview";
import PhaseReportView from "@/app/moddulo/components/PhaseReportView";
import { detectRisks } from "@/lib/moddulo/risks";
import type { XPCTO, ProjectType, ChatMessage, PhaseId } from "@/types/moddulo.types";
import { PHASE_ORDER } from "@/types/moddulo.types";

// ==========================================
// TIPOS LOCALES
// ==========================================

type XPCTOForm = {
  hito: string;
  sujeto: string;
  capacidades: { financiero: string; humano: string; logistico: string };
  tiempo: { fechaLimite: string; duracionMeses: number };
  justificacion: string;
};

type PageMode = "active" | "completed" | "editing";

const emptyForm = (): XPCTOForm => ({
  hito: "",
  sujeto: "",
  capacidades: { financiero: "", humano: "", logistico: "" },
  tiempo: { fechaLimite: "", duracionMeses: 0 },
  justificacion: "",
});

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function PropositoPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [form, setForm] = useState<XPCTOForm>(emptyForm());
  const [editForm, setEditForm] = useState<XPCTOForm>(emptyForm());
  const [projectType, setProjectType] = useState<ProjectType>("electoral");
  const [mode, setMode] = useState<PageMode>("active");
  const [reportText, setReportText] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);  // muestra reporte en columna izquierda
  const [isSaving, setIsSaving] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isClosingPhase, setIsClosingPhase] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [propagationWarning, setPropagationWarning] = useState<PhaseId[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const prevFormComplete = useRef(false);

  // Cargar proyecto al montar
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/moddulo/projects/${projectId}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          console.error(`[proposito] API error ${r.status}:`, await r.text());
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data?.project) return;
        const p = data.project;
        setProjectType(p.type ?? "electoral");

        // Poblar formulario desde xpcto
        const xpcto = p.xpcto;
        if (xpcto) {
          const loaded: XPCTOForm = {
            hito: xpcto.hito ?? "",
            sujeto: xpcto.sujeto ?? "",
            capacidades: {
              financiero: xpcto.capacidades?.financiero ?? "",
              humano: xpcto.capacidades?.humano ?? "",
              logistico: xpcto.capacidades?.logistico ?? "",
            },
            tiempo: {
              fechaLimite: xpcto.tiempo?.fechaLimite ?? "",
              duracionMeses: xpcto.tiempo?.duracionMeses ?? 0,
            },
            justificacion: xpcto.justificacion ?? "",
          };
          setForm(loaded);
          setEditForm(loaded);
        }

        // Detectar si la fase está completada
        const phaseStatus = p.phases?.proposito?.status;
        if (phaseStatus === "completed") {
          setMode("completed");
          const savedReport = p.phases?.proposito?.reportText;
          if (savedReport) setReportText(savedReport);
        }
      })
      .catch((err) => console.error("[proposito] fetch error:", err))
      .finally(() => setIsLoaded(true));
  }, [projectId]);

  // Auto-calcular duracionMeses (sólo en modo activo/edicion)
  useEffect(() => {
    if (!form.tiempo.fechaLimite) return;
    const limite = new Date(form.tiempo.fechaLimite);
    const hoy = new Date();
    const meses = Math.max(0, Math.round((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    setForm((prev) => ({ ...prev, tiempo: { ...prev.tiempo, duracionMeses: meses } }));
  }, [form.tiempo.fechaLimite]);

  // Auto-guardar (solo en modo activo, después de que cargaron los datos)
  const autoSave = useCallback(async (formData: XPCTOForm) => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      await fetch(`/api/moddulo/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          xpcto: {
            hito: formData.hito,
            sujeto: formData.sujeto,
            capacidades: formData.capacidades,
            tiempo: formData.tiempo,
            justificacion: formData.justificacion,
          } satisfies Partial<XPCTO>,
        }),
      });
      setLastSaved(new Date());
    } catch {/* silencioso */} finally {
      setIsSaving(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!isLoaded || mode !== "active") return;
    const timer = setTimeout(() => autoSave(form), 1500);
    return () => clearTimeout(timer);
  }, [form, autoSave, isLoaded, mode]);

  // Datos del formulario como objeto plano para el chat
  const currentFormData = {
    "xpcto.hito": form.hito,
    "xpcto.sujeto": form.sujeto,
    "xpcto.capacidades.financiero": form.capacidades.financiero,
    "xpcto.capacidades.humano": form.capacidades.humano,
    "xpcto.capacidades.logistico": form.capacidades.logistico,
    "xpcto.tiempo.fechaLimite": form.tiempo.fechaLimite,
    "xpcto.tiempo.duracionMeses": form.tiempo.duracionMeses,
    "xpcto.justificacion": form.justificacion,
  };

  // Extraer datos del chat
  const handleDataExtracted = useCallback((data: Record<string, unknown>) => {
    setForm((prev) => {
      const next = { ...prev };
      if (typeof data["xpcto.hito"] === "string") next.hito = data["xpcto.hito"];
      if (typeof data["xpcto.sujeto"] === "string") next.sujeto = data["xpcto.sujeto"];
      if (typeof data["xpcto.capacidades.financiero"] === "string")
        next.capacidades = { ...next.capacidades, financiero: data["xpcto.capacidades.financiero"] };
      if (typeof data["xpcto.capacidades.humano"] === "string")
        next.capacidades = { ...next.capacidades, humano: data["xpcto.capacidades.humano"] };
      if (typeof data["xpcto.capacidades.logistico"] === "string")
        next.capacidades = { ...next.capacidades, logistico: data["xpcto.capacidades.logistico"] };
      if (typeof data["xpcto.tiempo.fechaLimite"] === "string")
        next.tiempo = { ...next.tiempo, fechaLimite: data["xpcto.tiempo.fechaLimite"] };
      if (typeof data["xpcto.tiempo.duracionMeses"] === "number")
        next.tiempo = { ...next.tiempo, duracionMeses: data["xpcto.tiempo.duracionMeses"] };
      if (typeof data["xpcto.justificacion"] === "string") next.justificacion = data["xpcto.justificacion"];
      return next;
    });
  }, []);

  // Generar reporte diagnóstico via API (usado en activo, edición y cierre)
  const generateReport = async (formData: XPCTOForm): Promise<string | null> => {
    setIsGeneratingReport(true);
    try {
      const r = await fetch(`/api/moddulo/projects/${projectId}/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phaseId: "proposito",
          xpcto: {
            hito: formData.hito,
            sujeto: formData.sujeto,
            capacidades: formData.capacidades,
            tiempo: formData.tiempo,
            justificacion: formData.justificacion,
          },
        }),
      });
      if (!r.ok) return null;
      const data = await r.json();
      return data.reportText ?? null;
    } catch {
      return null;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Cerrar fase — guarda el reporte y navega a la siguiente fase
  const handleClosePhase = async () => {
    setIsClosingPhase(true);
    try {
      // Usar reporte existente o generar uno nuevo
      let report = reportText ?? extractReportFromMessages(chatMessages);
      if (!report) {
        report = await generateReport(form);
      }

      await fetch(`/api/moddulo/projects/${projectId}/complete-phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phaseId: "proposito", reportText: report ?? undefined }),
      });

      if (report) setReportText(report);
      setShowReview(false);
      // Navegar a la siguiente fase
      router.push(`/moddulo/proyecto/${projectId}/exploracion`);
    } catch {
      /* silencioso */
    } finally {
      setIsClosingPhase(false);
    }
  };

  // Entrar a modo edición
  const handleStartEdit = () => {
    setEditForm({ ...form });
    setMode("editing");
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setMode("completed");
  };

  // Guardar cambios del modo edición
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/moddulo/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          xpcto: {
            hito: editForm.hito,
            sujeto: editForm.sujeto,
            capacidades: editForm.capacidades,
            tiempo: editForm.tiempo,
            justificacion: editForm.justificacion,
          } satisfies Partial<XPCTO>,
        }),
      });
      setForm({ ...editForm });
      setLastSaved(new Date());

      // Regenerar reporte automáticamente con las nuevas variables
      const newReport = await generateReport(editForm);
      if (newReport) {
        setReportText(newReport);
        setShowReport(true);  // mostrar el reporte actualizado
      }

      // Verificar back-propagation
      const affected = await checkBackPropagation(projectId);
      if (affected.length > 0) {
        setPropagationWarning(affected);
      } else {
        setMode("completed");
      }
    } catch {/* silencioso */} finally {
      setIsSaving(false);
    }
  };

  // Detectar cuando se completa el formulario por primera vez en modo activo
  const formComplete = isFormComplete(form);
  useEffect(() => {
    if (mode !== "active" || !isLoaded) return;
    if (formComplete && !prevFormComplete.current) {
      // Primera vez que todos los campos están llenos — notificar en consola
      // (la UI reacciona vía el estado formComplete)
      prevFormComplete.current = true;
    } else if (!formComplete) {
      prevFormComplete.current = false;
    }
  }, [formComplete, mode, isLoaded]);

  const risks = detectRisks(
    { hito: form.hito, sujeto: form.sujeto, capacidades: form.capacidades, tiempo: form.tiempo, justificacion: form.justificacion },
    projectType
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-eske-20 bg-white-eske flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-bluegreen-eske">Fase 1</span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-lg font-bold text-gray-eske-80">Propósito</h1>
            {mode === "completed" && (
              <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                Completada
              </span>
            )}
            {mode === "editing" && (
              <span className="text-xs font-medium px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                Editando
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-eske-40">
            {isSaving ? "Guardando..." : lastSaved ? `Guardado ${lastSaved.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}` : ""}
          </span>

          {/* Botón Ver Resumen — visible en todos los modos cuando hay datos */}
          <VerResumenButton
            visible={formComplete || mode === "completed" || mode === "editing"}
            hasReport={!!reportText}
            isGenerating={isGeneratingReport}
            onClick={async () => {
              if (reportText) {
                // Ya existe reporte — mostrar sin llamada API
                setShowReport(true);
              } else {
                // Generar reporte nuevo
                const report = await generateReport(form);
                if (report) {
                  setReportText(report);
                  setShowReport(true);
                }
              }
            }}
          />

          {/* Modo activo: Editar variables + Cerrar Fase (habilitados solo al completar) */}
          {mode === "active" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartEdit}
                disabled={!formComplete}
                className="px-4 py-2 border border-bluegreen-eske text-bluegreen-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Editar variables
              </button>
              <button
                onClick={() => setShowReview(true)}
                disabled={!formComplete}
                className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cerrar Fase 1
              </button>
            </div>
          )}

          {/* Modo completado */}
          {mode === "completed" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartEdit}
                className="px-4 py-2 border border-bluegreen-eske text-bluegreen-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/5 transition-colors"
              >
                Editar variables
              </button>
              <button
                onClick={() => setShowReview(true)}
                className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors"
              >
                Cerrar Fase 1
              </button>
            </div>
          )}

          {/* Modo edición */}
          {mode === "editing" && (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-eske-20 text-gray-eske-60 rounded-lg text-sm font-medium hover:bg-gray-eske-10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 border border-bluegreen-eske text-bluegreen-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/5 transition-colors disabled:opacity-40"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                onClick={() => setShowReview(true)}
                className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors"
              >
                Cerrar Fase 1
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna izquierda: chat o reporte */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden min-w-0">
          {showReport || mode === "completed" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Botón volver al chat (solo cuando no es modo completed) */}
              {showReport && mode !== "completed" && (
                <button
                  onClick={() => setShowReport(false)}
                  className="shrink-0 mb-3 flex items-center gap-1.5 text-sm font-medium text-bluegreen-eske hover:text-bluegreen-eske/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver al chat
                </button>
              )}
              <PhaseReportView
                phaseId="proposito"
                reportText={reportText}
                projectId={projectId}
                onStartEdit={handleStartEdit}
                className="flex-1 overflow-hidden"
              />
            </div>
          ) : (
            <ModduloChat
              phaseId="proposito"
              projectId={projectId}
              currentFormData={currentFormData}
              onDataExtracted={handleDataExtracted}
              onMessagesChange={setChatMessages}
              className="flex-1 overflow-hidden"
            />
          )}
        </div>

        {/* Columna derecha: formulario XPCTO */}
        <div className="w-80 xl:w-96 shrink-0 border-l border-gray-eske-20 overflow-y-auto bg-gray-eske-10/50 p-4">
          <XPCTOFormPanel
            form={mode === "editing" ? editForm : form}
            onChange={mode === "editing" ? setEditForm : (mode === "active" ? setForm : () => {})}
            risks={risks}
            readOnly={mode === "completed"}
          />
        </div>
      </div>

      {/* Modal revisión de cierre */}
      {showReview && (
        <PhaseTransitionReview
          phaseId="proposito"
          nextPhaseId="exploracion"
          xpcto={form}
          risks={risks}
          onConfirm={handleClosePhase}
          onCancel={() => setShowReview(false)}
          isSubmitting={isClosingPhase}
        />
      )}

      {/* Modal back-propagation */}
      {propagationWarning.length > 0 && (
        <BackPropagationModal
          affectedPhases={propagationWarning}
          onDismiss={() => {
            setPropagationWarning([]);
            setMode("completed");
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================

// ==========================================
// BOTÓN VER RESUMEN
// ==========================================

function VerResumenButton({
  visible,
  hasReport,
  isGenerating,
  onClick,
}: {
  visible: boolean;
  hasReport: boolean;
  isGenerating: boolean;
  onClick: () => void;
}) {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      disabled={isGenerating}
      className="px-4 py-2 border border-bluegreen-eske text-bluegreen-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/5 transition-colors disabled:opacity-40 flex items-center gap-2"
    >
      {isGenerating ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-bluegreen-eske/30 border-t-bluegreen-eske rounded-full animate-spin" />
          Generando...
        </>
      ) : (
        hasReport ? "Ver Resumen" : "Generar Resumen"
      )}
    </button>
  );
}

// ==========================================
// TEXTAREA AUTO-RESIZE
// ==========================================

function AutoResizeTextarea({
  value,
  onChange,
  disabled,
  placeholder,
  minRows = 2,
  maxRows = 10,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 20;
    const minH = lineHeight * minRows + 16; // padding
    const maxH = lineHeight * maxRows + 16;
    el.style.height = Math.min(Math.max(el.scrollHeight, minH), maxH) + "px";
  }, [value, minRows, maxRows]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      rows={minRows}
      className={`resize-none overflow-y-auto ${className}`}
    />
  );
}

// ==========================================
// HELPERS
// ==========================================

// Todos los campos obligatorios del formulario deben estar llenos
function isFormComplete(form: XPCTOForm): boolean {
  return !!(
    form.hito.trim() &&
    form.sujeto.trim() &&
    form.capacidades.financiero.trim() &&
    form.capacidades.humano.trim() &&
    form.capacidades.logistico.trim() &&
    form.tiempo.fechaLimite.trim() &&
    form.justificacion.trim()
  );
}

function extractReportFromMessages(messages: ChatMessage[]): string | null {
  // Buscar el último mensaje del asistente que sea suficientemente largo
  // (el reporte diagnóstico suele ser > 500 caracteres)
  const candidates = messages
    .filter((m) => m.role === "assistant" && m.content.length > 500)
    .reverse();
  return candidates[0]?.content ?? null;
}

async function checkBackPropagation(projectId: string): Promise<PhaseId[]> {
  try {
    const r = await fetch(`/api/moddulo/projects/${projectId}`, { credentials: "include" });
    if (!r.ok) return [];
    const data = await r.json();
    const phases = data.project?.phases ?? {};
    const propositoIndex = PHASE_ORDER.indexOf("proposito");
    return PHASE_ORDER.slice(propositoIndex + 1).filter((phaseId) => {
      const status = phases[phaseId]?.status;
      return status === "in-progress" || status === "completed";
    }) as PhaseId[];
  } catch {
    return [];
  }
}

// ==========================================
// FORMULARIO XPCTO
// ==========================================

function XPCTOFormPanel({
  form,
  onChange,
  risks,
  readOnly = false,
}: {
  form: XPCTOForm;
  onChange: (f: XPCTOForm) => void;
  risks: ReturnType<typeof detectRisks>;
  readOnly?: boolean;
}) {
  const risksByField = risks.reduce<Record<string, (typeof risks)[0]>>(
    (acc, r) => ({ ...acc, [r.field]: r }),
    {}
  );

  const fieldClass = (field: string) =>
    `w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-bluegreen-eske/30 focus:border-bluegreen-eske text-gray-eske-80 bg-white-eske disabled:bg-gray-eske-10 disabled:text-gray-eske-50 ${
      risksByField[field]
        ? risksByField[field].level === "critical"
          ? "border-red-300"
          : "border-yellow-300"
        : "border-gray-eske-20"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-eske-50">Variables XPCTO</h2>
        {readOnly && (
          <span className="text-xs text-gray-eske-40 italic">Solo lectura</span>
        )}
        {!readOnly && (
          <span className="text-xs text-gray-eske-40">Auto-rellena via chat</span>
        )}
      </div>

      {/* X — Hito */}
      <FormField label="Hito (X)" hint="El resultado concreto e inamovible" risk={risksByField["xpcto.hito"]}>
        <AutoResizeTextarea
          value={form.hito}
          onChange={(v) => !readOnly && onChange({ ...form, hito: v })}
          disabled={readOnly}
          placeholder="¿Qué resultado específico y medible buscas lograr?"
          minRows={3}
          maxRows={10}
          className={fieldClass("xpcto.hito")}
        />
      </FormField>

      {/* P — Sujeto */}
      <FormField label="Sujeto (P)" hint="El actor político del proyecto">
        <AutoResizeTextarea
          value={form.sujeto}
          onChange={(v) => !readOnly && onChange({ ...form, sujeto: v })}
          disabled={readOnly}
          placeholder="Nombre, cargo al que aspira, perfil general..."
          minRows={2}
          maxRows={8}
          className={fieldClass("xpcto.sujeto")}
        />
      </FormField>

      {/* C — Capacidades */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-eske-60">
          Capacidades (C)
          {risksByField["xpcto.capacidades"] && (
            <RiskBadge level={risksByField["xpcto.capacidades"].level} />
          )}
        </p>
        {[
          { key: "financiero" as const, placeholder: "Financiero — presupuesto disponible" },
          { key: "humano" as const, placeholder: "Humano — equipo y estructura" },
          { key: "logistico" as const, placeholder: "Logístico — infraestructura y medios" },
        ].map(({ key, placeholder }) => (
          <input
            key={key}
            type="text"
            value={form.capacidades[key]}
            onChange={(e) => !readOnly && onChange({ ...form, capacidades: { ...form.capacidades, [key]: e.target.value } })}
            disabled={readOnly}
            placeholder={placeholder}
            className={fieldClass(`xpcto.capacidades.${key}`)}
          />
        ))}
      </div>

      {/* T — Tiempo */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-eske-60">
          Tiempo (T)
          {risksByField["xpcto.tiempo"] && <RiskBadge level={risksByField["xpcto.tiempo"].level} />}
        </p>
        <div>
          <label className="text-xs text-gray-eske-40 mb-1 block">Fecha límite inamovible</label>
          <input
            type="date"
            value={form.tiempo.fechaLimite}
            onChange={(e) => !readOnly && onChange({ ...form, tiempo: { ...form.tiempo, fechaLimite: e.target.value } })}
            disabled={readOnly}
            className={fieldClass("xpcto.tiempo.fechaLimite")}
          />
        </div>
        {form.tiempo.duracionMeses > 0 && (
          <p className="text-xs text-gray-eske-50 text-right">
            {form.tiempo.duracionMeses} {form.tiempo.duracionMeses === 1 ? "mes" : "meses"} desde hoy
          </p>
        )}
      </div>

      {/* O — Justificación */}
      <FormField label="Justificación (O)" hint="El propósito ético que legitima el proyecto" risk={risksByField["xpcto.justificacion"]}>
        <AutoResizeTextarea
          value={form.justificacion}
          onChange={(v) => !readOnly && onChange({ ...form, justificacion: v })}
          disabled={readOnly}
          placeholder="¿Por qué este proyecto merece existir más allá de ganar o perder?"
          minRows={3}
          maxRows={10}
          className={fieldClass("xpcto.justificacion")}
        />
      </FormField>
    </div>
  );
}

function FormField({ label, hint, risk, children }: {
  label: string;
  hint?: string;
  risk?: ReturnType<typeof detectRisks>[0];
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="text-xs font-semibold text-gray-eske-60">{label}</label>
        {risk && <RiskBadge level={risk.level} />}
      </div>
      {hint && <p className="text-xs text-gray-eske-40 mb-1">{hint}</p>}
      {children}
      {risk && (
        <p className={`text-xs mt-1 ${risk.level === "critical" ? "text-red-600" : "text-yellow-700"}`}>
          {risk.title}
        </p>
      )}
    </div>
  );
}

function RiskBadge({ level }: { level: "warning" | "critical" }) {
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
      level === "critical" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
    }`}>
      {level === "critical" ? "⚠" : "○"}
    </span>
  );
}

// ==========================================
// MODAL BACK-PROPAGATION
// ==========================================

function BackPropagationModal({ affectedPhases, onDismiss }: {
  affectedPhases: PhaseId[];
  onDismiss: () => void;
}) {
  const PHASE_NAMES: Record<PhaseId, string> = {
    proposito: "Propósito",
    exploracion: "Exploración",
    investigacion: "Investigación",
    diagnostico: "Diagnóstico",
    estrategia: "Diseño Estratégico",
    tactica: "Diseño Táctico",
    gerencia: "Gerencia",
    seguimiento: "Seguimiento",
    evaluacion: "Evaluación",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-eske/50">
      <div className="bg-white-eske rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-gray-eske-80">Cambios con impacto en fases posteriores</h2>
            <p className="text-sm text-gray-eske-60 mt-1">
              Las siguientes fases ya tienen trabajo registrado. Los cambios al XPCTO de Propósito pueden afectar las decisiones tomadas en ellas:
            </p>
          </div>
        </div>

        <ul className="space-y-2 mb-5">
          {affectedPhases.map((phaseId) => (
            <li key={phaseId} className="flex items-center gap-2 text-sm text-gray-eske-70 bg-orange-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {PHASE_NAMES[phaseId]}
            </li>
          ))}
        </ul>

        <p className="text-xs text-gray-eske-50 mb-5 leading-relaxed">
          Moddulo ha guardado tus cambios. Te recomendamos revisar el trabajo de cada fase afectada para verificar que las decisiones sigan siendo consistentes con el nuevo Propósito.
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-2.5 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors"
        >
          Entendido — revisar las fases afectadas
        </button>
      </div>
    </div>
  );
}
