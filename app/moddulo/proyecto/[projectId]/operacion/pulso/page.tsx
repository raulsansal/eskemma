// app/moddulo/proyecto/[projectId]/operacion/pulso/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { useStrategyContext, usePhaseData } from '@/app/moddulo/components/StrategyContextProvider';
import {
  PHASE_METADATA,
  LAYER_METADATA,
  type PulsoData,
  type KPI,
  type Alert,
  type SentimentSummary,
} from '@/types/strategy-context.types';
import { Timestamp } from 'firebase/firestore';

// ============================================================
// CONSTANTES
// ============================================================

const PHASE = 'pulso';
const LAYER = 'operacion';
const phaseInfo = PHASE_METADATA[PHASE];
const layerInfo = LAYER_METADATA[LAYER];

const KPI_CATEGORIES: Record<KPI['category'], { label: string; color: string; icon: string }> = {
  reach: { label: 'Alcance', color: 'bg-blue-100 text-blue-800', icon: '👁️' },
  engagement: { label: 'Interacción', color: 'bg-purple-100 text-purple-800', icon: '💬' },
  conversion: { label: 'Conversión', color: 'bg-green-100 text-green-800', icon: '✅' },
  sentiment: { label: 'Sentimiento', color: 'bg-pink-100 text-pink-800', icon: '❤️' },
  custom: { label: 'Personalizado', color: 'bg-gray-100 text-gray-800', icon: '📊' },
};

const TREND_ICONS: Record<KPI['trend'], { icon: string; color: string }> = {
  up: { icon: '↗️', color: 'text-green-600' },
  down: { icon: '↘️', color: 'text-red-600' },
  stable: { icon: '→', color: 'text-gray-600' },
};

