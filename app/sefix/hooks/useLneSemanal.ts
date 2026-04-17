"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SemanalTipo } from "@/lib/sefix/storage";
import type { Ambito } from "@/lib/sefix/seriesUtils";

// ──────────────────────────────────────────────────────────────
// Caché en módulo: evita re-fetches al cambiar sub-panel
// Key: `${ambito}_${tipo}_${corte}`
// ──────────────────────────────────────────────────────────────
type SemanalCacheEntry = {
  data: Record<string, number>;
  fecha: string;
  availableFechas: string[];
};
const cache = new Map<string, SemanalCacheEntry>();

interface UseLneSemanalResult {
  isLoading: boolean;
  error: string | null;
  data: Record<string, number> | null;
  fecha: string;
  availableFechas: string[];
}

/**
 * Carga datos semanales pre-agregados para un tipo y ámbito.
 *
 * Sin filtro geográfico (entidad = null):
 *   → GET /api/sefix/serie-semanal (lee CSV pre-agregado, ~200ms, sin CORS)
 *
 * Con filtro geográfico (entidad definida):
 *   → GET /api/sefix/semanal (procesa archivo crudo en el servidor)
 */
export function useLneSemanal(
  tipo: SemanalTipo,
  ambito: Ambito = "nacional",
  corte?: string,
  entidad?: string | null
): UseLneSemanalResult {
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [fecha, setFecha] = useState("");
  const [availableFechas, setAvailableFechas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const load = useCallback(async () => {
    cancelRef.current = false;
    setIsLoading(true);
    setError(null);

    try {
      let url: string;

      if (entidad) {
        // Con filtro geográfico: API route que procesa archivos crudos
        const p = new URLSearchParams({ tipo, ambito });
        if (corte) p.set("corte", corte);
        p.set("entidad", entidad);
        url = `/api/sefix/semanal?${p}`;
      } else {
        // Sin filtro: API route ligera que lee el CSV pre-agregado (~200ms)
        const cacheKey = `${ambito}_${tipo}_${corte ?? "latest"}`;
        const cached = cache.get(cacheKey);
        if (cached) {
          if (cancelRef.current) return;
          setData(cached.data);
          setFecha(cached.fecha);
          setAvailableFechas(cached.availableFechas);
          setIsLoading(false);
          return;
        }

        const p = new URLSearchParams({ tipo, ambito });
        if (corte) p.set("corte", corte);
        url = `/api/sefix/serie-semanal?${p}`;
      }

      const res = await fetch(url);
      if (cancelRef.current) return;
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }

      const json = (await res.json()) as {
        data?: Record<string, number>;
        ambitos?: { nacional: Record<string, number>; extranjero: Record<string, number> };
        fecha?: string;
        availableFechas?: string[];
      };

      if (cancelRef.current) return;

      // El endpoint /api/sefix/semanal devuelve { ambitos: { nacional, extranjero } }
      // El endpoint /api/sefix/serie-semanal devuelve { data }
      const resolved: Record<string, number> =
        json.data ?? json.ambitos?.[ambito] ?? {};
      const resolvedFecha = json.fecha ?? "";
      const resolvedFechas = json.availableFechas ?? [];

      setData(resolved);
      setFecha(resolvedFecha);
      setAvailableFechas(resolvedFechas);

      // Cachear solo las peticiones sin filtro geográfico
      if (!entidad) {
        const cacheKey = `${ambito}_${tipo}_${corte ?? "latest"}`;
        cache.set(cacheKey, {
          data: resolved,
          fecha: resolvedFecha,
          availableFechas: resolvedFechas,
        });
      }
    } catch (e) {
      if (cancelRef.current) return;
      setError(e instanceof Error ? e.message : "Error al cargar datos");
      setData(null);
    } finally {
      if (!cancelRef.current) setIsLoading(false);
    }
  }, [tipo, ambito, corte, entidad]);

  useEffect(() => {
    cancelRef.current = false;
    load();
    return () => {
      cancelRef.current = true;
    };
  }, [load]);

  return { isLoading, error, data, fecha, availableFechas };
}

// ──────────────────────────────────────────────────────────────
// Hook para cascade geográfica
// ──────────────────────────────────────────────────────────────
interface GeoOpcion {
  cve: string;
  nombre: string;
}

export function useGeoTerritorios(
  nivel: "distrito" | "municipio" | "seccion",
  entidad?: string,
  distrito?: string,
  municipio?: string,
  year?: number,
  source?: "semanal"
) {
  const [opciones, setOpciones] = useState<GeoOpcion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (nivel === "distrito" && !entidad) { setOpciones([]); return; }
    if (nivel === "municipio" && (!entidad || !distrito)) { setOpciones([]); return; }
    if (nivel === "seccion" && (!entidad || !municipio)) { setOpciones([]); return; }

    let cancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams({ nivel });
    if (entidad) params.set("entidad", entidad);
    if (distrito) params.set("distrito", distrito);
    if (municipio) params.set("municipio", municipio);
    if (source) params.set("source", source);
    else if (year) params.set("year", String(year));

    fetch(`/api/sefix/territorios?${params}`)
      .then((r) => r.json())
      .then(({ opciones: opts }: { opciones: GeoOpcion[] }) => {
        if (!cancelled) { setOpciones(opts ?? []); setIsLoading(false); }
      })
      .catch(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [nivel, entidad, distrito, municipio, year, source]);

  return { opciones, isLoading };
}
