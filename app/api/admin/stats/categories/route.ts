// app/api/admin/stats/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 });

    // Obtener todos los posts publicados
    const postsSnapshot = await adminDb
      .collection("posts")
      .where("status", "==", "published")
      .get();

    // Contar posts por categoría
    const categoryCount: { [key: string]: number } = {};

    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      const category = data.category || "sin-categoria";
      
      if (categoryCount[category]) {
        categoryCount[category]++;
      } else {
        categoryCount[category] = 1;
      }
    });

    // Convertir a array y ordenar por cantidad (descendente)
    const categories = Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}