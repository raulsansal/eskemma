// app/moddulo/proyecto/[projectId]/operacion/orquesta/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { useStrategyContext, usePhaseData } from '@/app/moddulo/components/StrategyContextProvider';
import {
  PHASE_METADATA,
  LAYER_METADATA,
  type OrquestaData,
  type ExecutionProgram,
  type Activity,
  type ActivityMetric,
  type TeamMember,
} from '@/types/strategy-context.types';

// ============================================================
// CONSTANTES
// ============================================================

const PHASE = 'orquesta';
const LAYER = 'operacion';
const phaseInfo = PHASE_METADATA[PHASE];
const layerInfo = LAYER_METADATA[LAYER];

const PROGRAM_TYPES: Record<ExecutionProgram['type'], { label: string; color: string; icon: string; description: string }> = {
  tierra: { label: 'Tierra', color: 'bg-amber-100 text-amber-800', icon: '🏃', description: 'Actividades de campo y territorio' },
  aire: { label: 'Aire', color: 'bg-sky-100 text-sky-800', icon: '📺', description: 'Medios masivos y publicidad' },
  agua: { label: 'Agua', color: 'bg-blue-100 text-blue-800', icon: '💻', description: 'Digital y redes sociales' },
  principal: { label: 'Principal', color: 'bg-purple-100 text-purple-800', icon: '⭐', description: 'Programa principal de campaña' },
};

