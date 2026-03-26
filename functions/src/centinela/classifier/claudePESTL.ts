// functions/src/centinela/classifier/claudePESTL.ts
// Clasifica artículos crudos en dimensiones PEST-L usando Claude API.
// Procesa hasta 10 artículos por llamada (batching para control de costos).
// Principio de trazabilidad: cada factor incluye título + URL de la fuente.

import Anthropic from "@anthropic-ai/sdk";
import type {RawArticle} from "../scrapers/googleNewsRSS";

const CLAUDE_MODEL = "claude-sonnet-4-6";
const BATCH_SIZE = 10;
const MIN_TITLE_LENGTH = 20;

export type PESTLCategory =
  | "Político"
  | "Económico"
  | "Social"
  | "Tecnológico"
  | "Legal";

export interface ClassifiedArticle {
  title: string;
  link: string;
  pubDate: string;
  source: "google_news" | "dof";
  categories: PESTLCategory[];
  impact: "alto" | "medio" | "bajo";
  sentiment: number;
  factor: string;
}

interface ClaudeClassificationResult {
  index: number;
  categories: PESTLCategory[];
  impact: "alto" | "medio" | "bajo";
  sentiment: number;
  factor: string;
}

/**
 * Extrae un JSON array del texto de respuesta de Claude.
 * @param {string} text Texto de respuesta de Claude
 * @return {ClaudeClassificationResult[]} Array de resultados parseados
 */
function extractJsonFromResponse(
  text: string
): ClaudeClassificationResult[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  try {
    return JSON.parse(jsonMatch[0]) as ClaudeClassificationResult[];
  } catch {
    return [];
  }
}

/**
 * Construye el prompt para clasificar un batch de artículos.
 * @param {RawArticle[]} articles Artículos a clasificar
 * @return {string} Prompt formateado
 */
function buildClassificationPrompt(articles: RawArticle[]): string {
  const articlesList = articles
    .map((a, i) => `[${i + 1}] Título: ${a.title}\nContenido: ${a.content}`)
    .join("\n\n");

  return `Eres un analista político especializado en México. Analiza las \
siguientes ${articles.length} noticias y clasifícalas según el marco PEST-L.

Para cada noticia proporciona:
- categories: array con una o más de \
["Político","Económico","Social","Tecnológico","Legal"]
- impact: "alto" | "medio" | "bajo"
- sentiment: número de -1.0 (muy negativo) a 1.0 (muy positivo)
- factor: resumen breve del factor identificado (máx. 100 caracteres)

NOTICIAS:
${articlesList}

Responde ÚNICAMENTE con un JSON array sin explicaciones adicionales:
[{"index":1,"categories":[...],"impact":"...","sentiment":0.0,"factor":"..."}]`;
}

/**
 * Clasifica un batch de artículos con Claude y retorna los resultados
 * fusionados con los metadatos originales (título, link, fuente).
 * @param {RawArticle[]} batch Artículos del batch
 * @param {Anthropic} client Cliente de Anthropic
 * @return {Promise<ClassifiedArticle[]>} Artículos clasificados
 */
async function classifyBatch(
  batch: RawArticle[],
  client: Anthropic
): Promise<ClassifiedArticle[]> {
  const prompt = buildClassificationPrompt(batch);

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{role: "user", content: prompt}],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const results = extractJsonFromResponse(text);

  return results
    .filter((r) => r.index >= 1 && r.index <= batch.length)
    .map((r) => {
      const article = batch[r.index - 1];
      return {
        title: article.title,
        link: article.link,
        pubDate: article.pubDate,
        source: article.source,
        categories: r.categories || [],
        impact: r.impact || "bajo",
        sentiment: Math.max(-1, Math.min(1, r.sentiment ?? 0)),
        factor: r.factor || article.title,
      };
    });
}

/**
 * Clasifica un arreglo de artículos crudos en dimensiones PEST-L
 * usando Claude API, procesando en batches de hasta 10 artículos.
 * @param {RawArticle[]} articles Artículos crudos a clasificar
 * @param {string} anthropicKey API key de Anthropic
 * @return {Promise<ClassifiedArticle[]>} Artículos clasificados con PEST-L
 */
export async function classifyArticlesWithClaude(
  articles: RawArticle[],
  anthropicKey: string
): Promise<ClassifiedArticle[]> {
  if (!anthropicKey) {
    console.warn("[claudePESTL] ANTHROPIC_API_KEY no configurado — saltando");
    return [];
  }

  // Filtrar artículos con título demasiado corto (ruido)
  const filtered = articles.filter(
    (a) => a.title && a.title.length >= MIN_TITLE_LENGTH
  );

  if (filtered.length === 0) {
    console.warn("[claudePESTL] No hay artículos válidos para clasificar");
    return [];
  }

  const client = new Anthropic({apiKey: anthropicKey});
  const classified: ClassifiedArticle[] = [];

  // Dividir en chunks de BATCH_SIZE
  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batch = filtered.slice(i, i + BATCH_SIZE);
    try {
      const batchResults = await classifyBatch(batch, client);
      classified.push(...batchResults);
      console.log(
        `[claudePESTL] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ` +
          `${batchResults.length}/${batch.length} clasificados`
      );
    } catch (error) {
      console.error(
        `[claudePESTL] Error en batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
      // Continuar con el siguiente batch
    }

    // Pausa breve entre batches para respetar rate limits
    if (i + BATCH_SIZE < filtered.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(
    `[claudePESTL] Total clasificados: ${classified.length}/${filtered.length}`
  );
  return classified;
}
