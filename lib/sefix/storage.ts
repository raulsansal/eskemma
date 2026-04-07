// lib/sefix/storage.ts
// Utilidades para leer y procesar los CSV de Sefix desde Firebase Storage
import { adminApp } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";
import { createInterface } from "readline";

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;

// ==========================================
// CACHÉ EN MEMORIA (TTL 30 min)
// ==========================================

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 30 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// ==========================================
// LECTURA STREAMING DE CSV
// ==========================================

function getBucket() {
  return getStorage(adminApp).bucket(BUCKET);
}

/** Lee un CSV de Storage línea por línea, filtrando y acumulando solo lo necesario */
async function streamCsvRows(
  storagePath: string,
  onRow: (row: Record<string, string>, headers: string[]) => void
): Promise<string[]> {
  const file = getBucket().file(storagePath);
  const stream = file.createReadStream();
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let headers: string[] = [];
  let isFirst = true;

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (isFirst) {
      headers = line.split(",").map((h) => h.trim());
      isFirst = false;
      continue;
    }
    const values = line.split(",");
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = (values[i] ?? "").trim();
    }
    onRow(row, headers);
  }

  return headers;
}

/** Lista los archivos CSV en un prefijo de Storage (con caché) */
export async function listStorageFiles(prefix: string): Promise<string[]> {
  const cacheKey = `list:${prefix}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  const [files] = await getBucket().getFiles({ prefix });
  const paths = files
    .map((f) => f.name)
    .filter((n) => n.endsWith(".csv") && !n.endsWith("/"));

  setCache(cacheKey, paths);
  return paths;
}

// ==========================================
// NORMALIZACIÓN DE ESTADO
// ==========================================

/**
 * Mapeo del nombre corto (usado en ESTADOS_LIST/UI) al nombre exacto que
 * aparece en la columna nombre_entidad de los CSVs de DERFE/INE.
 * Los cuatro estados listados tienen nombres constitucionales largos en sus
 * archivos de datos; los demás coinciden con el nombre corto.
 */
const DERFE_NOMBRE_MAP: Record<string, string> = {
  "COAHUILA":        "COAHUILA DE ZARAGOZA",
  "MICHOACAN":       "MICHOACAN DE OCAMPO",
  "VERACRUZ":        "VERACRUZ DE IGNACIO DE LA LLAVE",
  "ESTADO DE MEXICO": "MEXICO",   // DERFE usa "MEXICO" en sus archivos CSV
};

/** Traduce el nombre UI corto al nombre_entidad real del CSV de DERFE. */
function toDerfeNombre(nombre: string): string {
  return DERFE_NOMBRE_MAP[nombre] ?? nombre;
}

const ESTADO_MAP: Record<string, string> = {
  aguascalientes: "AGUASCALIENTES",
  baja_california: "BAJA CALIFORNIA",
  baja_california_sur: "BAJA CALIFORNIA SUR",
  campeche: "CAMPECHE",
  chiapas: "CHIAPAS",
  chihuahua: "CHIHUAHUA",
  coahuila: "COAHUILA",
  colima: "COLIMA",
  cdmx: "CIUDAD DE MEXICO",
  ciudad_de_mexico: "CIUDAD DE MEXICO",
  df: "CIUDAD DE MEXICO",
  durango: "DURANGO",
  estado_de_mexico: "ESTADO DE MEXICO",
  edomex: "ESTADO DE MEXICO",
  guanajuato: "GUANAJUATO",
  guerrero: "GUERRERO",
  hidalgo: "HIDALGO",
  jalisco: "JALISCO",
  michoacan: "MICHOACAN",
  morelos: "MORELOS",
  nayarit: "NAYARIT",
  nuevo_leon: "NUEVO LEON",
  oaxaca: "OAXACA",
  puebla: "PUEBLA",
  queretaro: "QUERETARO",
  quintana_roo: "QUINTANA ROO",
  san_luis_potosi: "SAN LUIS POTOSI",
  sinaloa: "SINALOA",
  sonora: "SONORA",
  tabasco: "TABASCO",
  tamaulipas: "TAMAULIPAS",
  tlaxcala: "TLAXCALA",
  veracruz: "VERACRUZ",
  yucatan: "YUCATAN",
  zacatecas: "ZACATECAS",
};

export function normalizeEstado(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function resolveEstadoName(input: string): string | null {
  return ESTADO_MAP[normalizeEstado(input)] ?? null;
}

// ==========================================
// RESULTADOS ELECTORALES
// ==========================================

// Columnas de metadatos que NO son votos de partido
const RESULTS_META_COLS = new Set([
  "id", "anio", "cve_ambito", "ambito", "cve_cargo", "cargo",
  "cve_principio", "principio", "cve_tipo", "tipo",
  "cve_circunscripcion", "circunscripcion", "cve_estado", "estado",
  "cve_def", "cabecera", "cve_mun", "municipio", "seccion",
  "no_reg", "vot_nul", "total_votos", "lne", "part_ciud",
]);

// Clave de cargo → prefijo de archivo
const CARGO_TO_KEY: Record<string, string> = {
  diputados: "dip",
  diputado: "dip",
  dip: "dip",
  senadores: "sen",
  senador: "sen",
  sen: "sen",
  presidente: "pdte",
  presidencia: "pdte",
  pdte: "pdte",
};

export interface ResultadosEstado {
  estado: string;
  cargo: string;
  anio: number;
  totalVotos: number;
  lne: number;
  participacion: number;
  votosNulos: number;
  partidos: { partido: string; votos: number; porcentaje: number }[];
  coaliconesIncluidas: string[];
  fuente: string;
}

export async function getResultadosByEstado(
  estadoInput: string,
  cargoInput: string,
  anioInput?: number
): Promise<ResultadosEstado | null> {
  // Empty string or "nacional" → aggregate all states
  const isNacional = !estadoInput || estadoInput.toLowerCase() === "nacional";
  const estadoNombre = isNacional ? null : resolveEstadoName(estadoInput);
  if (!isNacional && !estadoNombre) return null;

  const cargoKey = CARGO_TO_KEY[cargoInput.toLowerCase()] ?? "dip";

  // Listar archivos disponibles para este cargo
  const allFiles = await listStorageFiles("sefix/results/federals/");
  const cargoFiles = allFiles
    .filter((f) => f.includes(`/pef_${cargoKey}_`))
    .sort();

  if (cargoFiles.length === 0) return null;

  // Seleccionar año: el más reciente si no se especifica
  let targetFile: string;
  if (anioInput) {
    const match = cargoFiles.find((f) => f.includes(`_${anioInput}.csv`));
    if (!match) return null;
    targetFile = match;
  } else {
    targetFile = cargoFiles[cargoFiles.length - 1];
  }

  const anio = parseInt(targetFile.match(/_(\d{4})\.csv$/)?.[1] ?? "0");
  const cacheKey = `resultados:${estadoNombre ?? "NACIONAL"}:${cargoKey}:${anio}`;
  const cached = getCached<ResultadosEstado>(cacheKey);
  if (cached) return cached;

  // Streaming y agregación
  const totals: Record<string, number> = {};
  let totalVotos = 0;
  let lne = 0;
  let votosNulos = 0;
  let partidoHeaders: string[] = [];

  const headers = await streamCsvRows(targetFile, (row) => {
    if (estadoNombre && row.estado !== estadoNombre) return;

    const tv = parseInt(row.total_votos ?? "0");
    const lneRow = parseInt(row.lne ?? "0");
    const vn = parseInt(row.vot_nul ?? "0");

    totalVotos += isNaN(tv) ? 0 : tv;
    lne += isNaN(lneRow) ? 0 : lneRow;
    votosNulos += isNaN(vn) ? 0 : vn;

    for (const [col, val] of Object.entries(row)) {
      if (!RESULTS_META_COLS.has(col)) {
        const v = parseInt(val ?? "0");
        if (!isNaN(v)) totals[col] = (totals[col] ?? 0) + v;
      }
    }
  });

  // Identificar columnas de partido (simples, no coaliciones: sin _)
  partidoHeaders = headers.filter(
    (h) => !RESULTS_META_COLS.has(h) && !h.includes("_")
  );
  const coaliconesIncluidas = headers.filter(
    (h) => !RESULTS_META_COLS.has(h) && h.includes("_")
  );

  // Construir ranking de partidos (solo partidos simples)
  const partidos = partidoHeaders
    .map((p) => ({
      partido: p,
      votos: totals[p] ?? 0,
      porcentaje: totalVotos > 0 ? +((totals[p] ?? 0) / totalVotos * 100).toFixed(1) : 0,
    }))
    .filter((p) => p.votos > 0)
    .sort((a, b) => b.votos - a.votos);

  const result: ResultadosEstado = {
    estado: estadoNombre ?? "NACIONAL",
    cargo: cargoKey === "dip" ? "DIPUTADOS FEDERALES" : cargoKey === "sen" ? "SENADORES" : "PRESIDENTE",
    anio,
    totalVotos,
    lne,
    participacion: lne > 0 ? +((totalVotos / lne) * 100).toFixed(1) : 0,
    votosNulos,
    partidos,
    coaliconesIncluidas,
    fuente: `INE — Resultados Cómputos Distritales ${anio}`,
  };

  setCache(cacheKey, result);
  return result;
}

// ==========================================
// PADRÓN Y LISTA NOMINAL
// ==========================================

export interface PadronEstado {
  estado: string;
  corte: string;
  tipo: "historico" | "semanal";
  padronElectoral: number;
  listaNominal: number;
  padronHombres: number;
  padronMujeres: number;
  padronNoBinario: number;
  fuente: string;
}

/** Devuelve el path del archivo semanal _sexo más reciente */
async function getLatestSemanalPath(): Promise<string | null> {
  const files = await listStorageFiles("sefix/pdln/semanal/");
  const sexoFiles = files.filter((f) => f.endsWith("_sexo.csv")).sort();
  return sexoFiles[sexoFiles.length - 1] ?? null;
}

/** Devuelve el path del archivo histórico _base más reciente */
async function getLatestHistoricoPath(): Promise<string | null> {
  const files = await listStorageFiles("sefix/pdln/historico/");
  const baseFiles = files.filter((f) => f.endsWith("_base.csv")).sort();
  return baseFiles[baseFiles.length - 1] ?? null;
}

/** Extrae la fecha del nombre de archivo DERFE (YYYYMMDD → YYYY-MM-DD) */
function extractFecha(storagePath: string): string {
  const m = storagePath.match(/(\d{8})_/);
  if (!m) return "desconocida";
  const d = m[1];
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

export async function getPadronByEstado(
  estadoInput: string
): Promise<PadronEstado | null> {
  const estadoNombre = resolveEstadoName(estadoInput);
  if (!estadoNombre) return null;

  const cacheKey = `padron:${estadoNombre}`;
  const cached = getCached<PadronEstado>(cacheKey);
  if (cached) return cached;

  // Preferir semanal (más reciente) sobre histórico
  const semanalPath = await getLatestSemanalPath();
  const targetPath = semanalPath ?? (await getLatestHistoricoPath());
  if (!targetPath) return null;

  const isSemanal = targetPath.includes("/semanal/");
  const fecha = extractFecha(targetPath);

  let padronElectoral = 0;
  let listaNominal = 0;
  let padronHombres = 0;
  let padronMujeres = 0;
  let padronNoBinario = 0;

  if (isSemanal) {
    // Semanal _sexo: nombre_entidad, padron_hombres, padron_mujeres, padron_no_binario, padron_electoral, lista_hombres, lista_mujeres, lista_no_binario, lista_nominal
    await streamCsvRows(targetPath, (row) => {
      if (row.nombre_entidad !== estadoNombre) return;
      padronElectoral += parseInt(row.padron_electoral ?? "0") || 0;
      listaNominal += parseInt(row.lista_nominal ?? "0") || 0;
      padronHombres += parseInt(row.padron_hombres ?? "0") || 0;
      padronMujeres += parseInt(row.padron_mujeres ?? "0") || 0;
      padronNoBinario += parseInt(row.padron_no_binario ?? "0") || 0;
    });
  } else {
    // Histórico _base: nombre_entidad, padron_nacional_hombres, padron_nacional_mujeres, padron_nacional_no_binario, padron_nacional, lista_nacional
    await streamCsvRows(targetPath, (row) => {
      if (row.nombre_entidad !== estadoNombre) return;
      padronElectoral += parseInt(row.padron_nacional ?? "0") || 0;
      listaNominal += parseInt(row.lista_nacional ?? "0") || 0;
      padronHombres += parseInt(row.padron_nacional_hombres ?? "0") || 0;
      padronMujeres += parseInt(row.padron_nacional_mujeres ?? "0") || 0;
      padronNoBinario += parseInt(row.padron_nacional_no_binario ?? "0") || 0;
    });
  }

  if (padronElectoral === 0 && listaNominal === 0) return null;

  const result: PadronEstado = {
    estado: estadoNombre,
    corte: fecha,
    tipo: isSemanal ? "semanal" : "historico",
    padronElectoral,
    listaNominal,
    padronHombres,
    padronMujeres,
    padronNoBinario,
    fuente: `DERFE — Padrón Electoral al ${fecha}`,
  };

  setCache(cacheKey, result);
  return result;
}

// ==========================================
// SERIES HISTÓRICAS AGREGADAS (G1 / G2 / G3)
// ==========================================

export interface HistoricoMes {
  fecha: string;     // YYYY-MM-DD
  year: number;
  month: number;
  padronNacional: number;
  listaNacional: number;
  padronExtranjero: number;
  listaExtranjero: number;
  padronHombres: number;
  padronMujeres: number;
}

/** Agrega un archivo histórico _base a sus totales nacional y extranjero */
async function processHistoricoFile(
  storagePath: string
): Promise<HistoricoMes | null> {
  const fecha = extractFecha(storagePath);
  if (fecha === "desconocida") return null;

  const year = parseInt(fecha.slice(0, 4));
  const month = parseInt(fecha.slice(5, 7));

  let padronNacional = 0;
  let listaNacional = 0;
  let padronExtranjero = 0;
  let listaExtranjero = 0;
  let padronHombres = 0;
  let padronMujeres = 0;

  await streamCsvRows(storagePath, (row) => {
    // Excluir fila TOTALES (cve_entidad vacío o "NA")
    const cve = row.cve_entidad?.trim();
    if (!cve || cve === "" || cve.toUpperCase() === "NA") return;

    const isExt = row.cabecera_distrital?.toUpperCase().includes("RESIDENTES EXTRANJERO");
    const padron = parseInt(row.padron_nacional ?? "0") || 0;
    const lista = parseInt(row.lista_nacional ?? "0") || 0;
    const h = parseInt(row.padron_nacional_hombres ?? "0") || 0;
    const m = parseInt(row.padron_nacional_mujeres ?? "0") || 0;

    if (isExt) {
      padronExtranjero += padron;
      listaExtranjero += lista;
    } else {
      padronNacional += padron;
      listaNacional += lista;
      padronHombres += h;
      padronMujeres += m;
    }
  });

  if (padronNacional === 0 && padronExtranjero === 0) return null;

  return {
    fecha,
    year,
    month,
    padronNacional,
    listaNacional,
    padronExtranjero,
    listaExtranjero,
    padronHombres,
    padronMujeres,
  };
}

/** Devuelve los años disponibles para un cargo en resultados federales */
export async function getResultadosAvailableYears(
  cargoInput: string
): Promise<number[]> {
  const cargoKey = CARGO_TO_KEY[cargoInput.toLowerCase()] ?? "dip";
  const allFiles = await listStorageFiles("sefix/results/federals/");
  const years = allFiles
    .filter((f) => f.includes(`/pef_${cargoKey}_`))
    .map((f) => parseInt(f.match(/_(\d{4})\.csv$/)?.[1] ?? "0"))
    .filter((y) => y > 0);
  return [...new Set(years)].sort();
}

/** Devuelve resultados para todos los años disponibles de un cargo/estado */
export async function getResultadosAllYears(
  estadoInput: string,
  cargoInput: string
): Promise<ResultadosEstado[]> {
  const years = await getResultadosAvailableYears(cargoInput);
  const results = await Promise.allSettled(
    years.map((y) => getResultadosByEstado(estadoInput, cargoInput, y))
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<ResultadosEstado> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value)
    .sort((a, b) => a.anio - b.anio);
}

// ==========================================
// FILTRO GEOGRÁFICO PARA SERIES HISTÓRICAS
// Arquitectura: archivos JSON pre-generados por entidad en Firebase Storage.
// Se generan offline con scripts/pregenerate-sefix.ts, no en tiempo de consulta.
// ==========================================

export interface HistoricoGeoFilter {
  /** Nombre de entidad tal como aparece en nombre_entidad del CSV (e.g., "JALISCO") */
  entidad?: string;
  /**
   * Nombre del distrito tal como aparece en cabecera_distrital del CSV
   * (e.g., "1513 ECATEPEC DE MORELOS"). Más estable entre archivos que el CVE.
   */
  distritoNombre?: string;
  /**
   * Nombre del municipio tal como aparece en nombre_municipio del CSV
   * (e.g., "ECATEPEC DE MORELOS"). Más estable entre archivos que el CVE.
   */
  municipioNombre?: string;
  /** Números de sección como aparecen en seccion del CSV (e.g., ["1431", "1432"]) */
  secciones?: string[];
}

/** Datos de una sección electoral en el JSON pre-generado (columnar format) */
interface SeccionData {
  s: string;    // seccion
  m: string;    // nombre_municipio
  d: string;    // cabecera_distrital
  cvm: string;  // cve_municipio
  cvd: string;  // cve_distrito
  p:   number[]; // padronNacional per period index
  l:   number[]; // listaNacional per period index
  ph:  number[]; // padronHombres per period index
  pm:  number[]; // padronMujeres per period index
  pnb: number[]; // padronNoBinario per period index
  pe:  number[]; // padronExtranjero per period index
  le:  number[]; // listaExtranjero per period index
}

/** JSON pre-generado con todos los meses de un año para una entidad */
interface EntidadYearCache {
  entidad: string;
  year: number;
  months: number[];
  secciones: SeccionData[];
}

/** JSON pre-generado con el último mes de cada año (para G2/G3) */
interface EntidadAnualCache {
  entidad: string;
  years: number[];
  secciones: SeccionData[];
}

/** Caches en módulo — persisten por lifetime del proceso (warm Vercel instance) */
const entidadYearMemCache = new Map<string, EntidadYearCache>();
const entidadAnualMemCache = new Map<string, EntidadAnualCache>();

/**
 * Convierte nombre de entidad DERFE al key usado en Storage.
 * "ESTADO DE MEXICO" (DERFE: "MEXICO") → "MEXICO"
 * "JALISCO" → "JALISCO"
 * Espacios → _, quita acentos.
 */
export function toStorageKey(derfeNombre: string): string {
  if (derfeNombre === "__EXTRANJERO__") return "__EXTRANJERO__";
  return derfeNombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

/** Descarga el archivo anual de una entidad desde Storage */
async function loadEntidadAnual(storageKey: string): Promise<EntidadAnualCache | null> {
  const memKey = `${storageKey}_anual`;
  if (entidadAnualMemCache.has(memKey)) return entidadAnualMemCache.get(memKey)!;
  try {
    const path = `sefix/pdln/historico_entidad/${storageKey}_anual.json`;
    const file = getBucket().file(path);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString("utf-8")) as EntidadAnualCache;
    entidadAnualMemCache.set(memKey, data);
    return data;
  } catch {
    return null;
  }
}

/** Descarga el archivo mensual de una entidad+año desde Storage */
async function loadEntidadYear(storageKey: string, year: number): Promise<EntidadYearCache | null> {
  const memKey = `${storageKey}_${year}`;
  if (entidadYearMemCache.has(memKey)) return entidadYearMemCache.get(memKey)!;
  try {
    const path = `sefix/pdln/historico_entidad/${storageKey}_${year}.json`;
    const file = getBucket().file(path);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString("utf-8")) as EntidadYearCache;
    entidadYearMemCache.set(memKey, data);
    return data;
  } catch {
    return null;
  }
}

/** Normaliza número de sección eliminando ceros iniciales */
const normSec = (s: string | undefined): string =>
  (s?.trim() ?? "").replace(/^0+/, "") || "0";


/**
 * Devuelve la serie mensual histórica filtrada por ámbito geográfico.
 *
 * Usa JSON pre-generados offline (scripts/pregenerate-sefix.ts) en Firebase Storage:
 * - {ENTIDAD}_anual.json → último mes de cada año (para G2/G3)
 * - {ENTIDAD}_{year}.json → todos los meses del año seleccionado (para G1)
 *
 * Ambos archivos se descargan en paralelo (~300-800ms) y se filtran en memoria.
 * No hay lazy building ni polling.
 */
export async function getHistoricoSeriesGeo(
  geo: HistoricoGeoFilter,
  selectedYear?: number
): Promise<HistoricoMes[]> {
  const derfeEntidad = geo.entidad ? toDerfeNombre(geo.entidad) : undefined;
  if (!derfeEntidad) return getHistoricoSeries();

  const storageKey = toStorageKey(derfeEntidad);
  const year = selectedYear ?? new Date().getFullYear();

  const secKey = (geo.secciones ?? []).slice().sort().join(",");
  const cacheKey = `historico:geo2:${storageKey}:${year}:${geo.distritoNombre ?? ""}:${geo.municipioNombre ?? ""}:${secKey}`;
  const cached = getCached<HistoricoMes[]>(cacheKey);
  if (cached) return cached;

  // Download both files in parallel
  const [anualData, yearData] = await Promise.all([
    loadEntidadAnual(storageKey),
    loadEntidadYear(storageKey, year),
  ]);

  if (!anualData && !yearData) {
    console.warn(`[sefix/geo] No pre-generated cache for ${storageKey}. Run scripts/pregenerate-sefix.ts.`);
    return [];
  }

  const filtSecciones = geo.secciones?.length
    ? new Set(geo.secciones.map(normSec))
    : null;

  /** Filter section and aggregate across periods → HistoricoMes[] */
  function buildSeries(
    secciones: SeccionData[],
    periods: number[],  // months or years
    isMonthly: boolean
  ): Map<string, HistoricoMes> {
    const byPeriod = new Map<string, HistoricoMes>();

    for (const sec of secciones) {
      if (geo.distritoNombre && sec.d !== geo.distritoNombre) continue;
      if (geo.municipioNombre && sec.m !== geo.municipioNombre) continue;
      if (filtSecciones && !filtSecciones.has(normSec(sec.s))) continue;

      for (let i = 0; i < periods.length; i++) {
        const periodKey = isMonthly
          ? `${year}-${String(periods[i]).padStart(2, "0")}`
          : `${periods[i]}-12`; // anual: last month of year

        let agg = byPeriod.get(periodKey);
        if (!agg) {
          agg = {
            fecha: periodKey,
            year: isMonthly ? year : periods[i],
            month: isMonthly ? periods[i] : 12,
            padronNacional: 0, listaNacional: 0,
            padronExtranjero: 0, listaExtranjero: 0,
            padronHombres: 0, padronMujeres: 0,
          };
          byPeriod.set(periodKey, agg);
        }

        agg.padronNacional   += sec.p[i]   ?? 0;
        agg.listaNacional    += sec.l[i]    ?? 0;
        agg.padronHombres    += sec.ph[i]   ?? 0;
        agg.padronMujeres    += sec.pm[i]   ?? 0;
        agg.padronExtranjero += sec.pe[i]   ?? 0;
        agg.listaExtranjero  += sec.le[i]   ?? 0;
      }
    }

    return byPeriod;
  }

  const combined = new Map<string, HistoricoMes>();

  // Annual data → one point per year (last month) for G2/G3
  if (anualData) {
    const annualSeries = buildSeries(anualData.secciones, anualData.years, false);
    for (const [k, v] of annualSeries) combined.set(k, v);
  }

  // Monthly data for selected year → overrides annual entry for that year + adds G1 data
  if (yearData) {
    const monthlySeries = buildSeries(yearData.secciones, yearData.months, true);
    for (const [k, v] of monthlySeries) combined.set(k, v);
  }

  const series = Array.from(combined.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
  setCache(cacheKey, series);
  return series;
}

/**
 * Devuelve la serie mensual completa (2017-presente) con totales
 * nacional y extranjero. Procesa archivos en paralelo y cachea 30 min.
 */
export async function getHistoricoSeries(): Promise<HistoricoMes[]> {
  const cacheKey = "historico:series:all";
  const cached = getCached<HistoricoMes[]>(cacheKey);
  if (cached) return cached;

  const allFiles = await listStorageFiles("sefix/pdln/historico/");
  const baseFiles = allFiles.filter((f) => f.endsWith("_base.csv")).sort();

  // Procesamos en lotes de 8 para no abrir cientos de conexiones simultáneas
  // a Firebase Storage (causa de saturación de memoria y bloqueo del servidor)
  const BATCH_SIZE = 8;
  const accumulated: HistoricoMes[] = [];

  for (let i = 0; i < baseFiles.length; i += BATCH_SIZE) {
    const batch = baseFiles.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((f) => processHistoricoFile(f))
    );
    for (const r of batchResults) {
      if (r.status === "fulfilled" && r.value !== null) {
        accumulated.push(r.value);
      }
    }
  }

  const series = accumulated.sort((a, b) => a.fecha.localeCompare(b.fecha));

  setCache(cacheKey, series);
  return series;
}

// ==========================================
// DATOS SEMANALES — CORTE ÚNICO (por ámbito y fecha)
// ==========================================

export type SemanalTipo = "sexo" | "edad" | "origen";

export interface SemanalCorteResult {
  fecha: string;
  tipo: SemanalTipo;
  /** Agregado por entidad (o total) */
  rows: Record<string, string | number>[];
}

/** Devuelve los paths semanales disponibles para un tipo dado, ordenados desc */
export async function getSemanalPaths(tipo: SemanalTipo): Promise<string[]> {
  const all = await listStorageFiles("sefix/pdln/semanal/");
  return all.filter((f) => f.endsWith(`_${tipo}.csv`)).sort().reverse();
}

/** Devuelve las fechas disponibles (YYYY-MM-DD) para un tipo semanal */
export async function getSemanalFechas(tipo: SemanalTipo): Promise<string[]> {
  const paths = await getSemanalPaths(tipo);
  return paths
    .map((p) => extractFecha(p))
    .filter((f) => f !== "desconocida");
}

/**
 * Agrega el archivo semanal de un tipo y corte dado.
 * Si entidad=null devuelve totales nacionales/extranjero.
 * Si entidad!=null filtra las filas de esa entidad.
 */
export async function getSemanalAgregado(
  tipo: SemanalTipo,
  corte?: string,
  entidad?: string | null
): Promise<{
  fecha: string;
  ambitos: { nacional: Record<string, number>; extranjero: Record<string, number> };
  rows: Record<string, string | number>[];
} | null> {
  const paths = await getSemanalPaths(tipo);
  if (paths.length === 0) return null;

  // Seleccionar el archivo correcto
  let targetPath: string;
  if (corte) {
    const normalized = corte.replace(/-/g, "");
    const match = paths.find((p) => p.includes(normalized));
    if (!match) return null;
    targetPath = match;
  } else {
    targetPath = paths[0]; // más reciente
  }

  const fecha = extractFecha(targetPath);
  const cacheKey = `semanal:${tipo}:${fecha}:${entidad ?? "all"}`;
  const cached = getCached<ReturnType<typeof getSemanalAgregado> extends Promise<infer T> ? T : never>(cacheKey);
  if (cached) return cached as Awaited<ReturnType<typeof getSemanalAgregado>>;

  const nacional: Record<string, number> = {};
  const extranjero: Record<string, number> = {};

  // Columnas de clave que no se suman nunca
  const SKIP_COLS = new Set(["cve_entidad", "cve_distrito", "cve_municipio", "seccion"]);

  await streamCsvRows(targetPath, (row) => {
    const cve = row.cve_entidad?.trim();
    if (!cve || cve.toUpperCase() === "NA") return;

    // Filtro por entidad si se especifica
    if (entidad && row.nombre_entidad !== entidad) return;

    const isExt = row.cabecera_distrital?.toUpperCase().includes("RESIDENTES EXTRANJERO");
    const target = isExt ? extranjero : nacional;

    for (const [col, val] of Object.entries(row)) {
      if (SKIP_COLS.has(col)) continue;
      const num = parseFloat(val as string);
      if (!isNaN(num)) target[col] = (target[col] ?? 0) + num;
    }
  });

  // No acumulamos las filas crudas — eran la causa principal del alto uso de memoria (~300 MB por llamada)
  const result = { fecha, ambitos: { nacional, extranjero }, rows: [] as Record<string, string | number>[] };
  setCache(cacheKey, result);
  return result;
}

// ==========================================
// JERARQUÍA GEOGRÁFICA (cascade)
// ==========================================

export interface GeoOpcion {
  cve: string;
  nombre: string;
}

/**
 * Devuelve los distritos disponibles para una entidad dada.
 * Usa el archivo semanal _sexo más reciente (más liviano, 15 cols).
 */
export async function getDistritosPorEntidad(
  entidad: string
): Promise<GeoOpcion[]> {
  const cacheKey = `geo:distritos:${entidad}`;
  const cached = getCached<GeoOpcion[]>(cacheKey);
  if (cached) return cached;

  const paths = await getSemanalPaths("sexo");
  if (paths.length === 0) return [];
  const targetPath = paths[0];

  const derfeNombre = toDerfeNombre(entidad);
  const set = new Map<string, string>();
  await streamCsvRows(targetPath, (row) => {
    if (row.nombre_entidad !== derfeNombre) return;
    if (row.cabecera_distrital?.toUpperCase().includes("RESIDENTES EXTRANJERO")) return;
    const cve = row.cve_distrito?.trim();
    const nombre = row.cabecera_distrital?.trim();
    if (cve && nombre) set.set(cve, nombre);
  });

  const result = Array.from(set.entries())
    .map(([cve, nombre]) => ({ cve, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  setCache(cacheKey, result);
  return result;
}

/**
 * Devuelve los municipios para una entidad + distrito dados.
 */
export async function getMunicipiosPorDistrito(
  entidad: string,
  cvDistrito: string
): Promise<GeoOpcion[]> {
  const cacheKey = `geo:municipios:${entidad}:${cvDistrito}`;
  const cached = getCached<GeoOpcion[]>(cacheKey);
  if (cached) return cached;

  const paths = await getSemanalPaths("sexo");
  if (paths.length === 0) return [];

  const derfeNombre = toDerfeNombre(entidad);
  const set = new Map<string, string>();
  await streamCsvRows(paths[0], (row) => {
    if (row.nombre_entidad !== derfeNombre) return;
    if (row.cve_distrito?.trim() !== cvDistrito) return;
    const cve = row.cve_municipio?.trim();
    const nombre = row.nombre_municipio?.trim();
    if (cve && nombre) set.set(cve, nombre);
  });

  const result = Array.from(set.entries())
    .map(([cve, nombre]) => ({ cve, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  setCache(cacheKey, result);
  return result;
}

/**
 * Devuelve las secciones electorales para una entidad + municipio dados.
 */
export async function getSeccionesPorMunicipio(
  entidad: string,
  cvMunicipio: string
): Promise<string[]> {
  const cacheKey = `geo:secciones:${entidad}:${cvMunicipio}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  const paths = await getSemanalPaths("sexo");
  if (paths.length === 0) return [];

  const derfeNombre = toDerfeNombre(entidad);
  const secciones = new Set<string>();
  await streamCsvRows(paths[0], (row) => {
    if (row.nombre_entidad !== derfeNombre) return;
    if (row.cve_municipio?.trim() !== cvMunicipio) return;
    const sec = row.seccion?.trim();
    if (sec) secciones.add(sec);
  });

  const result = Array.from(secciones).sort((a, b) => parseInt(a) - parseInt(b));
  setCache(cacheKey, result);
  return result;
}

