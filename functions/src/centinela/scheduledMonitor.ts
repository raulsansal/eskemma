// functions/src/centinela/scheduledMonitor.ts
// Cloud Function programada — se ejecuta cada 6 horas vía Cloud Scheduler.
// Itera sobre todas las centinela_configs activas y dispara scrapeAndAnalyze.
// Implementación real en Fase 1.

import { onSchedule } from "firebase-functions/v2/scheduler";

export const scheduledMonitor = onSchedule(
  { schedule: "every 6 hours", timeZone: "America/Mexico_City" },
  async (_event) => {
    // TODO (Fase 1):
    // 1. Consultar centinela_configs donde isActive === true
    // 2. Para cada config, disparar scrapeAndAnalyze vía HTTP
    // 3. Loggear resultados en Cloud Logging
    throw new Error("Not implemented — ver Fase 1");
  }
);
