// app/api/moddulo/export/route.ts
/**
 * API Route para exportar proyectos a DOCX y PDF
 * Recibe los datos del proyecto directamente del cliente para evitar
 * problemas de permisos con Firebase en el servidor
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { generateStructuredContent } from '@/lib/export/content-generator';
import { generateDocx } from '@/lib/export/docx-generator';
import { generatePdf } from '@/lib/export/pdf-generator';
import { type ExportOptions, DEFAULT_EXPORT_OPTIONS, LOGO_PATHS } from '@/lib/export/export.types';
import { type StrategyProject } from '@/types/strategy-context.types';

// Función para cargar logos
async function loadLogos(): Promise<{ eskemma?: Buffer; moddulo?: Buffer }> {
  const logos: { eskemma?: Buffer; moddulo?: Buffer } = {};
  
  try {
    const eskemmaPath = join(process.cwd(), 'public', LOGO_PATHS.eskemma);
    logos.eskemma = await readFile(eskemmaPath);
  } catch (error) {
    console.warn('No se pudo cargar logo de Eskemma:', error);
  }
  
  try {
    const modduloPath = join(process.cwd(), 'public', LOGO_PATHS.moddulo);
    logos.moddulo = await readFile(modduloPath);
  } catch (error) {
    console.warn('No se pudo cargar logo de Moddulo:', error);
  }
  
  return logos;
}

// Función para convertir timestamps serializados de vuelta a objetos con toDate()
function hydrateTimestamps(project: Record<string, unknown>): StrategyProject {
  const createTimestampLike = (value: unknown) => {
    if (value && typeof value === 'object' && 'seconds' in value) {
      const seconds = (value as { seconds: number }).seconds;
      const nanoseconds = (value as { nanoseconds?: number }).nanoseconds || 0;
      return {
        seconds,
        nanoseconds,
        toDate: () => new Date(seconds * 1000 + nanoseconds / 1000000),
        toMillis: () => seconds * 1000 + nanoseconds / 1000000,
      };
    }
    // Si ya es un string de fecha ISO
    if (typeof value === 'string') {
      const date = new Date(value);
      return {
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => date,
        toMillis: () => date.getTime(),
      };
    }
    return value;
  };

  // Convertir timestamps principales
  if (project.createdAt) {
    project.createdAt = createTimestampLike(project.createdAt);
  }
  if (project.updatedAt) {
    project.updatedAt = createTimestampLike(project.updatedAt);
  }
  if (project.lastAccessedAt) {
    project.lastAccessedAt = createTimestampLike(project.lastAccessedAt);
  }

  // Convertir timestamps en phaseProgress
  if (project.phaseProgress && typeof project.phaseProgress === 'object') {
    const phaseProgress = project.phaseProgress as Record<string, Record<string, unknown>>;
    for (const phaseId of Object.keys(phaseProgress)) {
      const phase = phaseProgress[phaseId];
      if (phase) {
        if (phase.startedAt) {
          phase.startedAt = createTimestampLike(phase.startedAt);
        }
        if (phase.completedAt) {
          phase.completedAt = createTimestampLike(phase.completedAt);
        }
        if (phase.lastSavedAt) {
          phase.lastSavedAt = createTimestampLike(phase.lastSavedAt);
        }
      }
    }
  }

  // Convertir timestamps en datos de fases
  const layers = ['fundacion', 'estrategia', 'operacion'] as const;
  for (const layer of layers) {
    if (project[layer] && typeof project[layer] === 'object') {
      const layerData = project[layer] as Record<string, Record<string, unknown>>;
      for (const phaseKey of Object.keys(layerData)) {
        const phaseData = layerData[phaseKey];
        if (phaseData && phaseData.lastUpdated) {
          phaseData.lastUpdated = createTimestampLike(phaseData.lastUpdated);
        }
      }
    }
  }

  return project as unknown as StrategyProject;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project: rawProject, options: rawOptions } = body;

    if (!rawProject) {
      return NextResponse.json(
        { success: false, error: 'Se requieren los datos del proyecto' },
        { status: 400 }
      );
    }

    // Merge con opciones por defecto
    const options: ExportOptions = {
      ...DEFAULT_EXPORT_OPTIONS,
      ...rawOptions,
    };

    // Hidratar timestamps del proyecto
    const project = hydrateTimestamps(rawProject);

    // Cargar logos
    const logos = await loadLogos();

    // Generar contenido estructurado
    const structuredContent = generateStructuredContent(project, options);

    // Generar documento según formato
    let buffer: Buffer;
    let contentType: string;
    let fileExtension: string;

    if (options.format === 'docx') {
      buffer = await generateDocx(structuredContent, logos.eskemma, logos.moddulo);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileExtension = 'docx';
    } else if (options.format === 'pdf') {
      buffer = await generatePdf(structuredContent, logos.eskemma, logos.moddulo);
      contentType = 'application/pdf';
      fileExtension = 'pdf';
    } else {
      return NextResponse.json(
        { success: false, error: 'Formato no soportado' },
        { status: 400 }
      );
    }

    // Generar nombre de archivo
    // Mantener caracteres especiales del español para el nombre visible
    const sanitizedName = project.projectName
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    
    // Agregar sufijo según el alcance
    let scopeSuffix = '';
    if (options.scope === 'layers') {
      scopeSuffix = '_capas';
    } else if (options.scope === 'phases') {
      scopeSuffix = '_fases';
    }
    
    const filename = `${sanitizedName}${scopeSuffix}_${timestamp}.${fileExtension}`;
    
    // Para el nombre del archivo en ASCII (fallback para navegadores antiguos)
    const filenameAscii = filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N');
    
    // Codificar el nombre para UTF-8 según RFC 5987
    const filenameEncoded = encodeURIComponent(filename);

    // Devolver archivo - convertir Buffer a Uint8Array para NextResponse
    const uint8Array = new Uint8Array(buffer);
    
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Usar formato RFC 5987 para soportar caracteres UTF-8
        'Content-Disposition': `attachment; filename="${filenameAscii}"; filename*=UTF-8''${filenameEncoded}`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error en exportación:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al exportar proyecto' 
      },
      { status: 500 }
    );
  }
}

// GET para obtener opciones por defecto
export async function GET() {
  return NextResponse.json({
    success: true,
    supportedFormats: ['docx', 'pdf'],
    supportedScopes: ['full', 'layers', 'phases'],
    defaultOptions: DEFAULT_EXPORT_OPTIONS,
  });
}

