// app/api/setUserRole/route.ts
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin"; // ← CAMBIAR IMPORT

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, role } = body;

    if (!uid || !role) {
      console.error("Faltan parámetros requeridos:", { uid, role });
      return NextResponse.json(
        { error: "Faltan parámetros requeridos (uid, role)" },
        { status: 400 }
      );
    }

    if (typeof role !== "string" || role.trim() === "") {
      console.error("El valor del rol no es válido:", { role });
      return NextResponse.json(
        { error: "El valor del rol no es válido. Debe ser un string no vacío." },
        { status: 400 }
      );
    }

    if (typeof uid !== "string" || uid.trim() === "") {
      console.error("El valor del UID no es válido:", { uid });
      return NextResponse.json(
        { error: "El valor del UID no es válido. Debe ser un string no vacío." },
        { status: 400 }
      );
    }

    // Asignar el Custom Claim
    await adminAuth.setCustomUserClaims(uid, { role });

    console.log("✅ Rol asignado correctamente:", { uid, role });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error al asignar el rol:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error inesperado al asignar el rol." },
      { status: 500 }
    );
  }
}