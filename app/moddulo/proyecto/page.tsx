// app/moddulo/proyecto/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { listUserProjects, archiveProject, restoreProject, deleteProject } from '@/lib/strategy-context';
import {
  CAMPAIGN_TYPE_LABELS,
  PHASE_METADATA,
  LAYER_METADATA,
  PHASE_TO_LAYER,
  type ProjectSummary,
  type ProjectStatus,
} from '@/types/strategy-context.types';

// ============================================================
// TIPOS LOCALES
// ============================================================

type FilterStatus = 'all' | 'active' | 'completed' | 'archived';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ProyectosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ============================================================
  // CARGAR PROYECTOS
  // ============================================================

  useEffect(() => {
    async function loadProjects() {
      if (!user?.uid) return;

      setLoading(true);
      setError(null);

      try {
        const userProjects = await listUserProjects(user.uid, {
          includeArchived: true,
        });
        setProjects(userProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Error al cargar los proyectos. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }

    if (user?.uid) {
      loadProjects();
    }
  }, [user?.uid]);

  // ============================================================
  // FILTRAR PROYECTOS
  // ============================================================

  const filteredProjects = projects.filter((project) => {
    switch (filter) {
      case 'active':
        return project.status === 'active' || project.status === 'paused';
      case 'completed':
        return project.status === 'completed';
      case 'archived':
        return project.status === 'archived';
      default:
        return project.status !== 'archived';
    }
  });

  // ============================================================
  // ACCIONES
  // ============================================================

  const handleArchive = async (projectId: string) => {
    if (!confirm('¿Estás seguro de archivar este proyecto?')) return;

    setActionLoading(projectId);
    try {
      await archiveProject(projectId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: 'archived' as ProjectStatus } : p))
      );
    } catch (err) {
      console.error('Error archiving project:', err);
      alert('Error al archivar el proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (projectId: string) => {
    setActionLoading(projectId);
    try {
      await restoreProject(projectId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: 'active' as ProjectStatus } : p))
      );
    } catch (err) {
      console.error('Error restoring project:', err);
      alert('Error al restaurar el proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('¿Estás seguro de eliminar permanentemente este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading(projectId);
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Error al eliminar el proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // ESTADOS DE CARGA Y AUTENTICACIÓN
  // ============================================================

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bluegreen-eske border-t-transparent" />
          <p className="mt-4 text-gray-eske-70">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-eske-10 p-4">
        <div className="max-w-md w-full bg-white-eske rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-bluegreen-eske/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-bluegreen-eske" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-bluegreen-eske mb-4">
            Inicia sesión para continuar
          </h1>
          <p className="text-gray-eske-70 mb-6">
            Necesitas una cuenta para ver tus proyectos estratégicos.
          </p>
          <Link
            href="/login"
            className="inline-block bg-bluegreen-eske text-white-eske px-6 py-3 rounded-lg font-medium hover:bg-bluegreen-eske/90 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-eske-10">
      {/* Header */}
      <header className="bg-bluegreen-eske text-white-eske py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/moddulo"
            className="text-sm text-white-eske/70 hover:text-white-eske mb-2 inline-flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Moddulo
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Mis Proyectos Estratégicos</h1>
              <p className="text-white-eske/80 mt-1">
                {projects.length} proyecto{projects.length !== 1 ? 's' : ''} en total
              </p>
            </div>
            <Link
              href="/moddulo/onboarding"
              className="inline-flex items-center gap-2 bg-white-eske text-bluegreen-eske px-5 py-2.5 rounded-lg font-medium hover:bg-white-eske/90 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proyecto
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white-eske border-b border-gray-eske-20 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Activos', count: projects.filter((p) => p.status !== 'archived').length },
              { id: 'active', label: 'En progreso', count: projects.filter((p) => p.status === 'active' || p.status === 'paused').length },
              { id: 'completed', label: 'Completados', count: projects.filter((p) => p.status === 'completed').length },
              { id: 'archived', label: 'Archivados', count: projects.filter((p) => p.status === 'archived').length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as FilterStatus)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${filter === item.id
                    ? 'bg-bluegreen-eske text-white-eske'
                    : 'bg-gray-eske-10 text-gray-eske-70 hover:bg-gray-eske-20'
                  }
                `}
              >
                {item.label}
                <span className={`ml-1.5 ${filter === item.id ? 'text-white-eske/80' : 'text-gray-eske-50'}`}>
                  ({item.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-bluegreen-eske border-t-transparent" />
              <p className="mt-4 text-gray-eske-70">Cargando proyectos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Reintentar
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onDelete={handleDelete}
                isLoading={actionLoading === project.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ filter }: { filter: FilterStatus }) {
  const messages: Record<FilterStatus, { title: string; description: string }> = {
    all: {
      title: 'No tienes proyectos activos',
      description: 'Crea tu primer proyecto estratégico para comenzar.',
    },
    active: {
      title: 'No hay proyectos en progreso',
      description: 'Los proyectos que estés trabajando aparecerán aquí.',
    },
    completed: {
      title: 'No hay proyectos completados',
      description: 'Los proyectos que completes aparecerán aquí.',
    },
    archived: {
      title: 'No hay proyectos archivados',
      description: 'Los proyectos que archives aparecerán aquí.',
    },
  };

  const { title, description } = messages[filter];

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gray-eske-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-gray-eske-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-eske-80 mb-2">{title}</h3>
      <p className="text-gray-eske-60 mb-6">{description}</p>
      {filter === 'all' && (
        <Link
          href="/moddulo/onboarding"
          className="inline-flex items-center gap-2 bg-bluegreen-eske text-white-eske px-5 py-2.5 rounded-lg font-medium hover:bg-bluegreen-eske/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Primer Proyecto
        </Link>
      )}
    </div>
  );
}

// ============================================================
// PROJECT CARD
// ============================================================

interface ProjectCardProps {
  project: ProjectSummary;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

function ProjectCard({ project, onArchive, onRestore, onDelete, isLoading }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const currentPhase = PHASE_METADATA[project.currentPhase];
  const currentLayer = LAYER_METADATA[PHASE_TO_LAYER[project.currentPhase]];

  const statusConfig: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
    draft: { label: 'Borrador', color: 'text-gray-eske-70', bgColor: 'bg-gray-eske-20' },
    active: { label: 'En progreso', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    paused: { label: 'Pausado', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    completed: { label: 'Completado', color: 'text-green-700', bgColor: 'bg-green-100' },
    archived: { label: 'Archivado', color: 'text-gray-eske-60', bgColor: 'bg-gray-eske-20' },
  };

  const status = statusConfig[project.status];

  const formatDate = (timestamp: { seconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const projectUrl = `/moddulo/proyecto/${project.id}/${PHASE_TO_LAYER[project.currentPhase]}/${project.currentPhase}`;

  return (
    <div className="bg-white-eske rounded-lg shadow-sm border border-gray-eske-20 overflow-hidden hover:shadow-md transition-shadow">
      {/* Color bar */}
      <div className="h-1.5" style={{ backgroundColor: currentLayer.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-bluegreen-eske truncate">{project.projectName}</h3>
            <p className="text-xs text-gray-eske-60 mt-0.5">
              {CAMPAIGN_TYPE_LABELS[project.campaignType]}
            </p>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-gray-eske-10 text-gray-eske-50 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              )}
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white-eske rounded-lg shadow-lg border border-gray-eske-20 py-1 z-20">
                  {project.status === 'archived' ? (
                    <>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onRestore(project.id);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-eske-70 hover:bg-gray-eske-10 transition-colors"
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(project.id);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onArchive(project.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-eske-70 hover:bg-gray-eske-10 transition-colors"
                    >
                      Archivar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
            {status.label}
          </span>
          <span className="text-xs text-gray-eske-50">
            {project.jurisdiction.countryName}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-eske-60">Progreso</span>
            <span className="font-medium text-bluegreen-eske">{project.completionPercentage}%</span>
          </div>
          <div className="h-2 bg-gray-eske-10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${project.completionPercentage}%`,
                backgroundColor: currentLayer.color,
              }}
            />
          </div>
        </div>

        {/* Current phase */}
        <div className="flex items-center gap-2 mb-4 p-2.5 bg-gray-eske-10 rounded-lg">
          <span className="text-lg">{currentPhase.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-eske-50">Fase actual</p>
            <p className="text-sm font-medium text-gray-eske-80 truncate">
              {currentPhase.name}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-eske-10">
          <span className="text-xs text-gray-eske-50">
            Actualizado {formatDate(project.updatedAt as unknown as { seconds: number })}
          </span>

          {project.status !== 'archived' && (
            <Link
              href={projectUrl}
              className="text-sm font-medium text-bluegreen-eske hover:text-bluegreen-eske/80 transition-colors inline-flex items-center gap-1"
            >
              Continuar
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
