// app/api/auth/find-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const apps = getApps();
if (!apps.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export async function POST(request: NextRequest) {
  try {
    const { userName } = await request.json();

    if (!userName || typeof userName !== 'string' || userName.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nombre de usuario requerido' 
        },
        { status: 400 }
      );
    }

    const normalizedUserName = userName.trim().toLowerCase();
    console.log('🔍 Buscando usuario:', normalizedUserName);

    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef
      .where('userName', '==', normalizedUserName)
      .limit(1)
      .get();

    console.log('📊 Resultados encontrados:', snapshot.size);

    if (snapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado'
        },
        { status: 404 }
      );
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // ✅ OBTENER UID DEL DOCUMENTO
    const uid = userDoc.id;

    if (!userData.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de usuario incompletos'
        },
        { status: 500 }
      );
    }

    // Verificar métodos de autenticación
    let authMethods: string[] = [];
    try {
      const userRecord = await adminAuth.getUserByEmail(userData.email);
      authMethods = userRecord.providerData.map(provider => provider.providerId);
      console.log('🔐 Métodos de autenticación:', authMethods);
    } catch (error) {
      console.error('Error al obtener métodos de autenticación:', error);
    }

    // ✅ DEVOLVER UID EN LA RESPUESTA
    return NextResponse.json({
      success: true,
      data: {
        uid: uid, // ← AGREGAR ESTO
        email: userData.email,
        emailVerified: userData.emailVerified || false,
        profileCompleted: userData.profileCompleted || false,
        authMethods: authMethods,
        canUsePassword: authMethods.includes('password')
      }
    });

  } catch (error: any) {
    console.error('❌ Error en API find-user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Método no permitido' 
    },
    { status: 405 }
  );
}