// app/moddulo/components/ExportProjectModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useStrategyContext } from './StrategyContextProvider';
import { 
  type ExportFormat, 
  type ExportOptions, 
  type ExportScope,
  DEFAULT_EXPORT_OPTIONS,
  PHASE_NAMES,
  PHASE_ICONS,
  LAYER_NAMES,
  LAYER_COLORS,
  LAYER_PHASES,
  getEffectivePhases,
} from '@/lib/export/export.types';
import { type PhaseId, type LayerId } from '@/types/strategy-context.types';

interface ExportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export default function ExportProjectModal({
  isOpen,
  onClose,
  projectId,
}: ExportProjectModalProps) {
  const { project } = useStrategyContext();
  
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOptions(DEFAULT_EXPORT_OPTIONS);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const handleFormatChange = (format: ExportFormat) => {
    setOptions((prev) => ({ ...prev, format }));
  };

  const handleScopeChange = (scope: ExportScope) => {
    setOptions((prev) => {
      if (scope === 'full') {
        return {
          ...prev,
          scope,
          selectedLayers: ['fundacion', 'estrategia', 'operacion'],
          selectedPhases: [
            'proposito', 'exploracion', 'diagnostico',
            'estrategia', 'tactica', 'planeacion',
            'orquesta', 'pulso', 'evaluacion'
          ],
        };
      }
      return { ...prev, scope };
    });
  };

  const handleLayerToggle = (layerId: LayerId) => {
    setOptions((prev) => {
      const selectedLayers = prev.selectedLayers.includes(layerId)
        ? prev.selectedLayers.filter((l) => l !== layerId)
        : [...prev.selectedLayers, layerId];
      
      const selectedPhases = selectedLayers.flatMap(l => LAYER_PHASES[l]);
      
      return { ...prev, selectedLayers, selectedPhases };
    });
  };

  const handlePhaseToggle = (phaseId: PhaseId) => {
    setOptions((prev) => {
      const selectedPhases = prev.selectedPhases.includes(phaseId)
        ? prev.selectedPhases.filter((p) => p !== phaseId)
        : [...prev.selectedPhases, phaseId];
      return { ...prev, selectedPhases };
    });
  };

  const handleExport = async () => {
    const effectivePhases = getEffectivePhases(options);
    
    if (effectivePhases.length === 0) {
      setError('Selecciona al menos una fase o capa para exportar');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Serializar el proyecto para enviarlo al servidor
      // Los Timestamps de Firebase se serializan automáticamente
      const serializedProject = JSON.parse(JSON.stringify(project));

      const response = await fetch('/api/moddulo/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project: serializedProject, 
          options 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al exportar');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `proyecto_${project.projectName}.${options.format}`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsExporting(false);
    }
  };

  const effectivePhases = getEffectivePhases(options);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white-eske rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-eske-20 bg-linear-to-r from-bluegreen-eske/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-eske-80 flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  Exportar Proyecto
                </h2>
                <p className="text-sm text-gray-eske-50 mt-1">{project.projectName}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-eske-10 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-eske-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ¡Exportación exitosa! El archivo se está descargando...
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Formato */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-eske-80 mb-3">1. Formato de exportación</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleFormatChange('pdf')}
                  className={`p-4 rounded-lg border-2 transition-all ${options.format === 'pdf' ? 'border-bluegreen-eske bg-bluegreen-eske/5' : 'border-gray-eske-20 hover:border-gray-eske-40'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📕</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-eske-80">PDF</p>
                      <p className="text-xs text-gray-eske-50">Documento portable</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleFormatChange('docx')}
                  className={`p-4 rounded-lg border-2 transition-all ${options.format === 'docx' ? 'border-bluegreen-eske bg-bluegreen-eske/5' : 'border-gray-eske-20 hover:border-gray-eske-40'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📘</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-eske-80">DOCX</p>
                      <p className="text-xs text-gray-eske-50">Word editable</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Alcance */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-eske-80 mb-3">2. ¿Qué deseas exportar?</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => handleScopeChange('full')}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${options.scope === 'full' ? 'border-bluegreen-eske bg-bluegreen-eske/5' : 'border-gray-eske-20 hover:border-gray-eske-40'}`}
                >
                  <span className="text-2xl block mb-1">📦</span>
                  <p className="font-medium text-sm text-gray-eske-80">Proyecto completo</p>
                  <p className="text-xs text-gray-eske-50">Las 9 fases</p>
                </button>
                <button
                  onClick={() => handleScopeChange('layers')}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${options.scope === 'layers' ? 'border-bluegreen-eske bg-bluegreen-eske/5' : 'border-gray-eske-20 hover:border-gray-eske-40'}`}
                >
                  <span className="text-2xl block mb-1">📂</span>
                  <p className="font-medium text-sm text-gray-eske-80">Por capas</p>
                  <p className="text-xs text-gray-eske-50">Selecciona capas</p>
                </button>
                <button
                  onClick={() => handleScopeChange('phases')}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${options.scope === 'phases' ? 'border-bluegreen-eske bg-bluegreen-eske/5' : 'border-gray-eske-20 hover:border-gray-eske-40'}`}
                >
                  <span className="text-2xl block mb-1">📄</span>
                  <p className="font-medium text-sm text-gray-eske-80">Por fases</p>
                  <p className="text-xs text-gray-eske-50">Selección libre</p>
                </button>
              </div>

              {/* Selección de capas */}
              {options.scope === 'layers' && (
                <div className="bg-gray-eske-10/50 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-eske-60 mb-2">Selecciona las capas a exportar:</p>
                  {(Object.keys(LAYER_NAMES) as LayerId[]).map((layerId) => {
                    const isSelected = options.selectedLayers.includes(layerId);
                    const phaseCount = LAYER_PHASES[layerId].length;
                    const completedCount = LAYER_PHASES[layerId].filter(p => project.completedPhases.includes(p)).length;

                    return (
                      <button
                        key={layerId}
                        onClick={() => handleLayerToggle(layerId)}
                        className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between ${isSelected ? 'border-bluegreen-eske bg-white-eske' : 'border-gray-eske-20 bg-white-eske hover:border-gray-eske-40'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: LAYER_COLORS[layerId] }} />
                          <div className="text-left">
                            <p className="font-medium text-gray-eske-80">{LAYER_NAMES[layerId]}</p>
                            <p className="text-xs text-gray-eske-50">
                              Fases: {LAYER_PHASES[layerId].map(p => PHASE_NAMES[p]).join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-eske-50">{completedCount}/{phaseCount} completadas</span>
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-xs ${isSelected ? 'bg-bluegreen-eske text-white-eske' : 'bg-gray-eske-20'}`}>
                            {isSelected && '✓'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selección de fases individuales */}
              {options.scope === 'phases' && (
                <div className="bg-gray-eske-10/50 rounded-lg p-4">
                  <p className="text-sm text-gray-eske-60 mb-3">Selecciona las fases a exportar:</p>
                  <div className="space-y-4">
                    {(Object.keys(LAYER_NAMES) as LayerId[]).map((layerId) => (
                      <div key={layerId}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LAYER_COLORS[layerId] }} />
                          <span className="text-xs font-medium text-gray-eske-60 uppercase">{LAYER_NAMES[layerId]}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {LAYER_PHASES[layerId].map((phaseId) => {
                            const isSelected = options.selectedPhases.includes(phaseId);
                            const isCompleted = project.completedPhases.includes(phaseId);

                            return (
                              <button
                                key={phaseId}
                                onClick={() => handlePhaseToggle(phaseId)}
                                className={`p-2 rounded-lg text-left text-sm transition-all ${isSelected ? 'bg-bluegreen-eske/10 border border-bluegreen-eske' : 'bg-white-eske border border-gray-eske-20 hover:border-gray-eske-40'}`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-4 h-4 rounded flex items-center justify-center text-xs ${isSelected ? 'bg-bluegreen-eske text-white-eske' : 'bg-gray-eske-20'}`}>
                                    {isSelected && '✓'}
                                  </span>
                                  <span className="truncate">{PHASE_ICONS[phaseId]} {PHASE_NAMES[phaseId]}</span>
                                </div>
                                <p className="text-xs text-gray-eske-50 mt-1 ml-5">{isCompleted ? '✓ Completada' : 'En progreso'}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Opciones adicionales */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-eske-80 mb-3">3. Opciones adicionales</label>
              <div className="bg-gray-eske-10/50 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeCover}
                    onChange={(e) => setOptions((prev) => ({ ...prev, includeCover: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-eske-30 text-bluegreen-eske focus:ring-bluegreen-eske"
                  />
                  <div>
                    <span className="text-sm text-gray-eske-70">Incluir portada</span>
                    <p className="text-xs text-gray-eske-50">Página inicial con título y logos</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeTableOfContents}
                    onChange={(e) => setOptions((prev) => ({ ...prev, includeTableOfContents: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-eske-30 text-bluegreen-eske focus:ring-bluegreen-eske"
                  />
                  <div>
                    <span className="text-sm text-gray-eske-70">Incluir tabla de contenidos</span>
                    <p className="text-xs text-gray-eske-50">Índice navegable del documento</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeEmptyPhases}
                    onChange={(e) => setOptions((prev) => ({ ...prev, includeEmptyPhases: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-eske-30 text-bluegreen-eske focus:ring-bluegreen-eske"
                  />
                  <div>
                    <span className="text-sm text-gray-eske-70">Incluir fases sin datos</span>
                    <p className="text-xs text-gray-eske-50">Mostrar fases aunque no tengan información</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeProgress}
                    onChange={(e) => setOptions((prev) => ({ ...prev, includeProgress: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-eske-30 text-bluegreen-eske focus:ring-bluegreen-eske"
                  />
                  <div>
                    <span className="text-sm text-gray-eske-70">Mostrar progreso</span>
                    <p className="text-xs text-gray-eske-50">Indicar estado de cada fase (completada/en progreso)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-bluegreen-eske/5 border border-bluegreen-eske/20 rounded-lg p-4">
              <p className="text-sm font-medium text-bluegreen-eske mb-2">Resumen de exportación</p>
              <p className="text-sm text-gray-eske-70">
                Se exportarán <strong>{effectivePhases.length} fase{effectivePhases.length !== 1 ? 's' : ''}</strong> en formato <strong>{options.format.toUpperCase()}</strong>
              </p>
              {effectivePhases.length > 0 && (
                <div className="mt-2 space-y-1">
                  {/* Primera línea: primeras 5 fases */}
                  <p className="text-xs text-gray-eske-50">
                    {effectivePhases.slice(0, 5).map(p => `${PHASE_ICONS[p]} ${PHASE_NAMES[p]}`).join(' • ')}
                  </p>
                  {/* Segunda línea: fases restantes (si hay más de 5) */}
                  {effectivePhases.length > 5 && (
                    <p className="text-xs text-gray-eske-50">
                      {effectivePhases.slice(5).map(p => `${PHASE_ICONS[p]} ${PHASE_NAMES[p]}`).join(' • ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-eske-20 bg-gray-eske-10/30">
            <div className="flex items-center justify-end gap-3">
              <button onClick={onClose} disabled={isExporting} className="px-4 py-2 text-gray-eske-70 hover:bg-gray-eske-20 rounded-lg transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || effectivePhases.length === 0}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isExporting || effectivePhases.length === 0 
                    ? 'bg-gray-eske-20 text-gray-eske-50 cursor-not-allowed' 
                    : 'bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske/90 shadow-sm'
                }`}
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Exportando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar {options.format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
