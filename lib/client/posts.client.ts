// lib/client/posts.client.ts
export async function getPostData(id: string) {
  const response = await fetch(`/api/posts/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener los datos del post');
  }
  return response.json();
}

export async function updatePost(
  id: string,
  updatedData: {
    title: string;
    date: string;
    content: string;
    slug: string;
    status: 'draft' | 'published';
    author: { uid: string; displayName: string; email: string };
    featureImage?: string;
    tags?: string[];
  }
) {
  const response = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el post');
  }
  return response.json();
}

export async function createPost(newPostData: {
  title: string;
  date: string;
  content: string;
  slug: string;
  status: 'draft' | 'published';
  author: { uid: string; displayName: string; email: string };
  featureImage?: string;
  tags?: string[];
}) {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newPostData),
  });

  if (!response.ok) {
    throw new Error('Error al crear el post');
  }
  return response.json();
}

export async function getAllPosts() {
  const response = await fetch('/api/posts');
  if (!response.ok) {
    throw new Error('Error al obtener los posts');
  }
  return response.json();
}