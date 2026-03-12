// app/taller/diagnostico-electoral/components/WorkshopHeader.tsx
// ============================================================
// HEADER DEL TALLER
// Muestra título, progreso y controles
// ============================================================

"use client";

import { useAuth } from "@/context/AuthContext";
import type { UserWorkshopProgress } from "@/types/firestore.types";

interface WorkshopHeaderProps {
  progress: UserWorkshopProgress | null;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function WorkshopHeader({ 
  progress, 
  onMenuClick, 
  isSidebarOpen 
}: WorkshopHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 z-20 bg-white-eske border-b border-gray-eske-20 h-16 flex items-center px-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {/* Botón menú (solo visible en móvil) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-eske-10 transition-colors focus-ring-primary"
            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isSidebarOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <h1 className="text-lg font-semibold text-bluegreen-eske hidden sm:block">
            Taller de Diagnóstico Electoral
          </h1>
        </div>

        {/* Información del usuario */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Progreso del día (si aplica) */}
            {progress && (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-eske-70">
                <span>Último acceso:</span>
                <span>
                  {progress.lastAccessedAt 
                    ? new Date(progress.lastAccessedAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Hoy'
                  }
                </span>
              </div>
            )}

            {/* Avatar o iniciales del usuario */}
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-bluegreen-eske text-white flex items-center justify-center text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="hidden md:inline text-sm font-medium">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}