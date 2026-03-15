// app/moddulo/proyecto/[projectId]/proposito/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ModduloChat from "@/app/moddulo/components/ModduloChat";
import PhaseTransitionReview from "@/app/moddulo/components/PhaseTransitionReview";
import { detectRisks } from "@/lib/moddulo/risks";
import type { XPCTO, ProjectType } from "@/types/moddulo.types";

// ==========================================
// TIPO LOCAL PARA EL FORMULARIO
// ==========================================

type XPCTOForm = {
  hito: string;
  sujeto: string;
  capacidades: { financiero: string; humano: string; logistico: string };
  tiempo: { fechaLimite: string; duracionMeses: number };
  justificacion: string;
};

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
  const [projectType, setProjectType] = useState<ProjectType>("electoral");
  const [isSaving, setIsSaving] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isClosingPhase, setIsClosingPhase] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  // Flag que impide que auto-save corra antes de que los datos se carguen
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar datos del proyecto al montar — fuente de verdad: project.xpcto
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
        if (!data) return;
        console.log("[proposito] xpcto desde API:", JSON.stringify(data.project?.xpcto));
        if (data.project) {
          setProjectType(data.project.type ?? "electoral");
          const xpcto = data.project.xpcto;
          // Poblar el form con cualquier dato disponible (string no vacío = tiene dato)
          if (xpcto) {
            setForm({
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
            });
          }
        }
      })
      .catch((err) => console.error("[proposito] fetch error:", err))
      .finally(() => setIsLoaded(true));
  }, [projectId]);

  // Auto-calcular duracionMeses cuando cambia fechaLimite
  useEffect(() => {
    if (!form.tiempo.fechaLimite) return;
    const limite = new Date(form.tiempo.fechaLimite);
    const hoy = new Date();
    const meses = Math.max(0, Math.round((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    setForm((prev) => ({ ...prev, tiempo: { ...prev.tiempo, duracionMeses: meses } }));
  }, [form.tiempo.fechaLimite]);

  // Auto-guardar cuando el formulario cambia (debounced)
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
    // No auto-guardar hasta que los datos iniciales hayan cargado
    if (!isLoaded) return;
    const timer = setTimeout(() => autoSave(form), 1500);
    return () => clearTimeout(timer);
  }, [form, autoSave, isLoaded]);

  // Recibir datos extraídos por Moddulo del chat
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

  // Cerrar fase y avanzar a F2
  const handleClosePhase = async () => {
    setIsClosingPhase(true);
    try {
      await fetch(`/api/moddulo/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPhase: "exploracion" }),
      });
      router.push(`/moddulo/proyecto/${projectId}/exploracion`);
    } catch {
      setIsClosingPhase(false);
    }
  };

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

  const risks = detectRisks(
    {
      hito: form.hito,
      sujeto: form.sujeto,
      capacidades: form.capacidades,
      tiempo: form.tiempo,
      justificacion: form.justificacion,
    },
    projectType
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Phase header */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-eske-20 bg-white-eske flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-bluegreen-eske">Fase 1</span>
          <h1 className="text-lg font-bold text-gray-eske-80 mt-0.5">Propósito</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Estado de guardado */}
          <span className="text-xs text-gray-eske-40">
            {isSaving ? "Guardando..." : lastSaved ? `Guardado ${lastSaved.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}` : ""}
          </span>
          <button
            onClick={() => setShowReview(true)}
            className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90 transition-colors"
          >
            Cerrar Fase 1
          </button>
        </div>
      </div>

      {/* Layout split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat — columna izquierda */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden min-w-0">
          <ModduloChat
            phaseId="proposito"
            projectId={projectId}
            currentFormData={currentFormData}
            onDataExtracted={handleDataExtracted}
            className="flex-1 overflow-hidden"
          />
        </div>

        {/* Formulario XPCTO — columna derecha */}
        <div className="w-80 xl:w-96 shrink-0 border-l border-gray-eske-20 overflow-y-auto bg-gray-eske-10/50 p-4">
          <XPCTOForm form={form} onChange={setForm} risks={risks} />
        </div>
      </div>

      {/* Modal de revisión de cierre */}
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
    </div>
  );
}

// ==========================================
// FORMULARIO XPCTO
// ==========================================

function XPCTOForm({
  form,
  onChange,
  risks,
}: {
  form: XPCTOForm;
  onChange: (f: XPCTOForm) => void;
  risks: ReturnType<typeof detectRisks>;
}) {
  const risksByField = risks.reduce<Record<string, (typeof risks)[0]>>(
    (acc, r) => ({ ...acc, [r.field]: r }),
    {}
  );

  const fieldClass = (field: string) =>
    `w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-bluegreen-eske/30 focus:border-bluegreen-eske text-gray-eske-80 bg-white-eske ${
      risksByField[field]
        ? risksByField[field].level === "critical"
          ? "border-red-300"
          : "border-yellow-300"
        : "border-gray-eske-20"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-eske-50">
          Variables XPCTO
        </h2>
        <span className="text-xs text-gray-eske-40">Auto-rellena via chat</span>
      </div>

      {/* X — Hito */}
      <FormField
        label="Hito (X)"
        hint="El resultado concreto e inamovible"
        risk={risksByField["xpcto.hito"]}
      >
        <textarea
          value={form.hito}
          onChange={(e) => onChange({ ...form, hito: e.target.value })}
          placeholder="¿Qué resultado específico y medible buscas lograr?"
          rows={3}
          className={fieldClass("xpcto.hito") + " resize-none"}
        />
      </FormField>

      {/* P — Sujeto */}
      <FormField label="Sujeto (P)" hint="El actor político del proyecto">
        <textarea
          value={form.sujeto}
          onChange={(e) => onChange({ ...form, sujeto: e.target.value })}
          placeholder="Nombre, cargo al que aspira, perfil general..."
          rows={2}
          className={fieldClass("xpcto.sujeto") + " resize-none"}
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
        <input
          type="text"
          value={form.capacidades.financiero}
          onChange={(e) => onChange({ ...form, capacidades: { ...form.capacidades, financiero: e.target.value } })}
          placeholder="Financiero — presupuesto disponible"
          className={fieldClass("xpcto.capacidades.financiero")}
        />
        <input
          type="text"
          value={form.capacidades.humano}
          onChange={(e) => onChange({ ...form, capacidades: { ...form.capacidades, humano: e.target.value } })}
          placeholder="Humano — equipo y estructura"
          className={fieldClass("xpcto.capacidades.humano")}
        />
        <input
          type="text"
          value={form.capacidades.logistico}
          onChange={(e) => onChange({ ...form, capacidades: { ...form.capacidades, logistico: e.target.value } })}
          placeholder="Logístico — infraestructura y medios"
          className={fieldClass("xpcto.capacidades.logistico")}
        />
      </div>

      {/* T — Tiempo */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-eske-60">
          Tiempo (T)
          {risksByField["xpcto.tiempo"] && (
            <RiskBadge level={risksByField["xpcto.tiempo"].level} />
          )}
        </p>
        <div>
          <label className="text-xs text-gray-eske-40 mb-1 block">Fecha límite inamovible</label>
          <input
            type="date"
            value={form.tiempo.fechaLimite}
            onChange={(e) => onChange({ ...form, tiempo: { ...form.tiempo, fechaLimite: e.target.value } })}
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
      <FormField
        label="Justificación (O)"
        hint="El propósito ético que legitima el proyecto"
        risk={risksByField["xpcto.justificacion"]}
      >
        <textarea
          value={form.justificacion}
          onChange={(e) => onChange({ ...form, justificacion: e.target.value })}
          placeholder="¿Por qué este proyecto merece existir más allá de ganar o perder?"
          rows={3}
          className={fieldClass("xpcto.justificacion") + " resize-none"}
        />
      </FormField>
    </div>
  );
}

function FormField({
  label,
  hint,
  risk,
  children,
}: {
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
