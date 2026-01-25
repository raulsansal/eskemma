// app/moddulo/proyecto/[projectId]/operacion/evaluacion/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { useStrategyContext, usePhaseData } from '@/app/moddulo/components/StrategyContextProvider';
import {
  PHASE_METADATA,
  LAYER_METADATA,
  type EvaluacionData,
  type Lesson,
  type ROIAnalysis,
  type ROICategory,
  type LegacyItem,
} from '@/types/strategy-context.types';
import { Timestamp } from 'firebase/firestore';

// ============================================================
// CONSTANTES
// ============================================================

const PHASE = 'evaluacion';
const LAYER = 'operacion';
const phaseInfo = PHASE_METADATA[PHASE];
const layerInfo = LAYER_METADATA[LAYER];

const LESSON_CATEGORIES: Record<Lesson['category'], { label: string; color: string; icon: string }> = {
  success: { label: 'Éxito', color: 'bg-green-100 text-green-800', icon: '✅' },
  failure: { label: 'Fracaso', color: 'bg-red-100 text-red-800', icon: '❌' },
  improvement: { label: 'Mejora', color: 'bg-blue-100 text-blue-800', icon: '💡' },
};

const IMPACT_LEVELS: Record<Lesson['impact'], { label: string; color: string }> = {
  high: { label: 'Alto', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Bajo', color: 'bg-gray-100 text-gray-700' },
};

const LEGACY_TYPES: Record<LegacyItem['type'], { label: string; icon: string; color: string }> = {
  asset: { label: 'Activo', icon: '💎', color: 'bg-purple-100 text-purple-800' },
  relationship: { label: 'Relación', icon: '🤝', color: 'bg-blue-100 text-blue-800' },
  knowledge: { label: 'Conocimiento', icon: '📚', color: 'bg-amber-100 text-amber-800' },
  infrastructure: { label: 'Infraestructura', icon: '🏗️', color: 'bg-gray-100 text-gray-800' },
};

const VALUE_LEVELS: Record<LegacyItem['value'], string> = {
  high: '⭐⭐⭐ Alto',
  medium: '⭐⭐ Medio',
  low: '⭐ Bajo',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function EvaluacionPage() {
  const { project, completePhase } = useStrategyContext();
  const { data, updateData, isDirty } = usePhaseData<EvaluacionData>(PHASE);

  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'lecciones' | 'roi' | 'legado' | 'recomendaciones'>('lecciones');

  // ============================================================
  // HANDLERS DE DATOS
  // ============================================================

  // Lecciones aprendidas
  const addLesson = (lesson: Lesson) => {
    const current = data?.lessonsLearned || [];
    updateData({ lessonsLearned: [...current, lesson] });
  };

  const removeLesson = (index: number) => {
    const current = data?.lessonsLearned || [];
    updateData({ lessonsLearned: current.filter((_, i) => i !== index) });
  };

  // ROI
  const updateROI = (updates: Partial<ROIAnalysis>) => {
    const current: ROIAnalysis = data?.roiAnalysis || {
      totalInvestment: 0,
      totalReturn: 0,
      roiPercentage: 0,
      byCategory: [],
      intangibleBenefits: [],
    };
    
    // Recalcular ROI si cambian inversión o retorno
    let roiPercentage = current.roiPercentage;
    const investment = updates.totalInvestment ?? current.totalInvestment;
    const returnVal = updates.totalReturn ?? current.totalReturn;
    if (investment > 0) {
      roiPercentage = Math.round(((returnVal - investment) / investment) * 100);
    }

    updateData({ roiAnalysis: { ...current, ...updates, roiPercentage } });
  };

  const addROICategory = (category: ROICategory) => {
    const current = data?.roiAnalysis?.byCategory || [];
    updateROI({ byCategory: [...current, category] });
  };

  const removeROICategory = (index: number) => {
    const current = data?.roiAnalysis?.byCategory || [];
    updateROI({ byCategory: current.filter((_, i) => i !== index) });
  };

  const addIntangibleBenefit = (benefit: string) => {
    const current = data?.roiAnalysis?.intangibleBenefits || [];
    updateROI({ intangibleBenefits: [...current, benefit] });
  };

  const removeIntangibleBenefit = (index: number) => {
    const current = data?.roiAnalysis?.intangibleBenefits || [];
    updateROI({ intangibleBenefits: current.filter((_, i) => i !== index) });
  };

  // Legado
  const addLegacyItem = (item: LegacyItem) => {
    const current = data?.legacy || [];
    updateData({ legacy: [...current, item] });
  };

  const removeLegacyItem = (index: number) => {
    const current = data?.legacy || [];
    updateData({ legacy: current.filter((_, i) => i !== index) });
  };

  // Recomendaciones futuras
  const addRecommendation = (rec: string) => {
    const current = data?.futureRecommendations || [];
    updateData({ futureRecommendations: [...current, rec] });
  };

  const removeRecommendation = (index: number) => {
    const current = data?.futureRecommendations || [];
    updateData({ futureRecommendations: current.filter((_, i) => i !== index) });
  };

  // ============================================================
  // COMPLETAR FASE (GATE 3 - CIERRE)
  // ============================================================

  const handleCompletePhase = async () => {
    if ((data?.lessonsLearned?.length ?? 0) === 0) {
      alert('Por favor documenta al menos una lección aprendida.');
      setActiveTab('lecciones');
      return;
    }

    // Confirmación especial para Gate 3 (cierre de proyecto)
    const confirmed = confirm(
      '🎉 GATE 3: Cierre del Proyecto\n\n' +
      'Al completar esta fase, el proyecto se marcará como COMPLETADO.\n\n' +
      'Esta acción indica que el proyecto ha finalizado y toda la documentación de cierre está lista.\n\n' +
      '¿Deseas finalizar y cerrar el proyecto?'
    );

    if (!confirmed) return;

    setIsCompleting(true);
    
    // Marcar fecha de completado
    updateData({ completedAt: Timestamp.now() });
    
    const result = await completePhase(PHASE);
    if (!result.success) {
      alert(result.error || 'Error al completar la fase');
    }
    setIsCompleting(false);
  };

  // ============================================================
  // CÁLCULO DE PROGRESO
  // ============================================================

  const calculateProgress = (): number => {
    if (!data) return 0;
    let completed = 0;
    const total = 4;

    if ((data.lessonsLearned?.length ?? 0) > 0) completed++;
    if (data.roiAnalysis?.totalInvestment || data.roiAnalysis?.totalReturn) completed++;
    if ((data.legacy?.length ?? 0) > 0) completed++;
    if ((data.futureRecommendations?.length ?? 0) > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();
  const isPhaseCompleted = project?.completedPhases.includes(PHASE);
  const isProjectCompleted = project?.status === 'completed';

  // Stats de lecciones
  const lessonStats = useMemo(() => {
    const lessons = data?.lessonsLearned || [];
    return {
      total: lessons.length,
      success: lessons.filter(l => l.category === 'success').length,
      failure: lessons.filter(l => l.category === 'failure').length,
      improvement: lessons.filter(l => l.category === 'improvement').length,
    };
  }, [data?.lessonsLearned]);

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
          <span>Fase 9 de 9</span>
          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">🏁 Gate 3 - Cierre</span>
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
          {isProjectCompleted ? (
            <span className="px-4 py-2 bg-green-500 text-white-eske rounded-full text-sm font-medium shrink-0 flex items-center gap-2">
              🎉 Proyecto Completado
            </span>
          ) : isPhaseCompleted ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium shrink-0">✓ Completada</span>
          ) : null}
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

      {/* Gate Info */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>🏁 Gate 3 - Cierre del Proyecto:</strong> Esta es la fase final. Documenta las lecciones aprendidas, 
          analiza el retorno de inversión y define el legado del proyecto para futuras iniciativas.
        </p>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-bluegreen-eske">{lessonStats.total}</p>
          <p className="text-xs text-gray-eske-50">Lecciones</p>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{lessonStats.success}</p>
          <p className="text-xs text-gray-eske-50">Éxitos</p>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{data?.legacy?.length || 0}</p>
          <p className="text-xs text-gray-eske-50">Legado</p>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 text-center">
          <p className={`text-2xl font-bold ${(data?.roiAnalysis?.roiPercentage ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data?.roiAnalysis?.roiPercentage ?? 0}%
          </p>
          <p className="text-xs text-gray-eske-50">ROI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-eske-20 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            { id: 'lecciones', label: 'Lecciones Aprendidas', count: data?.lessonsLearned?.length || 0 },
            { id: 'roi', label: 'Análisis ROI' },
            { id: 'legado', label: 'Legado', count: data?.legacy?.length || 0 },
            { id: 'recomendaciones', label: 'Recomendaciones', count: data?.futureRecommendations?.length || 0 },
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
              {'count' in tab && typeof tab.count === 'number' && tab.count > 0 && (
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
        {activeTab === 'lecciones' && (
          <TabLecciones
            lessons={data?.lessonsLearned || []}
            onAdd={addLesson}
            onRemove={removeLesson}
          />
        )}
        {activeTab === 'roi' && (
          <TabROI
            roi={data?.roiAnalysis}
            onUpdate={updateROI}
            onAddCategory={addROICategory}
            onRemoveCategory={removeROICategory}
            onAddBenefit={addIntangibleBenefit}
            onRemoveBenefit={removeIntangibleBenefit}
          />
        )}
        {activeTab === 'legado' && (
          <TabLegado
            legacy={data?.legacy || []}
            onAdd={addLegacyItem}
            onRemove={removeLegacyItem}
          />
        )}
        {activeTab === 'recomendaciones' && (
          <TabRecomendaciones
            recommendations={data?.futureRecommendations || []}
            onAdd={addRecommendation}
            onRemove={removeRecommendation}
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
        {!isPhaseCompleted && !isProjectCompleted && (
          <button
            onClick={handleCompletePhase}
            disabled={isCompleting || progress < 25}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              progress >= 25
                ? 'bg-green-600 text-white-eske hover:bg-green-700'
                : 'bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed'
            }`}
          >
            {isCompleting ? 'Finalizando...' : '🏁 Finalizar Proyecto'}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB: LECCIONES APRENDIDAS
// ============================================================

interface TabLeccionesProps {
  lessons: Lesson[];
  onAdd: (lesson: Lesson) => void;
  onRemove: (index: number) => void;
}

function TabLecciones({ lessons, onAdd, onRemove }: TabLeccionesProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Lesson>>({});

  const handleSubmit = () => {
    if (!form.description?.trim()) return;
    onAdd({
      category: form.category || 'improvement',
      description: form.description.trim(),
      impact: form.impact || 'medium',
      applicability: form.applicability?.trim() || '',
    });
    setForm({});
    setShowForm(false);
  };

  // Agrupar por categoría
  const grouped = useMemo(() => {
    return {
      success: lessons.filter(l => l.category === 'success'),
      failure: lessons.filter(l => l.category === 'failure'),
      improvement: lessons.filter(l => l.category === 'improvement'),
    };
  }, [lessons]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Lecciones Aprendidas</h3>
          <p className="text-sm text-gray-eske-50">Documenta los aprendizajes del proyecto</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar lección
        </button>
      </div>

      {lessons.length > 0 ? (
        <div className="space-y-6">
          {/* Éxitos */}
          {grouped.success.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                ✅ Éxitos ({grouped.success.length})
              </h4>
              <div className="space-y-2">
                {grouped.success.map((lesson, i) => {
                  const originalIndex = lessons.findIndex(l => l === lesson);
                  return <LessonCard key={originalIndex} lesson={lesson} onRemove={() => onRemove(originalIndex)} />;
                })}
              </div>
            </div>
          )}

          {/* Fracasos */}
          {grouped.failure.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                ❌ Fracasos ({grouped.failure.length})
              </h4>
              <div className="space-y-2">
                {grouped.failure.map((lesson, i) => {
                  const originalIndex = lessons.findIndex(l => l === lesson);
                  return <LessonCard key={originalIndex} lesson={lesson} onRemove={() => onRemove(originalIndex)} />;
                })}
              </div>
            </div>
          )}

          {/* Mejoras */}
          {grouped.improvement.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                💡 Áreas de Mejora ({grouped.improvement.length})
              </h4>
              <div className="space-y-2">
                {grouped.improvement.map((lesson, i) => {
                  const originalIndex = lessons.findIndex(l => l === lesson);
                  return <LessonCard key={originalIndex} lesson={lesson} onRemove={() => onRemove(originalIndex)} />;
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay lecciones documentadas</p>
          <p className="text-sm text-gray-eske-40">Documenta éxitos, fracasos y áreas de mejora</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar Lección Aprendida</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-2">Categoría</label>
                <div className="flex gap-2">
                  {Object.entries(LESSON_CATEGORIES).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, category: key as Lesson['category'] })}
                      className={`flex-1 p-3 rounded-lg border text-center ${
                        form.category === key 
                          ? info.color + ' border-2' 
                          : 'border-gray-eske-20'
                      }`}
                    >
                      <span className="block text-xl mb-1">{info.icon}</span>
                      <span className="text-xs">{info.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Descripción *</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe la lección aprendida..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-2">Impacto</label>
                <div className="flex gap-2">
                  {Object.entries(IMPACT_LEVELS).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, impact: key as Lesson['impact'] })}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                        form.impact === key 
                          ? info.color + ' border-2' 
                          : 'border-gray-eske-20'
                      }`}
                    >
                      {info.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Aplicabilidad futura</label>
                <input
                  type="text"
                  value={form.applicability || ''}
                  onChange={(e) => setForm({ ...form, applicability: e.target.value })}
                  placeholder="¿En qué situaciones se puede aplicar esta lección?"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} disabled={!form.description?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson, onRemove }: { lesson: Lesson; onRemove: () => void }) {
  const catInfo = LESSON_CATEGORIES[lesson.category];
  const impactInfo = IMPACT_LEVELS[lesson.impact];

  return (
    <div className={`p-4 rounded-lg border ${catInfo.color.replace('text-', 'border-').replace('800', '200')}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${impactInfo.color}`}>
              Impacto {impactInfo.label}
            </span>
          </div>
          <p className="text-gray-eske-80">{lesson.description}</p>
          {lesson.applicability && (
            <p className="text-sm text-gray-eske-50 mt-2">
              <strong>Aplicabilidad:</strong> {lesson.applicability}
            </p>
          )}
        </div>
        <button onClick={onRemove} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
      </div>
    </div>
  );
}

// ============================================================
// TAB: ANÁLISIS ROI
// ============================================================

interface TabROIProps {
  roi: ROIAnalysis | undefined;
  onUpdate: (updates: Partial<ROIAnalysis>) => void;
  onAddCategory: (category: ROICategory) => void;
  onRemoveCategory: (index: number) => void;
  onAddBenefit: (benefit: string) => void;
  onRemoveBenefit: (index: number) => void;
}

function TabROI({ roi, onUpdate, onAddCategory, onRemoveCategory, onAddBenefit, onRemoveBenefit }: TabROIProps) {
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState<Partial<ROICategory>>({});
  const [newBenefit, setNewBenefit] = useState('');

  const handleAddCategory = () => {
    if (!catForm.category?.trim()) return;
    const investment = catForm.investment || 0;
    const returnVal = catForm.return || 0;
    const catRoi = investment > 0 ? Math.round(((returnVal - investment) / investment) * 100) : 0;
    
    onAddCategory({
      category: catForm.category.trim(),
      investment,
      return: returnVal,
      roi: catRoi,
    });
    setCatForm({});
    setShowCatForm(false);
  };

  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    onAddBenefit(newBenefit.trim());
    setNewBenefit('');
  };

  const roiPercentage = roi?.roiPercentage ?? 0;
  const isPositiveROI = roiPercentage >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">Análisis de Retorno de Inversión</h3>
        <p className="text-sm text-gray-eske-50">Evalúa el rendimiento financiero del proyecto</p>
      </div>

      {/* Resumen ROI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4">
          <label className="block text-xs text-gray-eske-50 mb-1">Inversión Total</label>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-gray-eske-70">$</span>
            <input
              type="number"
              value={roi?.totalInvestment || ''}
              onChange={(e) => onUpdate({ totalInvestment: parseFloat(e.target.value) || 0 })}
              className="w-full text-2xl font-bold text-red-600 bg-transparent border-0 focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4">
          <label className="block text-xs text-gray-eske-50 mb-1">Retorno Total</label>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-gray-eske-70">$</span>
            <input
              type="number"
              value={roi?.totalReturn || ''}
              onChange={(e) => onUpdate({ totalReturn: parseFloat(e.target.value) || 0 })}
              className="w-full text-2xl font-bold text-green-600 bg-transparent border-0 focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>
        <div className={`rounded-lg p-4 ${isPositiveROI ? 'bg-green-100' : 'bg-red-100'}`}>
          <label className="block text-xs text-gray-eske-50 mb-1">ROI</label>
          <p className={`text-3xl font-bold ${isPositiveROI ? 'text-green-700' : 'text-red-700'}`}>
            {roiPercentage > 0 ? '+' : ''}{roiPercentage}%
          </p>
        </div>
      </div>

      {/* ROI por categoría */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-eske-80">ROI por Categoría</h4>
          <button
            onClick={() => setShowCatForm(true)}
            className="text-sm text-bluegreen-eske hover:underline"
          >
            + Agregar categoría
          </button>
        </div>

        {(roi?.byCategory?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {roi?.byCategory?.map((cat, index) => (
              <div key={index} className="bg-white-eske border border-gray-eske-20 rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-eske-80">{cat.category}</p>
                  <p className="text-sm text-gray-eske-50">
                    Inversión: ${cat.investment.toLocaleString()} → Retorno: ${cat.return.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded font-medium ${cat.roi >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cat.roi > 0 ? '+' : ''}{cat.roi}%
                  </span>
                  <button onClick={() => onRemoveCategory(index)} className="text-gray-eske-40 hover:text-red-500">✕</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-gray-eske-40 text-sm bg-gray-eske-10 rounded-lg">Sin categorías de ROI</p>
        )}
      </div>

      {/* Beneficios intangibles */}
      <div>
        <h4 className="font-medium text-gray-eske-80 mb-3">Beneficios Intangibles</h4>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBenefit()}
            placeholder="Ej: Reconocimiento de marca, nuevas alianzas..."
            className="flex-1 px-3 py-2 border border-gray-eske-30 rounded-lg"
          />
          <button onClick={handleAddBenefit} disabled={!newBenefit.trim()} className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">
            Agregar
          </button>
        </div>
        {(roi?.intangibleBenefits?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-2">
            {roi?.intangibleBenefits?.map((benefit, index) => (
              <span key={index} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
                {benefit}
                <button onClick={() => onRemoveBenefit(index)} className="hover:text-red-500">✕</button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-eske-40">No hay beneficios intangibles registrados</p>
        )}
      </div>

      {/* Modal categoría */}
      {showCatForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar Categoría ROI</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Categoría *</label>
                <input
                  type="text"
                  value={catForm.category || ''}
                  onChange={(e) => setCatForm({ ...catForm, category: e.target.value })}
                  placeholder="Ej: Publicidad digital, Eventos..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">Inversión</label>
                  <input
                    type="number"
                    value={catForm.investment || ''}
                    onChange={(e) => setCatForm({ ...catForm, investment: parseFloat(e.target.value) || 0 })}
                    placeholder="$0"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">Retorno</label>
                  <input
                    type="number"
                    value={catForm.return || ''}
                    onChange={(e) => setCatForm({ ...catForm, return: parseFloat(e.target.value) || 0 })}
                    placeholder="$0"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCatForm(false); setCatForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleAddCategory} disabled={!catForm.category?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: LEGADO
// ============================================================

interface TabLegadoProps {
  legacy: LegacyItem[];
  onAdd: (item: LegacyItem) => void;
  onRemove: (index: number) => void;
}

function TabLegado({ legacy, onAdd, onRemove }: TabLegadoProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<LegacyItem>>({});

  const handleSubmit = () => {
    if (!form.description?.trim()) return;
    onAdd({
      type: form.type || 'knowledge',
      description: form.description.trim(),
      value: form.value || 'medium',
      transferable: form.transferable ?? true,
    });
    setForm({});
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Legado del Proyecto</h3>
          <p className="text-sm text-gray-eske-50">Activos, relaciones y conocimiento que perduran</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar elemento
        </button>
      </div>

      {legacy.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {legacy.map((item, index) => {
            const typeInfo = LEGACY_TYPES[item.type];
            return (
              <div key={index} className={`rounded-lg p-4 border ${typeInfo.color.replace('text-', 'border-').replace('800', '200')}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                      {typeInfo.icon}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeInfo.color}`}>{typeInfo.label}</span>
                  </div>
                  <button onClick={() => onRemove(index)} className="text-gray-eske-40 hover:text-red-500">✕</button>
                </div>
                <p className="text-gray-eske-80 mb-2">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-eske-50">
                  <span>{VALUE_LEVELS[item.value]}</span>
                  {item.transferable && <span className="text-green-600">✓ Transferible</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay elementos de legado</p>
          <p className="text-sm text-gray-eske-40">Documenta lo que perdura después del proyecto</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar Elemento de Legado</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(LEGACY_TYPES).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, type: key as LegacyItem['type'] })}
                      className={`p-3 rounded-lg border text-left ${
                        form.type === key 
                          ? 'border-bluegreen-eske bg-bluegreen-eske/10' 
                          : 'border-gray-eske-20'
                      }`}
                    >
                      <span className="text-lg mr-2">{info.icon}</span>
                      <span className="text-sm">{info.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Descripción *</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe el elemento de legado..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-2">Valor</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, value: val })}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                        form.value === val 
                          ? 'border-bluegreen-eske bg-bluegreen-eske/10' 
                          : 'border-gray-eske-20'
                      }`}
                    >
                      {VALUE_LEVELS[val]}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.transferable ?? true}
                  onChange={(e) => setForm({ ...form, transferable: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-eske-70">Es transferible a otros proyectos</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} disabled={!form.description?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: RECOMENDACIONES FUTURAS
// ============================================================

interface TabRecomendacionesProps {
  recommendations: string[];
  onAdd: (rec: string) => void;
  onRemove: (index: number) => void;
}

function TabRecomendaciones({ recommendations, onAdd, onRemove }: TabRecomendacionesProps) {
  const [newRec, setNewRec] = useState('');

  const handleAdd = () => {
    if (!newRec.trim()) return;
    onAdd(newRec.trim());
    setNewRec('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">Recomendaciones para el Futuro</h3>
        <p className="text-sm text-gray-eske-50">Consejos y sugerencias para próximos proyectos</p>
      </div>

      <div>
        <textarea
          value={newRec}
          onChange={(e) => setNewRec(e.target.value)}
          placeholder="Escribe una recomendación para futuros proyectos..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAdd}
            disabled={!newRec.trim()}
            className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium disabled:bg-gray-eske-20"
          >
            + Agregar recomendación
          </button>
        </div>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-bluegreen-eske/10 text-bluegreen-eske flex items-center justify-center text-sm font-medium shrink-0">
                {index + 1}
              </span>
              <p className="flex-1 text-gray-eske-80">{rec}</p>
              <button onClick={() => onRemove(index)} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay recomendaciones</p>
          <p className="text-sm text-gray-eske-40">Agrega consejos para futuros proyectos similares</p>
        </div>
      )}
    </div>
  );
}
