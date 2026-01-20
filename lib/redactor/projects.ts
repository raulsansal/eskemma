// lib/redactor/projects.ts
/**
 * ============================================
 * GESTIÓN DE PROYECTOS - REDACTOR POLÍTICO
 * ============================================
 * 
 * Módulo para CRUD completo de proyectos del Redactor Político.
 * Incluye validación, rate limiting y manejo de estados.
 * 
 * @module lib/redactor/projects
 * @author Eskemma
 * @version 3.0.0
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import type { 
  RedactorProject, 
  CreateProjectInput,
  ProjectConfiguration,
} from "@/types/redactor.types";
import { COLLECTIONS } from "./constants";

// ============================================
// HELPERS
// ============================================

/**
 * ⭐ Elimina campos undefined de un objeto
 * Firestore no permite undefined, solo acepta null
 * 
 * @param obj - Objeto a limpiar
 * @returns Objeto sin campos undefined
 */
function removeUndefined<T extends Record<string, any>>(obj: T): T {
  // Crear copia del objeto sin tipado estricto para manipulación
  const cleaned: Record<string, any> = { ...obj };
  
  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];
    
    if (value === undefined) {
      delete cleaned[key];
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      // Recursivo para objetos anidados (excepto Date)
      cleaned[key] = removeUndefined(value);
    }
  });
  
  // Retornar con el tipo original
  return cleaned as T;
}

// ============================================
// CREAR PROYECTO
// ============================================

/**
 * Crea un nuevo proyecto para el usuario
 * 
 * @param userId - ID del usuario propietario
 * @param input - Datos del proyecto (nombre, descripción)
 * @returns Proyecto creado con ID asignado
 * @throws Error si falla la creación
 * 
 * @example
 * ```typescript
 * const proyecto = await createProject("user123", {
 *   name: "Campaña Gubernatura 2025",
 *   description: "Proyecto principal de comunicación"
 * });
 * ```
 */
export async function createProject(
  userId: string,
  input: CreateProjectInput
): Promise<RedactorProject> {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    
    const now = new Date();
    
    const newProjectData = {
      userId,
      name: input.name.trim(),
      description: input.description?.trim() || "",
      configuration: null,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      lastAccessedAt: Timestamp.fromDate(now),
      stats: {
        totalGenerations: 0,
        lastGenerationAt: null,
      },
      isActive: false,
      isArchived: false,
    };

    const docRef = await addDoc(projectsRef, newProjectData);
    
    // Retornar proyecto con tipos correctos
    const newProject: RedactorProject = {
      id: docRef.id,
      userId,
      name: input.name.trim(),
      description: input.description?.trim() || "",
      configuration: null as unknown as ProjectConfiguration,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
      stats: {
        totalGenerations: 0,
        lastGenerationAt: null, // ⭐ null (ahora compatible)
      },
      isActive: false,
      isArchived: false,
    };
    
    return newProject;
  } catch (error) {
    console.error("[createProject] Error:", error);
    throw new Error("No se pudo crear el proyecto");
  }
}

// ============================================
// OBTENER PROYECTOS
// ============================================

/**
 * Obtiene todos los proyectos activos de un usuario
 * 
 * @param userId - ID del usuario
 * @returns Array de proyectos ordenados por último acceso
 * @throws Error si falla la consulta
 * 
 * @example
 * ```typescript
 * const proyectos = await getUserProjects("user123");
 * console.log(`Tienes ${proyectos.length} proyectos`);
 * ```
 */
export async function getUserProjects(userId: string): Promise<RedactorProject[]> {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(
      projectsRef,
      where("userId", "==", userId),
      where("isArchived", "==", false),
      orderBy("lastAccessedAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      
      const project: RedactorProject = {
        id: docSnapshot.id,
        userId: data.userId,
        name: data.name,
        description: data.description || "",
        configuration: data.configuration as ProjectConfiguration,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
        stats: {
          totalGenerations: data.stats?.totalGenerations || 0,
          lastGenerationAt: data.stats?.lastGenerationAt?.toDate() || null, // ⭐ || null
        },
        isActive: data.isActive || false,
        isArchived: data.isArchived || false,
      };
      
      return project;
    });
  } catch (error) {
    console.error("[getUserProjects] Error:", error);
    throw new Error("No se pudieron cargar los proyectos");
  }
}

/**
 * Obtiene un proyecto específico por ID
 * 
 * @param projectId - ID del proyecto
 * @returns Proyecto encontrado o null si no existe
 * 
 * @example
 * ```typescript
 * const proyecto = await getProject("proj_abc123");
 * if (proyecto) {
 *   console.log(proyecto.name);
 * }
 * ```
 */
export async function getProject(projectId: string): Promise<RedactorProject | null> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    const snapshot = await getDoc(projectRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    
    const project: RedactorProject = {
      id: snapshot.id,
      userId: data.userId,
      name: data.name,
      description: data.description || "",
      configuration: data.configuration as ProjectConfiguration,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
      stats: {
        totalGenerations: data.stats?.totalGenerations || 0,
        lastGenerationAt: data.stats?.lastGenerationAt?.toDate() || null, // ⭐ || null
      },
      isActive: data.isActive || false,
      isArchived: data.isArchived || false,
    };
    
    return project;
  } catch (error) {
    console.error("[getProject] Error:", error);
    return null;
  }
}

// ============================================
// ACTUALIZAR PROYECTO
// ============================================

/**
 * Actualiza la configuración de un proyecto
 * 
 * @param projectId - ID del proyecto
 * @param configuration - Nueva configuración
 * @throws Error si falla la actualización
 */
