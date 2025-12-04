// app/api/admin/stats/popular-posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Verificar que sea admin
    if (decodedToken.role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 }
      );
    }

    // Obtener los 5 posts más populares (ordenados por vistas)
    const postsSnapshot = await adminDb
      .collection("posts")
      .where("status", "==", "published")
      .orderBy("views", "desc")
      .limit(5)
      .get();

    const posts = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Sin título",
        slug: data.slug || doc.id,
        views: data.views || 0,
        category: data.category || "",
        featureImage: data.featureImage || undefined,
      };
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error al obtener posts populares:", error);
    return NextResponse.json(
      { error: "Error al obtener posts populares" },
      { status: 500 }
    );
  }
}