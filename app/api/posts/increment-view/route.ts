// app/api/posts/increment-view/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId || typeof postId !== "string" || postId.trim() === "") {
      return NextResponse.json(
        { error: "postId inválido" },
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

    await postRef.update({
      views: FieldValue.increment(1),
    });

    const currentViews = (postDoc.data()?.views || 0) + 1;
    
    console.log(`✅ Vista incrementada para post: ${postId} (Total: ${currentViews})`);

    return NextResponse.json({ 
      success: true, 
      postId,
      views: currentViews
    });

  } catch (error: any) {
    console.error("❌ Error al incrementar views:", error);
    
    return NextResponse.json(
      { 
        error: "Error al incrementar views", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}