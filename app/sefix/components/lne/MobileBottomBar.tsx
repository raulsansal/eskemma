"use client";

interface MobileBottomBarProps {
  leftOpen: boolean;
  rightOpen: boolean;
  onFiltros: () => void;
  onAnalisis: () => void;
}

export default function MobileBottomBar({
  leftOpen,
  rightOpen,
  onFiltros,
  onAnalisis,
}: MobileBottomBarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-14 z-50 bg-bluegreen-eske flex sm:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.22)] items-center px-3 gap-3"
      role="toolbar"
      aria-label="Navegación de paneles"
    >
      {/* Botón FILTROS */}
      <button
        type="button"
        onClick={onFiltros}
        aria-expanded={leftOpen}
        aria-label={leftOpen ? "Cerrar filtros" : "Abrir filtros de consulta"}
        className={[
          "flex-1 flex items-center justify-center rounded-xl py-1.5 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-eske focus-visible:ring-offset-1 focus-visible:ring-offset-bluegreen-eske",
          "active:scale-95 border",
          leftOpen
            ? "bg-white-eske/25 border-white-eske shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]"
            : "bg-white-eske/10 border-white-eske/40 hover:bg-white-eske/20 hover:border-white-eske/70",
        ].join(" ")}
      >
        <span className="flex flex-col items-center gap-0.5">
          <svg
            className="w-5 h-5 text-white-eske"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span className="text-[10px] font-bold tracking-wider text-white-eske leading-none">
            FILTROS
          </span>
        </span>
      </button>

      {/* Botón ANÁLISIS */}
      <button
        type="button"
        onClick={onAnalisis}
        aria-expanded={rightOpen}
        aria-label={rightOpen ? "Cerrar análisis textual" : "Abrir análisis textual"}
        className={[
          "flex-1 flex items-center justify-center rounded-xl py-1.5 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-eske focus-visible:ring-offset-1 focus-visible:ring-offset-bluegreen-eske",
          "active:scale-95 border",
          rightOpen
            ? "bg-white-eske/25 border-white-eske shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]"
            : "bg-white-eske/10 border-white-eske/40 hover:bg-white-eske/20 hover:border-white-eske/70",
        ].join(" ")}
      >
        <span className="flex flex-col items-center gap-0.5">
          <svg
            className="w-5 h-5 text-white-eske"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-[10px] font-bold tracking-wider text-white-eske leading-none">
            ANÁLISIS
          </span>
        </span>
      </button>
    </div>
  );
}
