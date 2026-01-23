// app/moddulo/proyecto/[projectId]/layout.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  StrategyContextProvider,
  useStrategyContext,
} from "@/app/moddulo/components/StrategyContextProvider";
import PhaseSidebar from "@/app/moddulo/components/PhaseSidebar";

// ============================================================
// LAYOUT WRAPPER (con Provider)
// ============================================================

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = params?.projectId as string;

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10">
        <p className="text-gray-eske-70">Proyecto no especificado</p>
      </div>
    );
  }

  return (
    <StrategyContextProvider projectId={projectId}>
      <ProjectLayoutContent projectId={projectId}>
        {children}
      </ProjectLayoutContent>
    </StrategyContextProvider>
  );
}

// ============================================================
// LAYOUT CONTENT (dentro del Provider)
// ============================================================

interface ProjectLayoutContentProps {
  projectId: string;
  children: React.ReactNode;
}

function ProjectLayoutContent({
  projectId,
  children,
}: ProjectLayoutContentProps) {
  const { project, loading, error } = useStrategyContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bluegreen-eske border-t-transparent" />
          <p className="mt-4 text-gray-eske-70">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10 p-4">
        <div className="max-w-md w-full bg-white-eske rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-eske-80 mb-2">
            Error al cargar el proyecto
          </h1>
          <p className="text-gray-eske-60 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg font-medium hover:bg-bluegreen-eske/90 transition-colors"
            >
              Reintentar
            </button>
            <Link
              href="/moddulo/proyecto"
              className="px-5 py-2.5 bg-gray-eske-10 text-gray-eske-70 rounded-lg font-medium hover:bg-gray-eske-20 transition-colors"
            >
              Volver a proyectos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN LAYOUT
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-eske-10 flex flex-col">
      {/* Top Header */}
      <header className="bg-bluegreen-eske text-white-eske py-3 px-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white-eske/10 transition-colors"
              aria-label="Abrir menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Back link */}
            <Link
              href="/moddulo/proyecto"
              className="text-sm text-white-eske/70 hover:text-white-eske inline-flex items-center gap-1 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Mis Proyectos</span>
            </Link>

            {/* Project name */}
            {project && (
              <div className="flex items-center gap-2">
                <span className="text-white-eske/50">/</span>
                <span className="font-medium truncate max-w-50 sm:max-w-none">
                  {project.projectName}
                </span>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Export button (placeholder) */}
            <button
              className="p-2 rounded-lg hover:bg-white-eske/10 transition-colors text-white-eske/80 hover:text-white-eske"
              title="Exportar proyecto"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>

            {/* Settings button (placeholder) */}
            <button
              className="p-2 rounded-lg hover:bg-white-eske/10 transition-colors text-white-eske/80 hover:text-white-eske"
              title="Configuración del proyecto"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <PhaseSidebar
            projectId={projectId}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black-eske/50"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className="relative w-72 max-w-[85vw] bg-white-eske shadow-xl">
              {/* Close button */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-eske-10 text-gray-eske-60 transition-colors z-10"
                aria-label="Cerrar menú"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <PhaseSidebar projectId={projectId} />
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
