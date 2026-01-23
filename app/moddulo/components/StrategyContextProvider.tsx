// app/moddulo/components/StrategyContextProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Timestamp } from 'firebase/firestore';
import {
  getProjectForUser,
  updateProject,
  updatePhaseData as updatePhaseDataFirestore,
  completePhase as completePhaseFirestore,
  archiveProject as archiveProjectFirestore,
  canAccessPhase as canAccessPhaseUtil,
  calculateOverallProgress,
  getNextRecommendedPhase,
  getLayerForPhase,
} from '@/lib/strategy-context';
import {
  PHASE_ORDER,
  PHASE_TO_LAYER,
  type StrategyProject,
  type StrategyContextState,
  type PhaseId,
  type LayerId,
} from '@/types/strategy-context.types';

// ============================================================
// TIPOS DEL CONTEXT
// ============================================================

interface StrategyContextValue extends StrategyContextState {
  // Acciones principales
  loadProject: (projectId: string) => Promise<void>;
  saveProject: () => Promise<void>;
  updatePhaseData: <T>(phase: PhaseId, data: Partial<T>) => void;
  completePhase: (phase: PhaseId) => Promise<{ success: boolean; nextPhase?: PhaseId; error?: string }>;
  goToPhase: (phase: PhaseId) => void;
  archiveProject: () => Promise<void>;

  // Helpers
  canAccessPhase: (phase: PhaseId) => boolean;
  getOverallProgress: () => number;
  getNextPhase: () => PhaseId | null;
  getCurrentLayerId: () => LayerId;
  getPhaseData: <T>(phase: PhaseId) => T | undefined;
}

// ============================================================
// REDUCER
// ============================================================

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: StrategyProject }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_PHASE_DATA'; payload: { phase: PhaseId; data: Record<string, unknown> } }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; payload: string }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'COMPLETE_PHASE'; payload: { phase: PhaseId; nextPhase?: PhaseId } }
  | { type: 'ARCHIVE' }
  | { type: 'RESET' };

const initialState: StrategyContextState = {
  project: null,
  loading: false,
  error: null,
  isDirty: false,
  lastSaved: null,
};

