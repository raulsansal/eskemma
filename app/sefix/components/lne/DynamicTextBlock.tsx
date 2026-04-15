// app/sefix/components/lne/DynamicTextBlock.tsx
// Renders the 5-block dynamic text analysis panel for the Histórico view.
// Uses dangerouslySetInnerHTML for rich-text blocks (content is server-generated, not user input).
import type { HistoricoTexts } from "@/lib/sefix/seriesUtils";

interface Props {
  texts: HistoricoTexts;
}

function RichText({ html }: { html: string }) {
  return (
    <p
      className="leading-relaxed text-black-eske font-normal"
      // Content is entirely server-generated (no user input) — safe to render
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-3 bg-gray-eske-10 rounded-md border-l-2 border-bluegreen-eske-40">
      <p className="text-xs font-semibold text-bluegreen-eske mb-1 uppercase tracking-wide">
        {label}
      </p>
      {children}
    </div>
  );
}

export default function DynamicTextBlock({ texts }: Props) {
  return (
    <aside className="space-y-3 text-sm" aria-label="Análisis dinámico del período">
      {/* ── Encabezado ── */}
      <p className="text-xs font-bold text-bluegreen-eske uppercase tracking-widest text-center">
        Análisis Dinámico
      </p>

      {/* ── Título ── */}
      {texts.titulo && (
        <div className="p-3 bg-gray-eske-10 rounded-md border-l-2 border-bluegreen-eske-40">
          <p className="font-semibold text-base text-black-eske text-center leading-snug">
            {texts.titulo}
          </p>
        </div>
      )}

      {/* ── Alcance (sobreescrito en HistoricoView con subtituloConCorte) ── */}
      {texts.alcance && (
        <Block label="Alcance">
          <p className="leading-relaxed text-black-eske-60 text-xs">{texts.alcance}</p>
        </Block>
      )}

      {/* ── Resumen ── */}
      {texts.resumen && (
        <Block label="Resumen">
          <RichText html={texts.resumen} />
        </Block>
      )}

      {/* ── Evolución ── */}
      {texts.evolucion && (
        <Block label="Evolución">
          <RichText html={texts.evolucion} />
        </Block>
      )}

      {/* ── Composición ── */}
      {texts.sexo && (
        <Block label="Composición">
          <RichText html={texts.sexo} />
        </Block>
      )}

      {/* ── Fuente ── */}
      {texts.fuente && (
        <p className="text-[11px] text-black-eske-60 text-center mt-1">
          {texts.fuente}
        </p>
      )}
    </aside>
  );
}
