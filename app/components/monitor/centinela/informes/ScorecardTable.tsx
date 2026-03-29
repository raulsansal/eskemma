// app/components/monitor/centinela/informes/ScorecardTable.tsx
// Weighted scorecard table for E7 — shows per-dimension scores and global score.

import type { Scorecard } from "@/lib/centinela/matrizUtils";
import type { DimensionAnalysis } from "@/types/centinela.types";

interface Props {
  scorecard: Scorecard;
  dimensions: DimensionAnalysis[];
}

const DIMENSION_LABELS: Record<string, string> = {
  P: "Político",
  E: "Económico",
  S: "Social",
  T: "Tecnológico",
  L: "Legal / Ambiental",
};

const CLASSIFICATION_STYLES: Record<string, string> = {
  OPORTUNIDAD: "bg-green-eske/10 text-green-eske border border-green-eske/30",
  AMENAZA: "bg-red-eske/10 text-red-eske border border-red-eske/30",
  NEUTRAL: "bg-gray-eske-20 text-gray-eske-60 border border-gray-eske-30",
};

export default function ScorecardTable({ scorecard, dimensions }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-eske-20">
            <th className="text-left py-2 px-3 font-semibold text-black-eske">
              Dimensión
            </th>
            <th className="text-left py-2 px-3 font-semibold text-black-eske">
              Señal
            </th>
            <th className="text-center py-2 px-3 font-semibold text-black-eske">
              Tendencia
            </th>
            <th className="text-center py-2 px-3 font-semibold text-black-eske">
              Clasificación
            </th>
            <th className="text-center py-2 px-3 font-semibold text-black-eske">
              Confianza
            </th>
            <th className="text-center py-2 px-3 font-semibold text-black-eske">
              Peso
            </th>
            <th className="text-center py-2 px-3 font-semibold text-black-eske">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {scorecard.dimensions.map((ds) => {
            const dim = dimensions.find((d) => d.code === ds.code);
            if (!dim) return null;
            return (
              <tr
                key={ds.code}
                className="border-b border-gray-eske-10 hover:bg-gray-eske-10/50"
              >
                <td className="py-2.5 px-3 font-medium text-black-eske">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-bluegreen-eske text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {ds.code}
                    </span>
                    {DIMENSION_LABELS[ds.code]}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-gray-eske-60 max-w-[200px]">
                  <span
                    className="block truncate"
                    title={dim.mainSignal}
                  >
                    {dim.mainSignal}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <TrendBadge trend={dim.trend} />
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      CLASSIFICATION_STYLES[dim.classification] ?? ""
                    }`}
                  >
                    {dim.classification}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-gray-eske-60">
                  {dim.confidence}%
                </td>
                <td className="py-2.5 px-3 text-center text-gray-eske-60">
                  {ds.dimWeight}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <ScoreBar score={ds.score} classification={dim.classification} />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-eske-30 bg-gray-eske-10">
            <td
              colSpan={6}
              className="py-3 px-3 font-semibold text-black-eske text-right"
            >
              Score global ponderado
            </td>
            <td className="py-3 px-3 text-center">
              <span
                className={`text-lg font-bold ${globalScoreColor(scorecard.globalScore)}`}
              >
                {scorecard.globalScore}
                <span className="text-sm font-normal text-gray-eske-60">
                  /100
                </span>
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TrendBadge({ trend }: { trend: string }) {
  const map: Record<string, { label: string; color: string }> = {
    ASCENDENTE: { label: "↑ Asc.", color: "text-orange-eske" },
    DESCENDENTE: { label: "↓ Desc.", color: "text-bluegreen-eske" },
    ESTABLE: { label: "→ Estable", color: "text-gray-eske-60" },
  };
  const entry = map[trend] ?? { label: trend, color: "text-gray-eske-60" };
  return (
    <span className={`text-xs font-medium ${entry.color}`}>{entry.label}</span>
  );
}

function ScoreBar({
  score,
  classification,
}: {
  score: number;
  classification: string;
}) {
  const color =
    classification === "OPORTUNIDAD"
      ? "bg-green-eske"
      : classification === "AMENAZA"
      ? "bg-red-eske"
      : "bg-gray-eske-40";

  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-16 h-1.5 bg-gray-eske-20 rounded-full overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-black-eske w-6 text-right">
        {score}
      </span>
    </div>
  );
}

function globalScoreColor(score: number): string {
  if (score >= 60) return "text-green-eske";
  if (score >= 30) return "text-orange-eske";
  return "text-red-eske";
}
