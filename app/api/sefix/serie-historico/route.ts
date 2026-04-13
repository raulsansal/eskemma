// app/api/sefix/serie-historico/route.ts
// Sirve el CSV pre-agregado serie_historico.csv como JSON.
// Lee UN solo archivo pequeño desde Storage (~200ms).
// NO usar getHistoricoSeries() aquí — esa función lee ~90 archivos y es lenta.
// Para datos NB exactos a nivel sección, usar /api/sefix/historico-geo.

import { NextResponse } from "next/server";
import { adminApp } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";

export const dynamic = "force-dynamic";

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
const SERIES_PATH = "sefix/pdln/semanal_series/serie_historico.csv";

function parseCsvToObjects(text: string): Record<string, string>[] {
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

export async function GET() {
  try {
    const bucket = getStorage(adminApp).bucket(BUCKET);
    const file = bucket.file(SERIES_PATH);

    const [contents] = await file.download();
    const text = contents.toString("utf-8");
    const rows = parseCsvToObjects(text);

    const raw = rows
      .map((row) => {
        const fecha = row.fecha ?? "";
        if (!fecha) return null;
        const n = (k: string) => parseInt(row[k] ?? "0", 10) || 0;
        return {
          fecha,
          year:  n("year")  || parseInt(fecha.slice(0, 4), 10),
          month: n("month") || parseInt(fecha.slice(5, 7), 10),
          padronNacional:   n("padronNacional")   || n("padron_nacional"),
          listaNacional:    n("listaNacional")    || n("lista_nacional"),
          padronExtranjero: n("padronExtranjero") || n("padron_extranjero"),
          listaExtranjero:  n("listaExtranjero")  || n("lista_extranjero"),
          padronHombres:  n("padronHombres")  || n("padron_hombres")  || n("padron_nacional_hombres"),
          padronMujeres:  n("padronMujeres")  || n("padron_mujeres")  || n("padron_nacional_mujeres"),
          padronNoBinario: n("padronNoBinario") || n("padron_no_binario") || n("padron_nacional_no_binario"),
          // Incluir lista NB si el CSV tiene esa columna (disponible desde cortes de 2025)
          listaNoBinario: n("listaNoBinario") || n("lista_no_binario") || n("lista_nacional_no_binario"),
          padronExtranjeroHombres:    n("padronExtranjeroHombres")   || n("padron_extranjero_hombres"),
          padronExtranjeroMujeres:    n("padronExtranjeroMujeres")   || n("padron_extranjero_mujeres"),
          padronExtranjeroNoBinario:  n("padronExtranjeroNoBinario") || n("padron_extranjero_no_binario"),
          listaExtranjeroHombres:     n("listaExtranjeroHombres")    || n("lista_extranjero_hombres"),
          listaExtranjeroMujeres:     n("listaExtranjeroMujeres")    || n("lista_extranjero_mujeres"),
          listaExtranjeroNoBinario:   n("listaExtranjeroNoBinario")  || n("lista_extranjero_no_binario"),
        };
      })
      .filter((m) => m !== null && m.padronNacional > 0);

    // Deduplicar: conservar el corte más reciente de cada mes
    // (mismo criterio que R: max(fecha) por year+month)
    const byYearMonth = new Map<string, NonNullable<(typeof raw)[0]>>();
    for (const entry of raw) {
      if (!entry) continue;
      const key = `${entry.year}-${entry.month}`;
      const existing = byYearMonth.get(key);
      if (!existing || entry.fecha > existing.fecha) byYearMonth.set(key, entry);
    }
    const data = Array.from(byYearMonth.values())
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return NextResponse.json(
      { data },
      {
        headers: {
          // 30 min navegador + CDN; stale-while-revalidate permite servir caché
          // mientras se actualiza en background → cero espera para visitas repetidas
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("[serie-historico] Error:", error);
    return NextResponse.json(
      { error: "No se pudo leer serie_historico.csv" },
      { status: 500 }
    );
  }
}
