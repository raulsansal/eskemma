// app/api/newsletter/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendWelcomeEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token es requerido" },
        { status: 400 }
      );
    }

    const subscribersRef = adminDb.collection("newsletter_subscribers");
    const query = await subscribersRef
      .where("confirmationToken", "==", token)
      .limit(1)
      .get();

    if (query.empty) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Token inválido o expirado. Por favor, suscríbete de nuevo" 
        },
        { status: 404 }
      );
    }

    const subscriberDoc = query.docs[0];
    const subscriberData = subscriberDoc.data();

    if (subscriberData.status === "confirmed") {
      console.log(`⚠️ Intento de confirmar suscripción ya confirmada: ${subscriberData.email}`);
      return NextResponse.json({
        success: true,
        message: "Tu suscripción ya estaba confirmada. ¡Gracias!",
      });
    }

    await subscribersRef.doc(subscriberDoc.id).update({
      status: "confirmed",
      confirmedAt: new Date(),
      confirmationToken: null,
    });

    console.log(`✅ Suscripción confirmada: ${subscriberData.email}`);

    // ✅ Enviar email de bienvenida CON NOMBRE
    try {
      await sendWelcomeEmail(subscriberData.email, subscriberData.name || "amigo");
      console.log(`📧 Email de bienvenida enviado a: ${subscriberData.email}`);
    } catch (emailError: any) {
      console.error("❌ Error al enviar email de bienvenida:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "¡Gracias por confirmar tu suscripción! Revisa tu email de bienvenida",
    });
  } catch (error: any) {
    console.error("❌ Error al confirmar suscripción:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al confirmar la suscripción. Inténtalo de nuevo",
      },
      { status: 500 }
    );
  }
}