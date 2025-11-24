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
          message: "No encontramos tu suscripción en nuestra base de datos.",
          notFound: true,
        },
        { status: 404 }
      );
    }

    const subscriberDoc = query.docs[0];
    const subscriberData = subscriberDoc.data();

    // ✅ VALIDACIÓN: Solo usuarios con status "confirmed" pueden desuscribirse
    if (subscriberData.status === "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "Tu suscripción aún no ha sido confirmada. Revisa tu email para confirmarla primero.",
          isPending: true,
        },
        { status: 400 }
      );
    }

    // ✅ VALIDACIÓN: Prevenir desuscripción duplicada
    if (subscriberData.status === "unsubscribed") {
      return NextResponse.json({
        success: false,
        message: "Ya te habías desuscrito anteriormente.",
        alreadyUnsubscribed: true,
        subscriberName: subscriberData.name || null,
      });
    }

    // ✅ Proceder con la desuscripción (solo si status === "confirmed")
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

    // Guardar feedback en colección separada
    if ((reasons && reasons.length > 0) || otherReason) {
      await adminDb.collection("newsletter_feedback").add({
        email: normalizedEmail,
        name: subscriberData.name || null,
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
      message: "Tu opinión nos ayuda a mejorar. ¡Gracias por el tiempo que nos dedicaste!",
      subscriberName: subscriberData.name || null,
    });
  } catch (error: any) {
    console.error("❌ Error al cancelar suscripción:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Algo salió mal. ¿Podrías intentarlo de nuevo?",
      },
      { status: 500 }
    );
  }
}