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

// ── Caché en memoria (persiste por lifetime de la pestaña) ──────────────────
let cachedNacional: HistoricoMes[] | null = null;

// ── Caché en sessionStorage (persiste entre reloads de la misma sesión) ──────
// Solo guarda la serie nacional porque es la más pesada (~50-100 KB JSON).
// Se invalida automáticamente cuando el navegador cierra la pestaña.
const SESSION_KEY_NACIONAL = "sefix:serie_historico:v1";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutos

function readSessionCache(): HistoricoMes[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_NACIONAL);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw) as { ts: number; data: HistoricoMes[] };
    if (Date.now() - ts > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY_NACIONAL);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeSessionCache(data: HistoricoMes[]): void {
  try {
    sessionStorage.setItem(SESSION_KEY_NACIONAL, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // sessionStorage puede lanzar en modo privado o con almacenamiento lleno; ignorar
  }
}

/**
 * Carga la serie nacional pre-agregada (rápida, ~200ms).
 * Estrategia de caché en 3 niveles:
 *   1. Módulo JS (mismo render, instantáneo)
 *   2. sessionStorage (reload en misma sesión, sin red)
 *   3. HTTP Cache-Control: max-age=1800 del servidor (visitas repetidas)
 */
async function loadNacionalSeries(): Promise<HistoricoMes[]> {
  if (cachedNacional) return cachedNacional;

  // Nivel 2: sessionStorage
  const fromSession = readSessionCache();
  if (fromSession) {
    cachedNacional = fromSession;
    return cachedNacional;
  }

  const res = await fetch("/api/sefix/serie-historico");
  if (!res.ok) throw new Error(`Error ${res.status} al cargar datos históricos`);
  const { data } = (await res.json()) as { data: HistoricoMes[] };
  cachedNacional = data ?? [];

  // Persistir en sessionStorage para la próxima carga de la misma sesión
  writeSessionCache(cachedNacional);

  return cachedNacional;
}

/** Cache en memoria de series geo-filtradas (por clave de filtro + año) */
const geoCache = new Map<string, HistoricoMes[]>();

/**
 * Carga la serie histórica filtrada por entidad/municipio/secciones.
 * Los JSON ya están pre-generados en Firebase Storage — respuesta en ~500-800ms.
 * Para consultas repetidas dentro de la misma sesión, devuelve el caché en memoria
 * sin tocar la red (la primera carga ya fue pagada).
 */
async function loadGeoSeries(
  geo: GeoInfo,
  year: number,
  signal?: AbortSignal,
): Promise<HistoricoMes[]> {
  const params = new URLSearchParams({ entidad: geo.entidad, year: String(year) });
  if (geo.distrito && geo.distrito !== "Todos") params.set("distrito", geo.distrito);
  if (geo.cveDistrito) params.set("cveDistrito", geo.cveDistrito);
  if (geo.municipio && geo.municipio !== "Todos") params.set("municipio", geo.municipio);
  if (geo.cveMunicipio) params.set("cveMunicipio", geo.cveMunicipio);
  if (geo.secciones && geo.secciones.length > 0) {
    params.set("secciones", geo.secciones.join(","));
  }
  const key = params.toString();

  const fromCache = geoCache.get(key);
  if (fromCache) return fromCache;

  const res = await fetch(`/api/sefix/historico-geo?${key}`, { signal });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        "Datos no pre-generados para esta entidad. Ejecuta scripts/pregenerate-sefix.ts."
      );
    }
    throw new Error(`Error ${res.status} al cargar datos geográficos`);
  }

  const body = (await res.json()) as { data?: HistoricoMes[] };
  const series = body.data ?? [];
  // Guardar en caché: si el usuario regresa al mismo filtro, no re-descarga
  if (series.length > 0) geoCache.set(key, series);
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
  /** NB anual: un punto por año (último corte). Solo para vistas no geo-filtradas. */
  nbAnnual: { year: number; padron: number; lista: number }[] | null;
  texts: HistoricoTexts | null;
}

