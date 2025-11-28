// app/api/posts/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { postId, action, postTitle, postSlug } = await request.json();

    if (!postId || !action) {
      return NextResponse.json(
        { error: "postId y action son requeridos" },
        { status: 400 }
      );
    }

    const savedPostRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("savedPosts")
      .doc(postId);

    if (action === "save") {
      if (!postTitle || !postSlug) {
        return NextResponse.json(
          { error: "postTitle y postSlug son requeridos para guardar" },
          { status: 400 }
        );
      }

      await savedPostRef.set({
        postId,
        savedAt: FieldValue.serverTimestamp(),
        postTitle,
        postSlug,
      });

      return NextResponse.json({
        success: true,
        action: "saved",
      });
    } else if (action === "unsave") {
      await savedPostRef.delete();

      return NextResponse.json({
        success: true,
        action: "unsaved",
      });
    } else {
      return NextResponse.json(
        { error: "action debe ser 'save' o 'unsave'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error al guardar/quitar post:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId es requerido" },
        { status: 400 }
      );
    }

    const savedPostRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("savedPosts")
      .doc(postId);

    const savedPostDoc = await savedPostRef.get();

    return NextResponse.json({
      isSaved: savedPostDoc.exists,
    });
  } catch (error) {
    console.error("Error al verificar post guardado:", error);
    return NextResponse.json(
      { error: "Error al verificar post guardado" },
      { status: 500 }
    );
  }
}