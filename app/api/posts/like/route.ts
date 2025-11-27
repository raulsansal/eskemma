// app/api/posts/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const { postId, action } = await request.json();

    if (!postId || !action) {
      return NextResponse.json(
        { error: "postId y action son requeridos" },
        { status: 400 }
      );
    }

    if (action !== "like" && action !== "unlike") {
      return NextResponse.json(
        { error: "action debe ser 'like' o 'unlike'" },
        { status: 400 }
      );
    }

    const postRef = adminDb.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json(
        { error: "Post no encontrado" },
        { status: 404 }
      );
    }

    const increment = action === "like" ? 1 : -1;

    await postRef.update({
      likes: FieldValue.increment(increment),
    });

    const updatedDoc = await postRef.get();
    const newLikes = updatedDoc.data()?.likes || 0;

    return NextResponse.json({
      success: true,
      likes: newLikes,
      action,
    });
  } catch (error) {
    console.error("Error al actualizar likes:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}