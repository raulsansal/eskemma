// lib/client/tags.client.ts
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export interface TagSuggestion {
  tag: string;
  count: number;
}

/**
 * Obtiene todos los tags únicos de los posts con su frecuencia
 */
export async function getAllTagsWithCount(): Promise<TagSuggestion[]> {
  try {
    const postsCollection = collection(db, "posts");
    const postsSnapshot = await getDocs(postsCollection);

    const tagMap = new Map<string, number>();

    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      const tags = data.tags || [];

      tags.forEach((tag: string) => {
        const normalizedTag = tag.trim().toLowerCase();
        if (normalizedTag) {
          tagMap.set(normalizedTag, (tagMap.get(normalizedTag) || 0) + 1);
        }
      });
    });

    // Convertir a array y ordenar por frecuencia
    const tagsArray = Array.from(tagMap.entries()).map(([tag, count]) => ({
      tag,
      count,
    }));

    tagsArray.sort((a, b) => b.count - a.count);

    return tagsArray;
  } catch (error) {
    console.error("Error al obtener tags:", error);
    return [];
  }
}

/**
 * Busca tags que coincidan con un término de búsqueda
 */
export async function searchTags(searchTerm: string): Promise<TagSuggestion[]> {
  const allTags = await getAllTagsWithCount();
  const normalizedSearch = searchTerm.toLowerCase().trim();

  if (!normalizedSearch) return allTags.slice(0, 10);

  return allTags
    .filter((tag) => tag.tag.includes(normalizedSearch))
    .slice(0, 10);
}