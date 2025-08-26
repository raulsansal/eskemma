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
  featureImage?: string | null; // Imagen destacada (opcional)
  date: string; // Fecha del post (en formato ISO o similar)
  author: {
    uid: string;
    displayName: string;
    email: string;
  };
  tags?: string[]; // Tags opcionales
  slug: string; // Slug único del post
  status: 'draft' | 'published'; // Estado del post
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de actualización
  likes?: number; // Número de "me gusta" (opcional, valor por defecto: 0)
  views?: number; // Número de visitas (opcional, valor por defecto: 0)
  metaTitle?: string; // Título SEO (opcional)
  metaDescription?: string; // Descripción SEO (opcional)
  keywords?: string[]; // Palabras clave SEO (opcional)
}

/**
 * Obtiene todos los posts ordenados por fecha.
 * @returns {Promise<Post[]>} - Lista de posts.
 */
export async function getSortedPostsData(): Promise<Post[]> {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('status', '==', 'published'), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);

  const posts: Post[] = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || 'Sin título',
      content: data.content || '',
      featureImage: data.featureImage || undefined,
      date: data.date || new Date().toISOString(),
      author: data.author || {
        uid: '',
        displayName: 'Desconocido',
        email: '',
      },
      tags: data.tags || [],
      slug: data.slug || '',
      status: data.status || 'draft',
      createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
      likes: data.likes || 0, // Valor por defecto
      views: data.views || 0, // Valor por defecto
      metaTitle: data.metaTitle || data.title || 'Sin título',
      metaDescription: data.metaDescription || data.content?.substring(0, 160) || '',
      keywords: data.keywords || [],
    };
  });

  return posts;
}

/**
 * CORRECCIÓN: Obtiene los slugs de todos los posts para generar rutas dinámicas.
 * @returns {Promise<Array<{ slug: string }>>} - Lista de objetos con los slugs de los posts.
 */
export async function getAllPostIds(): Promise<Array<{ slug: string }>> {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('status', '==', 'published'));
  const querySnapshot = await getDocs(q);

  const posts = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const slug = data.slug || '';

    // Debug: Verificar qué slugs estamos obteniendo
    console.log('Post ID:', doc.id, 'Slug:', slug);

    return {
      slug: slug,
    };
  });

  // Filtrar posts que no tengan slug válido
  const validPosts = posts.filter(post => post.slug && post.slug.trim() !== '');

  console.log('Posts válidos con slug:', validPosts);

  return validPosts;
}

/**
 * CORRECCIÓN: Obtiene los datos de un post específico por slug.
 * @param {string} slug - El slug del post.
 * @returns {Promise<Post | null>} - Datos del post o null si no se encuentra.
 */
export async function getPostData(slug: string): Promise<Post | null> {
  console.log('Buscando post con slug:', slug);

  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('slug', '==', slug), where('status', '==', 'published'));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.warn(`No se encontró ningún post con el slug: ${slug}`);

    // Debug adicional: verificar si existe un post con ese ID
    try {
      const docRef = doc(db, 'posts', slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Se encontró un documento con ese ID, pero el slug real es:', data.slug);
        console.log('Datos del documento:', data);
      }
    } catch (error) {
      console.log('No es un ID válido de documento');
    }

    return null;
  }

  const docData = querySnapshot.docs[0].data();
  console.log('Post encontrado:', docData.title, 'con slug:', docData.slug);

  return {
    id: querySnapshot.docs[0].id,
    title: docData.title || 'Sin título',
    content: docData.content || '',
    featureImage: docData.featureImage || undefined,
    date: docData.date || new Date().toISOString(),
    author: docData.author || {
      uid: '',
      displayName: 'Desconocido',
      email: '',
    },
    tags: docData.tags || [],
    slug: docData.slug || '',
    status: docData.status || 'draft',
    createdAt: docData.createdAt ? new Date(docData.createdAt.toDate()) : new Date(),
    updatedAt: docData.updatedAt ? new Date(docData.updatedAt.toDate()) : new Date(),
    likes: docData.likes || 0, // Valor por defecto
    views: docData.views || 0, // Valor por defecto
    metaTitle: docData.metaTitle || docData.title || 'Sin título',
    metaDescription: docData.metaDescription || docData.content?.substring(0, 160) || '',
    keywords: docData.keywords || [],
  };
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
      likes: postData.likes || 0, // Valor por defecto
      views: postData.views || 0, // Valor por defecto
    });

    // Retornar el ID del nuevo post
    return newPostRef.id;
  } catch (error) {
    console.error('Error al crear el post:', error);
    throw new Error('Ocurrió un error al crear el post.');
  }
}