// app/api/auth/find-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth'; // ← AGREGAR esta importación

// Inicializar Firebase Admin SDK
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
const adminAuth = getAuth(); // ← Crear instancia de Admin Auth

export async function POST(request: NextRequest) {
  try {
    const { userName } = await request.json();

    // Validar entrada
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

    // Usar Admin SDK que ignora las reglas de seguridad
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

    // Validar datos esenciales
    if (!userData.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de usuario incompletos'
        },
        { status: 500 }
      );
    }

    // VERIFICAR MÉTODOS DE AUTENTICACIÓN CON ADMIN SDK
    let authMethods: string[] = [];
    try {
      const userRecord = await adminAuth.getUserByEmail(userData.email);
      authMethods = userRecord.providerData.map(provider => provider.providerId);
      console.log('🔐 Métodos de autenticación (Admin SDK):', authMethods);
    } catch (error) {
      console.error('Error al obtener métodos de autenticación:', error);
    }

    // Devolver información completa para el login
    return NextResponse.json({
      success: true,
      data: {
        email: userData.email,
        emailVerified: userData.emailVerified || false,
        profileCompleted: userData.profileCompleted || false,
        authMethods: authMethods, // ← Informar los métodos disponibles
        canUsePassword: authMethods.includes('password') // ← Indicar si puede usar contraseña
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