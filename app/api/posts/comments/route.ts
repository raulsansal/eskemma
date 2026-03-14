// app/api/posts/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

// GET: Obtener comentarios de un post (con soporte para respuestas anidadas)
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
        parentId: data.parentId || null, // ✅ NUEVO: Para respuestas anidadas
        isApproved: data.isApproved ?? true, // ✅ NUEVO: Moderación
        moderationStatus: data.moderationStatus || "approved",
      };
    });

    // ✅ NUEVO: Organizar comentarios en estructura de árbol
    const topLevelComments = comments.filter((c) => !c.parentId);
    const repliesMap = new Map<string, any[]>();

    // Agrupar respuestas por parentId
    comments
      .filter((c) => c.parentId)
      .forEach((reply) => {
        if (!repliesMap.has(reply.parentId!)) {
          repliesMap.set(reply.parentId!, []);
        }
        repliesMap.get(reply.parentId!)!.push(reply);
      });

    // Agregar respuestas a sus comentarios padres
    const buildCommentTree = (comment: any): any => {
      return {
        ...comment,
        replies: repliesMap.get(comment.id) || [],
      };
    };

    const commentsWithReplies = topLevelComments.map(buildCommentTree);

    return NextResponse.json({ comments: commentsWithReplies });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return NextResponse.json(
      { error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo comentario o respuesta
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { postId, content, parentId } = await request.json();

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
    const userDoc = await adminDb.collection("users").doc(session.uid).get();
    const userData = userDoc.data();

    const photoURL = userData?.avatarUrl || null;

    const commentData = {
      content: content.trim(),
      author: {
        uid: session.uid,
        displayName: userData?.name || "Usuario",
        photoURL: photoURL,
      },
      createdAt: FieldValue.serverTimestamp(),
      postId,
      parentId: parentId || null, // ✅ NUEVO: Para respuestas anidadas
      isApproved: true, // ✅ Auto-aprobar por ahora (cambiar a false para moderación)
      moderationStatus: "approved", // ✅ NUEVO
    };

    const commentRef = await adminDb
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .add(commentData);

    // ✅ NUEVO: Si es una respuesta, crear notificación
    if (parentId) {
      try {
        const parentCommentDoc = await adminDb
          .collection("posts")
          .doc(postId)
          .collection("comments")
          .doc(parentId)
          .get();

        if (parentCommentDoc.exists) {
          const parentComment = parentCommentDoc.data();
          const parentAuthorUid = parentComment?.author?.uid;

          // No notificar si el autor responde su propio comentario
          if (parentAuthorUid && parentAuthorUid !== session.uid) {
            // Obtener slug del post
            const postDoc = await adminDb.collection("posts").doc(postId).get();
            const postSlug = postDoc.data()?.slug;

            await adminDb.collection("notifications").add({
              userId: parentAuthorUid,
              type: "comment_reply",
              message: `${userData?.name || "Alguien"} respondió a tu comentario`,
              postId: postId,
              postSlug: postSlug,
              commentId: commentRef.id,
              isRead: false,
              createdAt: FieldValue.serverTimestamp(),
            });
          }
        }
      } catch (notifError) {
        console.error("Error al crear notificación:", notifError);
        // No fallar la creación del comentario si falla la notificación
      }
    }

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

