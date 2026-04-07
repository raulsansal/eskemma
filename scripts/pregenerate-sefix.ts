#!/usr/bin/env npx tsx
/**
 * scripts/pregenerate-sefix.ts
 *
 * Offline script: reads local CSV files from data/pdln/historico/, pre-aggregates
 * per entidad at section level and uploads compact columnar JSON files to Firebase Storage.
 *
 * Usage:
 *   npx tsx scripts/pregenerate-sefix.ts --entidad JALISCO
 *   npx tsx scripts/pregenerate-sefix.ts --entidad "__EXTRANJERO__"
 *   npx tsx scripts/pregenerate-sefix.ts --all
 *
 * Output per entidad in Firebase Storage:
 *   sefix/pdln/historico_entidad/{KEY}_anual.json   ← last month of each year
 *   sefix/pdln/historico_entidad/{KEY}_{YYYY}.json  ← all months of that year
 *
 * Handles 3 CSV schema versions:
 *   13 cols (2017–2019): no extranjero columns, no NB
 *   21 cols (2020–2025-06): with padron/lista extranjero columns, no NB
 *   23 cols (2025-07+): with NB for nacional and extranjero
 */

import fs from "fs";
import path from "path";
import { createInterface } from "readline";
import { initializeApp, cert, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────
const DATA_DIR = path.resolve(__dirname, "../data/pdln/historico");
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
const STORAGE_PREFIX = "sefix/pdln/historico_entidad";

/** Special key for Residentes en el Extranjero aggregate */
const EXTRANJERO_KEY = "__EXTRANJERO__";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface SeccionData {
  s: string;    // seccion
  m: string;    // nombre_municipio
  d: string;    // cabecera_distrital
  cvm: string;  // cve_municipio
  cvd: string;  // cve_distrito
  p:   number[]; // padronNacional per period
  l:   number[]; // listaNacional per period
  ph:  number[]; // padronHombres per period
  pm:  number[]; // padronMujeres per period
  pnb: number[]; // padronNoBinario per period (0 if not available)
  pe:  number[]; // padronExtranjero per period
  le:  number[]; // listaExtranjero per period
}

interface EntidadYearCache {
  entidad: string;
  year: number;
  months: number[];
  secciones: SeccionData[];
}

interface EntidadAnualCache {
  entidad: string;
  years: number[];
  secciones: SeccionData[];
}

// Intermediate accumulator: seccion → month → values
interface RowValues {
  p: number; l: number; ph: number; pm: number; pnb: number; pe: number; le: number;
}

// ──────────────────────────────────────────────
// Firebase Admin init
// ──────────────────────────────────────────────
function initFirebase(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env"
    );
  }
  if (!STORAGE_BUCKET) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env");
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

// ──────────────────────────────────────────────
// Normalize entidad name → Storage key
// ──────────────────────────────────────────────
function toStorageKey(entidad: string): string {
  if (entidad === EXTRANJERO_KEY) return EXTRANJERO_KEY;
  return entidad
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

// ──────────────────────────────────────────────
// Parse date from filename
// ──────────────────────────────────────────────
function extractFecha(filename: string): { year: number; month: number } | null {
  const match = path.basename(filename).match(/(\d{4})(\d{2})\d{2}_base\.csv/);
  if (!match) return null;
  return { year: parseInt(match[1]), month: parseInt(match[2]) };
}

// ──────────────────────────────────────────────
// Read a single CSV file, yield rows for given entidad(es)
// ──────────────────────────────────────────────
async function readCsvFile(
  filePath: string,
  onRow: (
    entidadKey: string,
    seccion: string,
    municipio: string,
    distrito: string,
    cvMunicipio: string,
    cvDistrito: string,
    vals: RowValues
  ) => void
): Promise<void> {
  const stream = fs.createReadStream(filePath);
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let headers: string[] = [];
  let isFirst = true;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isFirst) {
      headers = trimmed.split(",").map((h) => h.trim());
      isFirst = false;
      continue;
    }

    const values = trimmed.split(",");
    const get = (col: string): string => {
      const idx = headers.indexOf(col);
      return idx >= 0 ? (values[idx] ?? "").trim() : "";
    };
    const getNum = (col: string): number => {
      const v = get(col);
      return v ? parseInt(v, 10) || 0 : 0;
    };

    const nombreEntidad = get("nombre_entidad");
    const seccion = get("seccion");
    const municipio = get("nombre_municipio");
    const distrito = get("cabecera_distrital");
    const cvMunicipio = get("cve_municipio");
    const cvDistrito = get("cve_distrito");

    if (!nombreEntidad || !seccion) continue;

    const isExt = distrito.toUpperCase().includes("RESIDENTES EXTRANJERO");

    // 2017-2019 schema (13 cols): extranjero data stored as special district 0 rows
    // 2020+ schema: padron_extranjero_* columns exist per row
    const has2020Cols = headers.includes("padron_extranjero");

    let p = 0, l = 0, ph = 0, pm = 0, pnb = 0, pe = 0, le = 0;

    if (isExt && !has2020Cols) {
      // 2017-2019: extranjero row uses nacional columns
      pe = getNum("padron_nacional");
      le = getNum("lista_nacional");
      // no sex breakdown for extranjero in this schema
    } else if (isExt && has2020Cols) {
      // 2020+: extranjero row with proper extranjero columns
      pe = getNum("padron_extranjero");
      le = getNum("lista_extranjero");
    } else {
      // Nacional row
      p   = getNum("padron_nacional");
      l   = getNum("lista_nacional");
      ph  = getNum("padron_nacional_hombres");
      pm  = getNum("padron_nacional_mujeres");
      pnb = getNum("padron_nacional_no_binario");
      if (has2020Cols) {
        pe = getNum("padron_extranjero");
        le = getNum("lista_extranjero");
      }
    }

    // Emit row for the entidad
    onRow(nombreEntidad, seccion, municipio, distrito, cvMunicipio, cvDistrito,
          { p, l, ph, pm, pnb, pe, le });

    // Also emit for EXTRANJERO aggregate if this is an ext row
    if (isExt) {
      onRow(EXTRANJERO_KEY, seccion, municipio, distrito, cvMunicipio, cvDistrito,
            { p: 0, l: 0, ph: 0, pm: 0, pnb: 0, pe, le });
    }
  }
}

