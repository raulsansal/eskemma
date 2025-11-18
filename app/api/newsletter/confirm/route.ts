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

    // Buscar suscriptor por token
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

    // Verificar si ya está confirmado
    if (subscriberData.status === "confirmed") {
      return NextResponse.json({
        success: true,
        message: "Tu suscripción ya estaba confirmada. ¡Gracias!",
      });
    }

    // Confirmar suscripción
    await subscribersRef.doc(subscriberDoc.id).update({
      status: "confirmed",
      confirmedAt: new Date(),
      confirmationToken: null, // Eliminar token usado
    });

    console.log(`✅ Suscripción confirmada: ${subscriberData.email}`);

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(subscriberData.email);
      console.log(`📧 Email de bienvenida enviado a: ${subscriberData.email}`);
    } catch (emailError) {
      console.error("Error al enviar email de bienvenida:", emailError);
      // No fallar si el email falla
    }

    return NextResponse.json({
      success: true,
      message: "¡Gracias por confirmar tu suscripción! Pronto recibirás nuestro newsletter",
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