export async function updateProjectConfiguration(
  projectId: string,
  configuration: ProjectConfiguration
): Promise<void> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    
    // ⭐ Limpiar undefined antes de guardar en Firestore
    const cleanConfig = removeUndefined(configuration);
    
    await updateDoc(projectRef, {
      configuration: cleanConfig,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("[updateProjectConfiguration] Error:", error);
    throw new Error("No se pudo actualizar la configuración");
  }
}

/**
 * Actualiza nombre y/o descripción de un proyecto
 * 
 * @param projectId - ID del proyecto
 * @param updates - Campos a actualizar
 */
export async function updateProjectInfo(
  projectId: string,
  updates: { name?: string; description?: string }
): Promise<void> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    
    const data: any = {
      updatedAt: serverTimestamp(),
    };
    
    if (updates.name !== undefined) {
      data.name = updates.name.trim();
    }
    
    if (updates.description !== undefined) {
      data.description = updates.description.trim();
    }
    
    await updateDoc(projectRef, data);
  } catch (error) {
    console.error("[updateProjectInfo] Error:", error);
    throw new Error("No se pudo actualizar el proyecto");
  }
}

// ============================================
// GESTIÓN DE ESTADO
// ============================================

/**
 * Marca un proyecto como activo y desactiva todos los demás
 * 
 * @param userId - ID del usuario
 * @param projectId - ID del proyecto a activar
 * @throws Error si falla la operación
 * 
 * @example
 * ```typescript
 * await setActiveProject("user123", "proj_abc");
 * // Ahora proj_abc es el único proyecto activo
 * ```
 */
export async function setActiveProject(
  userId: string,
  projectId: string
): Promise<void> {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((docSnapshot) => {
      const ref = doc(db, COLLECTIONS.PROJECTS, docSnapshot.id);
      const isThisProject = docSnapshot.id === projectId;
      
      batch.update(ref, {
        isActive: isThisProject,
        lastAccessedAt: isThisProject ? serverTimestamp() : docSnapshot.data().lastAccessedAt,
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error("[setActiveProject] Error:", error);
    throw new Error("No se pudo activar el proyecto");
  }
}

/**
 * Archiva un proyecto (soft delete)
 * 
 * @param projectId - ID del proyecto
 */
export async function archiveProject(projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    
    await updateDoc(projectRef, {
      isArchived: true,
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("[archiveProject] Error:", error);
    throw new Error("No se pudo archivar el proyecto");
  }
}

/**
 * Elimina permanentemente un proyecto
 * 
 * @param projectId - ID del proyecto
 * @param deleteGenerations - Si true, también elimina generaciones asociadas
 */
export async function deleteProject(
  projectId: string,
  deleteGenerations: boolean = false
): Promise<void> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await deleteDoc(projectRef);
    
    // TODO: Implementar eliminación de generaciones si deleteGenerations = true
    if (deleteGenerations) {
      console.warn("[deleteProject] Eliminación de generaciones no implementada aún");
    }
  } catch (error) {
    console.error("[deleteProject] Error:", error);
    throw new Error("No se pudo eliminar el proyecto");
  }
}

// ============================================
// ESTADÍSTICAS
// ============================================

/**
 * Incrementa el contador de generaciones de un proyecto
 * 
 * @param projectId - ID del proyecto
 */
export async function incrementProjectGenerations(projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    const snapshot = await getDoc(projectRef);
    
    if (!snapshot.exists()) {
      return;
    }
    
    const currentStats = snapshot.data().stats || { totalGenerations: 0 };
    
    await updateDoc(projectRef, {
      "stats.totalGenerations": (currentStats.totalGenerations || 0) + 1,
      "stats.lastGenerationAt": serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("[incrementProjectGenerations] Error:", error);
    // No lanzar error, es un update secundario
  }
}

// ============================================
// VALIDACIONES
// ============================================

/**
 * Verifica si el usuario puede crear más proyectos
 * 
 * @param userId - ID del usuario
 * @param maxProjects - Límite máximo según plan
 * @returns true si puede crear más proyectos
 * 
 * @example
 * ```typescript
 * const canCreate = await canCreateMoreProjects("user123", 5);
 * if (!canCreate) {
 *   alert("Has alcanzado el límite de proyectos");
 * }
 * ```
 */
export async function canCreateMoreProjects(
  userId: string,
  maxProjects: number
): Promise<boolean> {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(
      projectsRef,
      where("userId", "==", userId),
      where("isArchived", "==", false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size < maxProjects;
  } catch (error) {
    console.error("[canCreateMoreProjects] Error:", error);
    return false;
  }
}

/**
 * Obtiene el proyecto activo actual del usuario
 * 
 * @param userId - ID del usuario
 * @returns Proyecto activo o null si no hay ninguno
 */
export async function getActiveProject(userId: string): Promise<RedactorProject | null> {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(
      projectsRef,
      where("userId", "==", userId),
      where("isActive", "==", true),
      where("isArchived", "==", false)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const data = snapshot.docs[0].data();
    
    const project: RedactorProject = {
      id: snapshot.docs[0].id,
      userId: data.userId,
      name: data.name,
      description: data.description || "",
      configuration: data.configuration as ProjectConfiguration,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
      stats: {
        totalGenerations: data.stats?.totalGenerations || 0,
        lastGenerationAt: data.stats?.lastGenerationAt?.toDate() || null, // ⭐ || null
      },
      isActive: data.isActive || false,
      isArchived: data.isArchived || false,
    };
    
    return project;
  } catch (error) {
    console.error("[getActiveProject] Error:", error);
    return null;
  }
}

// ============================================
// BARREL EXPORTS
// ============================================

export default {
  createProject,
  getUserProjects,
  getProject,
  getActiveProject,
  updateProjectConfiguration,
  updateProjectInfo,
  setActiveProject,
  archiveProject,
  deleteProject,
  incrementProjectGenerations,
  canCreateMoreProjects,
};
