// app/api/newsletter/get-subscriber/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email es requerido" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar suscriptor
    const subscribersRef = adminDb.collection("newsletter_subscribers");
    const query = await subscribersRef
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (query.empty) {
      return NextResponse.json(
        { success: false, message: "Suscriptor no encontrado" },
        { status: 404 }
      );
    }

    const subscriberDoc = query.docs[0];
    const subscriberData = subscriberDoc.data();

    return NextResponse.json({
      success: true,
      subscriber: {
        email: subscriberData.email,
        name: subscriberData.name || "",
        status: subscriberData.status,
      },
    });
  } catch (error: any) {
    console.error("❌ Error al obtener suscriptor:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener datos" },
      { status: 500 }
    );
  }
}