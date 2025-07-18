// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updatePost } from '@/lib/server/posts.server';

// Interfaz Post
export interface Post {
  title: string;
  content: string;
  date: string;
  slug: string;
  author: {
    uid: string;
    displayName: string;
    email: string;
  };
  status: 'draft' | 'published'; // Estado del post
  featureImage?: string | null; // Campo opcional para la imagen destacada
  tags?: string[]; // Tags opcionales
  comments?: any[]; // Ajusta según tu estructura
  media?: any[]; // Ajusta según tu estructura
  translations?: Record<string, any>; // Ajusta según tu estructura
  createdAt: Date;
  updatedAt: Date;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body: Partial<Post> = await request.json(); // Usar Partial para permitir campos opcionales
    const { title, date, content, featureImage, tags, status } = body;

    // Validar datos
    if (!title || !date || !content) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar el post
    await updatePost(id, {
      title,
      date,
      content,
      featureImage: featureImage ?? null, // Asignar null si featureImage no está definido
      tags: tags || [],
      status: status || 'draft',
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Post actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el post' },
      { status: 500 }
    );
  }
}