const PROGRAM_STATUS: Record<ExecutionProgram['status'], { label: string; color: string }> = {
  planning: { label: 'Planeando', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
};

const ACTIVITY_STATUS: Record<Activity['status'], { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-700' },
  'in-progress': { label: 'En progreso', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-700' },
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function OrquestaPage() {
  const { project, completePhase } = useStrategyContext();
  const { data, updateData, isDirty } = usePhaseData<OrquestaData>(PHASE);

  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'programas' | 'equipo' | 'integraciones'>('programas');

  // ============================================================
  // HANDLERS DE DATOS
  // ============================================================

  // Programas
  const addProgram = (program: ExecutionProgram) => {
    const current = data?.programs || [];
    updateData({ programs: [...current, program] });
  };

  const removeProgram = (index: number) => {
    const current = data?.programs || [];
    updateData({ programs: current.filter((_, i) => i !== index) });
  };

  const updateProgram = (index: number, updates: Partial<ExecutionProgram>) => {
    const current = data?.programs || [];
    const updated = current.map((p, i) => i === index ? { ...p, ...updates } : p);
    updateData({ programs: updated });
  };

  const addActivityToProgram = (programIndex: number, activity: Activity) => {
    const current = data?.programs || [];
    const updated = current.map((p, i) => {
      if (i !== programIndex) return p;
      return { ...p, activities: [...p.activities, activity] };
    });
    updateData({ programs: updated });
  };

  const removeActivityFromProgram = (programIndex: number, activityIndex: number) => {
    const current = data?.programs || [];
    const updated = current.map((p, i) => {
      if (i !== programIndex) return p;
      return { ...p, activities: p.activities.filter((_, ai) => ai !== activityIndex) };
    });
    updateData({ programs: updated });
  };

  const updateActivityInProgram = (programIndex: number, activityIndex: number, updates: Partial<Activity>) => {
    const current = data?.programs || [];
    const updated = current.map((p, i) => {
      if (i !== programIndex) return p;
      const activities = p.activities.map((a, ai) => ai === activityIndex ? { ...a, ...updates } : a);
      return { ...p, activities };
    });
    updateData({ programs: updated });
  };

  // Equipo
  const addTeamMember = (member: TeamMember) => {
    const current = data?.team || [];
    updateData({ team: [...current, member] });
  };

  const removeTeamMember = (index: number) => {
    const current = data?.team || [];
    updateData({ team: current.filter((_, i) => i !== index) });
  };

  const updateTeamMember = (index: number, updates: Partial<TeamMember>) => {
    const current = data?.team || [];
    const updated = current.map((m, i) => i === index ? { ...m, ...updates } : m);
    updateData({ team: updated });
  };

  // Integraciones
  const toggleIntegration = (integration: string) => {
    const current = data?.activeIntegrations || [];
    const updated = current.includes(integration)
      ? current.filter(i => i !== integration)
      : [...current, integration];
    updateData({ activeIntegrations: updated });
  };

  // ============================================================
  // COMPLETAR FASE
  // ============================================================

  const handleCompletePhase = async () => {
    if ((data?.programs?.length ?? 0) === 0) {
      alert('Por favor crea al menos un programa de ejecución.');
      setActiveTab('programas');
      return;
    }

    if ((data?.team?.length ?? 0) === 0) {
      alert('Por favor agrega al menos un miembro del equipo.');
      setActiveTab('equipo');
      return;
    }

    setIsCompleting(true);
    const result = await completePhase(PHASE);
    if (!result.success) alert(result.error || 'Error al completar la fase');
    setIsCompleting(false);
  };

  // ============================================================
  // CÁLCULO DE PROGRESO
  // ============================================================

  const calculateProgress = (): number => {
    if (!data) return 0;
    let completed = 0;
    const total = 3;

    if ((data.programs?.length ?? 0) > 0) completed++;
    if ((data.team?.length ?? 0) > 0) completed++;
    if ((data.activeIntegrations?.length ?? 0) > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();
  const isPhaseCompleted = project?.completedPhases.includes(PHASE);

  // Estadísticas
  const stats = useMemo(() => {
    const programs = data?.programs || [];
    const totalActivities = programs.reduce((acc, p) => acc + p.activities.length, 0);
    const completedActivities = programs.reduce((acc, p) => 
      acc + p.activities.filter(a => a.status === 'completed').length, 0);
    const activePrograms = programs.filter(p => p.status === 'active').length;

    return { totalActivities, completedActivities, activePrograms, totalPrograms: programs.length };
  }, [data?.programs]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-eske-60 mb-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: layerInfo.color }} />
          <span>{layerInfo.name}</span>
          <span>•</span>
          <span>Fase 7 de 9</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-bluegreen-eske flex items-center gap-3">
              <span className="text-3xl">{phaseInfo.icon}</span>
              {phaseInfo.name}
            </h1>
            <p className="text-gray-eske-70 mt-1">{phaseInfo.description}</p>
            <p className="text-sm text-gray-eske-50 mt-2 italic">Pregunta clave: {phaseInfo.question}</p>
          </div>
          {isPhaseCompleted && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium shrink-0">✓ Completada</span>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-eske-60">Progreso de la fase</span>
            <span className="font-medium" style={{ color: layerInfo.color }}>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-eske-10 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: layerInfo.color }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-bluegreen-eske">{stats.totalPrograms}</p>
          <p className="text-xs text-gray-eske-50">Programas</p>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.activePrograms}</p>
          <p className="text-xs text-gray-eske-50">Activos</p>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalActivities}</p>
          <p className="text-xs text-gray-eske-50">Actividades</p>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{data?.team?.length || 0}</p>
          <p className="text-xs text-gray-eske-50">Miembros</p>
        </div>
      </div>

      {/* Apps integradas */}
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-800">
          <strong>🔗 Apps disponibles:</strong> Usa <span className="font-semibold">Calendario</span> para programar actividades y <span className="font-semibold">Recluta</span> para gestionar voluntarios.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-eske-20 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            { id: 'programas', label: 'Programas', count: data?.programs?.length || 0 },
            { id: 'equipo', label: 'Equipo', count: data?.team?.length || 0 },
            { id: 'integraciones', label: 'Integraciones', count: data?.activeIntegrations?.length || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-bluegreen-eske text-bluegreen-eske'
                  : 'border-transparent text-gray-eske-60 hover:text-gray-eske-80'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-bluegreen-eske/20' : 'bg-gray-eske-20'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'programas' && (
          <TabProgramas
            programs={data?.programs || []}
            onAdd={addProgram}
            onRemove={removeProgram}
            onUpdate={updateProgram}
            onAddActivity={addActivityToProgram}
            onRemoveActivity={removeActivityFromProgram}
            onUpdateActivity={updateActivityInProgram}
          />
        )}
        {activeTab === 'equipo' && (
          <TabEquipo
            team={data?.team || []}
            onAdd={addTeamMember}
            onRemove={removeTeamMember}
            onUpdate={updateTeamMember}
          />
        )}
        {activeTab === 'integraciones' && (
          <TabIntegraciones
            activeIntegrations={data?.activeIntegrations || []}
            onToggle={toggleIntegration}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-eske-20 flex items-center justify-between">
        <div className="text-sm text-gray-eske-50">
          {isDirty ? (
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-eske rounded-full" />Guardando...</span>
          ) : (
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" />Guardado</span>
          )}
        </div>
        {!isPhaseCompleted && (
          <button
            onClick={handleCompletePhase}
            disabled={isCompleting || progress < 66}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              progress >= 66
                ? 'bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90'
                : 'bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed'
            }`}
          >
            {isCompleting ? 'Procesando...' : 'Completar y continuar →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB: PROGRAMAS DE EJECUCIÓN
// ============================================================

interface TabProgramasProps {
  programs: ExecutionProgram[];
  onAdd: (program: ExecutionProgram) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<ExecutionProgram>) => void;
  onAddActivity: (programIndex: number, activity: Activity) => void;
  onRemoveActivity: (programIndex: number, activityIndex: number) => void;
  onUpdateActivity: (programIndex: number, activityIndex: number, updates: Partial<Activity>) => void;
}

function TabProgramas({ programs, onAdd, onRemove, onUpdate, onAddActivity, onRemoveActivity, onUpdateActivity }: TabProgramasProps) {
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [programForm, setProgramForm] = useState<Partial<ExecutionProgram>>({});
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);
  const [addingActivityTo, setAddingActivityTo] = useState<number | null>(null);
  const [activityForm, setActivityForm] = useState<Partial<Activity>>({});

  const handleAddProgram = () => {
    if (!programForm.name?.trim()) return;
    onAdd({
      id: `prog_${Date.now()}`,
      name: programForm.name.trim(),
      type: programForm.type || 'principal',
      description: programForm.description?.trim() || '',
      status: 'planning',
      activities: [],
    });
    setProgramForm({});
    setShowProgramForm(false);
  };

  const handleAddActivity = (programIndex: number) => {
    if (!activityForm.name?.trim()) return;
    onAddActivity(programIndex, {
      name: activityForm.name.trim(),
      description: activityForm.description?.trim() || '',
      startDate: activityForm.startDate,
      endDate: activityForm.endDate,
      responsible: activityForm.responsible?.trim(),
      status: 'pending',
      metrics: [],
    });
    setActivityForm({});
    setAddingActivityTo(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Programas de Ejecución</h3>
          <p className="text-sm text-gray-eske-50">Organiza la ejecución por tipo de programa</p>
        </div>
        <button
          onClick={() => setShowProgramForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Nuevo programa
        </button>
      </div>

      {/* Tipos de programa */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(PROGRAM_TYPES).map(([key, info]) => {
          const count = programs.filter(p => p.type === key).length;
          return (
            <div key={key} className={`rounded-lg p-3 ${info.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{info.icon}</span>
                <span className="font-medium text-sm">{info.label}</span>
              </div>
              <p className="text-xs opacity-70">{count} programa{count !== 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>

      {/* Lista de programas */}
      {programs.length > 0 ? (
        <div className="space-y-4">
          {programs.map((program, pIndex) => {
            const typeInfo = PROGRAM_TYPES[program.type];
            const statusInfo = PROGRAM_STATUS[program.status];
            const isExpanded = expandedProgram === pIndex;
            const completedActivities = program.activities.filter(a => a.status === 'completed').length;
            const progressPercent = program.activities.length > 0 
              ? Math.round((completedActivities / program.activities.length) * 100) 
              : 0;

            return (
              <div key={pIndex} className="bg-white-eske border border-gray-eske-20 rounded-lg shadow-sm overflow-hidden">
                {/* Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-eske-10/50 transition-colors"
                  onClick={() => setExpandedProgram(isExpanded ? null : pIndex)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-eske-80">{program.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                        {program.description && <p className="text-sm text-gray-eske-60">{program.description}</p>}
                        <p className="text-xs text-gray-eske-50 mt-1">
                          {program.activities.length} actividades • {completedActivities} completadas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={program.status}
                        onChange={(e) => { e.stopPropagation(); onUpdate(pIndex, { status: e.target.value as ExecutionProgram['status'] }); }}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${statusInfo.color}`}
                      >
                        {Object.entries(PROGRAM_STATUS).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                      <button onClick={(e) => { e.stopPropagation(); onRemove(pIndex); }} className="text-gray-eske-40 hover:text-red-500">✕</button>
                      <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {program.activities.length > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-gray-eske-10 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-eske-20 p-4 bg-gray-eske-10/30">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-eske-70">Actividades</h5>
                      <button
                        onClick={() => setAddingActivityTo(addingActivityTo === pIndex ? null : pIndex)}
                        className="text-sm text-bluegreen-eske hover:underline"
                      >
                        + Agregar actividad
                      </button>
                    </div>

                    {/* Form agregar actividad */}
                    {addingActivityTo === pIndex && (
                      <div className="bg-white-eske rounded-lg p-4 mb-4 border border-bluegreen-eske/30">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            type="text"
                            value={activityForm.name || ''}
                            onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
                            placeholder="Nombre de la actividad *"
                            className="px-3 py-2 border border-gray-eske-30 rounded-lg"
                          />
                          <input
                            type="text"
                            value={activityForm.responsible || ''}
                            onChange={(e) => setActivityForm({ ...activityForm, responsible: e.target.value })}
                            placeholder="Responsable"
                            className="px-3 py-2 border border-gray-eske-30 rounded-lg"
                          />
                          <input
                            type="date"
                            value={activityForm.startDate || ''}
                            onChange={(e) => setActivityForm({ ...activityForm, startDate: e.target.value })}
                            className="px-3 py-2 border border-gray-eske-30 rounded-lg"
                            placeholder="Fecha inicio"
                          />
                          <input
                            type="date"
                            value={activityForm.endDate || ''}
                            onChange={(e) => setActivityForm({ ...activityForm, endDate: e.target.value })}
                            className="px-3 py-2 border border-gray-eske-30 rounded-lg"
                            placeholder="Fecha fin"
                          />
                          <textarea
                            value={activityForm.description || ''}
                            onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                            placeholder="Descripción"
                            rows={2}
                            className="sm:col-span-2 px-3 py-2 border border-gray-eske-30 rounded-lg resize-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <button onClick={() => { setAddingActivityTo(null); setActivityForm({}); }} className="px-3 py-1.5 text-sm border border-gray-eske-30 rounded">Cancelar</button>
                          <button onClick={() => handleAddActivity(pIndex)} disabled={!activityForm.name?.trim()} className="px-3 py-1.5 text-sm bg-bluegreen-eske text-white-eske rounded disabled:bg-gray-eske-20">Agregar</button>
                        </div>
                      </div>
                    )}

                    {/* Lista de actividades */}
                    {program.activities.length > 0 ? (
                      <div className="space-y-2">
                        {program.activities.map((activity, aIndex) => {
                          const actStatus = ACTIVITY_STATUS[activity.status];
                          return (
                            <div key={aIndex} className={`bg-white-eske rounded-lg p-3 flex items-start justify-between gap-3 ${activity.status === 'completed' ? 'opacity-60' : ''}`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h6 className={`font-medium text-gray-eske-80 ${activity.status === 'completed' ? 'line-through' : ''}`}>
                                    {activity.name}
                                  </h6>
                                  <select
                                    value={activity.status}
                                    onChange={(e) => onUpdateActivity(pIndex, aIndex, { status: e.target.value as Activity['status'] })}
                                    className={`px-2 py-0.5 rounded text-xs font-medium border-0 cursor-pointer ${actStatus.color}`}
                                  >
                                    {Object.entries(ACTIVITY_STATUS).map(([key, val]) => (
                                      <option key={key} value={key}>{val.label}</option>
                                    ))}
                                  </select>
                                </div>
                                {activity.description && <p className="text-xs text-gray-eske-60">{activity.description}</p>}
                                <div className="flex gap-3 mt-1 text-xs text-gray-eske-50">
                                  {activity.responsible && <span>👤 {activity.responsible}</span>}
                                  {activity.startDate && <span>📅 {new Date(activity.startDate).toLocaleDateString('es-MX')}</span>}
                                  {activity.endDate && <span>→ {new Date(activity.endDate).toLocaleDateString('es-MX')}</span>}
                                </div>
                              </div>
                              <button onClick={() => onRemoveActivity(pIndex, aIndex)} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-gray-eske-40 text-sm">Sin actividades en este programa</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay programas de ejecución</p>
          <p className="text-sm text-gray-eske-40">Crea programas de Tierra, Aire o Agua para organizar la ejecución</p>
        </div>
      )}

      {/* Modal nuevo programa */}
      {showProgramForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Nuevo Programa de Ejecución</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={programForm.name || ''}
                  onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                  placeholder="Ej: Brigadas de campo, Campaña digital..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-2">Tipo de programa</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PROGRAM_TYPES).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setProgramForm({ ...programForm, type: key as ExecutionProgram['type'] })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        programForm.type === key 
                          ? 'border-bluegreen-eske bg-bluegreen-eske/5' 
                          : 'border-gray-eske-20 hover:border-gray-eske-40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{info.icon}</span>
                        <span className="font-medium text-sm">{info.label}</span>
                      </div>
                      <p className="text-xs text-gray-eske-50">{info.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Descripción</label>
                <textarea
                  value={programForm.description || ''}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  placeholder="Describe brevemente este programa..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowProgramForm(false); setProgramForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleAddProgram} disabled={!programForm.name?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: EQUIPO
// ============================================================

interface TabEquipoProps {
  team: TeamMember[];
  onAdd: (member: TeamMember) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<TeamMember>) => void;
}

function TabEquipo({ team, onAdd, onRemove, onUpdate }: TabEquipoProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<TeamMember>>({});
  const [newResp, setNewResp] = useState('');

  const handleSubmit = () => {
    if (!form.name?.trim() || !form.role?.trim()) return;
    onAdd({
      name: form.name.trim(),
      role: form.role.trim(),
      responsibilities: form.responsibilities || [],
      contactInfo: form.contactInfo?.trim(),
    });
    setForm({});
    setShowForm(false);
  };

  const addRespToForm = () => {
    if (!newResp.trim()) return;
    const current = form.responsibilities || [];
    setForm({ ...form, responsibilities: [...current, newResp.trim()] });
    setNewResp('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Equipo de Ejecución</h3>
          <p className="text-sm text-gray-eske-50">Define los roles y responsables del proyecto</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar miembro
        </button>
      </div>

      {team.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            <div key={index} className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-bluegreen-eske/10 flex items-center justify-center text-bluegreen-eske font-bold text-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={() => onRemove(index)} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
              </div>
              <h4 className="font-semibold text-gray-eske-80">{member.name}</h4>
              <p className="text-sm text-bluegreen-eske mb-2">{member.role}</p>
              {member.contactInfo && <p className="text-xs text-gray-eske-50 mb-2">📧 {member.contactInfo}</p>}
              {member.responsibilities.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-eske-10">
                  <p className="text-xs font-medium text-gray-eske-60 mb-1">Responsabilidades:</p>
                  <ul className="space-y-1">
                    {member.responsibilities.map((resp, i) => (
                      <li key={i} className="text-xs text-gray-eske-60 flex items-start gap-1">
                        <span className="text-bluegreen-eske">•</span>{resp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay miembros en el equipo</p>
          <p className="text-sm text-gray-eske-40">Agrega a los responsables de ejecutar el proyecto</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar Miembro del Equipo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Rol / Cargo *</label>
                <input
                  type="text"
                  value={form.role || ''}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Ej: Coordinador de campo, Community Manager..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Contacto</label>
                <input
                  type="text"
                  value={form.contactInfo || ''}
                  onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                  placeholder="Email o teléfono"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Responsabilidades</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newResp}
                    onChange={(e) => setNewResp(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRespToForm())}
                    placeholder="Agregar responsabilidad..."
                    className="flex-1 px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                  <button onClick={addRespToForm} className="px-3 py-2 bg-gray-eske-20 rounded-lg">+</button>
                </div>
                {(form.responsibilities?.length ?? 0) > 0 && (
                  <ul className="space-y-1">
                    {form.responsibilities?.map((resp, i) => (
                      <li key={i} className="flex items-center justify-between px-2 py-1 bg-gray-eske-10 rounded text-sm">
                        <span>{resp}</span>
                        <button onClick={() => setForm({ ...form, responsibilities: form.responsibilities?.filter((_, idx) => idx !== i) })} className="text-red-500">✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} disabled={!form.name?.trim() || !form.role?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: INTEGRACIONES
// ============================================================

interface TabIntegracionesProps {
  activeIntegrations: string[];
  onToggle: (integration: string) => void;
}

const AVAILABLE_INTEGRATIONS = [
  { id: 'calendario', name: 'Calendario', icon: '📅', description: 'Programa actividades y eventos' },
  { id: 'recluta', name: 'Recluta', icon: '👥', description: 'Gestiona voluntarios y brigadas' },
  { id: 'encuestas', name: 'Encuestas', icon: '📊', description: 'Realiza sondeos y estudios' },
  { id: 'territorio', name: 'Territorio', icon: '🗺️', description: 'Mapea y segmenta zonas geográficas' },
  { id: 'redactor', name: 'Redactor', icon: '✍️', description: 'Genera contenido con IA' },
  { id: 'social', name: 'Social Media', icon: '📱', description: 'Conecta redes sociales' },
  { id: 'crm', name: 'CRM Externo', icon: '💼', description: 'Integra con sistemas de contactos' },
  { id: 'analytics', name: 'Analytics', icon: '📈', description: 'Conecta Google Analytics' },
];

function TabIntegraciones({ activeIntegrations, onToggle }: TabIntegracionesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">Integraciones Activas</h3>
        <p className="text-sm text-gray-eske-50">Conecta las apps de Moddulo que usarás en la ejecución</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {AVAILABLE_INTEGRATIONS.map((integration) => {
          const isActive = activeIntegrations.includes(integration.id);
          return (
            <button
              key={integration.id}
              onClick={() => onToggle(integration.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isActive 
                  ? 'border-bluegreen-eske bg-bluegreen-eske/5' 
                  : 'border-gray-eske-20 hover:border-gray-eske-40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-eske-80">{integration.name}</h4>
                    <p className="text-xs text-gray-eske-50">{integration.description}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isActive ? 'border-bluegreen-eske bg-bluegreen-eske' : 'border-gray-eske-30'
                }`}>
                  {isActive && <span className="text-white-eske text-xs">✓</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {activeIntegrations.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>✓ {activeIntegrations.length} integraciones activas:</strong>{' '}
            {activeIntegrations.map(id => AVAILABLE_INTEGRATIONS.find(i => i.id === id)?.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

