// app/moddulo/proyecto/[projectId]/fundacion/proposito/page.tsx
"use client";

import React, { useState } from 'react';
import { useStrategyContext, usePhaseData } from '@/app/moddulo/components/StrategyContextProvider';
import {
  PHASE_METADATA,
  LAYER_METADATA,
  type PropositoData,
  type AudienceSegment,
} from '@/types/strategy-context.types';

// ============================================================
// CONSTANTES
// ============================================================

const PHASE = 'proposito';
const LAYER = 'fundacion';
const phaseInfo = PHASE_METADATA[PHASE];
const layerInfo = LAYER_METADATA[LAYER];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function PropositoPage() {
  const { project, completePhase, loading: contextLoading } = useStrategyContext();
  const { data, updateData, isDirty } = usePhaseData<PropositoData>(PHASE);

  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'mision' | 'audiencia' | 'valor'>('mision');

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleFieldChange = (field: keyof PropositoData, value: unknown) => {
    updateData({ [field]: value } as Partial<PropositoData>);
  };

  const handleCompletePhase = async () => {
    // Validar campos mínimos
    if (!data?.missionStatement?.trim()) {
      alert('Por favor define la declaración de misión antes de continuar.');
      return;
    }

    if (!data?.primaryAudience?.name?.trim()) {
      alert('Por favor define la audiencia principal antes de continuar.');
      return;
    }

    setIsCompleting(true);
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
    const total = 5;

    if (data.missionStatement?.trim()) completed++;
    if (data.visionStatement?.trim()) completed++;
    if (data.coreValues?.length > 0) completed++;
    if (data.primaryAudience?.name?.trim()) completed++;
    if (data.uniqueValue?.trim()) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();
  const isPhaseCompleted = project?.completedPhases.includes(PHASE);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-eske-60 mb-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: layerInfo.color }}
          />
          <span>{layerInfo.name}</span>
          <span>•</span>
          <span>Fase 1 de 9</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-bluegreen-eske flex items-center gap-3">
              <span className="text-3xl">{phaseInfo.icon}</span>
              {phaseInfo.name}
            </h1>
            <p className="text-gray-eske-70 mt-1">{phaseInfo.description}</p>
            <p className="text-sm text-gray-eske-50 mt-2 italic">
              Pregunta clave: {phaseInfo.question}
            </p>
          </div>

          {isPhaseCompleted && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium shrink-0">
              ✓ Completada
            </span>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-eske-60">Progreso de la fase</span>
            <span className="font-medium" style={{ color: layerInfo.color }}>
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-eske-10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: layerInfo.color }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-eske-20 mb-6">
        <nav className="flex gap-1">
          {[
            { id: 'mision', label: 'Misión y Visión' },
            { id: 'audiencia', label: 'Audiencia' },
            { id: 'valor', label: 'Propuesta de Valor' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-bluegreen-eske text-bluegreen-eske'
                  : 'border-transparent text-gray-eske-60 hover:text-gray-eske-80'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="space-y-6">
        {activeTab === 'mision' && (
          <TabMision data={data} onChange={handleFieldChange} />
        )}
        {activeTab === 'audiencia' && (
          <TabAudiencia data={data} onChange={handleFieldChange} />
        )}
        {activeTab === 'valor' && (
          <TabValor data={data} onChange={handleFieldChange} />
        )}
      </div>

      {/* Footer con acciones */}
      <div className="mt-8 pt-6 border-t border-gray-eske-20 flex items-center justify-between">
        <div className="text-sm text-gray-eske-50">
          {isDirty ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-eske rounded-full" />
              Guardando automáticamente...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Todos los cambios guardados
            </span>
          )}
        </div>

        {!isPhaseCompleted && (
          <button
            onClick={handleCompletePhase}
            disabled={isCompleting || progress < 60}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
              ${progress >= 60
                ? 'bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90 shadow-sm'
                : 'bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed'
              }
            `}
          >
            {isCompleting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Completando...
              </>
            ) : (
              <>
                Completar y continuar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB: MISIÓN Y VISIÓN
// ============================================================

interface TabProps {
  data: PropositoData | undefined;
  onChange: (field: keyof PropositoData, value: unknown) => void;
}

function TabMision({ data, onChange }: TabProps) {
  return (
    <div className="space-y-6">
      {/* Declaración de Misión */}
      <div>
        <label className="block text-sm font-medium text-gray-eske-80 mb-1.5">
          Declaración de Misión <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-eske-50 mb-2">
          ¿Cuál es el propósito central de este proyecto? ¿Qué problema resuelve o qué cambio busca generar?
        </p>
        <textarea
          value={data?.missionStatement || ''}
          onChange={(e) => onChange('missionStatement', e.target.value)}
          placeholder="Ej: Transformar la política local mediante una gestión transparente y participativa que devuelva la confianza ciudadana..."
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-eske-50 mt-1 text-right">
          {data?.missionStatement?.length || 0}/1000
        </p>
      </div>

      {/* Declaración de Visión */}
      <div>
        <label className="block text-sm font-medium text-gray-eske-80 mb-1.5">
          Declaración de Visión
        </label>
        <p className="text-xs text-gray-eske-50 mb-2">
          ¿Cómo se ve el éxito? ¿Qué futuro quieres crear?
        </p>
        <textarea
          value={data?.visionStatement || ''}
          onChange={(e) => onChange('visionStatement', e.target.value)}
          placeholder="Ej: Una ciudad donde cada ciudadano participa activamente en las decisiones que afectan su comunidad..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-eske-50 mt-1 text-right">
          {data?.visionStatement?.length || 0}/500
        </p>
      </div>

      {/* Valores Centrales */}
      <div>
        <label className="block text-sm font-medium text-gray-eske-80 mb-1.5">
          Valores Centrales
        </label>
        <p className="text-xs text-gray-eske-50 mb-2">
          ¿Qué principios guían este proyecto? (máximo 5 valores)
        </p>
        <ValuesInput
          values={data?.coreValues || []}
          onChange={(values) => onChange('coreValues', values)}
          maxValues={5}
        />
      </div>
    </div>
  );
}

// ============================================================
// TAB: AUDIENCIA
// ============================================================

function TabAudiencia({ data, onChange }: TabProps) {
  const updatePrimaryAudience = (updates: Partial<AudienceSegment>) => {
    const current = data?.primaryAudience || {
      name: '',
      description: '',
      priority: 'primary' as const,
    };
    onChange('primaryAudience', { ...current, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Audiencia Principal */}
      <div className="bg-gray-eske-10 rounded-lg p-5">
        <h3 className="font-medium text-bluegreen-eske mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-bluegreen-eske" />
          Audiencia Principal
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-eske-80 mb-1.5">
              Nombre del segmento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.primaryAudience?.name || ''}
              onChange={(e) => updatePrimaryAudience({ name: e.target.value })}
              placeholder="Ej: Jóvenes profesionales urbanos"
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-eske-80 mb-1.5">
              Descripción
            </label>
            <textarea
              value={data?.primaryAudience?.description || ''}
              onChange={(e) => updatePrimaryAudience({ description: e.target.value })}
              placeholder="Describe las características principales de este segmento..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1.5">
                Rango de edad
              </label>
              <input
                type="text"
                value={data?.primaryAudience?.demographics?.ageRange || ''}
                onChange={(e) =>
                  updatePrimaryAudience({
                    demographics: {
                      ...data?.primaryAudience?.demographics,
                      ageRange: e.target.value,
                    },
                  })
                }
                placeholder="Ej: 25-45 años"
                className="w-full px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-eske-80 mb-1.5">
                Ubicación
              </label>
              <input
                type="text"
                value={data?.primaryAudience?.demographics?.location || ''}
                onChange={(e) =>
                  updatePrimaryAudience({
                    demographics: {
                      ...data?.primaryAudience?.demographics,
                      location: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Zona metropolitana"
                className="w-full px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-eske-80 mb-1.5">
              Tamaño estimado
            </label>
            <select
              value={data?.primaryAudience?.size || ''}
              onChange={(e) =>
                updatePrimaryAudience({
                  size: e.target.value as AudienceSegment['size'],
                })
              }
              className="w-full px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent bg-white-eske"
            >
              <option value="">Seleccionar...</option>
              <option value="small">Pequeño (menos de 10,000)</option>
              <option value="medium">Mediano (10,000 - 100,000)</option>
              <option value="large">Grande (más de 100,000)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> En la fase de Exploración podrás definir audiencias secundarias
          y profundizar en el análisis de cada segmento.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// TAB: PROPUESTA DE VALOR
// ============================================================

function TabValor({ data, onChange }: TabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-eske-80 mb-1.5">
          Propuesta de Valor Única
        </label>
        <p className="text-xs text-gray-eske-50 mb-2">
          ¿Qué hace único a este proyecto? ¿Por qué tu audiencia debería elegirte a ti y no a la competencia?
        </p>
        <textarea
          value={data?.uniqueValue || ''}
          onChange={(e) => onChange('uniqueValue', e.target.value)}
          placeholder="Ej: Somos el único partido que combina experiencia de gestión probada con un compromiso genuino de participación ciudadana digital..."
          rows={5}
          maxLength={1000}
          className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-eske-50 mt-1 text-right">
          {data?.uniqueValue?.length || 0}/1000
        </p>
      </div>

      {/* Guía de reflexión */}
      <div className="bg-gray-eske-10 rounded-lg p-5">
        <h4 className="font-medium text-gray-eske-80 mb-3">Preguntas guía:</h4>
        <ul className="space-y-2 text-sm text-gray-eske-70">
          <li className="flex items-start gap-2">
            <span className="text-bluegreen-eske mt-0.5">•</span>
            ¿Qué problema específico resuelves mejor que nadie?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bluegreen-eske mt-0.5">•</span>
            ¿Qué beneficio concreto obtiene tu audiencia al apoyarte?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bluegreen-eske mt-0.5">•</span>
            ¿Qué te diferencia de otros actores en el mismo espacio?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bluegreen-eske mt-0.5">•</span>
            ¿Por qué ahora es el momento adecuado para este proyecto?
          </li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE: VALUES INPUT
// ============================================================

interface ValuesInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  maxValues: number;
}

function ValuesInput({ values, onChange, maxValues }: ValuesInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && values.length < maxValues && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un valor y presiona Enter"
          maxLength={50}
          disabled={values.length >= maxValues}
          className="flex-1 px-4 py-2.5 border border-gray-eske-30 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent disabled:bg-gray-eske-10"
        />
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim() || values.length >= maxValues}
          className="px-4 py-2.5 bg-bluegreen-eske text-white-eske rounded-lg font-medium hover:bg-bluegreen-eske/90 transition-colors disabled:bg-gray-eske-20 disabled:text-gray-eske-50"
        >
          Agregar
        </button>
      </div>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bluegreen-eske/10 text-bluegreen-eske rounded-full text-sm"
            >
              {value}
              <button
                onClick={() => handleRemove(index)}
                className="hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-eske-50 mt-2">
        {values.length}/{maxValues} valores
      </p>
    </div>
  );
}
