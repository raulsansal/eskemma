// lib/export/export.types.ts
/**
 * Tipos para el sistema de exportación de proyectos
 */

import { PhaseId, LayerId } from '@/types/strategy-context.types';

export type ExportFormat = 'docx' | 'pdf';
export type ExportScope = 'full' | 'layers' | 'phases';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  selectedLayers: LayerId[];
  selectedPhases: PhaseId[];
  includeEmptyPhases: boolean;
  includeTimestamps: boolean;
  includeProgress: boolean;
  includeCover: boolean;
  includeTableOfContents: boolean;
}

export interface ExportRequest {
  projectId: string;
  options: ExportOptions;
}

export interface ExportResponse {
  success: boolean;
  filename?: string;
  downloadUrl?: string;
  error?: string;
}

// Rutas de logos (ambos cuadrados para mejor presentación)
export const LOGO_PATHS = {
  eskemma: '/images/esk_sym_csm.png',  // Imagotipo cuadrado
  moddulo: '/icons/icon_Moddulo.png',   // Ícono cuadrado
};

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'pdf',
  scope: 'full',
  selectedLayers: ['fundacion', 'estrategia', 'operacion'],
  selectedPhases: [
    'proposito', 'exploracion', 'diagnostico',
    'estrategia', 'tactica', 'planeacion',
    'orquesta', 'pulso', 'evaluacion'
  ],
  includeEmptyPhases: true,
  includeTimestamps: true,
  includeProgress: true,
  includeCover: true,
  includeTableOfContents: true,
};

// Mapeo de fases a sus nombres legibles
export const PHASE_NAMES: Record<PhaseId, string> = {
  proposito: 'Propósito',
  exploracion: 'Exploración',
  diagnostico: 'Diagnóstico',
  estrategia: 'Estrategia',
  tactica: 'Táctica',
  planeacion: 'Planeación',
  orquesta: 'Orquesta',
  pulso: 'Pulso',
  evaluacion: 'Evaluación',
};

export const PHASE_ICONS: Record<PhaseId, string> = {
  proposito: '🎯',
  exploracion: '🔍',
  diagnostico: '📊',
  estrategia: '♟️',
  tactica: '📋',
  planeacion: '📅',
  orquesta: '🎼',
  pulso: '💓',
  evaluacion: '📈',
};

export const LAYER_NAMES: Record<LayerId, string> = {
  fundacion: 'Fundación',
  estrategia: 'Estrategia',
  operacion: 'Operación',
};

export const LAYER_COLORS: Record<LayerId, string> = {
  fundacion: '#3B82F6',
  estrategia: '#8B5CF6',
  operacion: '#10B981',
};

export const PHASE_TO_LAYER_MAP: Record<PhaseId, LayerId> = {
  proposito: 'fundacion',
  exploracion: 'fundacion',
  diagnostico: 'fundacion',
  estrategia: 'estrategia',
  tactica: 'estrategia',
  planeacion: 'estrategia',
  orquesta: 'operacion',
  pulso: 'operacion',
  evaluacion: 'operacion',
};

export const LAYER_PHASES: Record<LayerId, PhaseId[]> = {
  fundacion: ['proposito', 'exploracion', 'diagnostico'],
  estrategia: ['estrategia', 'tactica', 'planeacion'],
  operacion: ['orquesta', 'pulso', 'evaluacion'],
};

// Helper para obtener las fases efectivas a exportar según el scope
export function getEffectivePhases(options: ExportOptions): PhaseId[] {
  switch (options.scope) {
    case 'full':
      return [
        'proposito', 'exploracion', 'diagnostico',
        'estrategia', 'tactica', 'planeacion',
        'orquesta', 'pulso', 'evaluacion'
      ];
    case 'layers':
      return options.selectedLayers.flatMap(layer => LAYER_PHASES[layer]);
    case 'phases':
      return options.selectedPhases;
    default:
      return options.selectedPhases;
  }
}

