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

/**
 * Obtiene recursos por categoría del post
 * Prioriza recursos vinculados manualmente via relatedPosts
 */
export async function getResourcesByCategory(
  category: string,
  postId: string, // ✅ NUEVO: Necesitamos el postId
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

    // Si ya tenemos suficientes recursos manualmente vinculados, retornarlos
    if (manuallyRelatedResources.length >= limit) {
      return manuallyRelatedResources.slice(0, limit);
    }

    // ✅ PASO 2: Completar con recursos de la misma categoría
    const remainingLimit = limit - manuallyRelatedResources.length;
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
    return [...manuallyRelatedResources, ...categoryResources].slice(0, limit);
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