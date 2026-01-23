// lib/strategy-context.ts
/**
 * Funciones CRUD para proyectos estratégicos en Firestore
 * Colección: moddulo_projects
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import {
  PHASE_ORDER,
  PHASE_TO_LAYER,
  type StrategyProject,
  type ProjectSummary,
  type PhaseId,
  type PhaseProgress,
  type ProjectStatus,
  type ProjectMode,
  type CampaignType,
  type UserRole,
  type Jurisdiction,
  type ProjectSettings,
} from '@/types/strategy-context.types';

// ============================================================
// CONSTANTES
// ============================================================

const COLLECTION_NAME = 'moddulo_projects';

const DEFAULT_SETTINGS: ProjectSettings = {
  aiAssistanceLevel: 'balanced',
  preferredLanguage: 'es',
  emailNotifications: true,
  reminderFrequency: 'weekly',
  isShared: false,
  collaborators: [],
  isTemplate: false,
  isPublic: false,
};

const createInitialPhaseProgress = (): Record<PhaseId, PhaseProgress> => ({
  proposito: { status: 'not-started', completionPercentage: 0 },
  exploracion: { status: 'not-started', completionPercentage: 0 },
  diagnostico: { status: 'not-started', completionPercentage: 0 },
  estrategia: { status: 'not-started', completionPercentage: 0 },
  tactica: { status: 'not-started', completionPercentage: 0 },
  planeacion: { status: 'not-started', completionPercentage: 0 },
  orquesta: { status: 'not-started', completionPercentage: 0 },
  pulso: { status: 'not-started', completionPercentage: 0 },
  evaluacion: { status: 'not-started', completionPercentage: 0 },
});

// ============================================================
// CREAR PROYECTO
// ============================================================

export interface CreateProjectInput {
  userId: string;
  projectName: string;
  projectDescription?: string;
  mode: ProjectMode;
  campaignType: CampaignType;
  jurisdiction: Jurisdiction;
  userRole: UserRole;
}

export async function createProject(input: CreateProjectInput): Promise<string> {
  const projectRef = doc(collection(db, COLLECTION_NAME));
  const now = Timestamp.now();

  const newProject: StrategyProject = {
    id: projectRef.id,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,

    projectName: input.projectName,
    projectDescription: input.projectDescription,
    mode: input.mode,
    campaignType: input.campaignType,
    jurisdiction: input.jurisdiction,
    userRole: input.userRole,

    status: 'active',
    viabilityStatus: 'pending',
    currentPhase: 'proposito',
    completedPhases: [],
    phaseProgress: createInitialPhaseProgress(),

    fundacion: {},
    estrategia: {},
    operacion: {},

    uploadedDocuments: [],
    exports: [],

    settings: { ...DEFAULT_SETTINGS },
  };

  await setDoc(projectRef, newProject);
  return projectRef.id;
}

// ============================================================
// LEER PROYECTO
// ============================================================

export async function getProject(projectId: string): Promise<StrategyProject | null> {
  const projectRef = doc(db, COLLECTION_NAME, projectId);
  const snapshot = await getDoc(projectRef);

  if (!snapshot.exists()) {
    return null;
  }

  // Actualizar lastAccessedAt en background (no esperamos)
  updateDoc(projectRef, {
    lastAccessedAt: serverTimestamp(),
  }).catch(console.error);

  return snapshot.data() as StrategyProject;
}

export async function getProjectForUser(
  projectId: string,
  userId: string
): Promise<StrategyProject | null> {
  const project = await getProject(projectId);

  if (!project) {
    return null;
  }

  // Verificar propiedad o colaboración
  const isOwner = project.userId === userId;
  const isCollaborator = project.settings.collaborators.includes(userId);

  if (!isOwner && !isCollaborator) {
    return null;
  }

  return project;
}

// ============================================================
// LISTAR PROYECTOS
// ============================================================

export interface ListProjectsOptions {
  status?: ProjectStatus;
  maxResults?: number;
  includeArchived?: boolean;
}

export async function listUserProjects(
  userId: string,
  options?: ListProjectsOptions
): Promise<ProjectSummary[]> {
  // Construir query con o sin límite
  const baseQuery = options?.maxResults
    ? query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(options.maxResults)
      )
    : query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

  const snapshot = await getDocs(baseQuery);

  let projects = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as StrategyProject;
    return projectToSummary(data);
  });

  // Filtrar por estado
  if (options?.status) {
    projects = projects.filter((p) => p.status === options.status);
  } else if (!options?.includeArchived) {
    projects = projects.filter((p) => p.status !== 'archived');
  }

  return projects;
}

function projectToSummary(project: StrategyProject): ProjectSummary {
  const completedCount = project.completedPhases.length;
  const totalPhases = PHASE_ORDER.length;
  const completionPercentage = Math.round((completedCount / totalPhases) * 100);

  return {
    id: project.id,
    projectName: project.projectName,
    campaignType: project.campaignType,
    jurisdiction: {
      country: project.jurisdiction.country,
      countryName: project.jurisdiction.countryName,
      level: project.jurisdiction.level,
    },
    status: project.status,
    currentPhase: project.currentPhase,
    completionPercentage,
    updatedAt: project.updatedAt,
    createdAt: project.createdAt,
  };
}

// ============================================================
// ACTUALIZAR PROYECTO
// ============================================================

export async function updateProject(
  projectId: string,
  updates: Partial<StrategyProject>
): Promise<void> {
  const projectRef = doc(db, COLLECTION_NAME, projectId);

  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function updatePhaseData<T extends Record<string, unknown>>(
  projectId: string,
  phase: PhaseId,
  data: T
): Promise<void> {
  const projectRef = doc(db, COLLECTION_NAME, projectId);
  const layer = PHASE_TO_LAYER[phase];

  await updateDoc(projectRef, {
    [`${layer}.${phase}`]: data,
    [`phaseProgress.${phase}.lastSavedAt`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updatePhaseProgress(
  projectId: string,
  phase: PhaseId,
  completionPercentage: number
): Promise<void> {
  const projectRef = doc(db, COLLECTION_NAME, projectId);
  const clampedPercentage = Math.min(100, Math.max(0, completionPercentage));

  await updateDoc(projectRef, {
    [`phaseProgress.${phase}.completionPercentage`]: clampedPercentage,
    [`phaseProgress.${phase}.status`]: clampedPercentage > 0 ? 'in-progress' : 'not-started',
    updatedAt: serverTimestamp(),
  });
}

// ============================================================
// COMPLETAR FASE
// ============================================================

export interface CompletePhaseResult {
  success: boolean;
  nextPhase?: PhaseId;
  error?: string;
}

export async function completePhase(
  projectId: string,
  phase: PhaseId
): Promise<CompletePhaseResult> {
  const project = await getProject(projectId);

  if (!project) {
    return { success: false, error: 'Proyecto no encontrado' };
  }

  // Verificar que la fase anterior esté completada (excepto 'proposito')
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  if (phaseIndex > 0) {
    const previousPhase = PHASE_ORDER[phaseIndex - 1];
    if (!project.completedPhases.includes(previousPhase)) {
      return {
        success: false,
        error: `Debe completar la fase "${previousPhase}" primero`,
      };
    }
  }

  // Si es diagnóstico y la recomendación es archivar, marcar como no viable
  if (phase === 'diagnostico') {
    const diagnosticoData = project.fundacion.diagnostico;
    if (diagnosticoData?.recommendation === 'archive') {
      await updateProject(projectId, {
        status: 'archived',
        viabilityStatus: 'not-viable',
      });
      return { success: true };
    }

    // Actualizar viabilityStatus según recomendación
    const viabilityMap: Record<string, StrategyProject['viabilityStatus']> = {
      proceed: 'viable',
      'proceed-with-caution': 'conditional',
      pivot: 'conditional',
    };
    const newViability = diagnosticoData?.recommendation
      ? viabilityMap[diagnosticoData.recommendation] || 'pending'
      : 'pending';

    await updateProject(projectId, { viabilityStatus: newViability });
  }

  // Calcular siguiente fase
  const nextPhaseIndex = phaseIndex + 1;
  const nextPhase = nextPhaseIndex < PHASE_ORDER.length ? PHASE_ORDER[nextPhaseIndex] : undefined;

  // Preparar actualizaciones
  const completedPhases = [...project.completedPhases, phase];
  const now = Timestamp.now();

  const updates: Partial<StrategyProject> & Record<string, unknown> = {
    completedPhases,
    [`phaseProgress.${phase}.status`]: 'completed',
    [`phaseProgress.${phase}.completedAt`]: now,
    [`phaseProgress.${phase}.completionPercentage`]: 100,
  };

  if (nextPhase) {
    updates.currentPhase = nextPhase;
    updates[`phaseProgress.${nextPhase}.status`] = 'in-progress';
    updates[`phaseProgress.${nextPhase}.startedAt`] = now;
  } else {
    // Proyecto completado
    updates.status = 'completed';
  }

  await updateProject(projectId, updates as Partial<StrategyProject>);

  return { success: true, nextPhase };
}

// ============================================================
// ARCHIVAR / ELIMINAR / RESTAURAR
// ============================================================

export async function archiveProject(projectId: string): Promise<void> {
  await updateProject(projectId, { status: 'archived' });
}

export async function restoreProject(projectId: string): Promise<void> {
  await updateProject(projectId, { status: 'active' });
}

export async function pauseProject(projectId: string): Promise<void> {
  await updateProject(projectId, { status: 'paused' });
}

export async function deleteProject(projectId: string): Promise<void> {
  const projectRef = doc(db, COLLECTION_NAME, projectId);
  await deleteDoc(projectRef);
}

// ============================================================
// DUPLICAR PROYECTO
// ============================================================

export async function duplicateProject(
  projectId: string,
  newUserId: string,
  newName: string
): Promise<string> {
  const original = await getProject(projectId);

  if (!original) {
    throw new Error('Proyecto original no encontrado');
  }

  const newProjectId = await createProject({
    userId: newUserId,
    projectName: newName,
    projectDescription: original.projectDescription,
    mode: original.mode,
    campaignType: original.campaignType,
    jurisdiction: original.jurisdiction,
    userRole: original.userRole,
  });

  // Si es plantilla, copiar datos de fases (excepto operación)
  if (original.settings.isTemplate) {
    await updateProject(newProjectId, {
      fundacion: original.fundacion,
      estrategia: original.estrategia,
    });
  }

  return newProjectId;
}

// ============================================================
// UTILIDADES
// ============================================================

export function canAccessPhase(project: StrategyProject, phase: PhaseId): boolean {
  const phaseIndex = PHASE_ORDER.indexOf(phase);

  // Primera fase siempre accesible
  if (phaseIndex === 0) return true;

  // Para otras fases, verificar que la anterior esté completada
  const previousPhase = PHASE_ORDER[phaseIndex - 1];
  return project.completedPhases.includes(previousPhase);
}

export function calculateOverallProgress(project: StrategyProject): number {
  const completedCount = project.completedPhases.length;
  return Math.round((completedCount / PHASE_ORDER.length) * 100);
}

export function getNextRecommendedPhase(project: StrategyProject): PhaseId | null {
  // Buscar primera fase no completada
  for (const phase of PHASE_ORDER) {
    if (!project.completedPhases.includes(phase)) {
      return phase;
    }
  }
  return null;
}

export function getLayerForPhase(phase: PhaseId): 'fundacion' | 'estrategia' | 'operacion' {
  return PHASE_TO_LAYER[phase];
}

export function isProjectViable(project: StrategyProject): boolean {
  return project.viabilityStatus === 'viable' || project.viabilityStatus === 'conditional';
}

export function getPhaseData<T>(project: StrategyProject, phase: PhaseId): T | undefined {
  const layer = PHASE_TO_LAYER[phase];
  const layerData = project[layer] as Record<string, unknown>;
  return layerData?.[phase] as T | undefined;
}
