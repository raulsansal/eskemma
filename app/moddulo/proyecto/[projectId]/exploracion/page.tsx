// app/moddulo/proyecto/[projectId]/exploracion/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ModduloChat from "@/app/moddulo/components/ModduloChat";
import PhaseTransitionReview from "@/app/moddulo/components/PhaseTransitionReview";
import PhaseReportView from "@/app/moddulo/components/PhaseReportView";
import type {
  XPCTO,
  ProjectType,
  ChatMessage,
  PhaseId,
  ExplorationForm,
  VetoActor,
} from "@/types/moddulo.types";
import { PHASE_ORDER, emptyExplorationForm } from "@/types/moddulo.types";

// ==========================================
// TIPOS LOCALES
// ==========================================

type PageMode = "active" | "completed" | "editing";

type PestlSection =
  | "politico"
  | "economico"
  | "social"
  | "tecnologico"
  | "legal"
  | "semaforo"
  | "hipotesis";

const PESTL_SECTIONS: { id: PestlSection; label: string; short: string }[] = [
  { id: "politico",    label: "Político",      short: "P" },
  { id: "economico",   label: "Económico",     short: "E" },
  { id: "social",      label: "Social",        short: "S" },
  { id: "tecnologico", label: "Tecnológico",   short: "T" },
  { id: "legal",       label: "Legal",         short: "L" },
  { id: "semaforo",    label: "Semáforo Veto", short: "⚑" },
  { id: "hipotesis",   label: "Hipótesis",     short: "H" },
];

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function ExploracionPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [form, setForm] = useState<ExplorationForm>(emptyExplorationForm());
  const [editForm, setEditForm] = useState<ExplorationForm>(emptyExplorationForm());
  const [xpcto, setXpcto] = useState<XPCTO | null>(null);
  const [projectType, setProjectType] = useState<ProjectType>("electoral");
  const [activeSection, setActiveSection] = useState<PestlSection>("politico");
  const [mode, setMode] = useState<PageMode>("active");
  const [reportText, setReportText] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isClosingPhase, setIsClosingPhase] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [propagationWarning, setPropagationWarning] = useState<PhaseId[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "form">("chat");

  // Cargar proyecto al montar
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/moddulo/projects/${projectId}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          console.error(`[exploracion] API error ${r.status}:`, await r.text());
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data?.project) return;
        const p = data.project;
        setProjectType(p.type ?? "electoral");

        // XPCTO de F1 como contexto fundacional
        if (p.xpcto) setXpcto(p.xpcto);

        // Cargar datos de F2 desde phases.exploracion.data
        const phaseData = p.phases?.exploracion?.data;
        if (phaseData && Object.keys(phaseData).length > 0) {
          const loaded = mergePhaseData(emptyExplorationForm(), phaseData);
          setForm(loaded);
          setEditForm(loaded);
        }

        // Detectar si la fase está completada
        const phaseStatus = p.phases?.exploracion?.status;
        if (phaseStatus === "completed") {
          setMode("completed");
          const savedReport = p.phases?.exploracion?.reportText;
          if (savedReport) setReportText(savedReport);
        }
      })
      .catch((err) => console.error("[exploracion] fetch error:", err))
      .finally(() => setIsLoaded(true));
  }, [projectId]);

  // Auto-guardar (solo en modo activo, después de cargar)
  const autoSave = useCallback(async (formData: ExplorationForm) => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      await fetch(`/api/moddulo/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phaseData: { phaseId: "exploracion", data: formData } }),
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

  // Datos planos del formulario para el chat (incluye sección activa como contexto)
  const currentFormData: Record<string, unknown> = {
    activeSection,
    "pestl.politico.contexto": form.pestl.politico.contexto,
    "pestl.politico.actoresClave": form.pestl.politico.actoresClave,
    "pestl.politico.actoresVeto": form.pestl.politico.actoresVeto,
    "pestl.politico.senalesCriticas": form.pestl.politico.senalesCriticas,
    "pestl.economico.contexto": form.pestl.economico.contexto,
    "pestl.economico.senalesCriticas": form.pestl.economico.senalesCriticas,
    "pestl.social.contexto": form.pestl.social.contexto,
    "pestl.social.senalesCriticas": form.pestl.social.senalesCriticas,
    "pestl.tecnologico.contexto": form.pestl.tecnologico.contexto,
    "pestl.tecnologico.senalesCriticas": form.pestl.tecnologico.senalesCriticas,
    "pestl.legal.contexto": form.pestl.legal.contexto,
    "pestl.legal.senalesCriticas": form.pestl.legal.senalesCriticas,
    "semaforo.resumen": form.semaforo.resumen,
    "semaforo.actores": form.semaforo.actores,
    "hipotesis.enunciado": form.hipotesis.enunciado,
    "hipotesis.premisas": form.hipotesis.premisas,
    "hipotesis.implicaciones": form.hipotesis.implicaciones,
  };

  // XPCTO como contexto para el prompt del chat
  const xpctoContext = xpcto
    ? {
        hito: xpcto.hito,
        sujeto: xpcto.sujeto,
        capacidades: xpcto.capacidades,
        tiempo: xpcto.tiempo,
        justificacion: xpcto.justificacion,
        tipoProyecto: projectType,
      }
    : undefined;

  // Extracción de datos del chat → formulario
  const handleDataExtracted = useCallback((data: Record<string, unknown>) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      if (typeof data["pestl.politico.contexto"] === "string")       next.pestl.politico.contexto = data["pestl.politico.contexto"];
      if (typeof data["pestl.politico.actoresClave"] === "string")   next.pestl.politico.actoresClave = data["pestl.politico.actoresClave"];
      if (typeof data["pestl.politico.actoresVeto"] === "string")    next.pestl.politico.actoresVeto = data["pestl.politico.actoresVeto"];
      if (typeof data["pestl.politico.senalesCriticas"] === "string") next.pestl.politico.senalesCriticas = data["pestl.politico.senalesCriticas"];
      if (typeof data["pestl.economico.contexto"] === "string")      next.pestl.economico.contexto = data["pestl.economico.contexto"];
      if (typeof data["pestl.economico.senalesCriticas"] === "string") next.pestl.economico.senalesCriticas = data["pestl.economico.senalesCriticas"];
      if (typeof data["pestl.social.contexto"] === "string")         next.pestl.social.contexto = data["pestl.social.contexto"];
      if (typeof data["pestl.social.senalesCriticas"] === "string")  next.pestl.social.senalesCriticas = data["pestl.social.senalesCriticas"];
      if (typeof data["pestl.tecnologico.contexto"] === "string")    next.pestl.tecnologico.contexto = data["pestl.tecnologico.contexto"];
      if (typeof data["pestl.tecnologico.senalesCriticas"] === "string") next.pestl.tecnologico.senalesCriticas = data["pestl.tecnologico.senalesCriticas"];
      if (typeof data["pestl.legal.contexto"] === "string")          next.pestl.legal.contexto = data["pestl.legal.contexto"];
      if (typeof data["pestl.legal.senalesCriticas"] === "string")   next.pestl.legal.senalesCriticas = data["pestl.legal.senalesCriticas"];
      if (typeof data["semaforo.resumen"] === "string")              next.semaforo.resumen = data["semaforo.resumen"];
      if (Array.isArray(data["semaforo.actores"]))                   next.semaforo.actores = data["semaforo.actores"] as VetoActor[];
      if (typeof data["hipotesis.enunciado"] === "string")           next.hipotesis.enunciado = data["hipotesis.enunciado"];
      if (typeof data["hipotesis.premisas"] === "string")            next.hipotesis.premisas = data["hipotesis.premisas"];
      if (typeof data["hipotesis.implicaciones"] === "string")       next.hipotesis.implicaciones = data["hipotesis.implicaciones"];
      return next;
    });
  }, []);

  // Generar resultado exploratorio
  const generateReport = async (formData: ExplorationForm): Promise<string | null> => {
    setIsGeneratingReport(true);
    try {
      const r = await fetch(`/api/moddulo/projects/${projectId}/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phaseId: "exploracion", explorationData: formData, xpcto }),
      });
      if (!r.ok) return null;
      const data = await r.json();
      return data.reportText ?? null;
    } catch { return null; }
    finally { setIsGeneratingReport(false); }
  };

  const handleVerResultado = async () => {
    if (reportText) { setShowReport(true); setMobileTab("chat"); return; }
    const report = await generateReport(form);
    if (report) { setReportText(report); setShowReport(true); setMobileTab("chat"); }
  };

  const handleClosePhase = async () => {
    setIsClosingPhase(true);
    try {
      const report = reportText ?? await generateReport(form);
      await fetch(`/api/moddulo/projects/${projectId}/complete-phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phaseId: "exploracion", reportText: report ?? undefined }),
      });
      if (report) setReportText(report);
      setShowReview(false);
      router.push(`/moddulo/proyecto/${projectId}/investigacion`);
    } catch {/* silencioso */} finally { setIsClosingPhase(false); }
  };

  const handleStartEdit = () => { setEditForm(structuredClone(form)); setMode("editing"); };
  const handleCancelEdit = () => setMode("completed");

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/moddulo/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phaseData: { phaseId: "exploracion", data: editForm } }),
      });
      setForm(structuredClone(editForm));
      setLastSaved(new Date());
      const newReport = await generateReport(editForm);
      if (newReport) { setReportText(newReport); setShowReport(true); }
      const affected = await checkBackPropagation(projectId);
      if (affected.length > 0) setPropagationWarning(affected);
      else setMode("completed");
    } catch {/* silencioso */} finally { setIsSaving(false); }
  };

  const formComplete = isF2FormComplete(form);
  const activeForm = mode === "editing" ? editForm : form;
  const setActiveForm = mode === "editing" ? setEditForm : (mode === "active" ? setForm : () => {});

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ===== HEADER ===== */}
      <div className="shrink-0 px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-eske-20 bg-white-eske">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-bluegreen-eske shrink-0">F2</span>
            <h1 className="text-sm sm:text-base font-bold text-black-eske truncate">Exploración</h1>
            {mode === "completed" && (
              <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">✓ Lista</span>
            )}
            {mode === "editing" && (
              <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">Editando</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs text-gray-eske-40 hidden sm:block">
              {isSaving ? "Guardando..." : lastSaved ? `✓ ${lastSaved.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}` : ""}
            </span>
            <DownloadButton form={form} reportText={reportText} chatMessages={chatMessages} />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(formComplete || mode === "completed" || mode === "editing") && (
            <button
              onClick={handleVerResultado}
              disabled={isGeneratingReport}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-bluegreen-eske text-bluegreen-eske rounded-lg text-xs font-semibold hover:bg-bluegreen-eske/5 transition-colors disabled:opacity-40"
            >
              {isGeneratingReport
                ? <><div className="w-3 h-3 border-2 border-bluegreen-eske/30 border-t-bluegreen-eske rounded-full animate-spin" />Generando</>
                : reportText ? "Ver resultado exploratorio" : "Generar resultado exploratorio"
              }
            </button>
          )}

          {mode === "active" && (<>
            <button onClick={handleStartEdit} disabled={!formComplete}
              className="px-2.5 py-1.5 border border-gray-eske-20 text-gray-eske-60 rounded-lg text-xs font-semibold hover:bg-gray-eske-10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              Editar análisis
            </button>
            <button onClick={() => setShowReview(true)} disabled={!formComplete}
              className="px-2.5 py-1.5 bg-bluegreen-eske text-white-eske rounded-lg text-xs font-semibold hover:bg-bluegreen-eske/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              Cerrar Fase 2
            </button>
          </>)}

          {mode === "completed" && (<>
            <button onClick={handleStartEdit}
              className="px-2.5 py-1.5 border border-gray-eske-20 text-gray-eske-60 rounded-lg text-xs font-semibold hover:bg-gray-eske-10 transition-colors">
              Editar análisis
            </button>
            <button onClick={() => setShowReview(true)}
              className="px-2.5 py-1.5 bg-bluegreen-eske text-white-eske rounded-lg text-xs font-semibold hover:bg-bluegreen-eske/90 transition-colors">
              Cerrar Fase 2
            </button>
          </>)}

          {mode === "editing" && (<>
            <button onClick={handleCancelEdit}
              className="px-2.5 py-1.5 border border-gray-eske-20 text-gray-eske-60 rounded-lg text-xs font-semibold hover:bg-gray-eske-10 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSaveEdit} disabled={isSaving}
              className="px-2.5 py-1.5 border border-bluegreen-eske text-bluegreen-eske rounded-lg text-xs font-semibold hover:bg-bluegreen-eske/5 transition-colors disabled:opacity-40">
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button onClick={() => setShowReview(true)}
              className="px-2.5 py-1.5 bg-bluegreen-eske text-white-eske rounded-lg text-xs font-semibold hover:bg-bluegreen-eske/90 transition-colors">
              Cerrar Fase 2
            </button>
          </>)}
        </div>
      </div>

      {/* ===== TABS MOBILE ===== */}
      <div className="lg:hidden shrink-0 flex border-b border-gray-eske-20 bg-white-eske">
        {[
          { id: "chat" as const, label: showReport || mode === "completed" ? "📋 Resultado" : "💬 Chat" },
          { id: "form" as const, label: "📊 Análisis PEST-L" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setMobileTab(id)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors border-b-2 ${
              mobileTab === id ? "border-bluegreen-eske text-bluegreen-eske" : "border-transparent text-gray-eske-50"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <div className="flex-1 flex overflow-hidden">

        {/* Columna izquierda: chat / resultado */}
        <div className={`flex-1 flex-col p-3 sm:p-4 overflow-hidden min-w-0 ${mobileTab === "chat" ? "flex" : "hidden lg:flex"}`}>
          {showReport || mode === "completed" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {showReport && mode !== "completed" && (
                <button onClick={() => setShowReport(false)}
                  className="shrink-0 mb-3 flex items-center gap-1.5 text-sm font-medium text-bluegreen-eske hover:text-bluegreen-eske/80 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver al chat
                </button>
              )}
              <PhaseReportView
                phaseId="exploracion"
                reportText={reportText}
                projectId={projectId}
                onStartEdit={handleStartEdit}
                className="flex-1 overflow-hidden"
              />
            </div>
          ) : (
            <ModduloChat
              phaseId="exploracion"
              projectId={projectId}
              currentFormData={currentFormData}
              xpctoContext={xpctoContext}
              onDataExtracted={handleDataExtracted}
              onMessagesChange={setChatMessages}
              className="flex-1 overflow-hidden"
            />
          )}
        </div>

        {/* Columna derecha: formulario PEST-L */}
        <div className={`flex-col w-full lg:w-80 xl:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-eske-20 overflow-hidden bg-gray-eske-10/50 ${mobileTab === "form" ? "flex" : "hidden lg:flex"}`}>
          <ExplorationFormPanel
            form={activeForm}
            onChange={setActiveForm}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            readOnly={mode === "completed"}
            projectType={projectType}
          />
        </div>
      </div>

      {/* Modal de revisión al cerrar */}
      {showReview && (
        <PhaseTransitionReview
          phaseId="exploracion"
          nextPhaseId="investigacion"
          xpcto={xpcto ?? {}}
          risks={[]}
          onConfirm={handleClosePhase}
          onCancel={() => setShowReview(false)}
          isSubmitting={isClosingPhase}
        />
      )}

      {/* Modal back-propagation */}
      {propagationWarning.length > 0 && (
        <BackPropagationModal
          affectedPhases={propagationWarning}
          onDismiss={() => { setPropagationWarning([]); setMode("completed"); }}
        />
      )}
    </div>
  );
}

// ==========================================
// PANEL DEL FORMULARIO PEST-L
// ==========================================

function ExplorationFormPanel({
  form, onChange, activeSection, onSectionChange, readOnly, projectType,
}: {
  form: ExplorationForm;
  onChange: (f: ExplorationForm) => void;
  activeSection: PestlSection;
  onSectionChange: (s: PestlSection) => void;
  readOnly: boolean;
  projectType: ProjectType;
}) {
  const fieldClass =
    "w-full px-3 py-2 text-sm font-normal rounded-lg border border-gray-eske-20 " +
    "focus:outline-none focus:ring-2 focus:ring-bluegreen-eske/30 focus:border-bluegreen-eske " +
    "text-black-eske bg-white-eske disabled:bg-gray-eske-10 disabled:text-black-eske-10 " +
    "placeholder:text-gray-eske-40 resize-none";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-3 py-2 border-b border-gray-eske-20 bg-white-eske flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-eske-50">Análisis PEST-L</h2>
        <span className="text-xs text-gray-eske-40">{readOnly ? "Solo lectura" : "Auto-rellena via chat"}</span>
      </div>

      {/* Tabs de secciones */}
      <div className="shrink-0 flex overflow-x-auto border-b border-gray-eske-20 bg-white-eske">
        {PESTL_SECTIONS.map((sec) => {
          const filled = isSectionFilled(form, sec.id);
          return (
            <button key={sec.id} onClick={() => onSectionChange(sec.id)}
              className={`shrink-0 px-3 py-2 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1 ${
                activeSection === sec.id
                  ? "border-bluegreen-eske text-bluegreen-eske"
                  : "border-transparent text-gray-eske-50 hover:text-black-eske"
              }`}>
              <span className="hidden sm:inline">{sec.label}</span>
              <span className="sm:hidden">{sec.short}</span>
              {filled && <span className="w-1.5 h-1.5 rounded-full bg-bluegreen-eske shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Contenido de la sección */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeSection === "politico" && (
          <PoliticoSection form={form} onChange={onChange} readOnly={readOnly} fieldClass={fieldClass} projectType={projectType} />
        )}
        {activeSection === "economico" && (
          <SimpleDimSection
            title="Entorno Económico"
            hint={projectType === "gubernamental"
              ? "Recursos públicos, presupuesto, condiciones que afectan la gestión"
              : "Condiciones económicas que impactan la viabilidad y el electorado"}
            contexto={form.pestl.economico.contexto}
            senales={form.pestl.economico.senalesCriticas}
            onCtx={(v) => onChange({ ...form, pestl: { ...form.pestl, economico: { ...form.pestl.economico, contexto: v } } })}
            onSen={(v) => onChange({ ...form, pestl: { ...form.pestl, economico: { ...form.pestl.economico, senalesCriticas: v } } })}
            readOnly={readOnly} fieldClass={fieldClass}
          />
        )}
        {activeSection === "social" && (
          <SimpleDimSection
            title="Entorno Social"
            hint={projectType === "electoral"
              ? "Demografía, preferencias e identidades del electorado"
              : projectType === "ciudadano"
              ? "Bases sociales, capacidad de movilización, tejido asociativo"
              : "Percepción ciudadana, demandas sociales y cohesión"}
            contexto={form.pestl.social.contexto}
            senales={form.pestl.social.senalesCriticas}
            onCtx={(v) => onChange({ ...form, pestl: { ...form.pestl, social: { ...form.pestl.social, contexto: v } } })}
            onSen={(v) => onChange({ ...form, pestl: { ...form.pestl, social: { ...form.pestl.social, senalesCriticas: v } } })}
            readOnly={readOnly} fieldClass={fieldClass}
          />
        )}
        {activeSection === "tecnologico" && (
          <SimpleDimSection
            title="Entorno Tecnológico"
            hint="Infraestructura digital, redes sociales dominantes, herramientas disponibles"
            contexto={form.pestl.tecnologico.contexto}
            senales={form.pestl.tecnologico.senalesCriticas}
            onCtx={(v) => onChange({ ...form, pestl: { ...form.pestl, tecnologico: { ...form.pestl.tecnologico, contexto: v } } })}
            onSen={(v) => onChange({ ...form, pestl: { ...form.pestl, tecnologico: { ...form.pestl.tecnologico, senalesCriticas: v } } })}
            readOnly={readOnly} fieldClass={fieldClass}
          />
        )}
        {activeSection === "legal" && (
          <SimpleDimSection
            title="Entorno Legal"
            hint={projectType === "legislativo"
              ? "Marco normativo, bloques parlamentarios, requisitos de coalición o mayoría"
              : "Marco jurídico electoral, plazos legales, restricciones y oportunidades normativas"}
            contexto={form.pestl.legal.contexto}
            senales={form.pestl.legal.senalesCriticas}
            onCtx={(v) => onChange({ ...form, pestl: { ...form.pestl, legal: { ...form.pestl.legal, contexto: v } } })}
            onSen={(v) => onChange({ ...form, pestl: { ...form.pestl, legal: { ...form.pestl.legal, senalesCriticas: v } } })}
            readOnly={readOnly} fieldClass={fieldClass}
          />
        )}
        {activeSection === "semaforo" && (
          <SemaforoSection form={form} onChange={onChange} readOnly={readOnly} fieldClass={fieldClass} />
        )}
        {activeSection === "hipotesis" && (
          <HipotesisSection form={form} onChange={onChange} readOnly={readOnly} fieldClass={fieldClass} />
        )}
      </div>
    </div>
  );
}

// ==========================================
// SECCIÓN POLÍTICO
// ==========================================

function PoliticoSection({ form, onChange, readOnly, fieldClass, projectType }: {
  form: ExplorationForm; onChange: (f: ExplorationForm) => void;
  readOnly: boolean; fieldClass: string; projectType: ProjectType;
}) {
  const hint = projectType === "legislativo"
    ? "Bloques parlamentarios, presidencias de comisión, alianzas y oposición"
    : projectType === "electoral"
    ? "Partidos, coaliciones, figuras clave y estructura de la competencia electoral"
    : "Actores gubernamentales, grupos de presión y dinámica de poder institucional";

  const upd = (patch: Partial<ExplorationForm["pestl"]["politico"]>) =>
    onChange({ ...form, pestl: { ...form.pestl, politico: { ...form.pestl.politico, ...patch } } });

  return (
    <div className="space-y-3">
      <SectionField label="Contexto político general" hint={hint}>
        <AutoResizeTextarea value={form.pestl.politico.contexto}
          onChange={(v) => upd({ contexto: v })} disabled={readOnly}
          placeholder="Describe el panorama político del territorio y su relevancia para el proyecto..."
          minRows={3} maxRows={8} className={fieldClass} />
      </SectionField>
      <SectionField label="Actores clave">
        <AutoResizeTextarea value={form.pestl.politico.actoresClave}
          onChange={(v) => upd({ actoresClave: v })} disabled={readOnly}
          placeholder="¿Quiénes tienen influencia política real en este proyecto? (personas, partidos, organizaciones)"
          minRows={2} maxRows={6} className={fieldClass} />
      </SectionField>
      <SectionField label="Actores de veto" hint="Actores con capacidad real de bloqueo">
        <AutoResizeTextarea value={form.pestl.politico.actoresVeto}
          onChange={(v) => upd({ actoresVeto: v })} disabled={readOnly}
          placeholder="¿Quiénes pueden bloquear el proyecto y por qué razón?"
          minRows={2} maxRows={6} className={fieldClass} />
      </SectionField>
      <SectionField label="Señales críticas">
        <AutoResizeTextarea value={form.pestl.politico.senalesCriticas}
          onChange={(v) => upd({ senalesCriticas: v })} disabled={readOnly}
          placeholder="Alertas u oportunidades políticas identificadas en el entorno..."
          minRows={2} maxRows={5} className={fieldClass} />
      </SectionField>
    </div>
  );
}

// ==========================================
// SECCIÓN GENÉRICA (E, S, T, L)
// ==========================================

function SimpleDimSection({ title, hint, contexto, senales, onCtx, onSen, readOnly, fieldClass }: {
  title: string; hint: string; contexto: string; senales: string;
  onCtx: (v: string) => void; onSen: (v: string) => void;
  readOnly: boolean; fieldClass: string;
}) {
  return (
    <div className="space-y-3">
      <SectionField label={title} hint={hint}>
        <AutoResizeTextarea value={contexto} onChange={onCtx} disabled={readOnly}
          placeholder={`Describe el contexto de ${title.toLowerCase()} y su impacto en el proyecto...`}
          minRows={4} maxRows={10} className={fieldClass} />
      </SectionField>
      <SectionField label="Señales críticas">
        <AutoResizeTextarea value={senales} onChange={onSen} disabled={readOnly}
          placeholder="Alertas u oportunidades identificadas en esta dimensión..."
          minRows={2} maxRows={5} className={fieldClass} />
      </SectionField>
    </div>
  );
}

// ==========================================
// SECCIÓN SEMÁFORO DE VETO
// ==========================================

function SemaforoSection({ form, onChange, readOnly, fieldClass }: {
  form: ExplorationForm; onChange: (f: ExplorationForm) => void;
  readOnly: boolean; fieldClass: string;
}) {
  const NIVEL_COLORS: Record<VetoActor["nivel"], string> = {
    alto:  "bg-red-50 text-red-700 border-red-200",
    medio: "bg-amber-50 text-amber-700 border-amber-200",
    bajo:  "bg-gray-eske-10 text-gray-eske-60 border-gray-eske-20",
  };

  const addActor = () => {
    if (readOnly) return;
    onChange({ ...form, semaforo: { ...form.semaforo,
      actores: [...form.semaforo.actores, { nombre: "", nivel: "medio", descripcion: "" }],
    }});
  };

  const updateActor = (i: number, patch: Partial<VetoActor>) => {
    const actores = [...form.semaforo.actores];
    actores[i] = { ...actores[i], ...patch };
    onChange({ ...form, semaforo: { ...form.semaforo, actores } });
  };

  const removeActor = (i: number) => {
    if (readOnly) return;
    onChange({ ...form, semaforo: { ...form.semaforo,
      actores: form.semaforo.actores.filter((_, idx) => idx !== i),
    }});
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-eske-60">Actores con poder de veto</p>
      <p className="text-xs text-gray-eske-40">Lista los actores que pueden bloquear el proyecto con su nivel de riesgo.</p>

      {form.semaforo.actores.length === 0 && (
        <p className="text-xs text-gray-eske-40 italic">Sin actores registrados. Usa el chat o añade manualmente.</p>
      )}

      <div className="space-y-2">
        {form.semaforo.actores.map((actor, i) => (
          <div key={i} className={`rounded-lg border p-2.5 ${NIVEL_COLORS[actor.nivel]}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <input type="text" value={actor.nombre}
                onChange={(e) => updateActor(i, { nombre: e.target.value })} disabled={readOnly}
                placeholder="Nombre del actor"
                className="flex-1 text-xs font-semibold bg-transparent border-b border-current/20 focus:outline-none py-0.5 placeholder:font-normal placeholder:text-current/40" />
              <select value={actor.nivel}
                onChange={(e) => updateActor(i, { nivel: e.target.value as VetoActor["nivel"] })}
                disabled={readOnly}
                className="text-xs font-semibold bg-transparent border border-current/20 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer">
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
              {!readOnly && (
                <button onClick={() => removeActor(i)} className="text-current/50 hover:text-current transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <input type="text" value={actor.descripcion}
              onChange={(e) => updateActor(i, { descripcion: e.target.value })} disabled={readOnly}
              placeholder="¿Por qué puede bloquear y cómo?"
              className="w-full text-xs bg-transparent border-b border-current/20 focus:outline-none py-0.5 placeholder:text-current/40" />
          </div>
        ))}
      </div>

      {!readOnly && (
        <button onClick={addActor}
          className="text-xs font-semibold text-bluegreen-eske hover:text-bluegreen-eske/80 flex items-center gap-1 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
          </svg>
          Añadir actor
        </button>
      )}

      <SectionField label="Síntesis del riesgo de veto">
        <AutoResizeTextarea value={form.semaforo.resumen}
          onChange={(v) => onChange({ ...form, semaforo: { ...form.semaforo, resumen: v } })}
          disabled={readOnly}
          placeholder="Resumen del riesgo general de veto y estrategias de manejo..."
          minRows={2} maxRows={6} className={fieldClass} />
      </SectionField>
    </div>
  );
}