// ==========================================
// DATOS NO BINARIO POR FILTRO GEO (semanal)
// ==========================================

export interface NbGeoResult {
  padron: number;
  lista: number;
}

/**
 * Devuelve los totales No Binario del último corte semanal _sexo.csv
 * filtrados por entidad, municipio (CVE) y/o secciones.
 *
 * Retorna null si no hay datos NB para el filtro indicado.
 */
export async function getSemanalNbGeo(
  entidad: string,
  cveMunicipio?: string,
  secciones?: string[]
): Promise<NbGeoResult | null> {
  const paths = await getSemanalPaths("sexo");
  if (paths.length === 0) return null;

  const derfeNombre = toDerfeNombre(entidad.toUpperCase().trim());
  const filtSecciones = secciones?.length
    ? new Set(secciones.map(normSec))
    : null;

  let padron = 0;
  let lista = 0;

  await streamCsvRows(paths[0], (row) => {
    if (row.nombre_entidad !== derfeNombre) return;
    if (row.cabecera_distrital?.toUpperCase().includes("RESIDENTES EXTRANJERO")) return;
    if (cveMunicipio && row.cve_municipio?.trim() !== cveMunicipio) return;
    if (filtSecciones && !filtSecciones.has(normSec(row.seccion))) return;

    padron += parseInt(row.padron_no_binario ?? "0") || 0;
    lista  += parseInt(row.lista_no_binario  ?? "0") || 0;
  });

  if (padron === 0 && lista === 0) return null;
  return { padron, lista };
}

