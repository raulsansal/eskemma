// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPostData, updatePost } from '@/lib/server/posts.server';

// GET: Obtener un post específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params en Next.js 15
    const postData = await getPostData(id);
    return NextResponse.json(postData);
  } catch (error) {
    console.error('Error al obtener el post:', error);
    return NextResponse.json(
      { error: 'Error al obtener el post' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params en Next.js 15
    const body = await request.json();
    const { title, date, content } = body;

    // Validar datos
    if (!title || !date || !content) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    updatePost(id, { title, date, content });
    return NextResponse.json({ message: 'Post actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el post' },
      { status: 500 }
    );
  }
}