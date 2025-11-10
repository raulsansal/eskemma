// lib/client/posts.client.ts

import { collection, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// Interfaz para los datos necesarios al crear un post
interface CreatePostData {
  title: string;
  content: string;
  slug: string;
  category: string; // ✅ AGREGAR
  status: 'draft' | 'published';
  author: { uid: string; displayName: string; email: string };
  featureImage?: string;
  tags?: string[];
  date?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Interfaz para los datos necesarios al actualizar un post
interface UpdatePostData extends CreatePostData {
  likes?: number;
  views?: number;
}

// Interfaz para los datos completos de un post
interface PostData {
  id: string;
  title: string;
  content: string;
  slug: string;
  category: string; // ✅ AGREGAR
  status: 'draft' | 'published';
  author: {
    uid: string;
    displayName: string;
    email: string;
  };
  featureImage?: string;
  tags: string[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Función para crear un nuevo post
export async function createPost(newPostData: CreatePostData) {
  try {
    const postsCollection = collection(db, "posts");
    const newPostRef = doc(postsCollection);

    await setDoc(newPostRef, {
      ...newPostData,
      category: newPostData.category || 'tactica', // ✅ Asegurar categoría
      likes: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      date: newPostData.date ? new Date(newPostData.date) : new Date(),
      featureImage: newPostData.featureImage || null, 
    });

    return { id: newPostRef.id };
  } catch (error) {
    console.error('Error al crear el post:', error);
    throw new Error('Error al crear el post');
  }
}

// Función para actualizar un post existente
export async function updatePost(postId: string, updatedPostData: UpdatePostData) {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      ...updatedPostData,
      category: updatedPostData.category || 'tactica', // ✅ Asegurar categoría
      updatedAt: new Date(),
      date: updatedPostData.date ? new Date(updatedPostData.date) : new Date(),
      featureImage: updatedPostData.featureImage || null,
    });
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    throw new Error('Error al actualizar el post');
  }
}

// Función para eliminar un post
export async function deletePost(postId: string) {
  try {
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);
    console.log(`Post con ID ${postId} eliminado correctamente.`);
  } catch (error) {
    console.error('Error al eliminar el post:', error);
    throw new Error('Error al eliminar el post');
  }
}

// Función para obtener los datos de un post específico
export async function getPostData(postId: string): Promise<PostData | null> {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      return null;
    }

    const data = postSnapshot.data();

    // Debug: Imprimir fechas originales y convertidas
    console.log('Fecha original (date):', data.date);
    console.log('Fecha convertida (Date):', data.date?.toDate());

    // Transformar los datos para que coincidan con la interfaz PostData
    return {
      id: postSnapshot.id,
      title: data.title || "Sin título",
      content: data.content || "",
      slug: data.slug || "",
      category: data.category || "tactica", // ✅ AGREGAR con valor por defecto
      status: data.status || "draft",
      author: data.author || {
        uid: "",
        displayName: "Desconocido",
        email: "",
      },
      featureImage: data.featureImage || undefined,
      tags: data.tags || [],
      date: data.date ? data.date.toDate() : new Date(),
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
      likes: data.likes || 0,
      views: data.views || 0,
      metaTitle: data.metaTitle || data.title || "Sin título",
      metaDescription: data.metaDescription || data.content?.substring(0, 160) || "",
      keywords: data.keywords || data.tags || [],
    };
  } catch (error) {
    console.error("Error al obtener los datos del post:", error);
    throw error;
  }
}

// Función para obtener todos los posts
export async function getPosts(): Promise<PostData[]> {
  try {
    const postsCollection = collection(db, "posts");
    const querySnapshot = await getDocs(postsCollection);

    const posts: PostData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      posts.push({
        id: doc.id,
        title: data.title || "Sin título",
        content: data.content || "",
        slug: data.slug || "",
        category: data.category || "tactica", // ✅ AGREGAR con valor por defecto
        status: data.status || "draft",
        author: data.author || {
          uid: "",
          displayName: "Desconocido",
          email: "",
        },
        featureImage: data.featureImage || undefined,
        tags: data.tags || [],
        date: data.date ? data.date.toDate() : new Date(),
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        likes: data.likes || 0,
        views: data.views || 0,
        metaTitle: data.metaTitle || data.title || "Sin título",
        metaDescription: data.metaDescription || data.content?.substring(0, 160) || "",
        keywords: data.keywords || data.tags || [],
      });
    });

    return posts;
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    throw new Error("Ocurrió un error al cargar los posts.");
  }
}