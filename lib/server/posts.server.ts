// lib/server/posts.server.ts
import { db } from '@/firebase/firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';

/**
 * Interfaz para representar un post en Firestore.
 */
export interface Post {
  id?: string; // ID opcional (se genera automáticamente en Firestore)
  title: string;
  content: string;
  featureImage?: string | null;
  date: string;
  author: {
    uid: string;
    displayName: string;
    email: string;
  };
  tags?: string[]; // Tags opcionales
  slug: string;
  status: 'draft' | 'published'; // Estado del post
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Obtiene todos los posts ordenados por fecha.
 * @returns {Promise<Post[]>} - Lista de posts.
 */
export async function getSortedPostsData(): Promise<Post[]> {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('status', '==', 'published'), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);

  const posts: Post[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];

  return posts;
}

/**
 * Obtiene los IDs de todos los posts para generar rutas dinámicas.
 * @returns {Promise<Array>} - Lista de objetos con los parámetros de los posts.
 */
export async function getAllPostIds(): Promise<Array<{ params: { slug: string } }>> {
  const postsRef = collection(db, 'posts');
  const querySnapshot = await getDocs(postsRef);

  return querySnapshot.docs.map((doc) => ({
    params: {
      slug: doc.data().slug,
    },
  }));
}

/**
 * Obtiene los datos de un post específico.
 * @param {string} slug - El slug del post.
 * @returns {Promise<Post | null>} - Datos del post o null si no se encuentra.
 */
export async function getPostData(slug: string): Promise<Post | null> {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('slug', '==', slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docData = querySnapshot.docs[0].data();
  return {
    id: querySnapshot.docs[0].id,
    ...docData,
  } as Post;
}

/**
 * Actualiza un post existente o crea uno nuevo si no existe.
 * @param {string} postId - El ID del post.
 * @param {Partial<Post>} updatedData - Los datos actualizados del post.
 */
export async function updatePost(postId: string, updatedData: Partial<Post>) {
  const postRef = doc(db, 'posts', postId);
  const postSnapshot = await getDoc(postRef);

  if (!postSnapshot.exists()) {
    throw new Error('El post no existe.');
  }

  // Actualizar solo los campos proporcionados
  await updateDoc(postRef, {
    ...updatedData,
    updatedAt: new Date(),
  });
}

/**
 * Crea un nuevo post en Firestore.
 * @param {Post} postData - Los datos del nuevo post.
 * @returns {Promise<string>} - ID del post creado.
 */
export async function createPost(postData: Omit<Post, 'id'>): Promise<string> {
  try {
    // Generar un ID único para el nuevo post
    const postsRef = collection(db, 'posts');
    const newPostRef = doc(postsRef); // Genera un ID automáticamente

    // Crear el documento con el ID generado
    await setDoc(newPostRef, {
      ...postData,
      id: newPostRef.id, // Incluir el ID en los datos del documento
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Retornar el ID del nuevo post
    return newPostRef.id;
  } catch (error) {
    console.error('Error al crear el post:', error);
    throw new Error('Ocurrió un error al crear el post.');
  }
}