// ==========================================
// SECCIÓN HIPÓTESIS
// ==========================================

function HipotesisSection({ form, onChange, readOnly, fieldClass }: {
  form: ExplorationForm; onChange: (f: ExplorationForm) => void;
  readOnly: boolean; fieldClass: string;
}) {
  const upd = (patch: Partial<ExplorationForm["hipotesis"]>) =>
    onChange({ ...form, hipotesis: { ...form.hipotesis, ...patch } });

  return (
    <div className="space-y-3">
      <SectionField label="Hipótesis Estratégica Inicial" required
        hint="La premisa central que F3 validará o corregirá. Debe ser clara, auditable y falseable.">
        <AutoResizeTextarea value={form.hipotesis.enunciado}
          onChange={(v) => upd({ enunciado: v })} disabled={readOnly}
          placeholder='"Si el proyecto se posiciona en el eje de la seguridad y aprovecha el descontento con el partido gobernante, puede capitalizar el voto independiente en el distrito norte..."'
          minRows={3} maxRows={8} className={fieldClass} />
      </SectionField>
      <SectionField label="Premisas que la sostienen"
        hint="Los supuestos sobre los cuales descansa la hipótesis.">
        <AutoResizeTextarea value={form.hipotesis.premisas}
          onChange={(v) => upd({ premisas: v })} disabled={readOnly}
          placeholder="¿Qué supuestos hacen que esta hipótesis sea plausible?"
          minRows={3} maxRows={7} className={fieldClass} />
      </SectionField>
      <SectionField label="Implicaciones estratégicas"
        hint="¿Qué significa para el proyecto si la hipótesis es correcta o incorrecta?">
        <AutoResizeTextarea value={form.hipotesis.implicaciones}
          onChange={(v) => upd({ implicaciones: v })} disabled={readOnly}
          placeholder="Si es correcta: ... Si es incorrecta o parcial: ..."
          minRows={2} maxRows={6} className={fieldClass} />
      </SectionField>
    </div>
  );
}

