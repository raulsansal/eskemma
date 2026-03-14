// app/api/posts/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { id: commentId } = await params;

    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId es requerido" },
        { status: 400 }
      );
    }

    const commentRef = adminDb
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId);

    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      );
    }

    const commentData = commentDoc.data();

    // Verificar si es el autor o admin
    const isOwner = commentData?.author.uid === session.uid;
    const isAdmin = session.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este comentario" },
        { status: 403 }
      );
    }

    await commentRef.delete();

    return NextResponse.json({
      success: true,
      message: "Comentario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return NextResponse.json(
      { error: "Error al eliminar comentario" },
      { status: 500 }
    );
  }
}