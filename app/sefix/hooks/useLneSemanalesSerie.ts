"use client";

import { useState, useEffect, useRef } from "react";
import type { SemanalTipo } from "@/lib/sefix/storage";
import type { Ambito } from "@/lib/sefix/seriesUtils";

// ──────────────────────────────────────────────────────────────
// Tipo: una fila de la serie temporal semanal
// Tiene siempre "fecha" (YYYY-MM-DD) + métricas numéricas
// ──────────────────────────────────────────────────────────────
export interface SemanalSerieRow {
  fecha: string;
  [key: string]: number | string;
}

// ──────────────────────────────────────────────────────────────
// Caché en módulo JS: evita re-fetches al cambiar de tab
// Key: `${ambito}_${tipo}_serie`
// ──────────────────────────────────────────────────────────────
type SerieCache = {
  serie: SemanalSerieRow[];
  availableFechas: string[];
};
const cache = new Map<string, SerieCache>();

interface UseLneSemanalesSerieResult {
  isLoading: boolean;
  error: string | null;
  serie: SemanalSerieRow[];
  availableFechas: string[];
}

/**
 * Carga la serie temporal completa (todas las semanas) para un tipo y ámbito.
 * Usa el endpoint /api/sefix/serie-semanal?todas=true.
 * Cuando se pasa entidad, carga la serie específica de esa entidad desde el JSON pre-generado.
 */
export function useLneSemanalesSerie(
  tipo: SemanalTipo,
  ambito: Ambito = "nacional",
  entidad?: string | null
): UseLneSemanalesSerieResult {
  const [serie, setSerie] = useState<SemanalSerieRow[]>([]);
  const [availableFechas, setAvailableFechas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    setIsLoading(true);
    setError(null);

    const cacheKey = `${ambito}_${tipo}_${entidad ?? ""}_serie`;
    const cached = cache.get(cacheKey);
    if (cached) {
      setSerie(cached.serie);
      setAvailableFechas(cached.availableFechas);
      setIsLoading(false);
      return;
    }

    const params = new URLSearchParams({ tipo, ambito, todas: "true" });
    if (entidad) params.set("entidad", entidad);
    fetch(`/api/sefix/serie-semanal?${params}`)
      .then(async (res) => {
        if (cancelRef.current) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error ?? `HTTP ${res.status}`
          );
        }
        return res.json() as Promise<{
          serie: SemanalSerieRow[];
          availableFechas: string[];
        }>;
      })
      .then((json) => {
        if (cancelRef.current || !json) return;
        const s = json.serie ?? [];
        const f = json.availableFechas ?? [];
        setSerie(s);
        setAvailableFechas(f);
        cache.set(cacheKey, { serie: s, availableFechas: f });
      })
      .catch((e) => {
        if (cancelRef.current) return;
        setError(e instanceof Error ? e.message : "Error al cargar serie");
        setSerie([]);
      })
      .finally(() => {
        if (!cancelRef.current) setIsLoading(false);
      });

    return () => {
      cancelRef.current = true;
    };
  }, [tipo, ambito, entidad]);

  return { isLoading, error, serie, availableFechas };
}
