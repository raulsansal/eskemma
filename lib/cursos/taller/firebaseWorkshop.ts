// lib/taller/firebaseWorkshop.ts
// ============================================================
// UTILIDADES DE FIREBASE PARA EL TALLER
// Maneja progreso, archivos, notas y API keys
// CORREGIDO: Manejo consistente de fechas (string ISO en Firestore)
// ============================================================

import { db, storage } from "../../../firebase/firebaseConfig";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  increment 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { UserWorkshopProgress, FirestoreUser } from "@/types/firestore.types";

const WORKSHOP_ID = "taller-diagnostico-electoral";

/**
 * Obtiene el progreso del usuario en el taller
 */
export async function getWorkshopProgress(userId: string): Promise<UserWorkshopProgress | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data() as FirestoreUser;
    return userData.workshopProgress?.[WORKSHOP_ID] || null;
  } catch (error) {
    console.error("Error al obtener progreso del taller:", error);
    return null;
  }
}

/**
 * Inicia el progreso de un usuario en el taller
 */
export async function startWorkshop(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    const now = new Date().toISOString(); // Guardamos como string ISO
    
    await updateDoc(userRef, {
      [`workshopProgress.${WORKSHOP_ID}`]: {
        startedAt: now,
        lastAccessedAt: now,
        completionPercentage: 0,
        sessionsCompleted: {},
      },
    });
    
    return true;
  } catch (error) {
    console.error("Error al iniciar taller:", error);
    return false;
  }
}

/**
 * Actualiza el progreso del usuario en una sesión
 */
export async function updateSessionProgress(
  userId: string,
  sessionId: string,
  exerciseCompleted?: string
): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }
    
    const now = new Date().toISOString(); // Guardamos como string ISO
    const progressPath = `workshopProgress.${WORKSHOP_ID}`;
    const userData = userDoc.data() as FirestoreUser;
    const currentProgress = userData.workshopProgress?.[WORKSHOP_ID];
    
    // Si no hay progreso, iniciarlo
    if (!currentProgress) {
      await startWorkshop(userId);
    }
    
    // Construir la actualización
    const updates: any = {
      [`${progressPath}.lastAccessedAt`]: now,
    };
    
    // Verificar si la sesión ya estaba completada
    const sessionCompleted = currentProgress?.sessionsCompleted?.[sessionId];
    
    if (!sessionCompleted) {
      // Marcar sesión como completada
      updates[`${progressPath}.sessionsCompleted.${sessionId}`] = {
        completedAt: now,
        exercisesCompleted: exerciseCompleted ? [exerciseCompleted] : [],
      };
      
      // Incrementar porcentaje (estimado: 100% / total sesiones)
      // En una implementación real, obtendrías el total de sesiones de la config
      updates[`${progressPath}.completionPercentage`] = increment(2.5); // ~2.5% por sesión (40 sesiones)
    } else if (exerciseCompleted && !sessionCompleted.exercisesCompleted?.includes(exerciseCompleted)) {
      // Agregar ejercicio completado a sesión existente
      updates[`${progressPath}.sessionsCompleted.${sessionId}.exercisesCompleted`] = 
        arrayUnion(exerciseCompleted);
    }
    
    await updateDoc(userRef, updates);
    return true;
  } catch (error) {
    console.error("Error al actualizar progreso:", error);
    return false;
  }
}

/**
 * Guarda un archivo subido por el usuario para el taller
 */
export async function uploadWorkshopFile(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ path: string; url: string; name: string; size: number }> {
  try {
    // Validar tamaño (50MB máximo)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`El archivo es demasiado grande. Máximo ${MAX_SIZE / (1024 * 1024)}MB`);
    }
    
    // Validar tipo de archivo
    const validTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      throw new Error(`Formato no soportado. Usa: ${validTypes.join(', ')}`);
    }
    
    // Crear referencia en Storage
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `workshops/${WORKSHOP_ID}/${userId}/${fileName}`);
    
    // Subir archivo
    await uploadBytes(storageRef, file);
    
    // Obtener URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Guardar referencia en Firestore
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`workshopProgress.${WORKSHOP_ID}.userData.uploadedFile`]: {
        path: `workshops/${WORKSHOP_ID}/${userId}/${fileName}`,
        name: file.name,
        uploadedAt: new Date().toISOString(), // Guardamos como string ISO
        size: file.size,
      },
      [`workshopProgress.${WORKSHOP_ID}.lastAccessedAt`]: new Date().toISOString(),
    });
    
    return {
      path: `workshops/${WORKSHOP_ID}/${userId}/${fileName}`,
      url: downloadURL,
      name: file.name,
      size: file.size,
    };
  } catch (error) {
    console.error("Error al subir archivo:", error);
    throw error;
  }
}

/**
 * Guarda notas del usuario en una sesión
 */
export async function saveSessionNote(
  userId: string,
  sessionId: string,
  note: string
): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    const now = new Date().toISOString(); // Guardamos como string ISO
    const notesPath = `workshopProgress.${WORKSHOP_ID}.notes.${sessionId}`;
    
    await updateDoc(userRef, {
      [notesPath]: arrayUnion({
        content: note,
        createdAt: now,
      }),
      [`workshopProgress.${WORKSHOP_ID}.lastAccessedAt`]: now,
    });
    
    return true;
  } catch (error) {
    console.error("Error al guardar nota:", error);
    return false;
  }
}

/**
 * Obtiene las notas de una sesión
 * Nota: Las fechas vienen como string ISO de Firestore
 */
export async function getSessionNotes(
  userId: string,
  sessionId: string
): Promise<{ content: string; createdAt: string }[]> {
  try {
    const progress = await getWorkshopProgress(userId);
    const notes = progress?.notes?.[sessionId] || [];
    
    // Asegurar que todas las notas tengan createdAt como string
    return notes.map(note => ({
      content: note.content,
      createdAt: typeof note.createdAt === 'string' 
        ? note.createdAt 
        : note.createdAt.toISOString() // Si es Date, convertir a string
    }));
  } catch (error) {
    console.error("Error al obtener notas:", error);
    return [];
  }
}

/**
 * Marca/unmarca una sesión como bookmark
 */
export async function toggleBookmark(
  userId: string,
  sessionId: string
): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data() as FirestoreUser;
    const bookmarks = userData.workshopProgress?.[WORKSHOP_ID]?.bookmarks || [];
    
    const isBookmarked = bookmarks.includes(sessionId);
    const updates: any = {
      [`workshopProgress.${WORKSHOP_ID}.lastAccessedAt`]: new Date().toISOString(),
    };
    
    if (isBookmarked) {
      // Remover bookmark
      updates[`workshopProgress.${WORKSHOP_ID}.bookmarks`] = bookmarks.filter(
        (id: string) => id !== sessionId
      );
    } else {
      // Agregar bookmark
      updates[`workshopProgress.${WORKSHOP_ID}.bookmarks`] = arrayUnion(sessionId);
    }
    
    await updateDoc(userRef, updates);
    return !isBookmarked; // Retorna el nuevo estado
  } catch (error) {
    console.error("Error al toggle bookmark:", error);
    return false;
  }
}

/**
 * Actualiza preferencias del taller
 */
export async function updateWorkshopPreferences(
  userId: string,
  preferences: {
    fontSize?: "small" | "medium" | "large";
    autoSaveNotes?: boolean;
    showHints?: boolean;
  }
): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      [`workshopProgress.${WORKSHOP_ID}.preferences`]: preferences,
      [`workshopProgress.${WORKSHOP_ID}.lastAccessedAt`]: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error("Error al actualizar preferencias:", error);
    return false;
  }
}
