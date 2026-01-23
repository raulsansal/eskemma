// app/moddulo/proyecto/[projectId]/fundacion/diagnostico/page.tsx
"use client";

import React, { useState } from 'react';
import { useStrategyContext, usePhaseData } from '@/app/moddulo/components/StrategyContextProvider';
import {
  PHASE_METADATA,
  LAYER_METADATA,
  type DiagnosticoData,
  type FODAItem,
  type FODAAnalysis,
  type PESTELAnalysis,
  type ViabilityAssessment,
  type EthicsAssessment,
  type Risk,
  type EthicsConcern,
} from '@/types/strategy-context.types';

// ============================================================
// CONSTANTES
// ============================================================

const PHASE = 'diagnostico';
const LAYER = 'fundacion';
const phaseInfo = PHASE_METADATA[PHASE];
const layerInfo = LAYER_METADATA[LAYER];

const FODA_CATEGORIES = {
  fortalezas: { label: 'Fortalezas', color: 'bg-green-100 text-green-800', icon: '💪' },
  oportunidades: { label: 'Oportunidades', color: 'bg-blue-100 text-blue-800', icon: '🎯' },
  debilidades: { label: 'Debilidades', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
  amenazas: { label: 'Amenazas', color: 'bg-red-100 text-red-800', icon: '🚨' },
} as const;

const PESTEL_CATEGORIES = {
  political: { label: 'Político', color: 'bg-purple-100 text-purple-800' },
  economic: { label: 'Económico', color: 'bg-emerald-100 text-emerald-800' },
  social: { label: 'Social', color: 'bg-pink-100 text-pink-800' },
  technological: { label: 'Tecnológico', color: 'bg-cyan-100 text-cyan-800' },
  environmental: { label: 'Ambiental', color: 'bg-lime-100 text-lime-800' },
  legal: { label: 'Legal', color: 'bg-orange-100 text-orange-800' },
} as const;

const ETHICS_AREAS: Record<EthicsConcern['area'], string> = {
  truth: 'Veracidad',
  privacy: 'Privacidad',
  manipulation: 'Manipulación',
  discrimination: 'Discriminación',
  legality: 'Legalidad',
  other: 'Otro',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function DiagnosticoPage() {
  const { project, completePhase } = useStrategyContext();
  const { data, updateData, isDirty } = usePhaseData<DiagnosticoData>(PHASE);

  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'foda' | 'pestel' | 'viabilidad' | 'etica'>('foda');
  const [showViabilityWarning, setShowViabilityWarning] = useState(false);

  // Handlers FODA
  const updateFODA = (updates: Partial<FODAAnalysis>) => {
    const current: FODAAnalysis = data?.foda || { fortalezas: [], oportunidades: [], debilidades: [], amenazas: [] };
    updateData({ foda: { ...current, ...updates } });
  };

  const addFODAItem = (category: keyof FODAAnalysis, item: FODAItem) => {
    const current = data?.foda?.[category] || [];
    updateFODA({ [category]: [...current, item] });
  };

  const removeFODAItem = (category: keyof FODAAnalysis, index: number) => {
    const current = data?.foda?.[category] || [];
    updateFODA({ [category]: current.filter((_, i) => i !== index) });
  };

  // Handlers PESTEL (usa string[], no objetos)
  const updatePESTEL = (updates: Partial<PESTELAnalysis>) => {
    const current: PESTELAnalysis = data?.pestel || {
      political: [], economic: [], social: [], technological: [], environmental: [], legal: [],
    };
    updateData({ pestel: { ...current, ...updates } });
  };

  const addPESTELItem = (category: keyof PESTELAnalysis, item: string) => {
    const current = data?.pestel?.[category] || [];
    updatePESTEL({ [category]: [...current, item] });
  };

  const removePESTELItem = (category: keyof PESTELAnalysis, index: number) => {
    const current = data?.pestel?.[category] || [];
    updatePESTEL({ [category]: current.filter((_, i) => i !== index) });
  };

  // Handlers Viability
  const updateViability = (updates: Partial<ViabilityAssessment>) => {
    const current: ViabilityAssessment = data?.viabilityAssessment || {
      resourcesAvailable: false, timeframeFeasible: false, audienceReachable: false,
      competitiveAdvantage: false, overallScore: 0, risks: [],
    };
    updateData({ viabilityAssessment: { ...current, ...updates } });
  };

  const addRisk = (risk: Risk) => {
    const current = data?.viabilityAssessment?.risks || [];
    updateViability({ risks: [...current, risk] });
  };

  const removeRisk = (index: number) => {
    const current = data?.viabilityAssessment?.risks || [];
    updateViability({ risks: current.filter((_, i) => i !== index) });
  };

  // Handlers Ethics
  const updateEthics = (updates: Partial<EthicsAssessment>) => {
    const current: EthicsAssessment = data?.ethicsAssessment || {
      passesEthicsCheck: false, concerns: [], commitments: [],
    };
    updateData({ ethicsAssessment: { ...current, ...updates } });
  };

  const addConcern = (concern: EthicsConcern) => {
    const current = data?.ethicsAssessment?.concerns || [];
    updateEthics({ concerns: [...current, concern] });
  };

  const removeConcern = (index: number) => {
    const current = data?.ethicsAssessment?.concerns || [];
    updateEthics({ concerns: current.filter((_, i) => i !== index) });
  };

  const addCommitment = (commitment: string) => {
    const current = data?.ethicsAssessment?.commitments || [];
    updateEthics({ commitments: [...current, commitment] });
  };

  const removeCommitment = (index: number) => {
    const current = data?.ethicsAssessment?.commitments || [];
    updateEthics({ commitments: current.filter((_, i) => i !== index) });
  };

  // Recommendation (en DiagnosticoData, no en ViabilityAssessment)
  const updateRecommendation = (recommendation: DiagnosticoData['recommendation']) => {
    updateData({ recommendation });
  };

  // Completar fase
  const handleCompletePhase = async () => {
    if (!data?.recommendation) {
      alert('Por favor selecciona una recomendación antes de continuar.');
      setActiveTab('viabilidad');
      return;
    }

    if (data.recommendation === 'archive' && !showViabilityWarning) {
      setShowViabilityWarning(true);
      return;
    }

    setIsCompleting(true);
    const result = await completePhase(PHASE);
    if (!result.success) alert(result.error || 'Error al completar la fase');
    setIsCompleting(false);
    setShowViabilityWarning(false);
  };

  // Cálculo de progreso
  const calculateProgress = (): number => {
    if (!data) return 0;
    let completed = 0;
    const total = 4;

    const fodaComplete = data.foda &&
      (data.foda.fortalezas?.length ?? 0) > 0 &&
      (data.foda.oportunidades?.length ?? 0) > 0 &&
      (data.foda.debilidades?.length ?? 0) > 0 &&
      (data.foda.amenazas?.length ?? 0) > 0;
    if (fodaComplete) completed++;

    const pestelCount = data.pestel ? Object.values(data.pestel).filter(arr => (arr?.length ?? 0) > 0).length : 0;
    if (pestelCount >= 3) completed++;

    const viabCriteria = [
      data.viabilityAssessment?.resourcesAvailable,
      data.viabilityAssessment?.timeframeFeasible,
      data.viabilityAssessment?.audienceReachable,
      data.viabilityAssessment?.competitiveAdvantage,
    ].filter(Boolean).length;
    if (viabCriteria >= 2) completed++;

    if (data.recommendation) completed++;
    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();
  const isPhaseCompleted = project?.completedPhases.includes(PHASE);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-eske-60 mb-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: layerInfo.color }} />
          <span>{layerInfo.name}</span>
          <span>•</span>
          <span>Fase 3 de 9</span>
          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">⚡ VIABILITY GATE</span>
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

      {/* Viability Gate Warning */}
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="text-sm text-orange-800">
          <strong>⚡ Viability Gate:</strong> Esta fase determina si el proyecto es viable. Según tu evaluación, puede proceder, pivotar o archivarse.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-eske-20 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            { id: 'foda', label: 'Análisis FODA' },
            { id: 'pestel', label: 'Análisis PESTEL' },
            { id: 'viabilidad', label: 'Evaluación de Viabilidad', required: true },
            { id: 'etica', label: 'Consideraciones Éticas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id ? 'border-bluegreen-eske text-bluegreen-eske' : 'border-transparent text-gray-eske-60 hover:text-gray-eske-80'
              }`}
            >
              {tab.label}
              {tab.required && <span className="text-red-500 text-xs">*</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'foda' && <TabFODA foda={data?.foda} onAdd={addFODAItem} onRemove={removeFODAItem} />}
        {activeTab === 'pestel' && <TabPESTEL pestel={data?.pestel} onAdd={addPESTELItem} onRemove={removePESTELItem} />}
        {activeTab === 'viabilidad' && (
          <TabViabilidad
            assessment={data?.viabilityAssessment}
            recommendation={data?.recommendation}
            recommendationRationale={data?.recommendationRationale}
            onChangeAssessment={updateViability}
            onChangeRecommendation={updateRecommendation}
            onChangeRationale={(r) => updateData({ recommendationRationale: r })}
            onAddRisk={addRisk}
            onRemoveRisk={removeRisk}
          />
        )}
        {activeTab === 'etica' && (
          <TabEtica
            ethics={data?.ethicsAssessment}
            onChangeEthics={updateEthics}
            onAddConcern={addConcern}
            onRemoveConcern={removeConcern}
            onAddCommitment={addCommitment}
            onRemoveCommitment={removeCommitment}
          />
        )}
      </div>

      {/* Modal advertencia archivo */}
      {showViabilityWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-eske-80 mb-2">Proyecto No Viable</h3>
              <p className="text-gray-eske-60">Esta acción archivará el proyecto y no podrás continuar con las siguientes fases.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowViabilityWarning(false)} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg font-medium text-gray-eske-70 hover:bg-gray-eske-10">Revisar</button>
              <button onClick={handleCompletePhase} disabled={isCompleting} className="flex-1 px-4 py-2.5 bg-red-600 text-white-eske rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">
                {isCompleting ? 'Archivando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            disabled={isCompleting || !data?.recommendation}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              data?.recommendation ? 'bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90' : 'bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed'
            }`}
          >
            {isCompleting ? 'Procesando...' : 'Completar Diagnóstico →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB: FODA
// ============================================================

interface TabFODAProps {
  foda: FODAAnalysis | undefined;
  onAdd: (category: keyof FODAAnalysis, item: FODAItem) => void;
  onRemove: (category: keyof FODAAnalysis, index: number) => void;
}

function TabFODA({ foda, onAdd, onRemove }: TabFODAProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof FODA_CATEGORIES>('fortalezas');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<FODAItem>>({});

  const handleSubmit = () => {
    if (!form.description?.trim()) return;
    onAdd(activeCategory, {
      description: form.description.trim(),
      impact: form.impact || 'medium',
      actionable: form.actionable ?? true,
      suggestedAction: form.suggestedAction?.trim(),
    });
    setForm({});
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">Análisis FODA</h3>
        <p className="text-sm text-gray-eske-50">Fortalezas, Oportunidades, Debilidades y Amenazas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(FODA_CATEGORIES) as Array<keyof typeof FODA_CATEGORIES>).map((category) => {
          const config = FODA_CATEGORIES[category];
          const items = foda?.[category] || [];
          return (
            <div key={category} className={`border rounded-lg p-4 ${config.color.split(' ')[0]}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium flex items-center gap-2 ${config.color.split(' ')[1]}`}>
                  <span>{config.icon}</span>{config.label} ({items.length})
                </h4>
                <button onClick={() => { setActiveCategory(category); setShowForm(true); }} className={`text-xs px-2 py-1 rounded ${config.color}`}>+ Agregar</button>
              </div>
              {items.length > 0 ? (
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li key={index} className="bg-white-eske/60 rounded p-2 flex items-start justify-between gap-2 text-sm">
                      <div className="flex-1">
                        <p className="text-gray-eske-80">{item.description}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${item.impact === 'high' ? 'bg-red-200 text-red-800' : item.impact === 'low' ? 'bg-gray-200 text-gray-600' : 'bg-yellow-200 text-yellow-800'}`}>
                            {item.impact === 'high' ? 'Alto' : item.impact === 'low' ? 'Bajo' : 'Medio'}
                          </span>
                          {item.actionable && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">Accionable</span>}
                        </div>
                        {item.suggestedAction && <p className="text-xs text-gray-eske-50 mt-1">→ {item.suggestedAction}</p>}
                      </div>
                      <button onClick={() => onRemove(category, index)} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-eske-50 italic">Sin elementos</p>}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">{FODA_CATEGORIES[activeCategory].icon} Agregar a {FODA_CATEGORIES[activeCategory].label}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Descripción *</label>
                <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">Impacto</label>
                  <select value={form.impact || 'medium'} onChange={(e) => setForm({ ...form, impact: e.target.value as FODAItem['impact'] })} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske">
                    <option value="high">Alto</option>
                    <option value="medium">Medio</option>
                    <option value="low">Bajo</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.actionable ?? true} onChange={(e) => setForm({ ...form, actionable: e.target.checked })} className="w-4 h-4" />
                    <span className="text-sm">¿Accionable?</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Acción sugerida</label>
                <input type="text" value={form.suggestedAction || ''} onChange={(e) => setForm({ ...form, suggestedAction: e.target.value })} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg" />
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

// ============================================================
// TAB: PESTEL (usa string[], no objetos)
// ============================================================

interface TabPESTELProps {
  pestel: PESTELAnalysis | undefined;
  onAdd: (category: keyof PESTELAnalysis, item: string) => void;
  onRemove: (category: keyof PESTELAnalysis, index: number) => void;
}

function TabPESTEL({ pestel, onAdd, onRemove }: TabPESTELProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof PESTEL_CATEGORIES>('political');
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAdd(activeCategory, newItem.trim());
    setNewItem('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">Análisis PESTEL</h3>
        <p className="text-sm text-gray-eske-50">Factores Políticos, Económicos, Sociales, Tecnológicos, Ambientales y Legales</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(PESTEL_CATEGORIES) as Array<keyof typeof PESTEL_CATEGORIES>).map((cat) => {
          const config = PESTEL_CATEGORIES[cat];
          const count = pestel?.[cat]?.length || 0;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat ? `${config.color} ring-2 ring-offset-1` : 'bg-gray-eske-10 text-gray-eske-60 hover:bg-gray-eske-20'}`}>
              {config.label} {count > 0 && <span className="ml-1 px-1.5 py-0.5 bg-white/50 rounded text-xs">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="bg-gray-eske-10 rounded-lg p-4">
        <h4 className={`font-medium ${PESTEL_CATEGORIES[activeCategory].color} px-2 py-1 rounded inline-block mb-4`}>
          Factores {PESTEL_CATEGORIES[activeCategory].label}es
        </h4>
        <div className="flex gap-2 mb-4">
          <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder={`Agregar factor ${PESTEL_CATEGORIES[activeCategory].label.toLowerCase()}...`}
            className="flex-1 px-3 py-2 border border-gray-eske-30 rounded-lg" />
          <button onClick={handleAdd} disabled={!newItem.trim()} className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Agregar</button>
        </div>
        {(pestel?.[activeCategory]?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {pestel?.[activeCategory]?.map((item, index) => (
              <div key={index} className="bg-white-eske rounded-lg p-3 flex items-center justify-between gap-3">
                <p className="text-gray-eske-80 flex-1">{item}</p>
                <button onClick={() => onRemove(activeCategory, index)} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
              </div>
            ))}
          </div>
        ) : <p className="text-center py-6 text-gray-eske-50">Sin factores agregados</p>}
      </div>
    </div>
  );
}

// ============================================================
// TAB: VIABILIDAD
// ============================================================

interface TabViabilidadProps {
  assessment: ViabilityAssessment | undefined;
  recommendation: DiagnosticoData['recommendation'] | undefined;
  recommendationRationale: string | undefined;
  onChangeAssessment: (updates: Partial<ViabilityAssessment>) => void;
  onChangeRecommendation: (rec: DiagnosticoData['recommendation']) => void;
  onChangeRationale: (rationale: string) => void;
  onAddRisk: (risk: Risk) => void;
  onRemoveRisk: (index: number) => void;
}

function TabViabilidad({ assessment, recommendation, recommendationRationale, onChangeAssessment, onChangeRecommendation, onChangeRationale, onAddRisk, onRemoveRisk }: TabViabilidadProps) {
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [riskForm, setRiskForm] = useState<Partial<Risk>>({});

  const criteria = [
    { id: 'resourcesAvailable' as const, label: '¿Recursos disponibles?', desc: 'Recursos humanos, financieros y materiales' },
    { id: 'timeframeFeasible' as const, label: '¿Tiempo factible?', desc: 'Cronograma realista' },
    { id: 'audienceReachable' as const, label: '¿Audiencia alcanzable?', desc: 'Puedes llegar a tu audiencia objetivo' },
    { id: 'competitiveAdvantage' as const, label: '¿Ventaja competitiva?', desc: 'Ventaja clara sobre competencia' },
  ];

  const handleRiskSubmit = () => {
    if (!riskForm.description?.trim()) return;
    onAddRisk({
      description: riskForm.description.trim(),
      probability: riskForm.probability || 'medium',
      impact: riskForm.impact || 'medium',
      mitigation: riskForm.mitigation?.trim(),
    });
    setRiskForm({});
    setShowRiskForm(false);
  };

  const score = [assessment?.resourcesAvailable, assessment?.timeframeFeasible, assessment?.audienceReachable, assessment?.competitiveAdvantage].filter(Boolean).length;
  const scorePercent = Math.round((score / 4) * 100);

  const recConfig: Record<string, { label: string; color: string; icon: string }> = {
    proceed: { label: 'Proceder', color: 'bg-green-100 text-green-800 border-green-300', icon: '✅' },
    'proceed-with-caution': { label: 'Con precaución', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⚠️' },
    pivot: { label: 'Pivotar', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🔄' },
    archive: { label: 'Archivar', color: 'bg-red-100 text-red-800 border-red-300', icon: '📦' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">Evaluación de Viabilidad</h3>
        <p className="text-sm text-gray-eske-50">Evalúa cada criterio para determinar si el proyecto es viable</p>
      </div>

      {/* Criterios booleanos */}
      <div className="space-y-3">
        {criteria.map((c) => (
          <div key={c.id} className="bg-gray-eske-10 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={assessment?.[c.id] ?? false} onChange={(e) => onChangeAssessment({ [c.id]: e.target.checked })} className="mt-1 w-5 h-5 text-bluegreen-eske rounded" />
              <div>
                <p className="font-medium text-gray-eske-80">{c.label}</p>
                <p className="text-sm text-gray-eske-50">{c.desc}</p>
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* Score */}
      <div className="bg-bluegreen-eske/10 rounded-lg p-6 text-center">
        <p className="text-sm text-bluegreen-eske mb-1">Puntuación de Viabilidad</p>
        <p className={`text-5xl font-bold ${scorePercent >= 75 ? 'text-green-600' : scorePercent >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{scorePercent}%</p>
      </div>

      {/* Riesgos */}
      <div className="bg-red-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-red-800">Riesgos Identificados</h4>
          <button onClick={() => setShowRiskForm(true)} className="text-xs px-3 py-1.5 bg-red-600 text-white-eske rounded-lg">+ Agregar</button>
        </div>
        {(assessment?.risks?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {assessment?.risks?.map((risk, i) => (
              <div key={i} className="bg-white-eske rounded p-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-gray-eske-80">{risk.description}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${risk.probability === 'high' ? 'bg-red-200 text-red-800' : risk.probability === 'low' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      Prob: {risk.probability === 'high' ? 'Alta' : risk.probability === 'low' ? 'Baja' : 'Media'}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${risk.impact === 'high' ? 'bg-red-200 text-red-800' : risk.impact === 'low' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      Impacto: {risk.impact === 'high' ? 'Alto' : risk.impact === 'low' ? 'Bajo' : 'Medio'}
                    </span>
                  </div>
                  {risk.mitigation && <p className="text-xs text-gray-eske-50 mt-1">Mitigación: {risk.mitigation}</p>}
                </div>
                <button onClick={() => onRemoveRisk(i)} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-red-700 italic">Sin riesgos</p>}
      </div>

      {/* Modal riesgo */}
      {showRiskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar Riesgo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <textarea value={riskForm.description || ''} onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Probabilidad</label>
                  <select value={riskForm.probability || 'medium'} onChange={(e) => setRiskForm({ ...riskForm, probability: e.target.value as Risk['probability'] })} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske">
                    <option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Impacto</label>
                  <select value={riskForm.impact || 'medium'} onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value as Risk['impact'] })} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske">
                    <option value="high">Alto</option><option value="medium">Medio</option><option value="low">Bajo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mitigación</label>
                <input type="text" value={riskForm.mitigation || ''} onChange={(e) => setRiskForm({ ...riskForm, mitigation: e.target.value })} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowRiskForm(false); setRiskForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleRiskSubmit} disabled={!riskForm.description?.trim()} className="flex-1 px-4 py-2.5 bg-red-600 text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Recomendación */}
      <div>
        <label className="block text-sm font-medium text-gray-eske-80 mb-3">Recomendación <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-3">
          {(['proceed', 'proceed-with-caution', 'pivot', 'archive'] as const).map((rec) => {
            const cfg = recConfig[rec];
            const isSelected = recommendation === rec;
            return (
              <button key={rec} onClick={() => onChangeRecommendation(rec)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${isSelected ? `${cfg.color} border-current` : 'bg-white-eske border-gray-eske-20 hover:border-gray-eske-40'}`}>
                <span className="text-2xl mb-2 block">{cfg.icon}</span>
                <span className="font-medium block">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Justificación */}
      <div>
        <label className="block text-sm font-medium text-gray-eske-80 mb-1">Justificación</label>
        <textarea value={recommendationRationale || ''} onChange={(e) => onChangeRationale(e.target.value)} placeholder="Explica tu decisión..." rows={3} className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg resize-none" />
      </div>
    </div>
  );
}

// ============================================================
// TAB: ÉTICA
// ============================================================

interface TabEticaProps {
  ethics: EthicsAssessment | undefined;
  onChangeEthics: (updates: Partial<EthicsAssessment>) => void;
  onAddConcern: (concern: EthicsConcern) => void;
  onRemoveConcern: (index: number) => void;
  onAddCommitment: (commitment: string) => void;
  onRemoveCommitment: (index: number) => void;
}

function TabEtica({ ethics, onChangeEthics, onAddConcern, onRemoveConcern, onAddCommitment, onRemoveCommitment }: TabEticaProps) {
  const [showConcernForm, setShowConcernForm] = useState(false);
  const [concernForm, setConcernForm] = useState<Partial<EthicsConcern>>({});
  const [newCommitment, setNewCommitment] = useState('');

  const handleConcernSubmit = () => {
    if (!concernForm.description?.trim() || !concernForm.area) return;
    onAddConcern({
      area: concernForm.area,
      description: concernForm.description.trim(),
      severity: concernForm.severity || 'warning',
      recommendation: concernForm.recommendation?.trim(),
    });
    setConcernForm({});
    setShowConcernForm(false);
  };

  const handleAddCommitment = () => {
    if (!newCommitment.trim()) return;
    onAddCommitment(newCommitment.trim());
    setNewCommitment('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">Consideraciones Éticas</h3>
        <p className="text-sm text-gray-eske-50">Preocupaciones éticas y compromisos del proyecto</p>
      </div>

      {/* Check ético */}
      <div className="bg-gray-eske-10 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={ethics?.passesEthicsCheck ?? false} onChange={(e) => onChangeEthics({ passesEthicsCheck: e.target.checked })} className="w-5 h-5 text-bluegreen-eske rounded" />
          <div>
            <p className="font-medium text-gray-eske-80">¿El proyecto pasa la evaluación ética?</p>
            <p className="text-sm text-gray-eske-50">Marca si consideras que es éticamente viable</p>
          </div>
        </label>
      </div>

      {/* Preocupaciones (concerns) */}
      <div className="bg-orange-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-orange-800">Preocupaciones Éticas</h4>
          <button onClick={() => setShowConcernForm(true)} className="text-xs px-3 py-1.5 bg-orange-600 text-white-eske rounded-lg">+ Agregar</button>
        </div>
        {(ethics?.concerns?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {ethics?.concerns?.map((concern, i) => (
              <div key={i} className="bg-white-eske rounded p-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex gap-2 mb-1">
                    <span className="text-xs px-1.5 py-0.5 bg-orange-200 text-orange-800 rounded">{ETHICS_AREAS[concern.area]}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${concern.severity === 'blocking' ? 'bg-red-200 text-red-800' : concern.severity === 'note' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-200 text-yellow-800'}`}>
                      {concern.severity === 'blocking' ? 'Bloqueante' : concern.severity === 'note' ? 'Nota' : 'Advertencia'}
                    </span>
                  </div>
                  <p className="text-gray-eske-80">{concern.description}</p>
                  {concern.recommendation && <p className="text-xs text-gray-eske-50 mt-1">→ {concern.recommendation}</p>}
                </div>
                <button onClick={() => onRemoveConcern(i)} className="text-orange-400 hover:text-orange-600 shrink-0">✕</button>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-orange-700 italic">Sin preocupaciones</p>}
      </div>

      {/* Modal concern */}
      {showConcernForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar Preocupación</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Área *</label>
                  <select value={concernForm.area || ''} onChange={(e) => setConcernForm({ ...concernForm, area: e.target.value as EthicsConcern['area'] })} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske">
                    <option value="">Seleccionar...</option>
                    {Object.entries(ETHICS_AREAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Severidad</label>
                  <select value={concernForm.severity || 'warning'} onChange={(e) => setConcernForm({ ...concernForm, severity: e.target.value as EthicsConcern['severity'] })} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske">
                    <option value="note">Nota</option><option value="warning">Advertencia</option><option value="blocking">Bloqueante</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <textarea value={concernForm.description || ''} onChange={(e) => setConcernForm({ ...concernForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Recomendación</label>
                <input type="text" value={concernForm.recommendation || ''} onChange={(e) => setConcernForm({ ...concernForm, recommendation: e.target.value })} className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowConcernForm(false); setConcernForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleConcernSubmit} disabled={!concernForm.description?.trim() || !concernForm.area} className="flex-1 px-4 py-2.5 bg-orange-600 text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Compromisos */}
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-3">Compromisos Éticos</h4>
        <div className="flex gap-2 mb-3">
          <input type="text" value={newCommitment} onChange={(e) => setNewCommitment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCommitment())}
            placeholder="Ej: Solo información verificada" className="flex-1 px-3 py-2 border border-green-200 rounded-lg" />
          <button onClick={handleAddCommitment} disabled={!newCommitment.trim()} className="px-4 py-2 bg-green-600 text-white-eske rounded-lg disabled:bg-gray-eske-20">Agregar</button>
        </div>
        {(ethics?.commitments?.length ?? 0) > 0 && (
          <ul className="space-y-2">
            {ethics?.commitments?.map((item, i) => (
              <li key={i} className="flex items-center justify-between bg-white-eske rounded p-2">
                <span className="text-green-800">✓ {item}</span>
                <button onClick={() => onRemoveCommitment(i)} className="text-green-400 hover:text-green-600">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

