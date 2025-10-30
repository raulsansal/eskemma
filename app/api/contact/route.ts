// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { sendContactNotification } from "../../../lib/email";

// ========== SISTEMA HÍBRIDO DE PRIORIDAD ==========
const calculateSmartPriority = (
  message: string,
  userRole: string | null
): "low" | "medium" | "high" => {
  const messageLower = message.toLowerCase();

  // 1️⃣ PALABRAS CLAVE CRÍTICAS (siempre alta prioridad)
  const criticalKeywords = [
    "urgente",
    "emergencia",
    "no puedo acceder",
    "problema crítico",    
    "error crítico",
    "pago rechazado",
    "cuenta bloqueada",
    "bloqueado",
    "hackeo",
    "fraude",
  ];

  if (criticalKeywords.some((keyword) => messageLower.includes(keyword))) {
    return "high";
  }

  // 2️⃣ USUARIOS PREMIUM/GRUPAL (alta prioridad por defecto)
  if (["premium", "grupal"].includes(userRole || "")) {
    // Excepto si usan palabras de baja prioridad explícitas
    const lowPriorityExceptions = [
      "información general",
      "solo curiosidad",
      "no es urgente",
      "cuando tengan tiempo",
      "sin prisa",
    ];

    const isLowPriorityException = lowPriorityExceptions.some((keyword) =>
      messageLower.includes(keyword)
    );

    return isLowPriorityException ? "medium" : "high";
  }

  // 3️⃣ PROBLEMAS TÉCNICOS (prioridad media-alta)
  const technicalKeywords = [
    "error",
    "no funciona",
    "problema",
    "bug",
    "falla",
    "fallo",
    "caído",
    "no carga",
    "lento",
  ];

  if (technicalKeywords.some((keyword) => messageLower.includes(keyword))) {
    return "medium";
  }

  // 4️⃣ USUARIOS BÁSICOS/REGISTRADOS (prioridad media)
  if (["basic", "registered", "user"].includes(userRole || "")) {
    return "medium";
  }

  // 5️⃣ CONSULTAS GENERALES (prioridad baja)
  const generalKeywords = [
    "información",
    "consulta",
    "pregunta general",
    "quiero saber",
    "me gustaría saber",
    "cuál es",
    "qué es",
  ];

  if (generalKeywords.some((keyword) => messageLower.includes(keyword))) {
    return "low";
  }

  // 6️⃣ POR DEFECTO: Visitantes sin cuenta → baja prioridad
  return userRole ? "medium" : "low";
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, userId, userRole } = body;

    // ========== VALIDACIONES ==========

    // Validar campos obligatorios
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Todos los campos son obligatorios",
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Por favor, ingresa un correo electrónico válido",
        },
        { status: 400 }
      );
    }

    // Validar longitud del nombre
    if (name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "El nombre debe tener al menos 2 caracteres",
        },
        { status: 400 }
      );
    }

    // Validar longitud del mensaje
    if (message.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "El mensaje debe tener al menos 10 caracteres",
        },
        { status: 400 }
      );
    }

    if (message.trim().length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "El mensaje es demasiado largo (máximo 5000 caracteres)",
        },
        { status: 400 }
      );
    }

    // ========== OBTENER INFORMACIÓN ADICIONAL ==========

    // Obtener IP del usuario (opcional, para seguridad)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    // ========== CALCULAR PRIORIDAD INTELIGENTE ==========
    const calculatedPriority = calculateSmartPriority(
      message.trim(),
      userRole
    );

    // ========== GUARDAR EN FIRESTORE ==========

    console.log("💾 Guardando mensaje en Firestore...");

    const contactRef = collection(db, "contactMessages");
    const docRef = await addDoc(contactRef, {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      userId: userId || null,
      userRole: userRole || null,
      status: "new",
      priority: calculatedPriority, // ✅ Prioridad inteligente híbrida
      tags: [],
      adminNotes: null,
      ipAddress: ipAddress,
      createdAt: serverTimestamp(),
      readAt: null,
      repliedAt: null,
    });

    console.log("✅ Mensaje guardado en Firestore con ID:", docRef.id);
    console.log(
      `📊 Prioridad asignada: ${calculatedPriority} (Rol: ${userRole || "Sin cuenta"})`
    );

    // ========== ENVIAR NOTIFICACIÓN POR EMAIL ==========

    console.log("📧 Enviando notificación por email...");

    try {
      const emailResult = await sendContactNotification({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        message: message.trim(),
        userId: userId || null,
        userRole: userRole || null,
      });

      if (emailResult.success) {
        console.log("✅ Email enviado exitosamente");
      } else {
        console.warn(
          "⚠️ El mensaje se guardó pero el email falló:",
          emailResult.error
        );
        // No fallar la petición si solo falla el email
      }
    } catch (emailError) {
      console.error(
        "⚠️ Error al enviar email (mensaje guardado):",
        emailError
      );
      // No fallar la petición si solo falla el email
    }

    // ========== RESPUESTA EXITOSA ==========

    return NextResponse.json(
      {
        success: true,
        message: "Mensaje enviado exitosamente",
        messageId: docRef.id,
        priority: calculatedPriority, // ✅ Devolver prioridad para debugging
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error al procesar mensaje de contacto:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar el mensaje. Por favor, inténtalo de nuevo.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar que el endpoint está activo
export async function GET() {
  return NextResponse.json(
    {
      message: "Contact API endpoint is active",
      methods: ["POST"],
    },
    { status: 200 }
  );
}