const ALERT_TYPES: Record<Alert['type'], { label: string; color: string; bgColor: string; icon: string }> = {
  info: { label: 'Información', color: 'text-blue-800', bgColor: 'bg-blue-50 border-blue-200', icon: 'ℹ️' },
  warning: { label: 'Advertencia', color: 'text-yellow-800', bgColor: 'bg-yellow-50 border-yellow-200', icon: '⚠️' },
  critical: { label: 'Crítico', color: 'text-red-800', bgColor: 'bg-red-50 border-red-200', icon: '🚨' },
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function PulsoPage() {
  const { project, completePhase } = useStrategyContext();
  const { data, updateData, isDirty } = usePhaseData<PulsoData>(PHASE);

  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kpis' | 'alertas' | 'sentimiento'>('dashboard');

  // ============================================================
  // HANDLERS DE DATOS
  // ============================================================

  // KPIs
  const addKPI = (kpi: Omit<KPI, 'id' | 'lastUpdated'>) => {
    const current = data?.activeKPIs || [];
    const newKPI: KPI = {
      ...kpi,
      id: `kpi_${Date.now()}`,
      lastUpdated: Timestamp.now(),
    };
    updateData({ activeKPIs: [...current, newKPI] });
  };

  const removeKPI = (index: number) => {
    const current = data?.activeKPIs || [];
    updateData({ activeKPIs: current.filter((_, i) => i !== index) });
  };

  const updateKPI = (index: number, updates: Partial<KPI>) => {
    const current = data?.activeKPIs || [];
    const updated = current.map((kpi, i) => 
      i === index ? { ...kpi, ...updates, lastUpdated: Timestamp.now() } : kpi
    );
    updateData({ activeKPIs: updated });
  };

  // Alertas
  const addAlert = (alert: Omit<Alert, 'id' | 'createdAt' | 'acknowledged'>) => {
    const current = data?.activeAlerts || [];
    const newAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}`,
      createdAt: Timestamp.now(),
      acknowledged: false,
    };
    updateData({ activeAlerts: [newAlert, ...current] });
  };

  const acknowledgeAlert = (index: number) => {
    const current = data?.activeAlerts || [];
    const updated = current.map((alert, i) => 
      i === index ? { ...alert, acknowledged: true } : alert
    );
    updateData({ activeAlerts: updated });
  };

  const removeAlert = (index: number) => {
    const current = data?.activeAlerts || [];
    updateData({ activeAlerts: current.filter((_, i) => i !== index) });
  };

  // Sentimiento
  const updateSentiment = (updates: Partial<SentimentSummary>) => {
    const current: SentimentSummary = data?.sentimentSummary || {
      positive: 0,
      neutral: 0,
      negative: 0,
      dominantTopics: [],
      lastUpdated: Timestamp.now(),
    };
    updateData({ 
      sentimentSummary: { ...current, ...updates, lastUpdated: Timestamp.now() } 
    });
  };

  // ============================================================
  // COMPLETAR FASE
  // ============================================================

  const handleCompletePhase = async () => {
    if ((data?.activeKPIs?.length ?? 0) === 0) {
      alert('Por favor configura al menos un KPI para monitorear.');
      setActiveTab('kpis');
      return;
    }

    setIsCompleting(true);
    const result = await completePhase(PHASE);
    if (!result.success) alert(result.error || 'Error al completar la fase');
    setIsCompleting(false);
  };

  // ============================================================
  // CÁLCULO DE PROGRESO Y ESTADÍSTICAS
  // ============================================================

  const calculateProgress = (): number => {
    if (!data) return 0;
    let completed = 0;
    const total = 3;

    if ((data.activeKPIs?.length ?? 0) > 0) completed++;
    if (data.sentimentSummary) completed++;
    if ((data.activeAlerts?.length ?? 0) > 0 || completed >= 2) completed++; // Alertas opcionales

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();
  const isPhaseCompleted = project?.completedPhases.includes(PHASE);

  // Estadísticas de KPIs
  const kpiStats = useMemo(() => {
    const kpis = data?.activeKPIs || [];
    const onTarget = kpis.filter(k => k.currentValue >= k.targetValue).length;
    const belowTarget = kpis.filter(k => k.currentValue < k.targetValue).length;
    const trending = {
      up: kpis.filter(k => k.trend === 'up').length,
      down: kpis.filter(k => k.trend === 'down').length,
      stable: kpis.filter(k => k.trend === 'stable').length,
    };
    return { total: kpis.length, onTarget, belowTarget, trending };
  }, [data?.activeKPIs]);

  // Alertas no reconocidas
  const unacknowledgedAlerts = useMemo(() => {
    return (data?.activeAlerts || []).filter(a => !a.acknowledged).length;
  }, [data?.activeAlerts]);

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
          <span>Fase 8 de 9</span>
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

      {/* Alerta de notificaciones */}
      {unacknowledgedAlerts > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-red-800">
            <strong>🔔 {unacknowledgedAlerts} alerta{unacknowledgedAlerts !== 1 ? 's' : ''} sin reconocer</strong>
          </p>
          <button 
            onClick={() => setActiveTab('alertas')}
            className="text-sm text-red-700 hover:underline"
          >
            Ver alertas →
          </button>
        </div>
      )}

      {/* Apps integradas */}
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-800">
          <strong>🔗 Apps disponibles:</strong> Usa <span className="font-semibold">Escucha</span> para monitoreo de redes y <span className="font-semibold">Encuestas</span> para medir opinión pública.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-eske-20 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'kpis', label: 'KPIs', count: data?.activeKPIs?.length || 0 },
            { id: 'alertas', label: 'Alertas', count: unacknowledgedAlerts, highlight: unacknowledgedAlerts > 0 },
            { id: 'sentimiento', label: 'Sentimiento' },
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
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  tab.highlight ? 'bg-red-500 text-white-eske' : 
                  activeTab === tab.id ? 'bg-bluegreen-eske/20' : 'bg-gray-eske-20'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <TabDashboard
            kpis={data?.activeKPIs || []}
            alerts={data?.activeAlerts || []}
            sentiment={data?.sentimentSummary}
            kpiStats={kpiStats}
          />
        )}
        {activeTab === 'kpis' && (
          <TabKPIs
            kpis={data?.activeKPIs || []}
            onAdd={addKPI}
            onRemove={removeKPI}
            onUpdate={updateKPI}
          />
        )}
        {activeTab === 'alertas' && (
          <TabAlertas
            alerts={data?.activeAlerts || []}
            onAdd={addAlert}
            onAcknowledge={acknowledgeAlert}
            onRemove={removeAlert}
          />
        )}
        {activeTab === 'sentimiento' && (
          <TabSentimiento
            sentiment={data?.sentimentSummary}
            onUpdate={updateSentiment}
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
            disabled={isCompleting || progress < 33}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              progress >= 33
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
// TAB: DASHBOARD
// ============================================================

interface TabDashboardProps {
  kpis: KPI[];
  alerts: Alert[];
  sentiment: SentimentSummary | undefined;
  kpiStats: { total: number; onTarget: number; belowTarget: number; trending: { up: number; down: number; stable: number } };
}

function TabDashboard({ kpis, alerts, sentiment, kpiStats }: TabDashboardProps) {
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4">
          <p className="text-xs text-gray-eske-50 mb-1">KPIs Activos</p>
          <p className="text-2xl font-bold text-bluegreen-eske">{kpiStats.total}</p>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4">
          <p className="text-xs text-gray-eske-50 mb-1">En Meta</p>
          <p className="text-2xl font-bold text-green-600">{kpiStats.onTarget}</p>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4">
          <p className="text-xs text-gray-eske-50 mb-1">Bajo Meta</p>
          <p className="text-2xl font-bold text-red-600">{kpiStats.belowTarget}</p>
        </div>
        <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4">
          <p className="text-xs text-gray-eske-50 mb-1">Alertas Pendientes</p>
          <p className="text-2xl font-bold text-orange-600">{unacknowledgedAlerts.length}</p>
        </div>
      </div>

      {/* KPIs destacados */}
      {kpis.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-eske-80 mb-3">KPIs Principales</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.slice(0, 6).map((kpi, index) => {
              const catInfo = KPI_CATEGORIES[kpi.category];
              const trendInfo = TREND_ICONS[kpi.trend];
              const progressPercent = Math.min(100, Math.round((kpi.currentValue / kpi.targetValue) * 100));
              const isOnTarget = kpi.currentValue >= kpi.targetValue;

              return (
                <div key={index} className="bg-white-eske border border-gray-eske-20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{catInfo.icon}</span>
                      <h4 className="font-medium text-gray-eske-80 text-sm">{kpi.name}</h4>
                    </div>
                    <span className={trendInfo.color}>{trendInfo.icon}</span>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <p className="text-2xl font-bold text-bluegreen-eske">
                      {kpi.currentValue.toLocaleString()}<span className="text-sm font-normal text-gray-eske-50 ml-1">{kpi.unit}</span>
                    </p>
                    <p className="text-sm text-gray-eske-50">Meta: {kpi.targetValue.toLocaleString()}</p>
                  </div>
                  <div className="h-2 bg-gray-eske-10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${isOnTarget ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sentimiento */}
      {sentiment && (
        <div>
          <h3 className="font-medium text-gray-eske-80 mb-3">Resumen de Sentimiento</h3>
          <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div className="bg-green-500" style={{ width: `${sentiment.positive}%` }} />
                  <div className="bg-gray-300" style={{ width: `${sentiment.neutral}%` }} />
                  <div className="bg-red-500" style={{ width: `${sentiment.negative}%` }} />
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">😊 Positivo: {sentiment.positive}%</span>
              <span className="text-gray-600">😐 Neutral: {sentiment.neutral}%</span>
              <span className="text-red-600">😞 Negativo: {sentiment.negative}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Alertas recientes */}
      {unacknowledgedAlerts.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-eske-80 mb-3">Alertas Recientes</h3>
          <div className="space-y-2">
            {unacknowledgedAlerts.slice(0, 3).map((alert, index) => {
              const typeInfo = ALERT_TYPES[alert.type];
              return (
                <div key={index} className={`p-3 rounded-lg border ${typeInfo.bgColor}`}>
                  <div className="flex items-start gap-2">
                    <span>{typeInfo.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${typeInfo.color}`}>{alert.message}</p>
                      <p className="text-xs text-gray-eske-50">Fuente: {alert.source}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {kpis.length === 0 && (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">El dashboard está vacío</p>
          <p className="text-sm text-gray-eske-40">Configura KPIs para comenzar a monitorear tu proyecto</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: KPIs
// ============================================================

interface TabKPIsProps {
  kpis: KPI[];
  onAdd: (kpi: Omit<KPI, 'id' | 'lastUpdated'>) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<KPI>) => void;
}

function TabKPIs({ kpis, onAdd, onRemove, onUpdate }: TabKPIsProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Omit<KPI, 'id' | 'lastUpdated'>>>({});

  const handleSubmit = () => {
    if (!form.name?.trim()) return;
    onAdd({
      name: form.name.trim(),
      category: form.category || 'custom',
      currentValue: form.currentValue || 0,
      targetValue: form.targetValue || 100,
      unit: form.unit?.trim() || '',
      trend: form.trend || 'stable',
    });
    setForm({});
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Indicadores Clave (KPIs)</h3>
          <p className="text-sm text-gray-eske-50">Define y monitorea las métricas importantes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar KPI
        </button>
      </div>

      {kpis.length > 0 ? (
        <div className="space-y-4">
          {kpis.map((kpi, index) => {
            const catInfo = KPI_CATEGORIES[kpi.category];
            const trendInfo = TREND_ICONS[kpi.trend];
            const progressPercent = Math.min(100, Math.round((kpi.currentValue / kpi.targetValue) * 100));
            const isOnTarget = kpi.currentValue >= kpi.targetValue;

            return (
              <div key={index} className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${catInfo.color}`}>
                      {catInfo.icon}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-eske-80">{kpi.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded ${catInfo.color}`}>{catInfo.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={kpi.trend}
                      onChange={(e) => onUpdate(index, { trend: e.target.value as KPI['trend'] })}
                      className="px-2 py-1 border border-gray-eske-20 rounded text-sm"
                    >
                      <option value="up">↗️ Subiendo</option>
                      <option value="down">↘️ Bajando</option>
                      <option value="stable">→ Estable</option>
                    </select>
                    <button onClick={() => onRemove(index)} className="text-gray-eske-40 hover:text-red-500">✕</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-xs text-gray-eske-50">Valor actual</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={kpi.currentValue}
                        onChange={(e) => onUpdate(index, { currentValue: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-eske-20 rounded-lg font-bold text-lg"
                      />
                      <span className="text-sm text-gray-eske-50 shrink-0">{kpi.unit}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-eske-50">Meta</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={kpi.targetValue}
                        onChange={(e) => onUpdate(index, { targetValue: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-eske-20 rounded-lg"
                      />
                      <span className="text-sm text-gray-eske-50 shrink-0">{kpi.unit}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-eske-50">Progreso hacia meta</span>
                    <span className={isOnTarget ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-eske-10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${isOnTarget ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay KPIs configurados</p>
          <p className="text-sm text-gray-eske-40">Agrega indicadores para medir el éxito de tu proyecto</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar KPI</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Seguidores en redes, Votos de intención..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-2">Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(KPI_CATEGORIES).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, category: key as KPI['category'] })}
                      className={`p-2 rounded-lg border text-center text-sm ${
                        form.category === key 
                          ? 'border-bluegreen-eske bg-bluegreen-eske/10' 
                          : 'border-gray-eske-20'
                      }`}
                    >
                      <span className="block mb-1">{info.icon}</span>
                      {info.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">Valor actual</label>
                  <input
                    type="number"
                    value={form.currentValue || ''}
                    onChange={(e) => setForm({ ...form, currentValue: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">Meta</label>
                  <input
                    type="number"
                    value={form.targetValue || ''}
                    onChange={(e) => setForm({ ...form, targetValue: parseFloat(e.target.value) || 0 })}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Unidad</label>
                <input
                  type="text"
                  value={form.unit || ''}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="Ej: %, seguidores, puntos..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} disabled={!form.name?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: ALERTAS
// ============================================================

interface TabAlertasProps {
  alerts: Alert[];
  onAdd: (alert: Omit<Alert, 'id' | 'createdAt' | 'acknowledged'>) => void;
  onAcknowledge: (index: number) => void;
  onRemove: (index: number) => void;
}

function TabAlertas({ alerts, onAdd, onAcknowledge, onRemove }: TabAlertasProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Omit<Alert, 'id' | 'createdAt' | 'acknowledged'>>>({});

  const handleSubmit = () => {
    if (!form.message?.trim()) return;
    onAdd({
      type: form.type || 'info',
      message: form.message.trim(),
      source: form.source?.trim() || 'Manual',
    });
    setForm({});
    setShowForm(false);
  };

  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const acknowledged = alerts.filter(a => a.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Centro de Alertas</h3>
          <p className="text-sm text-gray-eske-50">Monitorea eventos importantes del proyecto</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Crear alerta
        </button>
      </div>

      {/* Alertas sin reconocer */}
      {unacknowledged.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Pendientes ({unacknowledged.length})
          </h4>
          <div className="space-y-2">
            {unacknowledged.map((alert, index) => {
              const originalIndex = alerts.findIndex(a => a === alert);
              const typeInfo = ALERT_TYPES[alert.type];
              return (
                <div key={originalIndex} className={`p-4 rounded-lg border ${typeInfo.bgColor}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{typeInfo.icon}</span>
                      <div>
                        <p className={`font-medium ${typeInfo.color}`}>{alert.message}</p>
                        <p className="text-xs text-gray-eske-50 mt-1">Fuente: {alert.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => onAcknowledge(originalIndex)}
                        className="px-3 py-1 bg-white-eske border border-gray-eske-30 rounded text-xs hover:bg-gray-eske-10"
                      >
                        ✓ Reconocer
                      </button>
                      <button onClick={() => onRemove(originalIndex)} className="text-gray-eske-40 hover:text-red-500">✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas reconocidas */}
      {acknowledged.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-eske-60 mb-3">
            Reconocidas ({acknowledged.length})
          </h4>
          <div className="space-y-2">
            {acknowledged.map((alert, index) => {
              const originalIndex = alerts.findIndex(a => a === alert);
              const typeInfo = ALERT_TYPES[alert.type];
              return (
                <div key={originalIndex} className="p-3 rounded-lg bg-gray-eske-10 opacity-60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span>{typeInfo.icon}</span>
                      <div>
                        <p className="text-sm text-gray-eske-70">{alert.message}</p>
                        <p className="text-xs text-gray-eske-50">Fuente: {alert.source}</p>
                      </div>
                    </div>
                    <button onClick={() => onRemove(originalIndex)} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay alertas</p>
          <p className="text-sm text-gray-eske-40">Las alertas aparecerán aquí cuando se detecten eventos importantes</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Crear Alerta</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-2">Tipo</label>
                <div className="flex gap-2">
                  {Object.entries(ALERT_TYPES).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, type: key as Alert['type'] })}
                      className={`flex-1 p-3 rounded-lg border text-center ${
                        form.type === key 
                          ? info.bgColor + ' border-2' 
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
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Mensaje *</label>
                <textarea
                  value={form.message || ''}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe la alerta..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Fuente</label>
                <input
                  type="text"
                  value={form.source || ''}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="Ej: Redes sociales, Encuesta, Manual..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} disabled={!form.message?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: SENTIMIENTO
// ============================================================

interface TabSentimientoProps {
  sentiment: SentimentSummary | undefined;
  onUpdate: (updates: Partial<SentimentSummary>) => void;
}

function TabSentimiento({ sentiment, onUpdate }: TabSentimientoProps) {
  const [newTopic, setNewTopic] = useState('');

  const total = (sentiment?.positive || 0) + (sentiment?.neutral || 0) + (sentiment?.negative || 0);

  const addTopic = () => {
    if (!newTopic.trim()) return;
    const current = sentiment?.dominantTopics || [];
    onUpdate({ dominantTopics: [...current, newTopic.trim()] });
    setNewTopic('');
  };

  const removeTopic = (index: number) => {
    const current = sentiment?.dominantTopics || [];
    onUpdate({ dominantTopics: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">Análisis de Sentimiento</h3>
        <p className="text-sm text-gray-eske-50">Monitorea la percepción pública sobre tu proyecto</p>
      </div>

      {/* Info */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>💡 Tip:</strong> Usa la app <span className="font-semibold">Escucha</span> para obtener análisis de sentimiento automático de redes sociales.
        </p>
      </div>

      {/* Distribución de sentimiento */}
      <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-6">
        <h4 className="font-medium text-gray-eske-80 mb-4">Distribución de Sentimiento</h4>
        
        <div className="space-y-4">
          {/* Positivo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-eske-70 flex items-center gap-2">
                😊 Positivo
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sentiment?.positive || 0}
                  onChange={(e) => onUpdate({ positive: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-16 px-2 py-1 border border-gray-eske-20 rounded text-center"
                />
                <span className="text-sm text-gray-eske-50">%</span>
              </div>
            </div>
            <div className="h-3 bg-gray-eske-10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${sentiment?.positive || 0}%` }} />
            </div>
          </div>

          {/* Neutral */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-eske-70 flex items-center gap-2">
                😐 Neutral
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sentiment?.neutral || 0}
                  onChange={(e) => onUpdate({ neutral: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-16 px-2 py-1 border border-gray-eske-20 rounded text-center"
                />
                <span className="text-sm text-gray-eske-50">%</span>
              </div>
            </div>
            <div className="h-3 bg-gray-eske-10 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 transition-all" style={{ width: `${sentiment?.neutral || 0}%` }} />
            </div>
          </div>

          {/* Negativo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-eske-70 flex items-center gap-2">
                😞 Negativo
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sentiment?.negative || 0}
                  onChange={(e) => onUpdate({ negative: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-16 px-2 py-1 border border-gray-eske-20 rounded text-center"
                />
                <span className="text-sm text-gray-eske-50">%</span>
              </div>
            </div>
            <div className="h-3 bg-gray-eske-10 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 transition-all" style={{ width: `${sentiment?.negative || 0}%` }} />
            </div>
          </div>
        </div>

        {total !== 100 && total > 0 && (
          <p className="text-xs text-orange-600 mt-4">⚠️ Los porcentajes suman {total}%. Idealmente deberían sumar 100%.</p>
        )}
      </div>

      {/* Temas dominantes */}
      <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-6">
        <h4 className="font-medium text-gray-eske-80 mb-4">Temas Dominantes en la Conversación</h4>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTopic()}
            placeholder="Agregar tema..."
            className="flex-1 px-3 py-2 border border-gray-eske-30 rounded-lg"
          />
          <button onClick={addTopic} disabled={!newTopic.trim()} className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">
            Agregar
          </button>
        </div>

        {(sentiment?.dominantTopics?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sentiment?.dominantTopics?.map((topic, index) => (
              <span key={index} className="px-3 py-1.5 bg-bluegreen-eske/10 text-bluegreen-eske rounded-full text-sm flex items-center gap-2">
                #{topic}
                <button onClick={() => removeTopic(index)} className="hover:text-red-500">✕</button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-eske-40 text-sm">No hay temas dominantes agregados</p>
        )}
      </div>
    </div>
  );
}

