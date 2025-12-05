// lib/client/comments.client.ts
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { CommentWithReplies } from "@/types/post.types";

/**
 * Obtiene todos los comentarios con filtros opcionales
 */
export async function getAllComments(
  filters?: {
    status?: "pending" | "approved" | "rejected" | "all";
    searchTerm?: string;
    postId?: string;
  },
  paginationLimit: number = 20,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
) {
  try {
    const comments: CommentWithReplies[] = [];
    const postsCollection = collection(db, "posts");
    const postsSnapshot = await getDocs(postsCollection);

    for (const postDoc of postsSnapshot.docs) {
      const commentsRef = collection(db, "posts", postDoc.id, "comments");
      let commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));

      // Aplicar filtro de status si existe
      if (filters?.status && filters.status !== "all") {
        commentsQuery = query(
          commentsRef,
          where("moderationStatus", "==", filters.status),
          orderBy("createdAt", "desc")
        );
      }

      const commentsSnapshot = await getDocs(commentsQuery);

      commentsSnapshot.forEach((commentDoc) => {
        const data = commentDoc.data();
        
        // Filtrar por postId si se especifica
        if (filters?.postId && postDoc.id !== filters.postId) {
          return;
        }

        // Filtrar por término de búsqueda
        if (filters?.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const contentMatch = data.content?.toLowerCase().includes(searchLower);
          const authorMatch = data.author?.displayName?.toLowerCase().includes(searchLower);
          
          if (!contentMatch && !authorMatch) {
            return;
          }
        }

        comments.push({
          id: commentDoc.id,
          content: data.content || "",
          author: {
            uid: data.author?.uid || "",
            displayName: data.author?.displayName || "Anónimo",
            photoURL: data.author?.photoURL,
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          postId: postDoc.id,
          parentId: data.parentId || null,
          isApproved: data.isApproved ?? true,
          moderationStatus: data.moderationStatus || "approved",
        });
      });
    }

    // Ordenar por fecha descendente
    comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return comments;
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    throw new Error("Error al cargar comentarios");
  }
}

/**
 * Obtiene un comentario específico
 */
export async function getComment(postId: string, commentId: string): Promise<CommentWithReplies | null> {
  try {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnapshot = await getDoc(commentRef);

    if (!commentSnapshot.exists()) {
      return null;
    }

    const data = commentSnapshot.data();
    return {
      id: commentSnapshot.id,
      content: data.content || "",
      author: {
        uid: data.author?.uid || "",
        displayName: data.author?.displayName || "Anónimo",
        photoURL: data.author?.photoURL,
      },
      createdAt: data.createdAt?.toDate() || new Date(),
      postId: postId,
      parentId: data.parentId || null,
      isApproved: data.isApproved ?? true,
      moderationStatus: data.moderationStatus || "approved",
    };
  } catch (error) {
    console.error("Error al obtener comentario:", error);
    throw new Error("Error al cargar comentario");
  }
}

/**
 * Actualiza el estado de moderación de un comentario
 */
export async function updateCommentStatus(
  postId: string,
  commentId: string,
  status: "pending" | "approved" | "rejected"
) {
  try {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    await updateDoc(commentRef, {
      moderationStatus: status,
      isApproved: status === "approved",
    });
  } catch (error) {
    console.error("Error al actualizar estado del comentario:", error);
    throw new Error("Error al actualizar estado");
  }
}

/**
 * Elimina un comentario
 */
export async function deleteComment(postId: string, commentId: string) {
  try {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    throw new Error("Error al eliminar comentario");
  }
}

/**
 * Obtiene el título del post al que pertenece un comentario
 */
export async function getPostTitle(postId: string): Promise<string> {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      return "Post no encontrado";
    }

    return postSnapshot.data()?.title || "Sin título";
  } catch (error) {
    console.error("Error al obtener título del post:", error);
    return "Error al cargar";
  }
}