/**
 * geoInfo: cuando entidad !== "Nacional", carga datos del endpoint geo-filtrado.
 * Los JSON pre-generados hacen que la carga sea ~500-800ms incluso para estados grandes.
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
  const [nbAnnual, setNbAnnual] = useState<{ year: number; padron: number; lista: number }[] | null>(null);

  const lastGeoKeyRef = useRef<string>("");

  const isGeo = geoInfo && geoInfo.entidad !== "Nacional";

  // Clave de dependencia: incluye ambito y año. Cambiar entre Nacional/Extranjero
  // dispara recarga porque la fuente de datos difiere (serie_historico.csv vs __EXTRANJERO__).
  const geoKey = isGeo
    ? `${geoInfo.entidad}|${geoInfo.cveDistrito ?? ""}|${geoInfo.cveMunicipio ?? ""}|${(geoInfo.secciones ?? []).sort().join(",")}|${selectedYear ?? ""}`
    : `${ambito}|${selectedYear ?? ""}`;

  useEffect(() => {
    if (geoKey === lastGeoKeyRef.current && raw !== null) return;

    const abortController = new AbortController();
    setIsLoading(true);
    setError(null);

    const year = selectedYear ?? new Date().getFullYear();

    // Para ámbito extranjero sin filtro geo, cargar el agregado nacional de
    // RESIDENTES EXTRANJERO desde los JSON pre-generados (__EXTRANJERO__).
    // serie_historico.csv no incluye columnas de extranjero.
    const extranjeroNacionalGeo: GeoInfo = {
      entidad: "__EXTRANJERO__",
      distrito: "Todos",
      municipio: "Todos",
      seccion: "Todas",
    };

    const loader = isGeo
      ? loadGeoSeries(geoInfo!, year, abortController.signal)
      : ambito === "extranjero"
        ? loadGeoSeries(extranjeroNacionalGeo, year, abortController.signal)
        : loadNacionalSeries();

    loader
      .then((series) => {
        if (abortController.signal.aborted) return;
        lastGeoKeyRef.current = geoKey;
        setRaw(series);
        const years = [...new Set(series.map((m) => m.year))].sort((a, b) => a - b);
        setAvailableYears(years);
        setIsLoading(false);
      })
      .catch((e: Error) => {
        if (abortController.signal.aborted) return;
        setError(e.message);
        setIsLoading(false);
      });

    return () => {
      abortController.abort();
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
    () => (raw ? computeG2Data(raw, ambito, year) : []),
    [raw, ambito, year]
  );
  // G3 (evolución LNE multi-año) solo hasta el año seleccionado
  const filteredYears = useMemo(
    () => availableYears.filter((y) => y <= year),
    [availableYears, year]
  );
  const g3Data = useMemo(
    () => (raw ? computeG3Data(raw, ambito, filteredYears) : []),
    [raw, ambito, filteredYears]
  );
  const g3SexData = useMemo(
    () => (raw ? computeG3SexData(raw, ambito, year) : []),
    [raw, ambito, year]
  );
  const texts = useMemo(
    () => (raw ? generateHistoricoTexts(raw, year, ambito) : null),
    [raw, year, ambito]
  );

  // Fetch datos No Binario semanal (último corte) — se actualiza con el filtro geo activo
  useEffect(() => {
    if (isGeo && geoInfo) {
      const params = new URLSearchParams({ entidad: geoInfo.entidad });
      if (geoInfo.cveMunicipio) params.set("cveMunicipio", geoInfo.cveMunicipio);
      if (geoInfo.secciones?.length) params.set("secciones", geoInfo.secciones.join(","));

      fetch(`/api/sefix/semanal-nb?${params}`)
        .then((r) => r.json())
        .then(({ data }: { data?: { padron: number; lista: number } | null }) => {
          setNbLatest(data ?? null);
        })
        .catch(() => setNbLatest(null));
    } else {
      const nbAmbito = ambito === "extranjero" ? "extranjero" : "nacional";
      fetch(`/api/sefix/serie-semanal?tipo=sexo&ambito=${nbAmbito}`)
        .then((r) => r.json())
        .then(({ data }: { data?: Record<string, number> }) => {
          const p = data?.padron_no_binario ?? 0;
          const l = data?.lista_no_binario ?? 0;
          setNbLatest(p > 0 ? { padron: p, lista: l } : null);
        })
        .catch(() => setNbLatest(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoKey]);

  // Fetch NB anual histórico — solo para vistas no geo-filtradas (nacional/extranjero).
  // Para vistas geo-filtradas, los valores NB vienen del propio raw (pnb por sección).
  useEffect(() => {
    if (isGeo) {
      setNbAnnual(null);
      return;
    }
    const nbAmbito = ambito === "extranjero" ? "extranjero" : "nacional";
    fetch(`/api/sefix/nb-anual?ambito=${nbAmbito}`)
      .then((r) => r.json())
      .then(({ data }: { data?: { year: number; padronNB: number; listaNB: number }[] }) => {
        const mapped = (data ?? []).map((d) => ({ year: d.year, padron: d.padronNB, lista: d.listaNB }));
        setNbAnnual(mapped.length > 0 ? mapped : null);
      })
      .catch(() => setNbAnnual(null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambito, isGeo ? geoKey : ambito]);

  return { isLoading, error, availableYears, g1Data, g2Data, g3Data, g3SexData, nbLatest, nbAnnual, texts };
}
