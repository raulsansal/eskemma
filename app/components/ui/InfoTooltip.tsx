"use client";

// app/components/ui/InfoTooltip.tsx
// Reusable contextual help tooltip triggered by an ℹ icon button.
// Shows a brief description + optional example on click.
// Closes on Escape, outside click, or second click on the trigger.

import { useEffect, useRef, useState } from "react";

export interface InfoTooltipProps {
  /** Main explanation of what the field/action does and why it matters */
  content: string;
  /** Optional short example to illustrate (shown after content) */
  example?: string;
  /** Additional CSS classes for the trigger button */
  className?: string;
  /**
   * Where the tooltip panel opens relative to the trigger button.
   * "right" (default) opens to the right — use for left-aligned controls.
   * "left" opens to the left — use for right-aligned controls near the edge.
   */
  placement?: "right" | "left";
}

export default function InfoTooltip({
  content,
  example,
  className = "",
  placement = "right",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleMousedown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMousedown);
    return () => document.removeEventListener("mousedown", handleMousedown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [open]);

  const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <span ref={containerRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={tooltipId}
        aria-label="Más información"
        className={[
          "inline-flex items-center justify-center",
          "w-4 h-4 rounded-full text-[10px] font-bold leading-none",
          "bg-bluegreen-eske/10 text-bluegreen-eske",
          "hover:bg-bluegreen-eske/20 transition-colors",
          "focus:outline-none focus-visible:ring-2",
          "focus-visible:ring-bluegreen-eske focus-visible:ring-offset-1",
          "cursor-pointer shrink-0",
        ].join(" ")}
      >
        i
      </button>

      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            "absolute z-50",
            placement === "left" ? "right-5 top-0" : "left-5 top-0",
            "w-64 sm:w-72",
            "bg-white-eske dark:bg-[#18324A] border border-gray-eske-20 dark:border-white/10 rounded-lg shadow-lg",
            "p-3 flex flex-col gap-1.5",
            "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95",
            "motion-safe:duration-100",
          ].join(" ")}
        >
          <p className="text-xs text-black-eske dark:text-[#C7D6E0] leading-relaxed">{content}</p>
          {example && (
            <p className="text-xs text-gray-eske-60 dark:text-[#6D8294] italic border-t border-gray-eske-10 dark:border-white/10 pt-1.5">
              <span className="not-italic font-medium text-gray-eske-70 dark:text-[#9AAEBE]">
                Ej:{" "}
              </span>
              {example}
            </p>
          )}
        </span>
      )}
    </span>
  );
}
