// app/moddulo/proyecto/[projectId]/estrategia/tactica/page.tsx
"use client";

import React, { useState } from 'react';
import { useStrategyContext, usePhaseData } from '@/app/moddulo/components/StrategyContextProvider';
import {
  PHASE_METADATA,
  LAYER_METADATA,
  type TacticaData,
  type KeyMessage,
  type ChannelStrategy,
  type ContentFormat,
} from '@/types/strategy-context.types';

// ============================================================
// CONSTANTES
// ============================================================

const PHASE = 'tactica';
const LAYER = 'estrategia';
const phaseInfo = PHASE_METADATA[PHASE];
const layerInfo = LAYER_METADATA[LAYER];

const TONE_OPTIONS: Record<KeyMessage['tone'], { label: string; color: string }> = {
  formal: { label: 'Formal', color: 'bg-gray-100 text-gray-800' },
  informal: { label: 'Informal', color: 'bg-blue-100 text-blue-800' },
  emotional: { label: 'Emocional', color: 'bg-pink-100 text-pink-800' },
  rational: { label: 'Racional', color: 'bg-cyan-100 text-cyan-800' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' },
};

const FREQUENCY_OPTIONS: Record<KeyMessage['frequency'], string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  'event-based': 'Por evento',
};

const ROLE_OPTIONS: Record<ChannelStrategy['role'], { label: string; color: string }> = {
  primary: { label: 'Principal', color: 'bg-green-100 text-green-800' },
  secondary: { label: 'Secundario', color: 'bg-blue-100 text-blue-800' },
  support: { label: 'Soporte', color: 'bg-gray-100 text-gray-800' },
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function TacticaPage() {
  const { project, completePhase } = useStrategyContext();
  const { data, updateData, isDirty } = usePhaseData<TacticaData>(PHASE);

  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'mensajes' | 'canales' | 'formatos' | 'calendario'>('mensajes');

  // ============================================================
  // HANDLERS DE DATOS
  // ============================================================

  // Mensajes clave
  const addMessage = (message: KeyMessage) => {
    const current = data?.keyMessages || [];
    updateData({ keyMessages: [...current, message] });
  };

  const removeMessage = (index: number) => {
    const current = data?.keyMessages || [];
    updateData({ keyMessages: current.filter((_, i) => i !== index) });
  };

  const updateMessage = (index: number, updates: Partial<KeyMessage>) => {
    const current = data?.keyMessages || [];
    const updated = current.map((msg, i) => i === index ? { ...msg, ...updates } : msg);
    updateData({ keyMessages: updated });
  };

  // Canales
  const addChannel = (channel: ChannelStrategy) => {
    const current = data?.channels || [];
    updateData({ channels: [...current, channel] });
  };

  const removeChannel = (index: number) => {
    const current = data?.channels || [];
    updateData({ channels: current.filter((_, i) => i !== index) });
  };

  const updateChannel = (index: number, updates: Partial<ChannelStrategy>) => {
    const current = data?.channels || [];
    const updated = current.map((ch, i) => i === index ? { ...ch, ...updates } : ch);
    updateData({ channels: updated });
  };

  // Formatos de contenido
  const addFormat = (format: ContentFormat) => {
    const current = data?.contentFormats || [];
    updateData({ contentFormats: [...current, format] });
  };

  const removeFormat = (index: number) => {
    const current = data?.contentFormats || [];
    updateData({ contentFormats: current.filter((_, i) => i !== index) });
  };

  // Calendario editorial
  const updateCalendarSummary = (value: string) => {
    updateData({ editorialCalendarSummary: value });
  };

  // ============================================================
  // COMPLETAR FASE
  // ============================================================

  const handleCompletePhase = async () => {
    if ((data?.keyMessages?.length ?? 0) === 0) {
      alert('Por favor agrega al menos un mensaje clave.');
      setActiveTab('mensajes');
      return;
    }

    if ((data?.channels?.length ?? 0) === 0) {
      alert('Por favor define al menos un canal de comunicación.');
      setActiveTab('canales');
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
    const total = 4;

    if ((data.keyMessages?.length ?? 0) > 0) completed++;
    if ((data.channels?.length ?? 0) > 0) completed++;
    if ((data.contentFormats?.length ?? 0) > 0) completed++;
    if (data.editorialCalendarSummary?.trim()) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();
  const isPhaseCompleted = project?.completedPhases.includes(PHASE);

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
          <span>Fase 5 de 9</span>
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

      {/* Apps integradas */}
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-800">
          <strong>🔗 Apps disponibles:</strong> Usa <span className="font-semibold">Redactor Político</span> o <span className="font-semibold">Redactor Premium</span> para generar contenido con IA.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-eske-20 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            { id: 'mensajes', label: 'Mensajes Clave', count: data?.keyMessages?.length || 0 },
            { id: 'canales', label: 'Canales', count: data?.channels?.length || 0 },
            { id: 'formatos', label: 'Formatos de Contenido', count: data?.contentFormats?.length || 0 },
            { id: 'calendario', label: 'Calendario Editorial' },
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
        {activeTab === 'mensajes' && (
          <TabMensajes
            messages={data?.keyMessages || []}
            onAdd={addMessage}
            onRemove={removeMessage}
            onUpdate={updateMessage}
          />
        )}
        {activeTab === 'canales' && (
          <TabCanales
            channels={data?.channels || []}
            onAdd={addChannel}
            onRemove={removeChannel}
            onUpdate={updateChannel}
          />
        )}
        {activeTab === 'formatos' && (
          <TabFormatos
            formats={data?.contentFormats || []}
            onAdd={addFormat}
            onRemove={removeFormat}
          />
        )}
        {activeTab === 'calendario' && (
          <TabCalendario
            summary={data?.editorialCalendarSummary}
            onChange={updateCalendarSummary}
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
            disabled={isCompleting || progress < 50}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              progress >= 50
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
// TAB: MENSAJES CLAVE
// ============================================================

interface TabMensajesProps {
  messages: KeyMessage[];
  onAdd: (message: KeyMessage) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<KeyMessage>) => void;
}

function TabMensajes({ messages, onAdd, onRemove, onUpdate }: TabMensajesProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<KeyMessage>>({});

  const handleSubmit = () => {
    if (!form.segment?.trim() || !form.message?.trim()) return;
    onAdd({
      segment: form.segment.trim(),
      message: form.message.trim(),
      tone: form.tone || 'formal',
      frequency: form.frequency || 'weekly',
    });
    setForm({});
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Mensajes Clave por Segmento</h3>
          <p className="text-sm text-gray-eske-50">Define los mensajes específicos para cada audiencia</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar mensaje
        </button>
      </div>

      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="bg-white-eske border border-gray-eske-20 rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-bluegreen-eske/10 text-bluegreen-eske rounded text-xs font-medium">
                    {msg.segment}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${TONE_OPTIONS[msg.tone].color}`}>
                    {TONE_OPTIONS[msg.tone].label}
                  </span>
                  <span className="px-2 py-1 bg-gray-eske-10 text-gray-eske-60 rounded text-xs">
                    {FREQUENCY_OPTIONS[msg.frequency]}
                  </span>
                </div>
                <button onClick={() => onRemove(index)} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
              </div>
              <p className="text-gray-eske-80 leading-relaxed">{msg.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay mensajes clave definidos</p>
          <p className="text-sm text-gray-eske-40">Agrega mensajes específicos para cada segmento de audiencia</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar Mensaje Clave</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Segmento / Audiencia *</label>
                <input
                  type="text"
                  value={form.segment || ''}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  placeholder="Ej: Jóvenes urbanos, Mujeres 35-50..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Mensaje *</label>
                <textarea
                  value={form.message || ''}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="El mensaje específico para este segmento..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">Tono</label>
                  <select
                    value={form.tone || 'formal'}
                    onChange={(e) => setForm({ ...form, tone: e.target.value as KeyMessage['tone'] })}
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske"
                  >
                    {Object.entries(TONE_OPTIONS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">Frecuencia</label>
                  <select
                    value={form.frequency || 'weekly'}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value as KeyMessage['frequency'] })}
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske"
                  >
                    {Object.entries(FREQUENCY_OPTIONS).map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} disabled={!form.segment?.trim() || !form.message?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: CANALES
// ============================================================

interface TabCanalesProps {
  channels: ChannelStrategy[];
  onAdd: (channel: ChannelStrategy) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<ChannelStrategy>) => void;
}

function TabCanales({ channels, onAdd, onRemove, onUpdate }: TabCanalesProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ChannelStrategy>>({});

  const handleSubmit = () => {
    if (!form.channel?.trim()) return;
    onAdd({
      channel: form.channel.trim(),
      role: form.role || 'secondary',
      objective: form.objective?.trim() || '',
      budget: form.budget,
      frequency: form.frequency?.trim() || '',
    });
    setForm({});
    setShowForm(false);
  };

  // Agrupar por rol
  const primaryChannels = channels.filter(c => c.role === 'primary');
  const secondaryChannels = channels.filter(c => c.role === 'secondary');
  const supportChannels = channels.filter(c => c.role === 'support');

  const ChannelCard = ({ channel, index }: { channel: ChannelStrategy; index: number }) => (
    <div className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-eske-80">{channel.channel}</h4>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROLE_OPTIONS[channel.role].color}`}>
            {ROLE_OPTIONS[channel.role].label}
          </span>
        </div>
        <button onClick={() => onRemove(index)} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
      </div>
      {channel.objective && <p className="text-sm text-gray-eske-60 mb-1">📎 {channel.objective}</p>}
      <div className="flex gap-3 text-xs text-gray-eske-50">
        {channel.frequency && <span>📅 {channel.frequency}</span>}
        {channel.budget && <span>💰 ${channel.budget.toLocaleString()}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Estrategia de Canales</h3>
          <p className="text-sm text-gray-eske-50">Define los canales y su rol en la comunicación</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar canal
        </button>
      </div>

      {channels.length > 0 ? (
        <div className="space-y-6">
          {/* Canales principales */}
          {primaryChannels.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Canales Principales ({primaryChannels.length})
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {primaryChannels.map((ch, i) => {
                  const originalIndex = channels.findIndex(c => c === ch);
                  return <ChannelCard key={originalIndex} channel={ch} index={originalIndex} />;
                })}
              </div>
            </div>
          )}

          {/* Canales secundarios */}
          {secondaryChannels.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Canales Secundarios ({secondaryChannels.length})
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {secondaryChannels.map((ch, i) => {
                  const originalIndex = channels.findIndex(c => c === ch);
                  return <ChannelCard key={originalIndex} channel={ch} index={originalIndex} />;
                })}
              </div>
            </div>
          )}

          {/* Canales de soporte */}
          {supportChannels.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Canales de Soporte ({supportChannels.length})
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {supportChannels.map((ch, i) => {
                  const originalIndex = channels.findIndex(c => c === ch);
                  return <ChannelCard key={originalIndex} channel={ch} index={originalIndex} />;
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay canales definidos</p>
          <p className="text-sm text-gray-eske-40">Agrega los canales que usarás para comunicarte</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar Canal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Canal *</label>
                <input
                  type="text"
                  value={form.channel || ''}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  placeholder="Ej: Facebook, Radio local, Mítines..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">Rol</label>
                  <select
                    value={form.role || 'secondary'}
                    onChange={(e) => setForm({ ...form, role: e.target.value as ChannelStrategy['role'] })}
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg bg-white-eske"
                  >
                    {Object.entries(ROLE_OPTIONS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-eske-80 mb-1">Presupuesto</label>
                  <input
                    type="number"
                    value={form.budget || ''}
                    onChange={(e) => setForm({ ...form, budget: parseInt(e.target.value) || undefined })}
                    placeholder="$ estimado"
                    className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Objetivo</label>
                <input
                  type="text"
                  value={form.objective || ''}
                  onChange={(e) => setForm({ ...form, objective: e.target.value })}
                  placeholder="¿Qué objetivo tiene este canal?"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Frecuencia</label>
                <input
                  type="text"
                  value={form.frequency || ''}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  placeholder="Ej: 3 posts/día, 2 spots/hora..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} disabled={!form.channel?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: FORMATOS DE CONTENIDO
// ============================================================

interface TabFormatosProps {
  formats: ContentFormat[];
  onAdd: (format: ContentFormat) => void;
  onRemove: (index: number) => void;
}

function TabFormatos({ formats, onAdd, onRemove }: TabFormatosProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ContentFormat>>({});
  const [newChannel, setNewChannel] = useState('');

  const handleSubmit = () => {
    if (!form.format?.trim()) return;
    onAdd({
      format: form.format.trim(),
      purpose: form.purpose?.trim() || '',
      targetChannels: form.targetChannels || [],
      estimatedQuantity: form.estimatedQuantity || 0,
    });
    setForm({});
    setShowForm(false);
  };

  const addChannelToForm = () => {
    if (!newChannel.trim()) return;
    const current = form.targetChannels || [];
    setForm({ ...form, targetChannels: [...current, newChannel.trim()] });
    setNewChannel('');
  };

  const removeChannelFromForm = (index: number) => {
    const current = form.targetChannels || [];
    setForm({ ...form, targetChannels: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-eske-80">Formatos de Contenido</h3>
          <p className="text-sm text-gray-eske-50">Define los tipos de contenido que producirás</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg text-sm font-medium hover:bg-bluegreen-eske/90"
        >
          + Agregar formato
        </button>
      </div>

      {formats.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formats.map((fmt, index) => (
            <div key={index} className="bg-white-eske border border-gray-eske-20 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-gray-eske-80">{fmt.format}</h4>
                <button onClick={() => onRemove(index)} className="text-gray-eske-40 hover:text-red-500 shrink-0">✕</button>
              </div>
              {fmt.purpose && <p className="text-sm text-gray-eske-60 mb-2">{fmt.purpose}</p>}
              {fmt.estimatedQuantity > 0 && (
                <p className="text-xs text-gray-eske-50 mb-2">📊 Cantidad estimada: {fmt.estimatedQuantity}</p>
              )}
              {fmt.targetChannels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {fmt.targetChannels.map((ch, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-eske-10 text-gray-eske-60 rounded text-xs">{ch}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-eske-10 rounded-lg">
          <p className="text-gray-eske-50 mb-2">No hay formatos de contenido definidos</p>
          <p className="text-sm text-gray-eske-40">Ej: Videos cortos, infografías, posts, comunicados...</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white-eske rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-eske-80 mb-4">Agregar Formato de Contenido</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Formato *</label>
                <input
                  type="text"
                  value={form.format || ''}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                  placeholder="Ej: Video corto, Infografía, Podcast..."
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Propósito</label>
                <input
                  type="text"
                  value={form.purpose || ''}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="¿Para qué se usará este formato?"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Cantidad estimada</label>
                <input
                  type="number"
                  value={form.estimatedQuantity || ''}
                  onChange={(e) => setForm({ ...form, estimatedQuantity: parseInt(e.target.value) || 0 })}
                  placeholder="Número de piezas a producir"
                  className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-eske-80 mb-1">Canales destino</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChannelToForm())}
                    placeholder="Agregar canal..."
                    className="flex-1 px-3 py-2 border border-gray-eske-30 rounded-lg"
                  />
                  <button onClick={addChannelToForm} disabled={!newChannel.trim()} className="px-3 py-2 bg-gray-eske-20 rounded-lg disabled:opacity-50">+</button>
                </div>
                {(form.targetChannels?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.targetChannels?.map((ch, i) => (
                      <span key={i} className="px-2 py-1 bg-bluegreen-eske/10 text-bluegreen-eske rounded text-xs flex items-center gap-1">
                        {ch}
                        <button onClick={() => removeChannelFromForm(i)} className="hover:text-red-500">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm({}); setNewChannel(''); }} className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} disabled={!form.format?.trim()} className="flex-1 px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg disabled:bg-gray-eske-20">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: CALENDARIO EDITORIAL
// ============================================================

interface TabCalendarioProps {
  summary: string | undefined;
  onChange: (value: string) => void;
}

function TabCalendario({ summary, onChange }: TabCalendarioProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-eske-80 mb-1">Resumen del Calendario Editorial</h3>
        <p className="text-sm text-gray-eske-50 mb-4">
          Describe la estrategia general de publicación y los momentos clave
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>💡 Tip:</strong> Usa la app <span className="font-semibold">Calendario</span> para planificar el calendario editorial detallado.
          Aquí solo define el resumen general.
        </p>
      </div>

      <textarea
        value={summary || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Describe tu estrategia de calendario editorial:

• ¿Cuántas publicaciones por semana/día?
• ¿Cuáles son los momentos clave de la campaña?
• ¿Qué hitos o eventos importantes hay?
• ¿Cómo se distribuirá el contenido en el tiempo?`}
        rows={12}
        className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent resize-none"
      />

      {/* Sugerencias de estructura */}
      <div className="bg-gray-eske-10 rounded-lg p-4">
        <h4 className="font-medium text-gray-eske-80 mb-3">Considera incluir:</h4>
        <ul className="space-y-2 text-sm text-gray-eske-60">
          <li className="flex items-start gap-2">
            <span className="text-bluegreen-eske">•</span>
            <span><strong>Fase de lanzamiento:</strong> Primeros días/semanas de comunicación intensiva</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bluegreen-eske">•</span>
            <span><strong>Fase de mantenimiento:</strong> Comunicación constante y programada</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bluegreen-eske">•</span>
            <span><strong>Momentos clave:</strong> Debates, eventos, fechas importantes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bluegreen-eske">•</span>
            <span><strong>Fase de cierre:</strong> Intensificación final de la campaña</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

