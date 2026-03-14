// app/api/admin/comments/[commentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });

    const { commentId } = await params;
    const body = await request.json();
    const { postId, action } = body;

    if (!postId || !action) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const commentRef = adminDb
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId);

    // Realizar la acción correspondiente
    switch (action) {
      case "approve":
        await commentRef.update({
          moderationStatus: "approved",
          isApproved: true,
        });
        break;

      case "reject":
        await commentRef.update({
          moderationStatus: "rejected",
          isApproved: false,
        });
        break;

      case "pending":
        await commentRef.update({
          moderationStatus: "pending",
          isApproved: false,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Acción no válida" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar comentario:", error);
    return NextResponse.json(
      { error: "Error al actualizar comentario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });

    const { commentId } = await params;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Falta el ID del post" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return NextResponse.json(
      { error: "Error al eliminar comentario" },
      { status: 500 }
    );
  }
}