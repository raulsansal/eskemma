// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updatePost } from '@/lib/server/posts.server';

// Interfaz Post
export interface Post {
  title: string;
  content: string;
  category: string;
  slug: string;
  author: {
    uid: string;
    displayName: string;
    email: string;
  };
  status: 'draft' | 'published';
  featureImage?: string | null;
  tags?: string[];
  comments?: any[];
  media?: any[];
  translations?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body: Partial<Post> = await request.json();
    const { title, content, category, featureImage, tags, status } = body;

    // Validar datos - ✅ Eliminada validación de 'date'
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar el post - ✅ Sin campo 'date'
    await updatePost(id, {
      title,
      content,
      category: category || 'general',
      featureImage: featureImage ?? null,
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