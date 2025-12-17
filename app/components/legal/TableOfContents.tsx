// app/components/legal/TableOfContents.tsx
"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Estructura de cada item del índice
 */
export interface TocItem {
  id: string; // ID de la sección (ej: "datos-recopilados")
  title: string; // Título de la sección (ej: "2. ¿Qué Datos Recopilamos?")
  level?: 1 | 2; // Nivel de anidación (1 = principal, 2 = subsección)
}

interface TableOfContentsProps {
  items: TocItem[]; // Lista de secciones
  title?: string; // Título del TOC (default: "Índice")
  className?: string; // Clases adicionales
  mobileCollapsible?: boolean; // Si es colapsable en mobile (default: true)
}

export default function TableOfContents({
  items,
  title = "Índice",
  className = "",
  mobileCollapsible = true,
}: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * Detectar cuando el componente se ha montado en el cliente
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * IntersectionObserver para detectar la sección activa
   * Solo se ejecuta en el cliente después de que el componente se monta
   */
  useEffect(() => {
    // Solo ejecutar en el cliente después del montaje
    if (!isMounted) return;

    // Limpiar observer anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Crear nuevo observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Buscar la primera sección visible con mayor intersección
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries[0];
          setActiveSection(topEntry.target.id);
        }
      },
      {
        // Configuración del observer
        rootMargin: "-100px 0px -66%", // Detecta cuando la sección está cerca del top
        threshold: [0, 0.25, 0.5, 0.75, 1], // Múltiples umbrales para mejor detección
      }
    );

    // Observar todas las secciones
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    observerRef.current = observer;

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [items, isMounted]);

  /**
   * Handler para scroll suave al hacer click
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    const element = document.getElementById(id);
    if (element) {
      // Scroll suave con offset para compensar header
      const yOffset = -80; // Ajustar según altura del header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });

      // Actualizar URL sin reload
      window.history.pushState(null, "", `#${id}`);

      // Cerrar mobile menu si está abierto
      if (mobileCollapsible) {
        setIsMobileOpen(false);
      }
    }
  };

  /**
   * Toggle mobile menu
   */
  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  return (
    <>
      {/* VERSIÓN MOBILE - Colapsable */}
      <div className={`lg:hidden mb-8 ${className}`} suppressHydrationWarning>
        <button
          onClick={toggleMobileMenu}
          className="w-full flex items-center justify-between bg-bluegreen-eske-10 p-4 rounded-lg border-2 border-bluegreen-eske hover:bg-bluegreen-eske-20 transition-colors duration-300 focus-ring-primary"
          suppressHydrationWarning
          aria-expanded={isMobileOpen}
          aria-controls="toc-mobile-menu"
          aria-label={`Tabla de contenidos: ${title}`}
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-bluegreen-eske"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="text-[16px] font-bold text-bluegreen-eske">
              {title}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-bluegreen-eske transform transition-transform duration-300 ${
              isMobileOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Mobile Menu Dropdown */}
        {isMobileOpen && (
          <nav 
            id="toc-mobile-menu"
            className="mt-2 bg-white-eske border-2 border-bluegreen-eske rounded-lg p-4 shadow-lg animate-slide-down"
            aria-label="Tabla de contenidos"
          >
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
                    aria-current={activeSection === item.id ? "location" : undefined}
                    className={`
                      block px-3 py-2 rounded-lg text-[14px] transition-all duration-300 focus-ring-primary
                      ${item.level === 2 ? "pl-6" : ""}
                      ${
                        activeSection === item.id
                          ? "bg-bluegreen-eske text-white-eske font-semibold"
                          : "text-black-eske hover:bg-bluegreen-eske-10 hover:text-bluegreen-eske"
                      }
                    `}
                  >
                    {activeSection === item.id && (
                      <span className="sr-only">(sección actual) </span>
                    )}
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* VERSIÓN DESKTOP - Sticky Sidebar */}
      <aside
        className={`hidden lg:block sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto ${className}`}
        suppressHydrationWarning
        aria-label="Tabla de contenidos"
      >
        <nav className="bg-white-eske border-2 border-bluegreen-eske-20 rounded-lg p-6 shadow-md">
          {/* Título */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-bluegreen-eske-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-bluegreen-eske"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <h2 className="text-[18px] font-bold text-bluegreen-eske">
              {title}
            </h2>
          </div>

          {/* Lista de secciones */}
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  aria-current={activeSection === item.id ? "location" : undefined}
                  className={`
                    group block px-3 py-2 rounded-lg text-[14px] transition-all duration-300 relative focus-ring-primary
                    ${item.level === 2 ? "pl-6 text-[13px]" : ""}
                    ${
                      activeSection === item.id
                        ? "bg-bluegreen-eske text-white-eske font-semibold shadow-md"
                        : "text-black-eske hover:bg-bluegreen-eske-10 hover:text-bluegreen-eske hover:pl-4"
                    }
                  `}
                >
                  {/* Indicador de sección activa */}
                  {activeSection === item.id && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white-eske rounded-r-full" aria-hidden="true"></span>
                  )}

                  {/* Título de la sección */}
                  <span className="relative z-10">
                    {activeSection === item.id && (
                      <span className="sr-only">(sección actual) </span>
                    )}
                    {item.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* Nota informativa */}
          <div className="mt-6 pt-4 border-t border-bluegreen-eske-20">
            <p className="text-[12px] text-black-eske-30 text-center">
              Click en cualquier sección para navegar
            </p>
          </div>
        </nav>
      </aside>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        /* Scrollbar personalizado para el TOC en desktop */
        aside::-webkit-scrollbar {
          width: 6px;
        }

        aside::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        aside::-webkit-scrollbar-thumb {
          background: var(--bluegreen-eske, #006064);
          border-radius: 10px;
        }

        aside::-webkit-scrollbar-thumb:hover {
          background: var(--bluegreen-eske-70, #00838f);
        }
      `}</style>
    </>
  );
}
