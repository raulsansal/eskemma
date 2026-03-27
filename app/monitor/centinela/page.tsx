"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import type {CentinelaConfig, CentinelaFeed} from "@/types/centinela.types";

// ── Tipos locales ─────────────────────────────────────────────

interface AnalysisCard {
  config: CentinelaConfig;
  feed: CentinelaFeed | null;
  loadingFeed: boolean;
}

// ── Helpers ───────────────────────────────────────────────────

function riskLevel(v: number): {label: string; cls: string} {
  if (v >= 70) return {label: "Alto",     cls: "bg-red-100 text-red-700"};
  if (v >= 40) return {label: "Moderado", cls: "bg-yellow-100 text-yellow-700"};
  return              {label: "Bajo",     cls: "bg-green-100 text-green-700"};
}

function formatDate(value: unknown): string {
  if (!value) return "Sin análisis";
  try {
    const d =
      typeof value === "string"
        ? new Date(value)
        : new Date((value as {_seconds: number})._seconds * 1000);
    return d.toLocaleString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "fecha desconocida";
  }
}

// ── Card de análisis ──────────────────────────────────────────

function AnalysisCardItem({card}: {card: AnalysisCard}) {
  const {config, feed, loadingFeed} = card;

  return (
    <Link
      href={`/monitor/centinela/analisis/${config.id}`}
      className="group bg-white-eske rounded-xl shadow-sm border
        border-gray-eske-20 p-5 flex flex-col gap-4
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-bluegreen-eske-60
              group-hover:text-bluegreen-eske transition-colors truncate"
          >
            {config.territorio.nombre}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">
            Análisis {config.modo}
          </p>
        </div>
        <svg
          className="w-4 h-4 text-gray-300 group-hover:text-bluegreen-eske
            transition-colors shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      {/* Feed info */}
      {loadingFeed ? (
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-5 w-32 bg-gray-100 rounded-full animate-pulse" />
        </div>
      ) : feed ? (
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full
              ${riskLevel(feed.vectorRiesgo).cls}`}
          >
            Riesgo {riskLevel(feed.vectorRiesgo).label} · {Math.round(feed.vectorRiesgo)}/100
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(feed.generadoEn)}
          </span>
        </div>
      ) : (
        <span className="text-xs text-gray-400 italic">
          Sin análisis — haz clic para ejecutar
        </span>
      )}
    </Link>
  );
}

// ── Formulario nuevo análisis ─────────────────────────────────

function NewAnalysisForm({
  onCreated,
}: {
  onCreated: (configId: string) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [modo, setModo] = useState<"ciudadano" | "gubernamental">("ciudadano");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/monitor/centinela/config", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          territorioNombre: nombre.trim(),
          modo,
        }),
      });
      const data = (await res.json()) as {configId?: string; error?: string};
      if (!res.ok) throw new Error(data.error ?? "Error al crear análisis");
      onCreated(data.configId!);
      setNombre("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col sm:flex-row gap-3 items-start sm:items-end"
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Territorio</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ej. Ciudad de México, Jalisco, Atizapán…"
          className="w-full px-3 py-2 border border-gray-eske-30 rounded-lg
            text-sm focus:outline-none focus:ring-2 focus:ring-bluegreen-eske
            placeholder:text-gray-eske-60"
          required
        />
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <label className="text-xs font-medium text-gray-500">
          Tipo de análisis
        </label>
        <select
          value={modo}
          onChange={(e) =>
            setModo(e.target.value as "ciudadano" | "gubernamental")
          }
          className="px-3 py-2 border border-gray-eske-30 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-bluegreen-eske
            bg-white-eske"
        >
          <option value="ciudadano">Ciudadano</option>
          <option value="gubernamental">Gubernamental</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !nombre.trim()}
        className="shrink-0 px-5 py-2 bg-bluegreen-eske text-white
          rounded-lg text-sm font-medium hover:bg-bluegreen-eske-60
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          self-end"
      >
        {loading ? "Creando…" : "Crear análisis"}
      </button>
      {error && (
        <p className="w-full text-xs text-red-600 bg-red-50 px-3 py-1.5
          rounded-lg">
          {error}
        </p>
      )}
    </form>
  );
}

// ── Página Hub ────────────────────────────────────────────────

export default function CentinelaHubPage() {
  const router = useRouter();
  const [cards, setCards] = useState<AnalysisCard[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  async function loadConfigs() {
    const res = await fetch("/api/monitor/centinela/config");
    if (!res.ok) return;
    const data = (await res.json()) as {configs: CentinelaConfig[]};
    const configs = data.configs ?? [];

    // Inicializar cards con loadingFeed = true
    setCards(
      configs.map((c) => ({config: c, feed: null, loadingFeed: true}))
    );

    // Cargar feeds en paralelo
    await Promise.all(
      configs.map(async (c) => {
        try {
          const fr = await fetch(
            `/api/monitor/centinela/feed?configId=${c.id}`
          );
          const fd = (await fr.json()) as {feed: CentinelaFeed | null};
          setCards((prev) =>
            prev.map((card) =>
              card.config.id === c.id
                ? {...card, feed: fd.feed ?? null, loadingFeed: false}
                : card
            )
          );
        } catch {
          setCards((prev) =>
            prev.map((card) =>
              card.config.id === c.id
                ? {...card, loadingFeed: false}
                : card
            )
          );
        }
      })
    );
  }

  useEffect(() => {
    loadConfigs().finally(() => setPageLoading(false));
  }, []);

  function handleConfigCreated(configId: string) {
    // Navegar directamente a la página del nuevo análisis
    router.push(`/monitor/centinela/analisis/${configId}`);
  }

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-white-eske-40 flex items-center
        justify-center">
        <div
          className="w-6 h-6 border-2 border-bluegreen-eske
            border-t-transparent rounded-full animate-spin"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white-eske-40">
      {/* Header */}
      <div className="bg-bluegreen-eske">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">🛡️</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Centinela</h1>
              <p className="text-sm text-bluegreen-eske-10/80 mt-1
                max-w-xl leading-relaxed">
                Monitor de entorno político en tiempo real. Analiza el contexto
                PEST-L de cualquier territorio mexicano con datos de Google
                News, DOF, INEGI y Banxico, clasificados con inteligencia
                artificial.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col
        gap-8">

        {/* Sección: Nuevo análisis */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider
            text-gray-400 mb-4">
            Nuevo análisis
          </h2>
          <div className="bg-white-eske rounded-xl shadow-sm border
            border-gray-eske-20 p-5">
            <NewAnalysisForm onCreated={handleConfigCreated} />
          </div>
        </section>

        {/* Sección: Análisis guardados */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider
            text-gray-400 mb-4">
            Análisis guardados
            {cards.length > 0 && (
              <span className="ml-2 text-xs font-normal normal-case
                text-gray-400">
                ({cards.length})
              </span>
            )}
          </h2>

          {cards.length === 0 ? (
            <div className="text-center py-12 bg-white-eske rounded-xl
              border border-dashed border-gray-eske-30">
              <p className="text-sm text-gray-400">
                Aún no tienes análisis. Crea uno arriba para comenzar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
              gap-4">
              {cards.map((card) => (
                <AnalysisCardItem key={card.config.id} card={card} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
