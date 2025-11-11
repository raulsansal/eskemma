// app/api/admin/set-admin-claim/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'UID es requerido' },
        { status: 400 }
      );
    }

    // ✅ Asignar Custom Claim "admin"
    await adminAuth.setCustomUserClaims(uid, { role: 'admin' });

    console.log(`✅ Custom Claim "admin" asignado al usuario: ${uid}`);

    return NextResponse.json({
      success: true,
      message: 'Custom Claim asignado correctamente. Por favor, cierra sesión y vuelve a iniciar sesión.',
    });
  } catch (error: any) {
    console.error('❌ Error al asignar Custom Claim:', error);
    return NextResponse.json(
      { error: error.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}