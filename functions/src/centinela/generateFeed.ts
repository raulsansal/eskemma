// functions/src/centinela/generateFeed.ts
// Orquestador interno: toma datos crudos de centinela_raw_articles,
// clasifica con Claude, calcula índices de riesgo y guarda centinela_feeds.
// Principio de trazabilidad: cada Factor incluye título + URL de la fuente.

import * as admin from "firebase-admin";
import type {Firestore} from "firebase-admin/firestore";
import {classifyArticlesWithClaude} from "./classifier/claudePESTL";
import type {ClassifiedArticle, PESTLCategory} from "./classifier/claudePESTL";
import {calculateRiskVector} from "./risk/vectorCalculator";
import type {InegiDataPoint} from "./scrapers/inegi";
import type {BanxicoDataPoint} from "./scrapers/banxico";

// Tipos que reflejan centinela.types.ts del proyecto Next.js
interface Factor {
  descripcion: string;
  impacto: "alto" | "medio" | "bajo";
  sentiment: number;
  fuente: string; // "Título del artículo — https://link.com"
  isManual: boolean;
}

interface DimensionPESTL {
  contexto: string;
  factores: Factor[];
  tendencia: "creciente" | "estable" | "decreciente";
  fuentes: string[];
}

interface PESTLAnalysis {
  politico: DimensionPESTL;
  economico: DimensionPESTL;
  social: DimensionPESTL;
  tecnologico: DimensionPESTL;
  legal: DimensionPESTL;
}

interface RawArticlesDoc {
  articles: Array<{
    title: string;
    link: string;
    pubDate: string;
    content: string;
    source: "google_news" | "dof";
  }>;
  economicData: {
    inegi: InegiDataPoint[];
    banxico: BanxicoDataPoint[];
  };
  territorio: string;
}

/** Mapa de categoría PEST-L → clave en PESTLAnalysis */
const CATEGORY_TO_KEY: Record<PESTLCategory, keyof PESTLAnalysis> = {
  "Político": "politico",
  "Económico": "economico",
  "Social": "social",
  "Tecnológico": "tecnologico",
  "Legal": "legal",
};

/**
 * Determina la tendencia de una dimensión según el promedio de sentiment.
 * @param {ClassifiedArticle[]} articles Artículos de la dimensión
 * @return {"creciente"|"estable"|"decreciente"} Tendencia calculada
 */
function calcTendencia(
  articles: ClassifiedArticle[]
): "creciente" | "estable" | "decreciente" {
  if (articles.length === 0) return "estable";
  const avg =
    articles.reduce((sum, a) => sum + a.sentiment, 0) / articles.length;
  if (avg < -0.3) return "creciente"; // riesgo en aumento
  if (avg > 0.3) return "decreciente"; // riesgo bajando
  return "estable";
}

/**
 * Construye una DimensionPESTL a partir de los artículos clasificados
 * en esa categoría. Incluye título + URL en cada Factor (trazabilidad).
 * @param {ClassifiedArticle[]} articles Artículos de la categoría
 * @return {DimensionPESTL} Dimensión construida
 */
function buildDimension(articles: ClassifiedArticle[]): DimensionPESTL {
  const factores: Factor[] = articles.map((a) => ({
    descripcion: a.factor,
    impacto: a.impact,
    sentiment: a.sentiment,
    fuente: `"${a.title}" — ${a.link}`,
    isManual: false,
  }));

  const contexto =
    factores.length > 0 ?
      factores.map((f) => f.descripcion).join(". ") :
      "Sin factores identificados en este período.";

  // URLs únicas para la lista de fuentes de la dimensión
  const fuentes = [...new Set(articles.map((a) => a.link).filter(Boolean))];

  return {
    contexto,
    factores,
    tendencia: calcTendencia(articles),
    fuentes,
  };
}

/**
 * Crea una dimensión vacía (cuando no hay artículos en esa categoría).
 * @return {DimensionPESTL} Dimensión vacía
 */