function reducer(state: StrategyContextState, action: Action): StrategyContextState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        loading: false,
        project: action.payload,
        error: null,
        isDirty: false,
        lastSaved: action.payload.updatedAt,
      };

    case 'LOAD_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        project: null,
      };

    case 'UPDATE_PHASE_DATA': {
      if (!state.project) return state;

      const { phase, data } = action.payload;
      const layer = PHASE_TO_LAYER[phase];
      const currentLayerData = state.project[layer] || {};
      const currentPhaseData = (currentLayerData as Record<string, unknown>)[phase] || {};

      return {
        ...state,
        isDirty: true,
        project: {
          ...state.project,
          [layer]: {
            ...currentLayerData,
            [phase]: {
              ...currentPhaseData,
              ...data,
              lastUpdated: Timestamp.now(),
            },
          },
        },
      };
    }

    case 'SAVE_START':
      return {
        ...state,
        loading: true,
      };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        loading: false,
        isDirty: false,
        lastSaved: Timestamp.now(),
        error: null,
      };

    case 'SAVE_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      };

    case 'COMPLETE_PHASE': {
      if (!state.project) return state;

      const { phase, nextPhase } = action.payload;
      const completedPhases = state.project.completedPhases.includes(phase)
        ? state.project.completedPhases
        : [...state.project.completedPhases, phase];

      return {
        ...state,
        isDirty: false,
        project: {
          ...state.project,
          completedPhases,
          currentPhase: nextPhase || state.project.currentPhase,
          status: nextPhase ? state.project.status : 'completed',
          phaseProgress: {
            ...state.project.phaseProgress,
            [phase]: {
              ...state.project.phaseProgress[phase],
              status: 'completed' as const,
              completedAt: Timestamp.now(),
              completionPercentage: 100,
            },
            ...(nextPhase && {
              [nextPhase]: {
                ...state.project.phaseProgress[nextPhase],
                status: 'in-progress' as const,
                startedAt: Timestamp.now(),
                completionPercentage: 0,
              },
            }),
          },
        },
      };
    }

    case 'ARCHIVE':
      if (!state.project) return state;
      return {
        ...state,
        project: {
          ...state.project,
          status: 'archived',
        },
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ============================================================
// CONTEXT
// ============================================================

const StrategyContext = createContext<StrategyContextValue | null>(null);

// ============================================================
// PROVIDER
// ============================================================

interface StrategyContextProviderProps {
  children: ReactNode;
  projectId?: string;
}

export function StrategyContextProvider({ children, projectId }: StrategyContextProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();
  const router = useRouter();

  // Ref para el timer de auto-guardado
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref para evitar múltiples cargas simultáneas
  const loadingRef = useRef(false);

  // ============================================================
  // CARGAR PROYECTO
  // ============================================================

  const loadProject = useCallback(
    async (id: string) => {
      if (!user?.uid) {
        dispatch({ type: 'LOAD_ERROR', payload: 'Usuario no autenticado' });
        return;
      }

      if (loadingRef.current) return;
      loadingRef.current = true;

      dispatch({ type: 'LOAD_START' });

      try {
        const project = await getProjectForUser(id, user.uid);

        if (!project) {
          dispatch({ type: 'LOAD_ERROR', payload: 'Proyecto no encontrado o sin acceso' });
          router.push('/moddulo/proyecto');
          return;
        }

        dispatch({ type: 'LOAD_SUCCESS', payload: project });
      } catch (error) {
        console.error('Error loading project:', error);
        dispatch({
          type: 'LOAD_ERROR',
          payload: error instanceof Error ? error.message : 'Error al cargar el proyecto',
        });
      } finally {
        loadingRef.current = false;
      }
    },
    [user?.uid, router]
  );

  // ============================================================
  // GUARDAR PROYECTO
  // ============================================================

  const saveProject = useCallback(async () => {
    if (!state.project || !state.isDirty) return;

    dispatch({ type: 'SAVE_START' });

    try {
      await updateProject(state.project.id, {
        fundacion: state.project.fundacion,
        estrategia: state.project.estrategia,
        operacion: state.project.operacion,
        phaseProgress: state.project.phaseProgress,
      });

      dispatch({ type: 'SAVE_SUCCESS' });
    } catch (error) {
      console.error('Error saving project:', error);
      dispatch({
        type: 'SAVE_ERROR',
        payload: error instanceof Error ? error.message : 'Error al guardar',
      });
    }
  }, [state.project, state.isDirty]);

  // ============================================================
  // ACTUALIZAR DATOS DE FASE (local + auto-save)
  // ============================================================

  const updatePhaseData = useCallback(
    <T,>(phase: PhaseId, data: Partial<T>) => {
      dispatch({
        type: 'UPDATE_PHASE_DATA',
        payload: { phase, data: data as Record<string, unknown> },
      });

      // Cancelar timer existente
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Nuevo timer de auto-guardado (2 segundos después del último cambio)
      autoSaveTimerRef.current = setTimeout(() => {
        saveProject();
      }, 2000);
    },
    [saveProject]
  );

  // ============================================================
  // COMPLETAR FASE
  // ============================================================

  const completePhase = useCallback(
    async (phase: PhaseId) => {
      if (!state.project) {
        return { success: false, error: 'No hay proyecto cargado' };
      }

      // Guardar cambios pendientes primero
      if (state.isDirty) {
        await saveProject();
      }

      try {
        const result = await completePhaseFirestore(state.project.id, phase);

        if (result.success) {
          dispatch({
            type: 'COMPLETE_PHASE',
            payload: { phase, nextPhase: result.nextPhase },
          });

          // Navegar a la siguiente fase si existe
          if (result.nextPhase) {
            const layer = getLayerForPhase(result.nextPhase);
            router.push(`/moddulo/proyecto/${state.project.id}/${layer}/${result.nextPhase}`);
          }
        }

        return result;
      } catch (error) {
        console.error('Error completing phase:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error al completar la fase',
        };
      }
    },
    [state.project, state.isDirty, saveProject, router]
  );

  // ============================================================
  // NAVEGAR A FASE
  // ============================================================

  const goToPhase = useCallback(
    (phase: PhaseId) => {
      if (!state.project) return;

      // Verificar acceso
      if (!canAccessPhaseUtil(state.project, phase)) {
        console.warn(`No tienes acceso a la fase "${phase}" todavía`);
        return;
      }

      const layer = getLayerForPhase(phase);
      router.push(`/moddulo/proyecto/${state.project.id}/${layer}/${phase}`);
    },
    [state.project, router]
  );

  // ============================================================
  // ARCHIVAR PROYECTO
  // ============================================================

  const archiveProject = useCallback(async () => {
    if (!state.project) return;

    try {
      await archiveProjectFirestore(state.project.id);
      dispatch({ type: 'ARCHIVE' });
      router.push('/moddulo/proyecto');
    } catch (error) {
      console.error('Error archiving project:', error);
    }
  }, [state.project, router]);

  // ============================================================
  // HELPERS
  // ============================================================

  const canAccessPhase = useCallback(
    (phase: PhaseId): boolean => {
      if (!state.project) return false;
      return canAccessPhaseUtil(state.project, phase);
    },
    [state.project]
  );

  const getOverallProgress = useCallback((): number => {
    if (!state.project) return 0;
    return calculateOverallProgress(state.project);
  }, [state.project]);

  const getNextPhase = useCallback((): PhaseId | null => {
    if (!state.project) return null;
    return getNextRecommendedPhase(state.project);
  }, [state.project]);

  const getCurrentLayerId = useCallback((): LayerId => {
    if (!state.project) return 'fundacion';
    return getLayerForPhase(state.project.currentPhase);
  }, [state.project]);

  const getPhaseData = useCallback(
    <T,>(phase: PhaseId): T | undefined => {
      if (!state.project) return undefined;

      const layer = PHASE_TO_LAYER[phase];
      const layerData = state.project[layer];

      if (!layerData) return undefined;

      return (layerData as Record<string, unknown>)[phase] as T | undefined;
    },
    [state.project]
  );

  // ============================================================
  // EFFECTS
  // ============================================================

  // Cargar proyecto cuando cambia projectId
  useEffect(() => {
    if (projectId && user?.uid) {
      loadProject(projectId);
    }

    return () => {
      // Limpiar al desmontar
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [projectId, user?.uid, loadProject]);

  // Limpiar timer de auto-guardado al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Advertir sobre cambios sin guardar al salir
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = '¿Tienes cambios sin guardar. ¿Seguro que quieres salir?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty]);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value: StrategyContextValue = {
    // Estado
    ...state,

    // Acciones
    loadProject,
    saveProject,
    updatePhaseData,
    completePhase,
    goToPhase,
    archiveProject,

    // Helpers
    canAccessPhase,
    getOverallProgress,
    getNextPhase,
    getCurrentLayerId,
    getPhaseData,
  };

  return (
    <StrategyContext.Provider value={value}>
      {children}
    </StrategyContext.Provider>
  );
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Hook principal para acceder al Strategy Context
 */
export function useStrategyContext() {
  const context = useContext(StrategyContext);

  if (!context) {
    throw new Error(
      'useStrategyContext debe usarse dentro de un StrategyContextProvider'
    );
  }

  return context;
}

/**
 * Hook para acceder a los datos de una fase específica
 */
export function usePhaseData<T>(phase: PhaseId) {
  const { project, updatePhaseData, loading, isDirty } = useStrategyContext();

  const phaseData = React.useMemo(() => {
    if (!project) return undefined;

    const layer = PHASE_TO_LAYER[phase];
    const layerData = project[layer];

    if (!layerData) return undefined;

    return (layerData as Record<string, unknown>)[phase] as T | undefined;
  }, [project, phase]);

  const progress = project?.phaseProgress[phase];

  const updateData = useCallback(
    (data: Partial<T>) => {
      updatePhaseData(phase, data as Record<string, unknown>);
    },
    [phase, updatePhaseData]
  );

  return {
    data: phaseData,
    progress,
    loading,
    isDirty,
    updateData,
  };
}

/**
 * Hook para verificar el estado de navegación entre fases
 */
export function usePhaseNavigation() {
  const {
    project,
    canAccessPhase,
    goToPhase,
    completePhase,
    getNextPhase,
    getOverallProgress,
  } = useStrategyContext();

  const currentPhase = project?.currentPhase || 'proposito';
  const completedPhases = project?.completedPhases || [];

  const isPhaseCompleted = useCallback(
    (phase: PhaseId) => completedPhases.includes(phase),
    [completedPhases]
  );

  const isCurrentPhase = useCallback(
    (phase: PhaseId) => currentPhase === phase,
    [currentPhase]
  );

  return {
    currentPhase,
    completedPhases,
    canAccessPhase,
    goToPhase,
    completePhase,
    getNextPhase,
    getOverallProgress,
    isPhaseCompleted,
    isCurrentPhase,
  };
}

/**
 * Hook para el estado de guardado
 */
export function useSaveStatus() {
  const { isDirty, loading, lastSaved, error, saveProject } = useStrategyContext();

  const formattedLastSaved = React.useMemo(() => {
    if (!lastSaved) return null;

    const date = lastSaved.toDate();
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [lastSaved]);

  return {
    isDirty,
    isSaving: loading,
    lastSaved: formattedLastSaved,
    error,
    saveNow: saveProject,
  };
}
