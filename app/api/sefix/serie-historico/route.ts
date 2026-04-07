// app/api/sefix/serie-historico/route.ts
// Sirve el CSV pre-agregado serie_historico.csv como JSON.
// Lee UN solo archivo pequeño desde Storage — respuesta en ~200ms.
// Cache-Control 30 min: procesa una vez por período.

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

    const data = rows
      .map((row) => {
        const fecha = row.fecha ?? "";
        if (!fecha) return null;
        const n = (k: string) => parseInt(row[k] ?? "0", 10) || 0;
        return {
          fecha,
          year: n("year") || parseInt(fecha.slice(0, 4), 10),
          month: n("month") || parseInt(fecha.slice(5, 7), 10),
          padronNacional: n("padronNacional") || n("padron_nacional"),
          listaNacional: n("listaNacional") || n("lista_nacional"),
          padronExtranjero: n("padronExtranjero") || n("padron_extranjero"),
          listaExtranjero: n("listaExtranjero") || n("lista_extranjero"),
          padronHombres: n("padronHombres") || n("padron_hombres"),
          padronMujeres: n("padronMujeres") || n("padron_mujeres"),
        };
      })
      .filter((m) => m !== null && m.padronNacional > 0);

    return NextResponse.json(
      { data },
      {
        headers: {
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
