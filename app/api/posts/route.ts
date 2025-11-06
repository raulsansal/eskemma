// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc, getDocs, query, orderBy, where, getDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const postsRef = collection(db, 'posts');
    
    // ✅ Filtrar solo posts publicados y ordenar por fecha descendente
    const q = query(
      postsRef,
      where('status', '==', 'published'),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    const posts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    return NextResponse.json({ error: 'Error al obtener los posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, date, author, featureImage, tags, status } = body;

    // Validar campos obligatorios
    if (!title || !content || !date || !author) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      title,
      content,
      date,
      slug: generateSlug(title),
      author,
      featureImage: featureImage || null,
      tags: tags || [],
      status: status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, postId: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el post:', error);
    return NextResponse.json({ error: 'Ocurrió un error al crear el post' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID del post no proporcionado' }, { status: 400 });
    }

    const postRef = doc(db, 'posts', id);
    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    await updateDoc(postRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    return NextResponse.json({ error: 'Ocurrió un error al actualizar el post' }, { status: 500 });
  }
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').trim();
}