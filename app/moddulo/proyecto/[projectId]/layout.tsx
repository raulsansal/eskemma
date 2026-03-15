// app/moddulo/proyecto/[projectId]/layout.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PhaseNav from "@/app/moddulo/components/PhaseNav";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-eske-60">Proyecto no especificado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-eske-10 flex flex-col">
      {/* Top Header */}
      <header className="bg-bluegreen-eske text-white-eske py-3 px-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white-eske/10 transition-colors"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Back link */}
            <Link
              href="/moddulo/proyecto"
              className="text-sm text-white-eske/70 hover:text-white-eske inline-flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Mis Proyectos</span>
            </Link>

            <span className="text-white-eske/50">/</span>
            <span className="font-medium text-sm">Moddulo</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-white-eske/10 transition-colors text-white-eske/80 hover:text-white-eske"
              title="Exportar proyecto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <PhaseNav projectId={projectId} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black-eske/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-64 max-w-[85vw] bg-white-eske shadow-xl">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-eske-10 text-gray-eske-60 z-10"
                aria-label="Cerrar menú"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <PhaseNav projectId={projectId} />
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
