// app/api/admin/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 20;

    // Obtener todos los posts
    const postsSnapshot = await adminDb.collection("posts").get();
    const allComments: any[] = [];

    // Recopilar comentarios de todos los posts
    for (const postDoc of postsSnapshot.docs) {
      const commentsSnapshot = await adminDb
        .collection("posts")
        .doc(postDoc.id)
        .collection("comments")
        .orderBy("createdAt", "desc")
        .get();

      commentsSnapshot.forEach((commentDoc) => {
        const data = commentDoc.data();
        
        // Aplicar filtro de estado
        if (status !== "all" && data.moderationStatus !== status) {
          return;
        }

        // Aplicar filtro de búsqueda
        if (search) {
          const searchLower = search.toLowerCase();
          const contentMatch = data.content?.toLowerCase().includes(searchLower);
          const authorMatch = data.author?.displayName?.toLowerCase().includes(searchLower);
          
          if (!contentMatch && !authorMatch) {
            return;
          }
        }

        allComments.push({
          id: commentDoc.id,
          postId: postDoc.id,
          postTitle: postDoc.data().title || "Sin título",
          content: data.content || "",
          author: {
            uid: data.author?.uid || "",
            displayName: data.author?.displayName || "Anónimo",
            photoURL: data.author?.photoURL || null,
          },
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          moderationStatus: data.moderationStatus || "approved",
          isApproved: data.isApproved ?? true,
          parentId: data.parentId || null,
        });
      });
    }

    // Ordenar por fecha descendente
    allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginación
    const totalComments = allComments.length;
    const totalPages = Math.ceil(totalComments / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedComments = allComments.slice(startIndex, endIndex);

    // Contar por estado
    const counts = {
      all: allComments.length,
      pending: allComments.filter(c => c.moderationStatus === "pending").length,
      approved: allComments.filter(c => c.moderationStatus === "approved").length,
      rejected: allComments.filter(c => c.moderationStatus === "rejected").length,
    };

    return NextResponse.json({
      comments: paginatedComments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        pageSize,
      },
      counts,
    });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return NextResponse.json(
      { error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
}