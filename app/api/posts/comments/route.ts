// app/api/posts/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// GET: Obtener comentarios de un post
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId es requerido" },
        { status: 400 }
      );
    }

    const commentsRef = adminDb
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .orderBy("createdAt", "desc");

    const commentsSnapshot = await commentsRef.get();

    const comments = commentsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        author: data.author,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        postId: data.postId,
      };
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return NextResponse.json(
      { error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo comentario
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const { postId, content } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId y content son requeridos" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "El comentario no puede exceder 500 caracteres" },
        { status: 400 }
      );
    }

    // Obtener datos del usuario desde Firestore
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    const commentData = {
      content: content.trim(),
      author: {
        uid: decodedToken.uid,
        displayName: userData?.name || decodedToken.name || "Usuario",
        photoURL: decodedToken.picture || userData?.avatarUrl || null,
      },
      createdAt: FieldValue.serverTimestamp(),
      postId,
    };

    const commentRef = await adminDb
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .add(commentData);

    const newComment = {
      id: commentRef.id,
      ...commentData,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return NextResponse.json(
      { error: "Error al crear comentario" },
      { status: 500 }
    );
  }
}