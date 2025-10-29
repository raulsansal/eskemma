// /pages/api/setUserRole.ts
import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/adminConfig";

export async function POST(request: Request) {
  try {
    // Parsear el cuerpo de la solicitud
    const body = await request.json();
    const { uid, role } = body;

    // Validar que se proporcionen los campos necesarios
    if (!uid || !role) {
      console.error("Faltan parámetros requeridos:", { uid, role });
      return NextResponse.json(
        { error: "Faltan parámetros requeridos (uid, role)" },
        { status: 400 }
      );
    }

    // Validar que el rol sea un string no vacío
    if (typeof role !== "string" || role.trim() === "") {
      console.error("El valor del rol no es válido:", { role });
      return NextResponse.json(
        { error: "El valor del rol no es válido. Debe ser un string no vacío." },
        { status: 400 }
      );
    }

    // Validar que el UID sea un string no vacío
    if (typeof uid !== "string" || uid.trim() === "") {
      console.error("El valor del UID no es válido:", { uid });
      return NextResponse.json(
        { error: "El valor del UID no es válido. Debe ser un string no vacío." },
        { status: 400 }
      );
    }

    // Asignar el Custom Claim usando Firebase Admin SDK
    await adminAuth.setCustomUserClaims(uid, { role });

    console.log("Rol asignado correctamente:", { uid, role });

    // Devolver una respuesta exitosa
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error al asignar el rol:", error);

    // Manejar errores específicos de Firebase Admin SDK
    if (error instanceof Error) {
      console.error("Detalles del error:", error.message);
      return NextResponse.json(
        { error: `Ocurrió un error interno del servidor: ${error.message}` },
        { status: 500 }
      );
    }

    // Manejar cualquier otro tipo de error
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al asignar el rol." },
      { status: 500 }
    );
  }
}