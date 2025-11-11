// app/api/test-admin/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    console.log('🔵 [test-admin] Probando Firebase Admin...');
    
    if (!adminAuth) {
      return NextResponse.json({
        error: 'adminAuth no está disponible',
        env: {
          hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
          hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
          hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        }
      }, { status: 500 });
    }
    
    // Intentar listar usuarios (solo el primero)
    const listUsersResult = await adminAuth.listUsers(1);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin funciona correctamente',
      usersCount: listUsersResult.users.length,
    });
  } catch (error: any) {
    console.error('❌ [test-admin] Error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}