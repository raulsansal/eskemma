// app/moddulo/proyecto/[projectId]/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStrategyContext } from '@/app/moddulo/components/StrategyContextProvider';
import { PHASE_TO_LAYER } from '@/types/strategy-context.types';

export default function ProjectIndexPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const { project, loading } = useStrategyContext();

  useEffect(() => {
    if (!loading && project && projectId) {
      // Redirigir a la fase actual del proyecto
      const currentPhase = project.currentPhase;
      const layer = PHASE_TO_LAYER[currentPhase];
      router.replace(`/moddulo/proyecto/${projectId}/${layer}/${currentPhase}`);
    }
  }, [loading, project, projectId, router]);

  // Mostrar loading mientras redirige
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-bluegreen-eske border-t-transparent" />
        <p className="mt-4 text-gray-eske-70">Cargando proyecto...</p>
      </div>
    </div>
  );
}