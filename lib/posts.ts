// lib/posts.ts

if (typeof window !== 'undefined') {
  throw new Error('Este archivo solo debe ser importado en el servidor.');
}

// Importar las funciones del servidor
import { getSortedPostsData as serverGetSortedPostsData } from './server/posts.server';
import { getAllPostIds as serverGetAllPostIds } from './server/posts.server';
import { getPostData as serverGetPostData } from './server/posts.server';
import { updatePost as serverUpdatePost } from './server/posts.server';

// Exportar las funciones del servidor
export function getSortedPostsData() {
  return serverGetSortedPostsData();
}

export function getAllPostIds() {
  return serverGetAllPostIds().then((posts) =>
    posts.map((post) => ({
      slug: post.slug || '', // Asegúrate de que cada objeto tenga la propiedad `slug`
    }))
  );
}

export async function getPostData(slug: string) {
  try {
    const postData = await serverGetPostData(slug);
    if (!postData) {
      console.warn(`No se encontró ningún post con el slug: ${slug}`);
      return null;
    }
    return postData;
  } catch (error) {
    console.error('Error al obtener los datos del post:', error);
    return null;
  }
}

export function updatePost(slug: string, updatedData: { title: string; date: string; content: string }) {
  return serverUpdatePost(slug, updatedData);
}