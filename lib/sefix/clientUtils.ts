// lib/sefix/clientUtils.ts
// Utilidades cliente-only para leer CSVs pre-agregados desde Firebase Storage público.
// NO importar firebase-admin ni funciones server-only desde aquí.

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;

/** Construye la URL pública de Firebase Storage para un path dado */
export function storagePublicUrl(path: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media`;
}

/** Descarga y parsea un CSV desde una URL. Devuelve array de objetos. */
export async function fetchCsv(url: string): Promise<Record<string, string>[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error al descargar ${url}: HTTP ${res.status}`);
  const text = await res.text();
  return parseCsv(text);
}

/** Parsea un CSV en texto plano a array de objetos */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = (values[i] ?? "").trim();
    }
    return row;
  });
}

/** Convierte un objeto de strings a números (omite claves especificadas) */
export function rowToNumbers(
  row: Record<string, string>,
  skipKeys: string[] = []
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(row)) {
    if (skipKeys.includes(k)) continue;
    const n = parseFloat(v);
    if (!isNaN(n)) result[k] = n;
  }
  return result;
}
