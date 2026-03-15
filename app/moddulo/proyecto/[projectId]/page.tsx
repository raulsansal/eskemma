// app/moddulo/proyecto/[projectId]/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProjectIndexPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  useEffect(() => {
    if (projectId) {
      // Redirigir siempre a la fase de propósito (F1) como punto de entrada
      router.replace(`/moddulo/proyecto/${projectId}/proposito`);
    }
  }, [projectId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-bluegreen-eske border-t-transparent" />
    </div>
  );
}