// ──────────────────────────────────────────────
// Upload JSON to Firebase Storage
// ──────────────────────────────────────────────
async function uploadJson(
  app: App,
  storagePath: string,
  data: unknown
): Promise<void> {
  const bucket = getStorage(app).bucket(STORAGE_BUCKET);
  const file = bucket.file(storagePath);
  const json = JSON.stringify(data);
  await file.save(Buffer.from(json, "utf-8"), {
    contentType: "application/json",
    metadata: { cacheControl: "public, max-age=3600" },
  });
}

// ──────────────────────────────────────────────
// Build and upload files for a single entidad
// ──────────────────────────────────────────────
async function processEntidad(
  app: App,
  entidadKey: string,
  // Map<year, Map<month, Map<seccionId, RowValues>>>
  data: Map<number, Map<number, Map<string, {
    vals: RowValues;
    municipio: string;
    distrito: string;
    cvMunicipio: string;
    cvDistrito: string;
  }>>>
): Promise<void> {
  const storageKey = toStorageKey(entidadKey);
  const years = Array.from(data.keys()).sort((a, b) => a - b);

  // ── Per-year monthly files ──────────────────
  for (const year of years) {
    const monthMap = data.get(year)!;
    const months = Array.from(monthMap.keys()).sort((a, b) => a - b);

    // Collect all unique sections seen this year
    const sectionIds = new Set<string>();
    for (const secMap of monthMap.values()) {
      for (const sid of secMap.keys()) sectionIds.add(sid);
    }

    const secciones: SeccionData[] = [];
    for (const sid of sectionIds) {
      // Get metadata from first available month
      let m = "", d = "", cvm = "", cvd = "";
      for (const month of months) {
        const s = monthMap.get(month)?.get(sid);
        if (s) { m = s.municipio; d = s.distrito; cvm = s.cvMunicipio; cvd = s.cvDistrito; break; }
      }

      const p: number[] = [], l: number[] = [], ph: number[] = [],
            pm: number[] = [], pnb: number[] = [], pe: number[] = [], le: number[] = [];

      for (const month of months) {
        const row = monthMap.get(month)?.get(sid);
        p.push(row?.vals.p ?? 0);
        l.push(row?.vals.l ?? 0);
        ph.push(row?.vals.ph ?? 0);
        pm.push(row?.vals.pm ?? 0);
        pnb.push(row?.vals.pnb ?? 0);
        pe.push(row?.vals.pe ?? 0);
        le.push(row?.vals.le ?? 0);
      }

      secciones.push({ s: sid, m, d, cvm, cvd, p, l, ph, pm, pnb, pe, le });
    }

    const cache: EntidadYearCache = {
      entidad: entidadKey,
      year,
      months,
      secciones,
    };

    const storagePath = `${STORAGE_PREFIX}/${storageKey}_${year}.json`;
    await uploadJson(app, storagePath, cache);
    process.stdout.write(`  ↑ ${storageKey}_${year}.json (${secciones.length} secciones, ${months.length} meses)\n`);
  }

  // ── Annual file (last month of each year) ───
  const annualSectionIds = new Set<string>();
  const annualData = new Map<number, Map<string, { vals: RowValues; municipio: string; distrito: string; cvMunicipio: string; cvDistrito: string }>>();

  for (const year of years) {
    const monthMap = data.get(year)!;
    const lastMonth = Math.max(...Array.from(monthMap.keys()));
    const lastSecMap = monthMap.get(lastMonth)!;
    annualData.set(year, lastSecMap);
    for (const sid of lastSecMap.keys()) annualSectionIds.add(sid);
  }

  const annualSecciones: SeccionData[] = [];
  for (const sid of annualSectionIds) {
    let m = "", d = "", cvm = "", cvd = "";
    for (const year of years) {
      const s = annualData.get(year)?.get(sid);
      if (s) { m = s.municipio; d = s.distrito; cvm = s.cvMunicipio; cvd = s.cvDistrito; break; }
    }

    const p: number[] = [], l: number[] = [], ph: number[] = [],
          pm: number[] = [], pnb: number[] = [], pe: number[] = [], le: number[] = [];

    for (const year of years) {
      const row = annualData.get(year)?.get(sid);
      p.push(row?.vals.p ?? 0);
      l.push(row?.vals.l ?? 0);
      ph.push(row?.vals.ph ?? 0);
      pm.push(row?.vals.pm ?? 0);
      pnb.push(row?.vals.pnb ?? 0);
      pe.push(row?.vals.pe ?? 0);
      le.push(row?.vals.le ?? 0);
    }

    annualSecciones.push({ s: sid, m, d, cvm, cvd, p, l, ph, pm, pnb, pe, le });
  }

  const anualCache: EntidadAnualCache = {
    entidad: entidadKey,
    years,
    secciones: annualSecciones,
  };

  const anualPath = `${STORAGE_PREFIX}/${storageKey}_anual.json`;
  await uploadJson(app, anualPath, anualCache);
  process.stdout.write(`  ↑ ${storageKey}_anual.json (${annualSecciones.length} secciones, ${years.length} años)\n`);
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const allFlag = args.includes("--all");
  const entidadArg = args[args.indexOf("--entidad") + 1] as string | undefined;

  if (!allFlag && !entidadArg) {
    console.error("Usage: npx tsx scripts/pregenerate-sefix.ts --entidad JALISCO");
    console.error("       npx tsx scripts/pregenerate-sefix.ts --all");
    process.exit(1);
  }

  const app = initFirebase();
  console.log(`✓ Firebase conectado (bucket: ${STORAGE_BUCKET})`);

  // List and sort CSV files
  const csvFiles = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith("_base.csv"))
    .sort();

  console.log(`✓ ${csvFiles.length} archivos CSV encontrados en ${DATA_DIR}`);

  // Accumulator: entidad → year → month → seccion → values
  type SecAccum = Map<string, {
    vals: RowValues; municipio: string; distrito: string;
    cvMunicipio: string; cvDistrito: string;
  }>;
  type MonthAccum = Map<number, SecAccum>;
  type EntidadAccum = Map<number, MonthAccum>;
  const accumulator = new Map<string, EntidadAccum>();

  const targetEntidad = entidadArg?.toUpperCase();

  // Process CSVs
  for (let i = 0; i < csvFiles.length; i++) {
    const file = csvFiles[i];
    const fecha = extractFecha(file);
    if (!fecha) { console.warn(`  ⚠ Ignorado (sin fecha): ${file}`); continue; }

    const { year, month } = fecha;
    const filePath = path.join(DATA_DIR, file);

    process.stdout.write(`[${i + 1}/${csvFiles.length}] ${file} ... `);

    let rowCount = 0;
    await readCsvFile(filePath, (entidadKey, seccion, municipio, distrito, cvMunicipio, cvDistrito, vals) => {
      // Filter if not --all
      if (!allFlag && entidadKey !== targetEntidad && entidadKey !== EXTRANJERO_KEY) return;
      if (!allFlag && entidadKey === EXTRANJERO_KEY && targetEntidad !== EXTRANJERO_KEY) return;

      // Get or create nested maps
      let entidadMap = accumulator.get(entidadKey);
      if (!entidadMap) { entidadMap = new Map(); accumulator.set(entidadKey, entidadMap); }

      let yearMap = entidadMap.get(year);
      if (!yearMap) { yearMap = new Map(); entidadMap.set(year, yearMap); }

      let secMap = yearMap.get(month);
      if (!secMap) { secMap = new Map(); yearMap.set(month, secMap); }

      // Accumulate (sum for sections that appear multiple times — shouldn't happen, but safe)
      const existing = secMap.get(seccion);
      if (existing) {
        existing.vals.p   += vals.p;
        existing.vals.l   += vals.l;
        existing.vals.ph  += vals.ph;
        existing.vals.pm  += vals.pm;
        existing.vals.pnb += vals.pnb;
        existing.vals.pe  += vals.pe;
        existing.vals.le  += vals.le;
      } else {
        secMap.set(seccion, { vals: { ...vals }, municipio, distrito, cvMunicipio, cvDistrito });
      }
      rowCount++;
    });

    process.stdout.write(`${rowCount} filas\n`);
  }

  // Upload per entidad
  const entidadKeys = Array.from(accumulator.keys()).sort();
  console.log(`\n→ Subiendo archivos para ${entidadKeys.length} entidades...`);

  for (const key of entidadKeys) {
    console.log(`\n[${key}]`);
    await processEntidad(app, key, accumulator.get(key)!);
  }

  console.log("\n✅ Pre-generación completada.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Error fatal:", e);
  process.exit(1);
});
