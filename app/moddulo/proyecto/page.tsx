// app/moddulo/proyecto/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PHASE_NAMES,
  PROJECT_TYPE_LABELS,
} from "@/types/moddulo.types";
import type { ModduloProject } from "@/types/moddulo.types";

function ProjectCard({ project }: { project: ModduloProject }) {
  const statusColors = {
    draft: "bg-gray-eske-20 dark:bg-[#21425E] text-gray-eske-60 dark:text-[#9AAEBE]",
    active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    paused: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    completed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    archived: "bg-gray-eske-20 dark:bg-[#21425E] text-gray-eske-50 dark:text-[#6D8294]",
  };

  const statusLabels = {
    draft: "Borrador",
    active: "Activo",
    paused: "Pausado",
    completed: "Completado",
    archived: "Archivado",
  };

  return (
    <Link
      href={`/moddulo/proyecto/${project.id}/${project.currentPhase}`}
      className="block bg-white-eske dark:bg-[#18324A] rounded-xl border border-gray-eske-20 dark:border-white/10 p-5 hover:border-bluegreen-eske/40 dark:hover:border-white/20 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-eske-80 dark:text-[#EAF2F8] truncate">{project.name}</h3>
          {project.description && (
            <p className="text-xs text-gray-eske-50 dark:text-[#9AAEBE] mt-0.5 line-clamp-2">{project.description}</p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[project.status]}`}
        >
          {statusLabels[project.status]}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-eske-50 dark:text-[#9AAEBE]">
        <span className="font-medium text-bluegreen-eske/80">
          {PROJECT_TYPE_LABELS[project.type]}
        </span>
        <span>·</span>
        <span>Fase actual: {PHASE_NAMES[project.currentPhase]}</span>
      </div>
    </Link>
  );
}

export default function ProyectosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ModduloProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const loadProjects = async () => {
      try {
        const response = await fetch("/api/moddulo/projects", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects);
        } else {
          setError("Error al cargar proyectos");
        }
      } catch {
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-bluegreen-eske border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-eske-10 dark:bg-[#0B1620] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/moddulo"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-eske-50 dark:text-[#9AAEBE] hover:text-bluegreen-eske dark:hover:text-[#6BA4C6] transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Moddulo
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-eske-80 dark:text-[#EAF2F8]">Mis Proyectos</h1>
            <p className="text-gray-eske-60 dark:text-[#9AAEBE] mt-1 text-sm">
              {projects.length > 0
                ? `${projects.length} proyecto${projects.length !== 1 ? "s" : ""} activo${projects.length !== 1 ? "s" : ""}`
                : "Gestiona tus proyectos estratégicos"}
            </p>
          </div>
          <Link
            href="/moddulo/proyecto/nuevo"
            className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg font-medium hover:bg-bluegreen-eske/90 transition-colors text-sm"
          >
            + Nuevo proyecto
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-bluegreen-eske border-t-transparent" />
          </div>
        ) : error ? (
          <div className="bg-white-eske dark:bg-[#18324A] rounded-xl border border-red-200 dark:border-red-900/40 p-8 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-bluegreen-eske hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white-eske dark:bg-[#18324A] rounded-xl border border-gray-eske-20 dark:border-white/10 p-12 text-center">
            <div className="w-16 h-16 bg-bluegreen-eske/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-bluegreen-eske" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-eske-80 dark:text-[#EAF2F8] mb-2">
              No tienes proyectos aún
            </h2>
            <p className="text-gray-eske-50 dark:text-[#9AAEBE] mb-6 text-sm">
              Crea tu primer proyecto estratégico para comenzar con Moddulo
            </p>
            <Link
              href="/moddulo/proyecto/nuevo"
              className="px-6 py-3 bg-bluegreen-eske text-white-eske rounded-lg font-medium hover:bg-bluegreen-eske/90 transition-colors text-sm inline-block"
            >
              Crear primer proyecto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
