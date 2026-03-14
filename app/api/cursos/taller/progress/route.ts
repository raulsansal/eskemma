// app/api/cursos/taller/progress/route.ts
// ============================================================
// API PARA OBTENER Y ACTUALIZAR PROGRESO DEL TALLER
// UBICACIÓN CORRECTA: /api/cursos/taller/progress
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

const WORKSHOP_ID = "taller-diagnostico-electoral";

/**
 * GET /api/cursos/taller/progress?userId=xxx
 * Obtiene el progreso de un usuario en el taller
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId) {
      return NextResponse.json({ error: "Se requiere userId" }, { status: 400 });
    }

    // Verificar que el usuario solo acceda a sus propios datos
    if (session.uid !== userId) {
      return NextResponse.json({ error: "No autorizado para ver estos datos" }, { status: 403 });
    }

    // Obtener datos de Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const workshopProgress = userData?.workshopProgress?.[WORKSHOP_ID] || null;

    // Si se solicita una sesión específica, devolver solo esa información
    if (sessionId && workshopProgress) {
      const sessionCompleted = workshopProgress.sessionsCompleted?.[sessionId];
      return NextResponse.json({
        sessionCompleted: !!sessionCompleted,
        completedAt: sessionCompleted?.completedAt || null,
        exercisesCompleted: sessionCompleted?.exercisesCompleted || [],
      });
    }

    return NextResponse.json({
      progress: workshopProgress,
    });
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cursos/taller/progress
 * Actualiza el progreso de una sesión
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { userId, sessionId, exerciseCompleted } = body;

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: userId, sessionId" },
        { status: 400 }
      );
    }

    if (session.uid !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const now = new Date().toISOString();
    const progressPath = `workshopProgress.${WORKSHOP_ID}`;

    // Obtener progreso actual para calcular porcentaje
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const currentProgress = userData?.workshopProgress?.[WORKSHOP_ID];

    // Preparar actualización
    const updates: Record<string, any> = {
      [`${progressPath}.lastAccessedAt`]: now,
    };

    // Si no hay progreso, iniciarlo
    if (!currentProgress) {
      updates[`${progressPath}.startedAt`] = now;
      updates[`${progressPath}.completionPercentage`] = 0;
      updates[`${progressPath}.sessionsCompleted`] = {};
    }

    // Actualizar sesión
    const sessionCompleted = currentProgress?.sessionsCompleted?.[sessionId];
    
    if (!sessionCompleted) {
      updates[`${progressPath}.sessionsCompleted.${sessionId}`] = {
        completedAt: now,
        exercisesCompleted: exerciseCompleted ? [exerciseCompleted] : [],
      };
      
      // Calcular nuevo porcentaje (esto es simplificado, en producción necesitarías el total de sesiones)
      // Por ahora incrementamos 2.5% como placeholder
      updates[`${progressPath}.completionPercentage`] = 
        (currentProgress?.completionPercentage || 0) + 2.5;
    } else if (exerciseCompleted && !sessionCompleted.exercisesCompleted?.includes(exerciseCompleted)) {
      // Agregar ejercicio a sesión existente - CORREGIDO: usar FieldValue importado
      updates[`${progressPath}.sessionsCompleted.${sessionId}.exercisesCompleted`] = 
        FieldValue.arrayUnion(exerciseCompleted);
    }

    // Actualizar en Firestore
    await adminDb.collection("users").doc(userId).update(updates);

    return NextResponse.json({ 
      success: true,
      message: "Progreso actualizado correctamente" 
    });
  } catch (error) {
    console.error("Error al actualizar progreso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}