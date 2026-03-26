// functions/src/centinela/scheduledMonitor.ts
// Cloud Function programada: cada 6 horas itera configs activas y
// dispara scrapeAndAnalyze para cada una.

import {onSchedule} from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import {logger} from "firebase-functions";

export const scheduledMonitor = onSchedule(
  {
    schedule: "every 6 hours",
    timeZone: "America/Mexico_City",
    secrets: ["INEGI_TOKEN", "BANXICO_TOKEN"],
  },
  async () => {
    const db = admin.firestore();

    const snapshot = await db
      .collection("centinela_configs")
      .where("isActive", "==", true)
      .get();

    if (snapshot.empty) {
      logger.info("[scheduledMonitor] No hay configuraciones activas.");
      return;
    }

    logger.info(
      `[scheduledMonitor] Procesando ${snapshot.size} configs activas.`
    );

    const firebaseConfig = process.env.FIREBASE_CONFIG ?
      JSON.parse(process.env.FIREBASE_CONFIG) :
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({} as any);
    const projectId =
      process.env.GCLOUD_PROJECT ||
      firebaseConfig.projectId ||
      "eskemma-3c4c3";
    const cfUrl =
      `https://us-central1-${projectId}.cloudfunctions.net` +
      "/scrapeAndAnalyze";

    const results = await Promise.allSettled(
      snapshot.docs.map(async (doc) => {
        const config = doc.data();
        const response = await fetch(cfUrl, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            configId: doc.id,
            userId: config.userId,
          }),
          signal: AbortSignal.timeout(60000),
        });
        return {configId: doc.id, httpStatus: response.status};
      })
    );

    results.forEach((result, i) => {
      const configId = snapshot.docs[i].id;
      if (result.status === "fulfilled") {
        logger.info(
          `[scheduledMonitor] ${configId}: HTTP ${result.value.httpStatus}`
        );
      } else {
        logger.error(
          `[scheduledMonitor] ${configId} falló:`,
          result.reason
        );
      }
    });
  }
);