// ==========================================
// COMPONENTES DE UTILIDAD
// ==========================================

function SectionField({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-eske-60 block mb-1">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-eske-40 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

function AutoResizeTextarea({ value, onChange, disabled, placeholder, minRows = 2, maxRows = 10, className = "" }: {
  value: string; onChange: (v: string) => void; disabled?: boolean;
  placeholder?: string; minRows?: number; maxRows?: number; className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lh = parseInt(getComputedStyle(el).lineHeight) || 20;
    el.style.height = Math.min(Math.max(el.scrollHeight, lh * minRows + 16), lh * maxRows + 16) + "px";
  }, [value, minRows, maxRows]);

  return (
    <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)}
      disabled={disabled} placeholder={placeholder} rows={minRows}
      className={`resize-none overflow-y-auto ${className}`} />
  );
}

// ==========================================
// MODAL BACK-PROPAGATION
// ==========================================

function BackPropagationModal({ affectedPhases, onDismiss }: {
  affectedPhases: PhaseId[]; onDismiss: () => void;
}) {
  const NAMES: Record<PhaseId, string> = {
    proposito: "Propósito", exploracion: "Exploración", investigacion: "Investigación",
    diagnostico: "Diagnóstico", estrategia: "Diseño Estratégico", tactica: "Diseño Táctico",
    gerencia: "Gerencia", seguimiento: "Seguimiento", evaluacion: "Evaluación",
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
            <h2 className="font-bold text-black-eske">Cambios con impacto en fases posteriores</h2>
            <p className="text-sm text-black-eske-10 mt-1">Los cambios en la Exploración pueden afectar las decisiones tomadas en las siguientes fases:</p>
          </div>
        </div>
        <ul className="space-y-2 mb-5">
          {affectedPhases.map((id) => (
            <li key={id} className="flex items-center gap-2 text-sm text-black-eske-10 bg-orange-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {NAMES[id]}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-eske-50 mb-5 leading-relaxed">
          Moddulo ha guardado los cambios. Revisa el trabajo de cada fase afectada para asegurarte de que las decisiones sigan siendo consistentes con el nuevo análisis.
        </p>
        <button onClick={onDismiss}
          className="w-full py-2.5 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors">
          Entendido — revisar las fases afectadas
        </button>
      </div>
    </div>
  );
}

// ==========================================
// BOTÓN DE DESCARGA
// ==========================================

function DownloadButton({ form, reportText, chatMessages }: {
  form: ExplorationForm; reportText: string | null; chatMessages: ChatMessage[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dl = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const pestlText = [
    "ANÁLISIS PEST-L — FASE 2: EXPLORACIÓN",
    "======================================", "",
    "[ P ] POLÍTICO",
    `Contexto: ${form.pestl.politico.contexto || "(sin datos)"}`,
    `Actores clave: ${form.pestl.politico.actoresClave || "(sin datos)"}`,
    `Actores de veto: ${form.pestl.politico.actoresVeto || "(sin datos)"}`,
    `Señales críticas: ${form.pestl.politico.senalesCriticas || "(sin datos)"}`, "",
    "[ E ] ECONÓMICO", `Contexto: ${form.pestl.economico.contexto || "(sin datos)"}`,
    `Señales críticas: ${form.pestl.economico.senalesCriticas || "(sin datos)"}`, "",
    "[ S ] SOCIAL", `Contexto: ${form.pestl.social.contexto || "(sin datos)"}`,
    `Señales críticas: ${form.pestl.social.senalesCriticas || "(sin datos)"}`, "",
    "[ T ] TECNOLÓGICO", `Contexto: ${form.pestl.tecnologico.contexto || "(sin datos)"}`,
    `Señales críticas: ${form.pestl.tecnologico.senalesCriticas || "(sin datos)"}`, "",
    "[ L ] LEGAL", `Contexto: ${form.pestl.legal.contexto || "(sin datos)"}`,
    `Señales críticas: ${form.pestl.legal.senalesCriticas || "(sin datos)"}`, "",
    "SEMÁFORO DE VETO",
    ...(form.semaforo.actores.length
      ? form.semaforo.actores.map((a) => `  • ${a.nombre} [${a.nivel.toUpperCase()}]: ${a.descripcion}`)
      : ["  (Sin actores registrados)"]),
    `Síntesis: ${form.semaforo.resumen || "(sin datos)"}`, "",
    "HIPÓTESIS ESTRATÉGICA INICIAL",
    `Enunciado: ${form.hipotesis.enunciado || "(sin datos)"}`,
    `Premisas: ${form.hipotesis.premisas || "(sin datos)"}`,
    `Implicaciones: ${form.hipotesis.implicaciones || "(sin datos)"}`,
  ].join("\n");

  const options = [
    { label: "Resultado exploratorio (.md)", available: !!reportText, action: () => reportText && dl(reportText, "F2-Exploracion-Resultado.md") },
    { label: "Historial del chat (.txt)", available: chatMessages.length > 0, action: () => {
      dl(chatMessages.map((m) => `[${m.role === "assistant" ? "Moddulo" : "Consultor"}]\n${m.content}`).join("\n\n---\n\n"), "F2-Exploracion-Chat.txt");
    }},
    { label: "Análisis PEST-L (.txt)", available: !!(form.pestl.politico.contexto || form.hipotesis.enunciado), action: () => dl(pestlText, "F2-Exploracion-PESTL.txt") },
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} title="Descargar archivos de esta fase"
        className="p-1.5 rounded-lg border border-gray-eske-20 text-black-eske-10 hover:border-bluegreen-eske hover:text-bluegreen-eske transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-white-eske border border-gray-eske-20 rounded-xl shadow-lg z-20 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-eske-20 bg-gray-eske-10/50">
            <p className="text-xs font-bold text-black-eske uppercase tracking-widest">Descargar</p>
          </div>
          {options.map(({ label, available, action }) => (
            <button key={label} onClick={() => available && action()} disabled={!available}
              className={`w-full text-left px-3 py-2.5 text-xs font-medium flex items-center gap-2 transition-colors ${
                available ? "text-black-eske hover:bg-bluegreen-eske/5 hover:text-bluegreen-eske" : "text-gray-eske-40 cursor-not-allowed"
              }`}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {label}
              {!available && <span className="ml-auto text-gray-eske-40">(sin datos)</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================

function isF2FormComplete(form: ExplorationForm): boolean {
  return (["politico", "economico", "social", "tecnologico", "legal"] as const)
    .every((dim) => form.pestl[dim].contexto.trim().length > 0) &&
    form.hipotesis.enunciado.trim().length > 0;
}

function isSectionFilled(form: ExplorationForm, section: PestlSection): boolean {
  if (section === "hipotesis") return form.hipotesis.enunciado.trim().length > 0;
  if (section === "semaforo") return form.semaforo.actores.length > 0 || form.semaforo.resumen.trim().length > 0;
  return form.pestl[section as keyof ExplorationForm["pestl"]].contexto.trim().length > 0;
}

function mergePhaseData(base: ExplorationForm, data: Record<string, unknown>): ExplorationForm {
  const merged = structuredClone(base);
  if (data.pestl && typeof data.pestl === "object") {
    const pestl = data.pestl as Record<string, unknown>;
    for (const dim of ["politico", "economico", "social", "tecnologico", "legal"] as const) {
      if (pestl[dim] && typeof pestl[dim] === "object") Object.assign(merged.pestl[dim], pestl[dim]);
    }
  }
  if (data.semaforo && typeof data.semaforo === "object") Object.assign(merged.semaforo, data.semaforo);
  if (data.hipotesis && typeof data.hipotesis === "object") Object.assign(merged.hipotesis, data.hipotesis);
  return merged;
}

async function checkBackPropagation(projectId: string): Promise<PhaseId[]> {
  try {
    const r = await fetch(`/api/moddulo/projects/${projectId}`, { credentials: "include" });
    if (!r.ok) return [];
    const data = await r.json();
    const phases = data.project?.phases ?? {};
    const idx = PHASE_ORDER.indexOf("exploracion");
    return PHASE_ORDER.slice(idx + 1).filter((id) => {
      const s = phases[id]?.status;
      return s === "in-progress" || s === "completed";
    }) as PhaseId[];
  } catch { return []; }
}
