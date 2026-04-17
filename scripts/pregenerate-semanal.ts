#!/usr/bin/env npx tsx
/**
 * scripts/pregenerate-semanal.ts
 *
 * Offline script: uploads pre-processed semanal files to Firebase Storage.
 *
 * Usage:
 *   npx tsx scripts/pregenerate-semanal.ts --series  # upload series CSVs to semanal_series/
 *   npx tsx scripts/pregenerate-semanal.ts --geo     # build + upload geo.json
 *   npx tsx scripts/pregenerate-semanal.ts --agg     # build + upload aggregate JSONs per state
 *   npx tsx scripts/pregenerate-semanal.ts --all     # all three actions
 *
 * Input files (local):
 *   data/series/serie_{nacional|extranjero}_{edad|sexo|origen}.csv  — pre-aggregated weekly series
 *   data/pdln/semanal/derfe_pdln_{YYYYMMDD}_{edad|sexo|origen}.csv  — raw section-level semanal data
 *
 * Output in Firebase Storage:
 *   sefix/pdln/semanal_series/{filename}.csv         — series CSVs (consumed by serie-semanal route)
 *   sefix/pdln/semanal_geo/geo.json                  — geo hierarchy (fast cascade)
 *   sefix/pdln/semanal_agg/{tipo}.json               — per-state aggregates (fast corte-único queries)
 */

import fs from "fs";
import path from "path";
import { createInterface } from "readline";
import { initializeApp, cert, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────

const SERIES_DIR   = path.resolve(__dirname, "../data/series");
const SEMANAL_DIR  = path.resolve(__dirname, "../data/pdln/semanal");
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;

const SERIES_PREFIX = "sefix/pdln/semanal_series";
const GEO_PATH      = "sefix/pdln/semanal_geo/geo.json";
const AGG_PREFIX    = "sefix/pdln/semanal_agg";

/**
 * Normalizes CSV entidad names with constitutional long names to the short
 * names used in the UI (ESTADOS_LIST). Mirrors pregenerate-sefix.ts logic.
 */
const CSV_ENTIDAD_NORMALIZER: Record<string, string> = {
  "COAHUILA DE ZARAGOZA":             "COAHUILA",
  "MICHOACAN DE OCAMPO":              "MICHOACAN",
  "VERACRUZ DE IGNACIO DE LA LLAVE":  "VERACRUZ",
  "MEXICO":                           "ESTADO DE MEXICO",
};

function normalizeEntidadName(raw: string): string {
  const key = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
  return CSV_ENTIDAD_NORMALIZER[key] ?? key;
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface GeoDistrito {
  cve: string;
  nombre: string;
}

interface StateGeoData {
  distritos: GeoDistrito[];
  municipios: Record<string, GeoDistrito[]>;   // cvDistrito → list
  secciones:  Record<string, string[]>;         // cvMunicipio → list
}

type SemanalGeo = Record<string, StateGeoData>; // entidad DERFE nombre → data

interface AmbRadix {
  nacional:   Record<string, number>;
  extranjero: Record<string, number>;
}

interface AggOutput {
  fecha:       string;
  nacional:    Record<string, number>;
  extranjero:  Record<string, number>;
  por_entidad: Record<string, AmbRadix>;  // nombre_entidad (DERFE) → { nacional, extranjero }
}

// ──────────────────────────────────────────────
// Firebase Admin
// ──────────────────────────────────────────────

function initFirebase(): App {
  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

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
// CSV helpers
// ──────────────────────────────────────────────

/** Reads a local CSV line-by-line, calling onRow for each data row */
async function streamLocal(
  filePath: string,
  onRow: (row: Record<string, string>, headers: string[]) => void
): Promise<string[]> {
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
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = (values[i] ?? "").trim();
    }
    onRow(row, headers);
  }

  return headers;
}

/** Returns the latest file matching a suffix pattern from a directory */
function latestFile(dir: string, suffix: string): string | null {
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith(suffix))
    .sort();  // YYYYMMDD format sorts correctly
  return files.length > 0 ? path.join(dir, files[files.length - 1]) : null;
}

/** Parse YYYYMMDD date from filename */
function fechaFromFilename(filename: string): string {
  const match = path.basename(filename).match(/(\d{4})(\d{2})(\d{2})/);
  if (!match) return "";
  return `${match[1]}-${match[2]}-${match[3]}`;
}

// ──────────────────────────────────────────────
// Step 1: Upload series CSVs
// ──────────────────────────────────────────────

