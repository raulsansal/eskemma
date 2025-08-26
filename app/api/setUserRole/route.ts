// app/api/setUserRole/route.ts
import { NextResponse } from 'next/server';
import { admin } from '@/firebase/adminConfig'; // Importa Firebase Admin SDK

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, role } = body;

    // Validar que se proporcionen los campos necesarios
    if (!uid || !role) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (uid, role)' },
        { status: 400 }
      );
    }

    // Asignar el Custom Claim usando Firebase Admin SDK
    await admin.setCustomUserClaims(uid, { role });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al asignar el rol:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error interno del servidor' },
      { status: 500 }
    );
  }
}