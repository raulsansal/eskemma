// app/api/moddulo/projects/[projectId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/server/auth-helpers";
import { getProject, updateProject } from "@/lib/moddulo/project";
import type { UpdateProjectInput } from "@/types/moddulo.types";

// GET: Obtener proyecto individual
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { projectId } = await params;
    const project = await getProject(projectId, session.uid);

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error al obtener proyecto:", error);
    return NextResponse.json({ error: "Error al obtener proyecto" }, { status: 500 });
  }
}

// PATCH: Actualizar proyecto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { projectId } = await params;
    const input: UpdateProjectInput = await request.json();

    await updateProject(projectId, session.uid, input);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    const message = error instanceof Error ? error.message : "Error al actualizar proyecto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
