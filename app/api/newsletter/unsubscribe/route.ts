// app/api/newsletter/unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email, reasons, otherReason } = await request.json();

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
        {
          success: false,
          message:
            "No encontramos tu suscripción. Quizás ya estabas fuera del Baúl 🤔",
        },
        { status: 404 }
      );
    }

    const subscriberDoc = query.docs[0];
    const subscriberData = subscriberDoc.data();

    // Verificar si ya estaba dado de baja
    if (subscriberData.status === "unsubscribed") {
      return NextResponse.json({
        success: true,
        message:
          "Ya te habías despedido antes. ¡Pero siempre serás bienvenido de vuelta!",
        alreadyUnsubscribed: true,
      });
    }

    // Preparar datos de feedback
    const unsubscribeData: any = {
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    };

    // Si hay feedback, guardarlo
    if (reasons && reasons.length > 0) {
      unsubscribeData.unsubscribeReasons = reasons;
    }

    if (otherReason && otherReason.trim()) {
      unsubscribeData.unsubscribeOtherReason = otherReason.trim();
    }

    // Actualizar suscriptor
    await subscribersRef.doc(subscriberDoc.id).update(unsubscribeData);

    // Guardar feedback en colección separada para análisis
    if ((reasons && reasons.length > 0) || otherReason) {
      await adminDb.collection("newsletter_feedback").add({
        email: normalizedEmail,
        userId: subscriberData.userId || null,
        type: "unsubscribe",
        reasons: reasons || [],
        otherReason: otherReason || null,
        source: subscriberData.source || "unknown",
        subscribedAt: subscriberData.subscribedAt,
        unsubscribedAt: new Date(),
        daysSinceSubscription: subscriberData.subscribedAt
          ? Math.floor(
              (Date.now() - subscriberData.subscribedAt.toDate().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      });

      console.log(`📊 Feedback de unsubscribe guardado: ${normalizedEmail}`);
    }

    console.log(`✅ Suscripción cancelada: ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message:
        "Tu opinión nos ayuda a mejorar. ¡Gracias por el tiempo que nos dedicaste!",
    });
  } catch (error: any) {
    console.error("❌ Error al cancelar suscripción:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Algo salió mal en nuestro lado. ¿Podrías intentarlo de nuevo?",
      },
      { status: 500 }
    );
  }
}
