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

/**
 * Fila cruda de un archivo _base.csv filtrada a una entidad específica.
 * Se cachea en memoria para evitar re-leer Storage en cada consulta con distinto filtro.
 */
interface EntidadRawRow {
  fecha: string;
  year: number;
  month: number;
  cabecera_distrital: string;
  nombre_municipio: string;
  seccion: string;
  padron: number;
  lista: number;
  padronH: number;
  padronM: number;
  isExt: boolean;
}

/**
 * Caché en memoria por entidad DERFE (persiste por lifetime del proceso).
 * Permite servir múltiples filtros distintos de la misma entidad sin releer Storage.
 */
const entidadRowsCache = new Map<string, EntidadRawRow[]>();

/** Deduplicación de cargas concurrentes para la misma entidad */
const entidadRowsLoading = new Map<string, Promise<EntidadRawRow[]>>();

// ── Caché persistente en Firebase Storage ──────────────────────────────────
// Patrón: primera carga lenta (~30-120s) → guarda JSON en Storage →
// siguientes cargas rápidas (~1-3s) incluso tras reiniciar el servidor.

function entidadStorageCachePath(derfeEntidad: string): string {
  // Normalizar nombre para usar como nombre de archivo
  const key = derfeEntidad
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
  return `sefix/pdln/historico_entidad/${key}.json`;
}

/** Lee el JSON pre-agregado de una entidad desde Firebase Storage (~1-3s) */
async function loadEntidadStorageCache(derfeEntidad: string): Promise<EntidadRawRow[] | null> {
  try {
    const path = entidadStorageCachePath(derfeEntidad);
    const file = getBucket().file(path);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [contents] = await file.download();
    return JSON.parse(contents.toString("utf-8")) as EntidadRawRow[];
  } catch {
    return null; // Si falla la lectura, continuar con el método lento
  }
}

/**
 * Guarda las filas de una entidad en Firebase Storage para consultas futuras.
 * No-bloqueante: se ejecuta en background tras la primera carga lenta.
 */
async function saveEntidadStorageCache(
  derfeEntidad: string,
  rows: EntidadRawRow[]
): Promise<void> {
  try {
    const path = entidadStorageCachePath(derfeEntidad);
    const file = getBucket().file(path);
    await file.save(Buffer.from(JSON.stringify(rows)), {
      contentType: "application/json",
      metadata: { cacheControl: "private, max-age=3600" },
    });
    console.log(`[sefix] Caché de entidad guardada: ${path} (${rows.length} filas)`);
  } catch (e) {
    console.warn(`[sefix] No se pudo guardar caché de entidad ${derfeEntidad}:`, e);
  }
}

/**
 * Lee todos los archivos _base.csv históricos filtrando a una entidad.
 * Primera llamada: lenta (~30-120s dependiendo de red). Resultado se cachea en
 * Firebase Storage para llamadas futuras (~1-3s) y en módulo (instantáneo).
 */
