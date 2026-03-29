// app/components/monitor/centinela/informes/ReportViewer.tsx
// Displays streaming or static report Markdown content.
// Editable inline via contentEditable div.

"use client";

import { useEffect, useRef } from "react";

interface Props {
  content: string;
  streaming: boolean;
  onContentChange: (text: string) => void;
}

export default function ReportViewer({
  content,
  streaming,
  onContentChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external content changes (streaming) into the DOM.
  // Only update if not focused to avoid caret jumping while editing.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement !== el) {
      el.innerText = content;
    }
  }, [content]);

  function handleInput() {
    if (ref.current) {
      onContentChange(ref.current.innerText);
    }
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        contentEditable={!streaming}
        suppressContentEditableWarning
        onInput={handleInput}
        className={[
          "report-container",
          "min-h-[300px] w-full rounded-lg border border-gray-eske-20",
          "bg-white-eske p-5 text-sm text-black-eske leading-relaxed",
          "whitespace-pre-wrap font-sans outline-none",
          "focus-visible:ring-2 focus-visible:ring-bluegreen-eske/30",
          streaming ? "cursor-default" : "cursor-text",
        ].join(" ")}
        aria-label="Contenido del informe"
        aria-readonly={streaming}
      />
      {streaming && (
        <span
          className="absolute bottom-5 right-5 inline-block w-2 h-4
            bg-bluegreen-eske animate-pulse rounded-sm"
          aria-hidden="true"
        />
      )}
      {!streaming && content && (
        <p className="mt-1.5 text-xs text-gray-eske-50">
          Puedes editar el texto antes de exportar.
        </p>
      )}
    </div>
  );
}
