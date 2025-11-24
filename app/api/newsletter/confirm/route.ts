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
          message: "Token inválido o expirado. Por favor, suscríbete de nuevo desde el blog." 
        },
        { status: 404 }
      );
    }

    const subscriberDoc = query.docs[0];
    const subscriberData = subscriberDoc.data();

    // ✅ VALIDACIÓN: Si ya está confirmado, no volver a enviar email de bienvenida
    if (subscriberData.status === "confirmed") {
      console.log(`⚠️ Intento de confirmar suscripción ya confirmada: ${subscriberData.email}`);
      return NextResponse.json({
        success: true,
        message: "Tu suscripción ya estaba confirmada. ¡Bienvenido de nuevo!",
        alreadyConfirmed: true,
      });
    }

    // ✅ VALIDACIÓN: Verificar que el status sea "pending"
    if (subscriberData.status === "unsubscribed") {
      console.log(`⚠️ Intento de confirmar suscriptor dado de baja: ${subscriberData.email}`);
      return NextResponse.json(
        {
          success: false,
          message: "Esta suscripción fue cancelada previamente. Por favor, suscríbete de nuevo desde el blog.",
          wasUnsubscribed: true,
        },
        { status: 400 }
      );
    }

    // ✅ VALIDACIÓN: Solo proceder si status === "pending"
    if (subscriberData.status !== "pending") {
      console.log(`⚠️ Status inesperado al confirmar: ${subscriberData.status} para ${subscriberData.email}`);
      return NextResponse.json(
        {
          success: false,
          message: "Estado de suscripción inválido. Por favor, contacta al soporte.",
        },
        { status: 400 }
      );
    }

    // ✅ VALIDACIÓN OPCIONAL: Verificar expiración del token (48 horas)
    const subscribedAt = subscriberData.subscribedAt?.toDate();
    if (subscribedAt) {
      const hoursSinceSubscription = (Date.now() - subscribedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceSubscription > 48) {
        console.log(`⏰ Token expirado (${hoursSinceSubscription.toFixed(1)} horas) para: ${subscriberData.email}`);
        return NextResponse.json(
          {
            success: false,
            message: "Este enlace de confirmación ha expirado (48 horas). Por favor, suscríbete de nuevo.",
            tokenExpired: true,
          },
          { status: 410 } // 410 Gone
        );
      }
    }

    // ✅ Proceder con la confirmación
    await subscribersRef.doc(subscriberDoc.id).update({
      status: "confirmed",
      confirmedAt: new Date(),
      confirmationToken: null, // ✅ Eliminar token usado
    });

    console.log(`✅ Suscripción confirmada: ${subscriberData.email}`);

    // ✅ Enviar email de bienvenida CON NOMBRE
    try {
      await sendWelcomeEmail(
        subscriberData.email, 
        subscriberData.name || "amigo"
      );
      console.log(`📧 Email de bienvenida enviado a: ${subscriberData.email}`);
    } catch (emailError: any) {
      console.error("❌ Error al enviar email de bienvenida:", emailError);
      // ✅ NO fallar la confirmación si el email falla
      // La suscripción ya fue confirmada exitosamente
    }

    return NextResponse.json({
      success: true,
      message: "¡Gracias por confirmar tu suscripción! Revisa tu email para ver el mensaje de bienvenida.",
    });
  } catch (error: any) {
    console.error("❌ Error al confirmar suscripción:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al confirmar la suscripción. Inténtalo de nuevo.",
      },
      { status: 500 }
    );
  }
}