// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });

    // Obtener todos los posts
    const postsSnapshot = await adminDb.collection("posts").get();
    
    let totalPosts = 0;
    let totalViews = 0;
    let publishedPosts = 0;
    let draftPosts = 0;

    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalPosts++;
      totalViews += data.views || 0;
      
      if (data.status === "published") {
        publishedPosts++;
      } else if (data.status === "draft") {
        draftPosts++;
      }
    });

    // Obtener total de comentarios
    let totalComments = 0;
    
    for (const postDoc of postsSnapshot.docs) {
      const commentsSnapshot = await adminDb
        .collection("posts")
        .doc(postDoc.id)
        .collection("comments")
        .get();
      
      totalComments += commentsSnapshot.size;
    }

    const stats = {
      totalPosts,
      totalViews,
      totalComments,
      publishedPosts,
      draftPosts,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}