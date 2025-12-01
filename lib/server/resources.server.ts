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
 */
export async function getResourcesByCategory(
  category: string,
  limit: number = 3
): Promise<DownloadableResource[]> {
  try {
    const resourcesRef = collection(db, "resources");
    const q = query(
      resourcesRef,
      where("category", "==", category),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
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