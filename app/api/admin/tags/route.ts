// app/api/admin/tags/route.ts
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

    // Obtener todos los posts
    const postsSnapshot = await adminDb.collection("posts").get();

    const tagMap = new Map<string, number>();

    // Recopilar tags de todos los posts
    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      const tags = data.tags || [];

      tags.forEach((tag: string) => {
        const normalizedTag = tag.trim().toLowerCase();
        if (normalizedTag) {
          tagMap.set(normalizedTag, (tagMap.get(normalizedTag) || 0) + 1);
        }
      });
    });

    // Convertir a array y ordenar por frecuencia
    const tagsArray = Array.from(tagMap.entries())
      .map(([tag, count]) => ({
        tag,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      tags: tagsArray,
      totalTags: tagsArray.length,
      totalUsage: Array.from(tagMap.values()).reduce((a, b) => a + b, 0),
    });
  } catch (error) {
    console.error("Error al obtener tags:", error);
    return NextResponse.json(
      { error: "Error al obtener tags" },
      { status: 500 }
    );
  }
}