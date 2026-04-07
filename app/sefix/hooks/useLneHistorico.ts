"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { HistoricoMes } from "@/lib/sefix/storage";
import type { GeoInfo } from "@/app/sefix/components/lne/GeoFilter";
import {
  computeG1Data,
  computeG2Data,
  computeG3Data,
  computeG3SexData,
  generateHistoricoTexts,
  type Ambito,
  type G1Data,
  type G2Point,
  type G3Point,
  type G3SexPoint,
  type HistoricoTexts,
} from "@/lib/sefix/seriesUtils";

// Caché en módulo: persiste por el lifetime de la pestaña del navegador
let cachedNacional: HistoricoMes[] | null = null;

/**
 * Carga la serie nacional pre-agregada (rápida, ~200ms).
 * Se usa cuando no hay filtro geográfico activo.
 */
async function loadNacionalSeries(): Promise<HistoricoMes[]> {
  if (cachedNacional) return cachedNacional;
  const res = await fetch("/api/sefix/serie-historico");
  if (!res.ok) throw new Error(`Error ${res.status} al cargar datos históricos`);
  const { data } = (await res.json()) as { data: HistoricoMes[] };
  cachedNacional = data ?? [];
  return cachedNacional;
}

/** Cache de series geo-filtradas (por clave de filtro) */
const geoCache = new Map<string, HistoricoMes[]>();

/**
 * Carga la serie histórica filtrada por entidad/distrito/municipio/secciones.
 * Primera llamada tarda ~20-30s; después se cachea en módulo.
 */
async function loadGeoSeries(geo: GeoInfo): Promise<HistoricoMes[]> {
  const params = new URLSearchParams({ entidad: geo.entidad });
  // Usar nombres (cabecera_distrital / nombre_municipio) en lugar de CVEs:
  // son estables en todos los archivos históricos de DERFE
  if (geo.distrito && geo.distrito !== "Todos") params.set("distrito", geo.distrito);
  if (geo.municipio && geo.municipio !== "Todos") params.set("municipio", geo.municipio);
  if (geo.secciones && geo.secciones.length > 0) {
    params.set("secciones", geo.secciones.join(","));
  }
  const key = params.toString();

  const fromCache = geoCache.get(key);
  if (fromCache) return fromCache;

  // Timeout de 180s para evitar fetches colgados indefinidamente
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180_000);

  let res: Response;
  try {
    res = await fetch(`/api/sefix/historico-geo?${key}`, { signal: controller.signal });
  } catch (e) {
    clearTimeout(timeoutId);
    if ((e as Error).name === "AbortError") {
      throw new Error("La consulta tardó demasiado. Intenta con un filtro más específico.");
    }
    throw e;
  }
  clearTimeout(timeoutId);

  if (!res.ok) throw new Error(`Error ${res.status} al cargar datos geográficos`);
  const { data } = (await res.json()) as { data: HistoricoMes[] };
  const series = data ?? [];
  geoCache.set(key, series);
  return series;
}

// ──────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────
interface UseLneHistoricoResult {
  isLoading: boolean;
  error: string | null;
  availableYears: number[];
  g1Data: G1Data | null;
  g2Data: G2Point[];
  g3Data: G3Point[];
  g3SexData: G3SexPoint[];
  nbLatest: { padron: number; lista: number } | null;
  texts: HistoricoTexts | null;
}

/**
 * geoInfo: cuando entidad !== "Nacional", carga datos del endpoint geo-filtrado.
 * La primera carga geo puede tardar ~20-30s; las subsiguientes se sirven de caché.
 */
export function useLneHistorico(
  ambito: Ambito = "nacional",
  selectedYear?: number,
  geoInfo?: GeoInfo | null
): UseLneHistoricoResult {
  const [raw, setRaw] = useState<HistoricoMes[] | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nbLatest, setNbLatest] = useState<{ padron: number; lista: number } | null>(null);

  // Ref para saber qué geo se usó en la última carga (evitar re-fetches innecesarios)
  const lastGeoKeyRef = useRef<string>("");

  const isGeo = geoInfo && geoInfo.entidad !== "Nacional";

  // Clave de dependencia para el effect (serializar el filtro geo)
  const geoKey = isGeo
    ? `${geoInfo.entidad}|${geoInfo.cveDistrito ?? ""}|${geoInfo.cveMunicipio ?? ""}|${(geoInfo.secciones ?? []).sort().join(",")}`
    : "nacional";

  useEffect(() => {
    // Evitar re-fetch si el filtro geo no cambió
    if (geoKey === lastGeoKeyRef.current && raw !== null) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const loader = isGeo ? loadGeoSeries(geoInfo!) : loadNacionalSeries();

    loader
      .then((series) => {
        if (cancelled) return;
        lastGeoKeyRef.current = geoKey;
        setRaw(series);
        const years = [...new Set(series.map((m) => m.year))].sort((a, b) => a - b);
        setAvailableYears(years);
        setIsLoading(false);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoKey]);

  const year = useMemo(
    () =>
      selectedYear ??
      availableYears[availableYears.length - 1] ??
      new Date().getFullYear(),
    [selectedYear, availableYears]
  );

  const g1Data = useMemo(
    () => (raw ? computeG1Data(raw, year, ambito) : null),
    [raw, year, ambito]
  );
  const g2Data = useMemo(
    () => (raw ? computeG2Data(raw, ambito) : []),
    [raw, ambito]
  );
  const g3Data = useMemo(
    () => (raw ? computeG3Data(raw, ambito) : []),
    [raw, ambito]
  );
  const g3SexData = useMemo(
    () => (raw ? computeG3SexData(raw) : []),
    [raw]
  );
  const texts = useMemo(
    () => (raw ? generateHistoricoTexts(raw, year, ambito) : null),
    [raw, year, ambito]
  );

  // Fetch datos No Binario del último corte semanal (escala incompatible con H/M)
  useEffect(() => {
    fetch("/api/sefix/serie-semanal?tipo=sexo&ambito=nacional")
      .then((r) => r.json())
      .then(({ data }: { data?: Record<string, number> }) => {
        const p = data?.padron_no_binario ?? 0;
        const l = data?.lista_no_binario ?? 0;
        if (p > 0) setNbLatest({ padron: p, lista: l });
      })
      .catch(() => null);
  }, []);

  return { isLoading, error, availableYears, g1Data, g2Data, g3Data, g3SexData, nbLatest, texts };
}
