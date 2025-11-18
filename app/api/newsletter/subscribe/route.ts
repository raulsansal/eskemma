// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendVerificationEmail } from "@/lib/emailService";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, userId, source, interests } = await request.json();

    // Validar email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email es requerido" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Email inválido" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verificar si ya está suscrito
    const subscribersRef = adminDb.collection("newsletter_subscribers");
    const existingQuery = await subscribersRef
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      const existingDoc = existingQuery.docs[0];
      const existingData = existingDoc.data();

      if (existingData.status === "confirmed") {
        return NextResponse.json({
          success: true,
          message: "Ya estás suscrito a nuestro newsletter",
          alreadySubscribed: true,
        });
      }

      if (existingData.status === "pending") {
        const newToken = crypto.randomBytes(32).toString("hex");
        
        await subscribersRef.doc(existingDoc.id).update({
          confirmationToken: newToken,
        });

        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/confirm?token=${newToken}`;

        // Enviar email de verificación
        try {
          await sendVerificationEmail(normalizedEmail, verificationLink);
          console.log(`📧 Email de verificación reenviado a: ${normalizedEmail}`);
        } catch (emailError) {
          console.error("Error al enviar email:", emailError);
        }

        console.log("🔗 Link de verificación (reenvío):", verificationLink);

        return NextResponse.json({
          success: true,
          message: "Revisa tu email para confirmar tu suscripción",
          alreadySubscribed: true,
          verificationLink: verificationLink, // Solo para testing
        });
      }

      if (existingData.status === "unsubscribed") {
        const token = crypto.randomBytes(32).toString("hex");

        await subscribersRef.doc(existingDoc.id).update({
          status: "pending",
          subscribedAt: new Date(),
          unsubscribedAt: null,
          confirmationToken: token,
          source: source || "blog",
          interests: interests || [],
        });

        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/confirm?token=${token}`;

        // Enviar email de verificación
        try {
          await sendVerificationEmail(normalizedEmail, verificationLink);
          console.log(`📧 Email de verificación enviado a: ${normalizedEmail}`);
        } catch (emailError) {
          console.error("Error al enviar email:", emailError);
        }

        console.log(`✅ Suscripción reactivada (pending): ${normalizedEmail}`);
        console.log("🔗 Link de verificación:", verificationLink);

        return NextResponse.json({
          success: true,
          message: "¡Bienvenido de vuelta! Revisa tu email para confirmar tu suscripción",
          subscriberId: existingDoc.id,
          verificationLink: verificationLink, // Solo para testing
        });
      }
    }

    // CREAR NUEVO SUSCRIPTOR
    const token = crypto.randomBytes(32).toString("hex");

    const subscriberData = {
      email: normalizedEmail,
      userId: userId || null,
      status: "pending",
      subscribedAt: new Date(),
      confirmedAt: null,
      unsubscribedAt: null,
      confirmationToken: token,
      source: source || "blog",
      interests: interests || [],
      lastEmailSent: null,
    };

    const newSubscriberRef = await subscribersRef.add(subscriberData);

    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/confirm?token=${token}`;

    // Enviar email de verificación
    try {
      await sendVerificationEmail(normalizedEmail, verificationLink);
      console.log(`📧 Email de verificación enviado a: ${normalizedEmail}`);
    } catch (emailError) {
      console.error("Error al enviar email de verificación:", emailError);
      // No fallar si el email falla, el usuario aún tiene el link en pantalla
    }

    console.log(`✅ Nuevo suscriptor creado (pending): ${normalizedEmail} (${newSubscriberRef.id})`);
    console.log("🔗 Link de verificación:", verificationLink);

    return NextResponse.json({
      success: true,
      message: "¡Gracias por suscribirte! Revisa tu email para confirmar tu suscripción",
      subscriberId: newSubscriberRef.id,
      verificationLink: verificationLink, // Solo para testing - eliminar en producción
    });
  } catch (error: any) {
    console.error("❌ Error al procesar suscripción:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar la suscripción. Inténtalo de nuevo",
      },
      { status: 500 }
    );
  }
}