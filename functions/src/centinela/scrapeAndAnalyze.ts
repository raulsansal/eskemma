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
import {generateFeedFromRawData} from "./generateFeed";

export const scrapeAndAnalyze = onRequest(
  {
    timeoutSeconds: 540,
    memory: "512MiB",
    secrets: ["INEGI_TOKEN", "BANXICO_TOKEN", "ANTHROPIC_API_KEY"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Método no permitido"});
      return;
    }

    const {configId, userId, jobId: providedJobId} = req.body as {
      configId?: string;
      userId?: string;
      jobId?: string;
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

    // 2. Usar el jobId pre-creado por el trigger o crear uno nuevo
    const jobRef = providedJobId ?
      db.collection("centinela_jobs").doc(providedJobId) :
      db.collection("centinela_jobs").doc();
    const jobId = jobRef.id;

    if (providedJobId) {
      // El trigger ya creó el doc; solo actualizamos a "running"
      await jobRef.update({
        status: "running",
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await jobRef.set({
        configId,
        userId,
        status: "running",
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

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

      // 5. Responder inmediatamente — clasificación continúa en background.
      // Cloud Run (Gen2) sigue ejecutando hasta que el event loop quede vacío.
      res.status(200).json({
        success: true,
        jobId,
        articlesCount: articles.length,
      });

      // 6. Clasificación y generación de feed en segundo plano
      const anthropicKey = process.env.ANTHROPIC_API_KEY ?? "";
      try {
        const feedId = await generateFeedFromRawData({
          jobId,
          configId,
          userId,
          modo: configData?.modo ?? "ciudadano",
          anthropicKey,
          db,
        });
        await jobRef.update({
          status: "completed",
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          rawDataId: jobId,
          feedId,
        });
      } catch (bgError) {
        const message =
          bgError instanceof Error ? bgError.message : "Error desconocido";
        console.error("[scrapeAndAnalyze] Clasificación falló:", bgError);
        await jobRef.update({
          status: "failed",
          error: message,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";

      console.error("[scrapeAndAnalyze] Error fatal en scraping:", error);

      await jobRef.update({
        status: "failed",
        error: message,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(500).json({success: false, error: message});
    }
  }
);
