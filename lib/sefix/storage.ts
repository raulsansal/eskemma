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
  const estadoNombre = resolveEstadoName(estadoInput);
  if (!estadoNombre) return null;

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
  const cacheKey = `resultados:${estadoNombre}:${cargoKey}:${anio}`;
  const cached = getCached<ResultadosEstado>(cacheKey);
  if (cached) return cached;

  // Streaming y agregación
  const totals: Record<string, number> = {};
  let totalVotos = 0;
  let lne = 0;
  let votosNulos = 0;
  let partidoHeaders: string[] = [];

  const headers = await streamCsvRows(targetFile, (row) => {
    if (row.estado !== estadoNombre) return;

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
    estado: estadoNombre,
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
