"use client";

import type { SemanalTipo } from "@/lib/sefix/storage";
import type { Ambito } from "@/lib/sefix/seriesUtils";
import type { SemanalSerieRow } from "@/app/sefix/hooks/useLneSemanalesSerie";
import {
  generateSemanalTextsEdad,
  generateSemanalTextsSexo,
  generateSemanalTextsOrigen,
} from "@/lib/sefix/semanalUtils";

interface SemanalTextBlockProps {
  tipo: SemanalTipo;
  ambito: Ambito;
  fecha: string;
  data: Record<string, number>;
  dataEdad?: Record<string, number> | null;
  serie?: SemanalSerieRow[];
  scopeLabel?: string;
}

function RichText({ html }: { html: string }) {
  return (
    <p
      className="leading-relaxed text-black-eske font-normal"
      // Content is entirely server-generated (no user input) — safe to render
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-3 bg-gray-eske-10 rounded-md border-l-2 border-bluegreen-eske-40">
      <p className="text-xs font-semibold text-bluegreen-eske mb-1 uppercase tracking-wide">
        {label}
      </p>
      {children}
    </div>
  );
}

export default function SemanalTextBlock({
  tipo,
  ambito,
  fecha,
  data,
  dataEdad,
  serie = [],
  scopeLabel,
}: SemanalTextBlockProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-gray-eske-10 rounded-lg p-4 animate-pulse h-40" aria-hidden="true" />
    );
  }

  return (
    <aside className="space-y-3 text-sm" aria-label="Análisis dinámico semanal">
      {/* Header */}
      <p className="text-xs font-bold text-bluegreen-eske uppercase tracking-widest text-center">
        Análisis Dinámico
      </p>

      {tipo === "edad" && (
        <EdadTexts data={data} serie={serie} ambito={ambito} fecha={fecha} scopeLabel={scopeLabel} />
      )}
      {tipo === "sexo" && (
        <SexoTexts data={data} dataEdad={dataEdad ?? null} ambito={ambito} fecha={fecha} scopeLabel={scopeLabel} />
      )}
      {tipo === "origen" && (
        <OrigenTexts data={data} ambito={ambito} fecha={fecha} scopeLabel={scopeLabel} />
      )}

      <p className="text-[11px] text-black-eske-60 text-center mt-1">
        Fuente: INE. Estadística de Padrón Electoral y Lista Nominal del Electorado.
      </p>
    </aside>
  );
}

function EdadTexts({
  data, serie, ambito, fecha, scopeLabel,
}: {
  data: Record<string, number>;
  serie: SemanalSerieRow[];
  ambito: Ambito;
  fecha: string;
  scopeLabel?: string;
}) {
  const texts = generateSemanalTextsEdad(data, serie, ambito, fecha);
  return (
    <>
      {texts.titulo && (
        <div className="p-3 bg-gray-eske-10 rounded-md border-l-2 border-bluegreen-eske-40">
          <p className="font-semibold text-base text-black-eske text-center leading-snug">
            {texts.titulo}
          </p>
          {fecha && (
            <p className="text-xs text-black-eske-60 text-center mt-0.5">Corte: {fecha}</p>
          )}
        </div>
      )}
      {scopeLabel && (
        <Block label="Alcance">
          <p className="leading-relaxed text-black-eske font-normal">{scopeLabel}</p>
        </Block>
      )}
      <Block label="Inclusión">
        <RichText html={texts.resumen} />
      </Block>
      <Block label="Grupos Etarios">
        <RichText html={texts.distribucion} />
      </Block>
      <Block label="Resumen">
        <RichText html={texts.topRangos} />
      </Block>
    </>
  );
}

function SexoTexts({
  data, dataEdad, ambito, fecha, scopeLabel,
}: {
  data: Record<string, number>;
  dataEdad: Record<string, number> | null;
  ambito: Ambito;
  fecha: string;
  scopeLabel?: string;
}) {
  const texts = generateSemanalTextsSexo(data, dataEdad, ambito, fecha);
  return (
    <>
      {texts.titulo && (
        <div className="p-3 bg-gray-eske-10 rounded-md border-l-2 border-bluegreen-eske-40">
          <p className="font-semibold text-base text-black-eske text-center leading-snug">
            {texts.titulo}
          </p>
          {fecha && (
            <p className="text-xs text-black-eske-60 text-center mt-0.5">Corte: {fecha}</p>
          )}
        </div>
      )}
      {scopeLabel && (
        <Block label="Alcance">
          <p className="leading-relaxed text-black-eske font-normal">{scopeLabel}</p>
        </Block>
      )}
      <Block label="Distribución">
        <RichText html={texts.resumen} />
      </Block>
      <Block label="Tasas">
        <RichText html={texts.tasas} />
      </Block>
      {texts.composicion && (
        <Block label="Composición">
          <RichText html={texts.composicion} />
        </Block>
      )}
    </>
  );
}

function OrigenTexts({
  data, ambito, fecha, scopeLabel,
}: {
  data: Record<string, number>;
  ambito: Ambito;
  fecha: string;
  scopeLabel?: string;
}) {
  const texts = generateSemanalTextsOrigen(data, ambito, fecha);
  return (
    <>
      {texts.titulo && (
        <div className="p-3 bg-gray-eske-10 rounded-md border-l-2 border-bluegreen-eske-40">
          <p className="font-semibold text-base text-black-eske text-center leading-snug">
            {texts.titulo}
          </p>
          {fecha && (
            <p className="text-xs text-black-eske-60 text-center mt-0.5">Corte: {fecha}</p>
          )}
        </div>
      )}
      {scopeLabel && (
        <Block label="Alcance">
          <p className="leading-relaxed text-black-eske font-normal">{scopeLabel}</p>
        </Block>
      )}
      <Block label="Top Entidades">
        <RichText html={texts.top5} />
      </Block>
      <Block label="Casos Especiales">
        <RichText html={texts.especiales} />
      </Block>
      <Block label="Brecha Padrón-LNE">
        <RichText html={texts.brecha} />
      </Block>
    </>
  );
}
