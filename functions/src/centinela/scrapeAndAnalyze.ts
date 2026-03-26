// functions/src/centinela/scrapeAndAnalyze.ts
// Cloud Function HTTP: recibe { configId, userId }, ejecuta scrapers en
// paralelo y guarda los datos crudos en centinela_raw_articles.

import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {fetchGoogleNewsRSS} from "./scrapers/googleNewsRSS";
import {fetchDOFRSS} from "./scrapers/dof";
import {
  fetchInegiIndicators,
  INEGI_DEFAULT_SERIES,
} from "./scrapers/inegi";
import {
  fetchBanxicoSeries,
  BANXICO_DEFAULT_SERIES,
} from "./scrapers/banxico";

export const scrapeAndAnalyze = onRequest(
  {
    timeoutSeconds: 540,
    memory: "512MiB",
    secrets: ["INEGI_TOKEN", "BANXICO_TOKEN"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Método no permitido"});
      return;
    }

    const {configId, userId} = req.body as {
      configId?: string;
      userId?: string;
    };

    if (!configId || !userId) {
      res.status(400).json({error: "configId y userId son requeridos"});
      return;
    }

    const db = admin.firestore();

    // 1. Verificar que la config existe y pertenece al usuario
    const configSnap = await db
      .collection("centinela_configs")
      .doc(configId)
      .get();

    if (!configSnap.exists || configSnap.data()?.userId !== userId) {
      res.status(403).json({
        error: "Configuración no encontrada o sin permisos",
      });
      return;
    }

    const configData = configSnap.data();
    const territorioNombre: string =
      configData?.territorio?.nombre ?? "México";

    // 2. Crear job con status "running"
    const jobRef = db.collection("centinela_jobs").doc();
    const jobId = jobRef.id;

    await jobRef.set({
      configId,
      userId,
      status: "running",
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    try {
      // 3. Scrapers en paralelo — allSettled para no bloquear si uno falla
      const [newsResult, dofResult, inegiResult, banxicoResult] =
        await Promise.allSettled([
          fetchGoogleNewsRSS(territorioNombre),
          fetchDOFRSS(),
          fetchInegiIndicators(INEGI_DEFAULT_SERIES),
          Promise.all(
            BANXICO_DEFAULT_SERIES.map((s) => fetchBanxicoSeries(s))
          ),
        ]);

      const articles = [
        ...(newsResult.status === "fulfilled" ?
          newsResult.value :
          []),
        ...(dofResult.status === "fulfilled" ?
          dofResult.value :
          []),
      ];

      const inegiData =
        inegiResult.status === "fulfilled" ? inegiResult.value : [];

      const banxicoData =
        banxicoResult.status === "fulfilled" ?
          banxicoResult.value.flat() :
          [];

      if (newsResult.status === "rejected") {
        console.error("[scrapeAndAnalyze] Google News:", newsResult.reason);
      }
      if (dofResult.status === "rejected") {
        console.error("[scrapeAndAnalyze] DOF:", dofResult.reason);
      }
      if (inegiResult.status === "rejected") {
        console.error("[scrapeAndAnalyze] INEGI:", inegiResult.reason);
      }
      if (banxicoResult.status === "rejected") {
        console.error("[scrapeAndAnalyze] Banxico:", banxicoResult.reason);
      }

      // 4. Guardar datos crudos
      await db.collection("centinela_raw_articles").doc(jobId).set({
        jobId,
        configId,
        userId,
        territorio: territorioNombre,
        generadoEn: admin.firestore.FieldValue.serverTimestamp(),
        articles,
        economicData: {
          inegi: inegiData,
          banxico: banxicoData,
        },
        articlesCount: articles.length,
      });

      // 5. Marcar job como completado
      await jobRef.update({
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        rawDataId: jobId,
      });

      res.status(200).json({
        success: true,
        jobId,
        articlesCount: articles.length,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";

      console.error("[scrapeAndAnalyze] Error fatal:", error);

      await jobRef.update({
        status: "failed",
        error: message,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(500).json({success: false, error: message});
    }
  }
);
