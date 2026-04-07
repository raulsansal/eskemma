// app/sefix/components/lne/DynamicTextBlock.tsx
import type { HistoricoTexts } from "@/lib/sefix/seriesUtils";

interface Props {
  texts: HistoricoTexts;
}

export default function DynamicTextBlock({ texts }: Props) {
  const blocks = [
    texts.titulo && { label: null, text: texts.titulo, strong: true },
    texts.alcance && { label: "Alcance", text: texts.alcance, strong: false },
    texts.resumen && { label: "Resumen", text: texts.resumen, strong: false },
    texts.evolucion && { label: "Evolución", text: texts.evolucion, strong: false },
    texts.sexo && { label: "Composición", text: texts.sexo, strong: false },
  ].filter(Boolean) as { label: string | null; text: string; strong: boolean }[];

  return (
    <aside
      className="space-y-3 text-sm"
      aria-label="Análisis textual del período"
    >
      {blocks.map((b, i) => (
        <div
          key={i}
          className="p-3 bg-gray-eske-10 rounded-md border-l-2 border-bluegreen-eske-40"
        >
          {b.label && (
            <p className="text-xs font-semibold text-bluegreen-eske mb-1 uppercase tracking-wide">
              {b.label}
            </p>
          )}
          <p
            className={[
              "leading-relaxed text-black-eske",
              b.strong ? "font-semibold text-base" : "font-normal",
            ].join(" ")}
          >
            {b.text}
          </p>
        </div>
      ))}
    </aside>
  );
}
