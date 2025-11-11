// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/firebase/firebaseConfig';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';

export async function GET() {
  try {
    const postsRef = collection(db, 'posts');
    
    // ✅ CORREGIDO: Usar updatedAt en vez de date
    const q = query(
      postsRef,
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    const posts = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Sin título',
        content: data.content || '',
        category: data.category || 'general',
        slug: data.slug || '',
        status: data.status || 'draft',
        featureImage: data.featureImage || null,
        tags: data.tags || [],
        author: data.author || {
          uid: '',
          displayName: 'Desconocido',
          email: '',
        },
        // ✅ Convertir Timestamp de Firestore a ISO string
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : new Date().toISOString(),
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString() 
          : new Date().toISOString(),
        likes: data.likes || 0,
        views: data.views || 0,
        metaTitle: data.metaTitle || data.title || 'Sin título',
        metaDescription: data.metaDescription || '',
        keywords: data.keywords || [],
      };
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    return NextResponse.json(
      { error: 'Error al obtener los posts', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, author, featureImage, tags, status, category } = body;

    // Validar campos obligatorios
    if (!title || !content || !author || !category) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: title, content, author, category' }, 
        { status: 400 }
      );
    }

    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      title,
      content,
      category: category || 'general',
      slug: generateSlug(title),
      author,
      featureImage: featureImage || null,
      tags: tags || [],
      status: status || 'draft',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      likes: 0,
      views: 0,
    });

    return NextResponse.json({ success: true, postId: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el post:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al crear el post', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}