function emptyDimension(): DimensionPESTL {
  return {
    contexto: "Sin información disponible para este período.",
    factores: [],
    tendencia: "estable",
    fuentes: [],
  };
}

/**
 * Lee centinela_raw_articles, clasifica con Claude, calcula riesgo
 * y guarda el resultado en centinela_feeds. Retorna el feedId generado.
 * @param {object} params Parámetros del feed
 * @param {string} params.jobId ID del job (= ID del doc en raw_articles)
 * @param {string} params.configId ID de la configuración
 * @param {string} params.userId UID del usuario
 * @param {"ciudadano"|"gubernamental"} params.modo Modo de análisis
 * @param {string} params.anthropicKey API key de Anthropic
 * @param {Firestore} params.db Instancia de Firestore
 * @return {Promise<string>} feedId del documento creado
 */
export async function generateFeedFromRawData(params: {
  jobId: string;
  configId: string;
  userId: string;
  modo: "ciudadano" | "gubernamental";
  anthropicKey: string;
  db: Firestore;
}): Promise<string> {
  const {jobId, configId, userId, modo, anthropicKey, db} = params;

  // 1. Leer datos crudos
  const rawSnap = await db
    .collection("centinela_raw_articles")
    .doc(jobId)
    .get();

  if (!rawSnap.exists) {
    throw new Error(`centinela_raw_articles/${jobId} no encontrado`);
  }

  const raw = rawSnap.data() as RawArticlesDoc;

  // 2. Clasificar artículos con Claude
  console.log(
    `[generateFeed] Clasificando ${raw.articles.length} artículos...`
  );
  const classified = await classifyArticlesWithClaude(
    raw.articles,
    anthropicKey
  );
  console.log(`[generateFeed] ${classified.length} artículos clasificados`);

  // 3. Agrupar por dimensión PEST-L
  const byDimension: Record<keyof PESTLAnalysis, ClassifiedArticle[]> = {
    politico: [],
    economico: [],
    social: [],
    tecnologico: [],
    legal: [],
  };

  for (const article of classified) {
    for (const category of article.categories) {
      const key = CATEGORY_TO_KEY[category];
      if (key) byDimension[key].push(article);
    }
  }

  const pestl: PESTLAnalysis = {
    politico: byDimension.politico.length > 0 ?
      buildDimension(byDimension.politico) :
      emptyDimension(),
    economico: byDimension.economico.length > 0 ?
      buildDimension(byDimension.economico) :
      emptyDimension(),
    social: byDimension.social.length > 0 ?
      buildDimension(byDimension.social) :
      emptyDimension(),
    tecnologico: byDimension.tecnologico.length > 0 ?
      buildDimension(byDimension.tecnologico) :
      emptyDimension(),
    legal: byDimension.legal.length > 0 ?
      buildDimension(byDimension.legal) :
      emptyDimension(),
  };

  // 4. Calcular índices de riesgo
  const {vectorRiesgo, indicePresionSocial, indiceClimaInversion} =
    calculateRiskVector({
      classifiedArticles: classified,
      economicData: raw.economicData,
      modo,
    });

  // 5. Marcar feeds anteriores del mismo configId como no vigentes
  const prevFeeds = await db
    .collection("centinela_feeds")
    .where("configId", "==", configId)
    .where("vigente", "==", true)
    .get();

  const batch = db.batch();
  prevFeeds.forEach((doc) => batch.update(doc.ref, {vigente: false}));
  await batch.commit();

  // 6. Guardar el nuevo feed
  const feedRef = db.collection("centinela_feeds").doc();
  await feedRef.set({
    id: feedRef.id,
    configId,
    userId,
    generadoEn: admin.firestore.FieldValue.serverTimestamp(),
    territorio: raw.territorio,
    vigente: true,
    pestl,
    vectorRiesgo,
    indicePresionSocial,
    indiceClimaInversion,
    syncedToModdulo: false,
  });

  console.log(
    `[generateFeed] Feed creado: ${feedRef.id} — vectorRiesgo: ${vectorRiesgo}`
  );
  return feedRef.id;
}
