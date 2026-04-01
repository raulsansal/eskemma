"use client";

// app/components/monitor/centinela/interpretacion/AdjustmentModal.tsx
// Modal that appears when the analyst repositions a dimension on the matrix.
// Requires a justification (min 20 chars) and optionally a new classification.
// Uses useFocusTrap and useEscapeKey for accessibility.

import { useState, type RefObject } from "react";
import { useFocusTrap } from "@/app/hooks/useFocusTrap";
import { useEscapeKey } from "@/app/hooks/useEscapeKey";
import type { Classification, DimensionCode } from "@/types/centinela.types";

const DIMENSION_LABELS: Record<DimensionCode, string> = {
  P: "Político",
  E: "Económico",
  S: "Social",
  T: "Tecnológico",
  L: "Legal / Ambiental",
};

const CLASSIFICATION_LABELS: Record<Classification, string> = {
  OPORTUNIDAD: "Oportunidad",
  AMENAZA: "Amenaza",
  NEUTRAL: "Neutral",
};

interface Props {
  dimensionCode: DimensionCode;
  currentClassification: Classification;
  saving: boolean;
  onSave: (justification: string, newClassification: Classification) => void;
  onCancel: () => void;
}

export default function AdjustmentModal({
  dimensionCode,
  currentClassification,
  saving,
  onSave,
  onCancel,
}: Props) {
  const [justification, setJustification] = useState("");
  const [classification, setClassification] =
    useState<Classification>(currentClassification);

  const containerRef = useFocusTrap(true);
  useEscapeKey(true, onCancel);

  const charCount = justification.trim().length;
  const canSave = charCount >= 20 && !saving;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adj-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black-eske/40 motion-safe:animate-in
          motion-safe:fade-in motion-safe:duration-150"
        aria-hidden="true"
        onClick={onCancel}
      />

      {/* Panel */}
      <div
        ref={containerRef as RefObject<HTMLDivElement>}
        className="relative z-10 bg-white-eske rounded-xl shadow-lg
          border border-gray-eske-20 w-full max-w-md p-6 flex flex-col gap-4
          motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-150"
      >
        <div>
          <h2
            id="adj-modal-title"
            className="text-base font-semibold text-black-eske"
          >
            Justificar ajuste —{" "}
            <span className="text-bluegreen-eske">
              {DIMENSION_LABELS[dimensionCode]}
            </span>
          </h2>
          <p className="text-xs text-black-eske mt-0.5">
            Explica por qué reposicionas este factor. Mínimo 20 caracteres.
          </p>
        </div>

        {/* Justification textarea */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="adj-justification"
            className="text-sm font-medium text-black-eske"
          >
            Justificación
          </label>
          <textarea
            id="adj-justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="ej. Datos de campo revelan que este factor tiene mayor probabilidad de ocurrencia que lo estimado por las fuentes digitales…"
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-eske-30 rounded-lg
              text-sm focus:outline-none focus-visible:ring-2
              focus-visible:ring-bluegreen-eske placeholder:text-gray-eske-50
              resize-none"
            autoFocus
          />
          <p
            className={[
              "text-xs text-right",
              charCount >= 20 ? "text-green-eske" : "text-gray-eske-50",
            ].join(" ")}
            aria-live="polite"
          >
            {charCount} / 20 caracteres mínimos
          </p>
        </div>

        {/* Optional classification change */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="adj-classification"
            className="text-sm font-medium text-black-eske"
          >
            Clasificación{" "}
            <span className="text-black-eske font-normal">(opcional)</span>
          </label>
          <select
            id="adj-classification"
            value={classification}
            onChange={(e) =>
              setClassification(e.target.value as Classification)
            }
            className="px-3 py-2 border border-gray-eske-30 rounded-lg text-sm
              focus:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske
              bg-white-eske"
          >
            {(["OPORTUNIDAD", "AMENAZA", "NEUTRAL"] as Classification[]).map(
              (c) => (
                <option key={c} value={c}>
                  {CLASSIFICATION_LABELS[c]}
                </option>
              )
            )}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 border border-gray-eske-30 text-black-eske
              rounded-lg text-sm font-medium hover:bg-gray-eske-10
              transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(justification.trim(), classification)}
            disabled={!canSave}
            className="px-5 py-2 bg-bluegreen-eske text-white rounded-lg
              text-sm font-medium hover:bg-bluegreen-eske-60 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando…" : "Guardar ajuste"}
          </button>
        </div>
      </div>
    </div>
  );
}
