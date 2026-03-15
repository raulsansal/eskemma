// lib/moddulo/changelog.ts
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { ChangelogEntry, PhaseId, ChangeSource } from "@/types/moddulo.types";

const SUBCOLLECTION = "changelog";

// ==========================================
// REGISTRAR UN CAMBIO
// ==========================================

export async function logChange(
  projectId: string,
  entry: Omit<ChangelogEntry, "id" | "timestamp">
): Promise<void> {
  await adminDb
    .collection("moddulo_projects")
    .doc(projectId)
    .collection(SUBCOLLECTION)
    .add({
      ...entry,
      timestamp: FieldValue.serverTimestamp(),
    });
}

// ==========================================
// HELPERS DE REGISTRO
// ==========================================

export async function logUserChange(
  projectId: string,
  userId: string,
  phaseId: PhaseId | "project",
  action: string,
  options?: {
    previousValue?: unknown;
    newValue?: unknown;
    reason?: string;
  }
): Promise<void> {
  await logChange(projectId, {
    userId,
    phaseId,
    action,
    source: "user",
    ...options,
  });
}

export async function logAISuggestion(
  projectId: string,
  userId: string,
  phaseId: PhaseId,
  action: string,
  newValue?: unknown
): Promise<void> {
  await logChange(projectId, {
    userId,
    phaseId,
    action,
    source: "ai-suggestion",
    newValue,
  });
}

export async function logPropagation(
  projectId: string,
  userId: string,
  phaseId: PhaseId,
  action: string,
  reason?: string
): Promise<void> {
  await logChange(projectId, {
    userId,
    phaseId,
    action,
    source: "propagation",
    reason,
  });
}

// ==========================================
// LEER BITÁCORA
// ==========================================

export async function getChangelog(
  projectId: string,
  options?: { limit?: number; phaseId?: PhaseId | "project" }
): Promise<ChangelogEntry[]> {
  let query = adminDb
    .collection("moddulo_projects")
    .doc(projectId)
    .collection(SUBCOLLECTION)
    .orderBy("timestamp", "desc");

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  const snap = await query.get();
  const entries = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ChangelogEntry[];

  if (options?.phaseId) {
    return entries.filter((e) => e.phaseId === options.phaseId);
  }

  return entries;
}
