// functions/src/centinela/scrapeAndAnalyze.ts
// Cloud Function HTTP — disparada desde Next.js API Route /api/monitor/centinela/trigger
// Ejecuta el ciclo completo de scraping + clasificación PEST-L para un configId.
// Implementación real en Fase 1 (scraping) y Fase 2 (clasificación Claude).

import { onRequest } from "firebase-functions/v2/https";

export const scrapeAndAnalyze = onRequest(
  { timeoutSeconds: 540, memory: "1GiB" },
  async (_req, res) => {
    // TODO (Fase 1):
    // 1. Leer centinela_configs/{configId} de Firestore
    // 2. Crear centinela_jobs con status "pending"
    // 3. Ejecutar scrapers en paralelo (Google News, INEGI, Banxico, DOF)
    // 4. Clasificar con Claude API → PESTLAnalysis
    // 5. Calcular vectorRiesgo, indicePresionSocial, indiceClimaInversion
    // 6. Guardar centinela_feeds
    // 7. Actualizar centinela_jobs a "completed" con feedId
    res.status(501).json({ status: "not_implemented" });
  }
);
