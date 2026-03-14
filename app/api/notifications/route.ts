// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";

// GET: Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const notificationsRef = adminDb
      .collection("notifications")
      .where("userId", "==", session.uid)
      .orderBy("createdAt", "desc")
      .limit(20);

    const notificationsSnapshot = await notificationsRef.get();

    const notifications = notificationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        message: data.message,
        postId: data.postId,
        postSlug: data.postSlug,
        commentId: data.commentId,
        isRead: data.isRead || false,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      };
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

// PATCH: Marcar notificaciones como leídas
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { notificationIds } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "notificationIds debe ser un array" },
        { status: 400 }
      );
    }

    // Marcar como leídas
    const batch = adminDb.batch();

    for (const notifId of notificationIds) {
      const notifRef = adminDb.collection("notifications").doc(notifId);
      batch.update(notifRef, { isRead: true });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Notificaciones marcadas como leídas",
    });
  } catch (error) {
    console.error("Error al actualizar notificaciones:", error);
    return NextResponse.json(
      { error: "Error al actualizar notificaciones" },
      { status: 500 }
    );
  }
}