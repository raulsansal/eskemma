"use client";

import { useState, useEffect, useRef } from "react";
import type { ResultadosChartData } from "@/types/sefix.types";

interface UseResultadosOptions {
  estado: string;
  cargo: string;
  anio?: number;
}

interface UseResultadosReturn {
  data: ResultadosChartData | null;
  isLoading: boolean;
  error: string | null;
}

interface UseResultadosAllYearsReturn {
  data: ResultadosChartData[];
  isLoading: boolean;
  error: string | null;
}

const DEBOUNCE_MS = 300;

/** Hook para obtener resultados de un año específico (o el más reciente) */
export function useResultados({
  estado,
  cargo,
  anio,
}: UseResultadosOptions): UseResultadosReturn {
  const [data, setData] = useState<ResultadosChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cargo) {
      setData(null);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ cargo });
        if (estado) params.set("estado", estado);
        if (anio) params.set("anio", String(anio));
        const res = await fetch(`/api/sefix/resultados?${params}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Error ${res.status}`);
        }
        const json = await res.json();
        setData(json.resultados ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar resultados");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [estado, cargo, anio]);

  return { data, isLoading, error };
}

/** Hook para obtener resultados de todos los años disponibles (serie histórica) */
export function useResultadosAllYears({
  estado,
  cargo,
}: Omit<UseResultadosOptions, "anio">): UseResultadosAllYearsReturn {
  const [data, setData] = useState<ResultadosChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cargo) {
      setData([]);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ cargo, all_years: "true" });
        if (estado) params.set("estado", estado);
        const res = await fetch(`/api/sefix/resultados?${params}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Error ${res.status}`);
        }
        const json = await res.json();
        setData(json.resultados ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar historial");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [estado, cargo]);

  return { data, isLoading, error };
}

/** Hook para obtener los años disponibles para un cargo */
export function useAvailableYears(cargo: string): {
  years: number[];
  isLoading: boolean;
} {
  const [years, setYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!cargo) return;
    setIsLoading(true);
    const params = new URLSearchParams({ cargo, available_years: "1" });
    fetch(`/api/sefix/resultados?${params}`)
      .then((r) => r.json())
      .then((json) => setYears(json.availableYears ?? []))
      .catch(() => setYears([]))
      .finally(() => setIsLoading(false));
  }, [cargo]);

  return { years, isLoading };
}