async function uploadSeriesFiles(app: App): Promise<void> {
  const bucket = getStorage(app).bucket(STORAGE_BUCKET);

  const files = fs.readdirSync(SERIES_DIR).filter((f) => f.endsWith(".csv"));
  if (files.length === 0) {
    console.warn("  [series] No CSV files found in", SERIES_DIR);
    return;
  }

  for (const filename of files) {
    const localPath   = path.join(SERIES_DIR, filename);
    const storagePath = `${SERIES_PREFIX}/${filename}`;
    console.log(`  Uploading ${filename} → ${storagePath}`);
    await bucket.upload(localPath, {
      destination: storagePath,
      metadata: { contentType: "text/csv" },
    });
  }
  console.log(`  ✓ Uploaded ${files.length} series CSVs`);
}

// ──────────────────────────────────────────────
// Step 2: Build and upload geo.json
// ──────────────────────────────────────────────

async function buildAndUploadGeo(app: App): Promise<void> {
  const sexoFile = latestFile(SEMANAL_DIR, "_sexo.csv");
  if (!sexoFile) {
    throw new Error("No _sexo.csv found in " + SEMANAL_DIR);
  }

  console.log(`  Reading geo from: ${path.basename(sexoFile)}`);

  const geo: SemanalGeo = {};
  let rowCount = 0;

  await streamLocal(sexoFile, (row) => {
    const nombreRaw = row.nombre_entidad?.trim();
    const cveEnt = row.cve_entidad?.trim();
    const cveDist = row.cve_distrito?.trim();
    const nombreDist = row.cabecera_distrital?.trim();
    const cveMun  = row.cve_municipio?.trim();
    const nombreMun = row.nombre_municipio?.trim();
    const seccion = row.seccion?.trim();

    // Skip invalid rows
    if (!nombreRaw || nombreRaw === "NA" || !cveEnt || cveEnt === "NA") return;
    if (!seccion || seccion === "NA") return;

    // Skip extranjero rows (distritos residentes extranjero)
    if (nombreDist?.toUpperCase().includes("RESIDENTES EXTRANJERO")) return;

    if (!cveDist || !nombreDist || !cveMun || !nombreMun) return;

    const nombre = normalizeEntidadName(nombreRaw);

    // Init entidad bucket
    if (!geo[nombre]) {
      geo[nombre] = { distritos: [], municipios: {}, secciones: {} };
    }
    const ent = geo[nombre];

    // Accumulate distinct distritos
    if (!ent.municipios[cveDist]) {
      ent.distritos.push({ cve: cveDist, nombre: nombreDist });
      ent.municipios[cveDist] = [];
    }

    // Accumulate distinct municipios per distrito
    if (!ent.secciones[cveMun]) {
      ent.municipios[cveDist].push({ cve: cveMun, nombre: nombreMun });
      ent.secciones[cveMun] = [];
    }

    // Accumulate sections per municipio
    if (!ent.secciones[cveMun].includes(seccion)) {
      ent.secciones[cveMun].push(seccion);
    }

    rowCount++;
  });

  // Sort everything for stable output
  for (const ent of Object.values(geo)) {
    ent.distritos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    for (const muns of Object.values(ent.municipios)) {
      muns.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    for (const secs of Object.values(ent.secciones)) {
      secs.sort((a, b) => parseInt(a) - parseInt(b));
    }
  }

  const json = JSON.stringify(geo);
  const bucket = getStorage(app).bucket(STORAGE_BUCKET);
  const file = bucket.file(GEO_PATH);

  await file.save(json, { metadata: { contentType: "application/json" } });

  const stateCount = Object.keys(geo).length;
  const sizeKb = Math.round(json.length / 1024);
  console.log(`  ✓ geo.json → ${GEO_PATH} (${stateCount} estados, ${rowCount.toLocaleString()} rows, ${sizeKb} KB)`);
}

// ──────────────────────────────────────────────
// Step 3: Build and upload aggregate JSONs
// ──────────────────────────────────────────────

const TIPOS = ["edad", "sexo", "origen"] as const;
type Tipo = typeof TIPOS[number];

const SKIP_COLS = new Set([
  "cve_entidad", "cve_distrito", "cve_municipio", "seccion",
  "nombre_entidad", "cabecera_distrital", "nombre_municipio",
]);

async function buildAndUploadAgg(app: App): Promise<void> {
  const bucket = getStorage(app).bucket(STORAGE_BUCKET);

  for (const tipo of TIPOS) {
    const csvFile = latestFile(SEMANAL_DIR, `_${tipo}.csv`);
    if (!csvFile) {
      console.warn(`  [agg] No _${tipo}.csv found, skipping`);
      continue;
    }

    const fecha = fechaFromFilename(csvFile);
    console.log(`  Reading ${tipo} agg from: ${path.basename(csvFile)} (fecha ${fecha})`);

    const output: AggOutput = {
      fecha,
      nacional:    {},
      extranjero:  {},
      por_entidad: {},
    };

    let rowCount = 0;

    await streamLocal(csvFile, (row) => {
      const nombreRaw = row.nombre_entidad?.trim();
      const cveEnt = row.cve_entidad?.trim();
      if (!nombreRaw || nombreRaw === "NA" || !cveEnt || cveEnt === "NA") return;

      const nombre = normalizeEntidadName(nombreRaw);
      const isExt = row.cabecera_distrital?.toUpperCase().includes("RESIDENTES EXTRANJERO");

      // Ensure per-entidad bucket
      if (!output.por_entidad[nombre]) {
        output.por_entidad[nombre] = { nacional: {}, extranjero: {} };
      }

      const globalTarget = isExt ? output.extranjero  : output.nacional;
      const entTarget    = isExt
        ? output.por_entidad[nombre].extranjero
        : output.por_entidad[nombre].nacional;

      for (const [col, val] of Object.entries(row)) {
        if (SKIP_COLS.has(col)) continue;
        const num = parseFloat(val);
        if (isNaN(num)) continue;
        globalTarget[col] = (globalTarget[col] ?? 0) + num;
        entTarget[col]    = (entTarget[col]    ?? 0) + num;
      }

      rowCount++;
    });

    const storagePath = `${AGG_PREFIX}/${tipo}.json`;
    const json = JSON.stringify(output);
    const file = bucket.file(storagePath);
    await file.save(json, { metadata: { contentType: "application/json" } });

    const entCount = Object.keys(output.por_entidad).length;
    const sizeKb   = Math.round(json.length / 1024);
    console.log(`  ✓ ${tipo}.json → ${storagePath} (${entCount} entidades, ${rowCount.toLocaleString()} rows, ${sizeKb} KB)`);
  }
}

// ──────────────────────────────────────────────
// Step 4: Build and upload entity time-series JSONs
// Output: semanal_agg/serie_entidades_{tipo}.json
// Structure: { [entidad]: { nacional: SemanalSerieRow[], extranjero: SemanalSerieRow[] } }
// ──────────────────────────────────────────────

const RANGOS_EDAD_KEYS = [
  "18", "19", "20_24", "25_29", "30_34", "35_39",
  "40_44", "45_49", "50_54", "55_59", "60_64", "65_y_mas",
];
const SEXOS = ["hombres", "mujeres", "no_binario"];

/** Computes derived direct totals from sex-disaggregated columns.
 *  Adds: padron_{r}, lista_{r} (from sex sum), padron_total, lista_total.
 */
function deriveTotals(
  agg: Record<string, number>,
  tipo: Tipo
): void {
  if (tipo === "edad") {
    let padronTotal = 0;
    let listaTotal  = 0;
    for (const r of RANGOS_EDAD_KEYS) {
      const pad = SEXOS.reduce((s, sx) => s + (agg[`padron_${r}_${sx}`] ?? 0), 0);
      const lst = SEXOS.reduce((s, sx) => s + (agg[`lista_${r}_${sx}`]  ?? 0), 0);
      // Only set derived total if sex columns exist
      if (pad > 0) { agg[`padron_${r}`] = pad; padronTotal += pad; }
      if (lst > 0) { agg[`lista_${r}`]  = lst; listaTotal  += lst; }
    }
    if (padronTotal > 0) agg["padron_total"] = padronTotal;
    if (listaTotal  > 0) agg["lista_total"]  = listaTotal;
  } else if (tipo === "sexo") {
    // Compute padron_total / lista_total from sex breakdown
    const padH  = agg["padron_hombres"]    ?? 0;
    const padM  = agg["padron_mujeres"]    ?? 0;
    const padNB = agg["padron_no_binario"] ?? 0;
    const lstH  = agg["lista_hombres"]     ?? 0;
    const lstM  = agg["lista_mujeres"]     ?? 0;
    const lstNB = agg["lista_no_binario"]  ?? 0;
    if (padH + padM + padNB > 0) agg["padron_total"] = padH + padM + padNB;
    if (lstH + lstM + lstNB > 0) agg["lista_total"]  = lstH + lstM + lstNB;
  } else if (tipo === "origen") {
    // padron_total / lista_total = sum across all origin columns
    let padTotal = 0;
    let lstTotal = 0;
    for (const [k, v] of Object.entries(agg)) {
      if (k.startsWith("pad_")) padTotal += v;
      if (k.startsWith("ln_"))  lstTotal += v;
    }
    if (padTotal > 0) agg["padron_total"] = padTotal;
    if (lstTotal > 0) agg["lista_total"]  = lstTotal;
  }
}

type EntitySeriesOutput = Record<
  string,
  { nacional: Record<string, number | string>[]; extranjero: Record<string, number | string>[] }
>;

async function buildAndUploadEntitySeries(app: App): Promise<void> {
  const bucket = getStorage(app).bucket(STORAGE_BUCKET);

  for (const tipo of TIPOS) {
    // Collect all files for this tipo, sorted ascending by date
    const files = fs.readdirSync(SEMANAL_DIR)
      .filter((f) => f.endsWith(`_${tipo}.csv`))
      .sort();  // YYYYMMDD in filename sorts correctly

    if (files.length === 0) {
      console.warn(`  [entity-series] No _${tipo}.csv files found, skipping`);
      continue;
    }

    console.log(`  [entity-series] ${tipo}: processing ${files.length} weekly files…`);

    // Accumulate series per entity + ambito
    const entitySeries: EntitySeriesOutput = {};

    for (const filename of files) {
      const filePath = path.join(SEMANAL_DIR, filename);
      const fecha    = fechaFromFilename(filename);
      if (!fecha) continue;

      // Per-entity aggregates for this single fecha
      const entAgg: Record<string, { nacional: Record<string, number>; extranjero: Record<string, number> }> = {};

      await streamLocal(filePath, (row) => {
        const nombreRaw = row.nombre_entidad?.trim();
        const cveEnt    = row.cve_entidad?.trim();
        if (!nombreRaw || nombreRaw === "NA" || !cveEnt || cveEnt === "NA") return;

        const nombre = normalizeEntidadName(nombreRaw);
        const isExt  = row.cabecera_distrital?.toUpperCase().includes("RESIDENTES EXTRANJERO");

        if (!entAgg[nombre]) {
          entAgg[nombre] = { nacional: {}, extranjero: {} };
        }
        const target = isExt ? entAgg[nombre].extranjero : entAgg[nombre].nacional;

        for (const [col, val] of Object.entries(row)) {
          if (SKIP_COLS.has(col)) continue;
          const num = parseFloat(val);
          if (isNaN(num)) continue;
          target[col] = (target[col] ?? 0) + num;
        }
      });

      // Derive totals and push to entity series
      for (const [nombre, ambs] of Object.entries(entAgg)) {
        if (!entitySeries[nombre]) {
          entitySeries[nombre] = { nacional: [], extranjero: [] };
        }
        for (const ambKey of ["nacional", "extranjero"] as const) {
          const agg = ambs[ambKey];
          if (Object.keys(agg).length === 0) continue;
          deriveTotals(agg, tipo);
          entitySeries[nombre][ambKey].push({ fecha, ...agg });
        }
      }
    }

    const storagePath = `${AGG_PREFIX}/serie_entidades_${tipo}.json`;
    const json = JSON.stringify(entitySeries);
    const file = bucket.file(storagePath);
    await file.save(json, { metadata: { contentType: "application/json" } });

    const entCount = Object.keys(entitySeries).length;
    const sizeKb   = Math.round(json.length / 1024);
    console.log(`  ✓ serie_entidades_${tipo}.json → ${storagePath} (${entCount} entidades, ${files.length} fechas, ${sizeKb} KB)`);
  }
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const doSeries       = args.includes("--series")        || args.includes("--all");
  const doGeo          = args.includes("--geo")           || args.includes("--all");
  const doAgg          = args.includes("--agg")           || args.includes("--all");
  const doEntitySeries = args.includes("--entity-series") || args.includes("--all");

  if (!doSeries && !doGeo && !doAgg && !doEntitySeries) {
    console.error("Usage: npx tsx scripts/pregenerate-semanal.ts [--series] [--geo] [--agg] [--entity-series] [--all]");
    process.exit(1);
  }

  console.log("Initializing Firebase...");
  const app = initFirebase();

  if (doSeries) {
    console.log("\n[1/4] Uploading series CSVs...");
    await uploadSeriesFiles(app);
  }

  if (doGeo) {
    console.log("\n[2/4] Building geo.json...");
    await buildAndUploadGeo(app);
  }

  if (doAgg) {
    console.log("\n[3/4] Building aggregate JSONs...");
    await buildAndUploadAgg(app);
  }

  if (doEntitySeries) {
    console.log("\n[4/4] Building entity time-series JSONs...");
    await buildAndUploadEntitySeries(app);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