async function loadEntidadRawRows(derfeEntidad: string): Promise<EntidadRawRow[]> {
  // 1. Caché en memoria (instantáneo, persiste por lifetime del proceso)
  const cached = entidadRowsCache.get(derfeEntidad);
  if (cached) return cached;

  // 2. Deduplicar cargas concurrentes
  const inFlight = entidadRowsLoading.get(derfeEntidad);
  if (inFlight) return inFlight;

  const promise = (async (): Promise<EntidadRawRow[]> => {
    // 3. Caché persistente en Storage (~1-3s, sobrevive reinicios del servidor)
    const fromStorage = await loadEntidadStorageCache(derfeEntidad);
    if (fromStorage) {
      console.log(`[sefix] Cargando caché de entidad desde Storage: ${derfeEntidad} (${fromStorage.length} filas)`);
      entidadRowsCache.set(derfeEntidad, fromStorage);
      entidadRowsLoading.delete(derfeEntidad);
      return fromStorage;
    }

    // 4. Primera carga: leer todos los _base.csv (lento)
    console.log(`[sefix] Primera carga de ${derfeEntidad}: leyendo archivos históricos...`);
    const allFiles = await listStorageFiles("sefix/pdln/historico/");
    const baseFiles = allFiles.filter((f) => f.endsWith("_base.csv")).sort();

    const rows: EntidadRawRow[] = [];
    const BATCH_SIZE = 16;

    for (let i = 0; i < baseFiles.length; i += BATCH_SIZE) {
      const batch = baseFiles.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async (f) => {
          const fecha = extractFecha(f);
          if (fecha === "desconocida") return;
          const year = parseInt(fecha.slice(0, 4));
          const month = parseInt(fecha.slice(5, 7));

          await streamCsvRows(f, (row) => {
            const cve = row.cve_entidad?.trim();
            if (!cve || cve === "" || cve.toUpperCase() === "NA") return;
            if (row.nombre_entidad !== derfeEntidad) return; // descarta ~97% del CSV

            rows.push({
              fecha, year, month,
              cabecera_distrital: row.cabecera_distrital?.trim() ?? "",
              nombre_municipio: row.nombre_municipio?.trim() ?? "",
              seccion: row.seccion?.trim() ?? "",
              padron: parseInt(row.padron_nacional ?? "0") || 0,
              lista: parseInt(row.lista_nacional ?? "0") || 0,
              padronH: parseInt(row.padron_nacional_hombres ?? "0") || 0,
              padronM: parseInt(row.padron_nacional_mujeres ?? "0") || 0,
              isExt: row.cabecera_distrital?.toUpperCase().includes("RESIDENTES EXTRANJERO") ?? false,
            });
          });
        })
      );
    }

    // 5. Guardar en Storage en background (no bloquea la respuesta)
    saveEntidadStorageCache(derfeEntidad, rows).catch(() => {});

    entidadRowsCache.set(derfeEntidad, rows);
    entidadRowsLoading.delete(derfeEntidad);
    console.log(`[sefix] ${derfeEntidad}: ${rows.length} filas cargadas y guardadas en caché.`);
    return rows;
  })();

  entidadRowsLoading.set(derfeEntidad, promise);
  return promise;
}

/** Normaliza número de sección eliminando ceros iniciales */
const normSec = (s: string | undefined): string =>
  (s?.trim() ?? "").replace(/^0+/, "") || "0";

/**
 * Devuelve la serie mensual histórica filtrada por ámbito geográfico.
 *
 * Arquitectura de dos niveles:
 * 1. Caché de resultado (30 min) — para consultas idénticas repetidas.
 * 2. Caché de filas crudas por entidad (60 min) — la primera llamada por entidad
 *    lee ~100 archivos de Storage; las siguientes filtran en memoria (instantáneo).
 */
export async function getHistoricoSeriesGeo(geo: HistoricoGeoFilter): Promise<HistoricoMes[]> {
  const secKey = (geo.secciones ?? []).slice().sort().join(",");
  const cacheKey = `historico:geo:${geo.entidad ?? ""}:${geo.distritoNombre ?? ""}:${geo.municipioNombre ?? ""}:${secKey}`;
  const cached = getCached<HistoricoMes[]>(cacheKey);
  if (cached) return cached;

  const derfeEntidad = geo.entidad ? toDerfeNombre(geo.entidad) : undefined;
  if (!derfeEntidad) return getHistoricoSeries();

  // Cargar (o recuperar del caché) todas las filas de esta entidad
  const entidadRows = await loadEntidadRawRows(derfeEntidad);

  // Preparar filtros de sección normalizados
  const filtSecciones = geo.secciones?.length
    ? new Set(geo.secciones.map(normSec))
    : null;

  // Agregar en memoria por (fecha, is_extranjero) — inmediato
  const byFecha = new Map<string, {
    fecha: string; year: number; month: number;
    padronNacional: number; listaNacional: number;
    padronExtranjero: number; listaExtranjero: number;
    padronHombres: number; padronMujeres: number;
  }>();

  for (const row of entidadRows) {
    if (geo.distritoNombre && row.cabecera_distrital !== geo.distritoNombre) continue;
    if (geo.municipioNombre && row.nombre_municipio !== geo.municipioNombre) continue;
    if (filtSecciones && !filtSecciones.has(normSec(row.seccion))) continue;

    let agg = byFecha.get(row.fecha);
    if (!agg) {
      agg = { fecha: row.fecha, year: row.year, month: row.month,
              padronNacional: 0, listaNacional: 0,
              padronExtranjero: 0, listaExtranjero: 0,
              padronHombres: 0, padronMujeres: 0 };
      byFecha.set(row.fecha, agg);
    }
    if (row.isExt) {
      agg.padronExtranjero += row.padron;
      agg.listaExtranjero += row.lista;
    } else {
      agg.padronNacional += row.padron;
      agg.listaNacional += row.lista;
      agg.padronHombres += row.padronH;
      agg.padronMujeres += row.padronM;
    }
  }

  const series = Array.from(byFecha.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
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
