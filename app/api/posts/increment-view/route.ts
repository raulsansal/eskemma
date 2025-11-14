// app/api/posts/increment-view/route.ts
import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "postId es requerido" },
        { status: 400 }
      );
    }

    // Validar que postId sea un string válido
    if (typeof postId !== "string" || postId.trim() === "") {
      return NextResponse.json(
        { error: "postId inválido" },
        { status: 400 }
      );
    }

    const postRef = doc(db, "posts", postId);
    
    // Incrementar views usando Firestore increment (atómico)
    await updateDoc(postRef, {
      views: increment(1),
    });

    console.log(`✅ Vista incrementada para post: ${postId}`);

    return NextResponse.json({ success: true, postId });
  } catch (error: any) {
    console.error("Error al incrementar views:", error);
    return NextResponse.json(
      { error: "Error al incrementar views", details: error.message },
      { status: 500 }
    );
  }
}