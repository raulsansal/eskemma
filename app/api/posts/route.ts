// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { getSortedPostsData } from '@/lib/server/posts.server';

// GET: Obtener todos los posts
export async function GET() {
  try {
    const posts = getSortedPostsData();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    return NextResponse.json(
      { error: 'Error al obtener los posts' },
      { status: 500 }
    );
  }
}