"use client";

import { useState, useEffect } from "react";

export type OrigenMatrizData = {
  fecha: string;
  por_entidad: Record<string, { nacional: Record<string, number>; extranjero: Record<string, number> }>;
};

let globalCache: OrigenMatrizData | null = null;

export function useLneOrigenMatriz() {
  const [data, setData] = useState<OrigenMatrizData | null>(globalCache);
  const [isLoading, setIsLoading] = useState(!globalCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (globalCache) return;
    fetch("/api/sefix/semanal-origen-matriz")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json() as Promise<OrigenMatrizData>;
      })
      .then((d) => {
        globalCache = d;
        setData(d);
      })
      .catch(() => setError("Error al cargar datos de origen"))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}
