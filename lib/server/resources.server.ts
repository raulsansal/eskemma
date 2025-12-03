// lib/server/resources.server.ts
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { DownloadableResource } from "@/types/post.types";
import { RESOURCES_CONFIG } from "@/lib/constants/resources.config";

/**
 * Obtiene recursos por categoría del post
 * Prioriza recursos vinculados manualmente via relatedPosts
 * 
 * Comportamiento controlado por RESOURCES_CONFIG.USE_MANUAL_RESOURCES_ONLY:
 * - true: SOLO muestra recursos vinculados manualmente (control total)
 * - false: Completa con recursos de la categoría si no hay suficientes manuales
 */
export async function getResourcesByCategory(
  category: string,
  postId: string,
  limit: number = 3
): Promise<DownloadableResource[]> {
  try {
    const resourcesRef = collection(db, "resources");
    
    // ✅ PASO 1: Buscar recursos vinculados manualmente a este post
    const manuallyRelatedQuery = query(
      resourcesRef,
      where("relatedPosts", "array-contains", postId),
      where("status", "==", "active"),
      firestoreLimit(limit)
    );

    const manuallyRelatedSnapshot = await getDocs(manuallyRelatedQuery);
    const manuallyRelatedResources: DownloadableResource[] = manuallyRelatedSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Recurso sin título",
        description: data.description || "",
        category: data.category || "",
        fileType: data.fileType || "pdf",
        fileSize: data.fileSize || "0 MB",
        thumbnail: data.thumbnail || undefined,
        fileStoragePath: data.fileStoragePath || "",
        isFree: data.isFree ?? true,
        price: data.price || 0,
        accessLevel: data.accessLevel || ["user"],
        downloadCount: data.downloadCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        status: data.status || "active",
      };
    });

    // ✅ CONTROL GLOBAL: Si USE_MANUAL_RESOURCES_ONLY es true, retornar SOLO recursos manuales
    if (RESOURCES_CONFIG.USE_MANUAL_RESOURCES_ONLY) {
      console.log(`📌 Modo manual activado: mostrando ${manuallyRelatedResources.length} recursos vinculados manualmente para post ${postId}`);
      return manuallyRelatedResources;
    }

    // ✅ MODO AUTOMÁTICO: Completar con recursos de la categoría si es necesario
    
    // Si ya tenemos suficientes recursos manualmente vinculados, retornarlos
    if (manuallyRelatedResources.length >= limit) {
      console.log(`✅ Suficientes recursos manuales (${manuallyRelatedResources.length}/${limit}) para post ${postId}`);
      return manuallyRelatedResources.slice(0, limit);
    }

    // PASO 2: Completar con recursos de la misma categoría
    const remainingLimit = limit - manuallyRelatedResources.length;
    console.log(`🔄 Completando con ${remainingLimit} recursos de categoría "${category}" para post ${postId}`);
    
    const categoryQuery = query(
      resourcesRef,
      where("category", "==", category),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      firestoreLimit(remainingLimit)
    );

    const categorySnapshot = await getDocs(categoryQuery);
    const categoryResources: DownloadableResource[] = categorySnapshot.docs
      .filter((doc) => !manuallyRelatedResources.some((r) => r.id === doc.id)) // Evitar duplicados
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Recurso sin título",
          description: data.description || "",
          category: data.category || "",
          fileType: data.fileType || "pdf",
          fileSize: data.fileSize || "0 MB",
          thumbnail: data.thumbnail || undefined,
          fileStoragePath: data.fileStoragePath || "",
          isFree: data.isFree ?? true,
          price: data.price || 0,
          accessLevel: data.accessLevel || ["user"],
          downloadCount: data.downloadCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          status: data.status || "active",
        };
      });

    // Combinar recursos manualmente relacionados + recursos por categoría
    const finalResources = [...manuallyRelatedResources, ...categoryResources].slice(0, limit);
    console.log(`✅ Total de recursos para post ${postId}: ${finalResources.length} (${manuallyRelatedResources.length} manuales + ${categoryResources.length} automáticos)`);
    
    return finalResources;
  } catch (error) {
    console.error("Error al obtener recursos por categoría:", error);
    return [];
  }
}

/**
 * Obtiene recursos populares (más descargados)
 */
export async function getPopularResources(
  limit: number = 3
): Promise<DownloadableResource[]> {
  try {
    const resourcesRef = collection(db, "resources");
    const q = query(
      resourcesRef,
      where("status", "==", "active"),
      orderBy("downloadCount", "desc"),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);

    const resources: DownloadableResource[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Recurso sin título",
        description: data.description || "",
        category: data.category || "",
        fileType: data.fileType || "pdf",
        fileSize: data.fileSize || "0 MB",
        thumbnail: data.thumbnail || undefined,
        fileStoragePath: data.fileStoragePath || "",
        isFree: data.isFree ?? true,
        price: data.price || 0,
        accessLevel: data.accessLevel || ["user"],
        downloadCount: data.downloadCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        status: data.status || "active",
      };
    });

    return resources;
  } catch (error) {
    console.error("Error al obtener recursos populares:", error);
    return [];
  }
}