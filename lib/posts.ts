// lib/posts.ts

if (typeof window !== 'undefined') {
  throw new Error('Este archivo solo debe ser importado en el servidor.');
}

// Importar las funciones del servidor
import { getSortedPostsData as serverGetSortedPostsData } from './server/posts.server';
import { getAllPostIds as serverGetAllPostIds } from './server/posts.server';
import { getPostData as serverGetPostData } from './server/posts.server';
import { updatePost as serverUpdatePost } from './server/posts.server';

// Importar la interfaz PostData
import { PostData } from '@/types/post.types';

// Exportar las funciones del servidor
export function getSortedPostsData() {
  return serverGetSortedPostsData();
}

export async function getAllPostIds() {
  const posts = await serverGetAllPostIds();
  return posts.map((post) => ({
    slug: post.slug || '', // Asegúrate de que cada objeto tenga la propiedad `slug`
  }));
}

export async function getPostData(slug: string): Promise<PostData | null> {
  try {
    const postData = await serverGetPostData(slug);
    if (!postData) {
      console.warn(`No se encontró ningún post con el slug: ${slug}`);
      return null;
    }

    // Validar y asignar valores predeterminados si es necesario
    const validatedPostData: PostData = {
      id: postData.id || '',
      title: postData.title || 'Sin título',
      date: postData.updatedAt instanceof Date && !isNaN(postData.updatedAt.getTime())
        ? postData.updatedAt
        : new Date(),
      content: postData.content || '',
      tags: postData.tags || [],
      status: postData.status || 'draft',
      featureImage: postData.featureImage || undefined,
      slug: postData.slug || '',
      author: postData.author || {
        uid: '',
        displayName: 'Desconocido',
        email: 'correo@desconocido.com',
      },
      likes: postData.likes || 0, // Valor por defecto
      views: postData.views || 0, // Valor por defecto
      createdAt: postData.createdAt instanceof Date && !isNaN(postData.createdAt.getTime())
        ? postData.createdAt
        : new Date(),
      updatedAt: postData.updatedAt instanceof Date && !isNaN(postData.updatedAt.getTime())
        ? postData.updatedAt
        : new Date(),
      metaTitle: postData.metaTitle || postData.title || 'Sin título',
      metaDescription: postData.metaDescription || postData.content?.substring(0, 160) || '',
      keywords: postData.keywords || [],
    };

    return validatedPostData;
  } catch (error) {
    console.error('Error al obtener los datos del post:', error);
    return null;
  }
}

export function updatePost(slug: string, updatedData: { title: string; date: string; content: string }) {
  return serverUpdatePost(slug, updatedData);
}