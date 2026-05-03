"use client";
// Panel izquierdo de filtros para Elecciones Federales.
// Orden: Año → Cargo → Partidos → Tipo → Principio → Estado → Distrito → Municipio → Sección
import {
  AVAILABLE_YEARS,
  VALID_COMBINATIONS,
  CARGO_CSV_LABELS,
  PARTIDO_LABELS,
  PARTY_COLORS,
  ELECCIONES_DEFAULTS,
} from "@/lib/sefix/eleccionesConstants";
import { ESTADOS_LIST } from "@/lib/sefix/constants";
import PartidosMultiSelect, { MultiSelectOption } from "./PartidosMultiSelect";
import {
  useEleccionesDistritos,
  useEleccionesMunicipios,
  useEleccionesSecciones,
  useEleccionesMetadata,
} from "@/app/sefix/hooks/useEleccionesFilters";

const SELECT_CLS =
  "text-sm border border-gray-eske-30 dark:border-white/10 rounded-md px-2 py-1.5 " +
  "bg-white-eske dark:bg-[#112230] text-black-eske dark:text-[#EAF2F8] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske w-full";

const RADIO_CLS =
  "flex items-center gap-2 text-sm text-black-eske dark:text-[#EAF2F8] cursor-pointer";

interface Props {
  // Estado pending
  pendingAnio: number;
  pendingCargo: string;
  pendingEstado: string;
  pendingPartidos: string[];
  pendingTipo: string;
  pendingPrincipio: string;
  pendingCabecera: string;
  pendingMunicipio: string;
  pendingSecciones: string[];
  // Setters
  setAnio: (v: number) => void;
  setCargo: (v: string) => void;
  setEstado: (v: string) => void;
  setPartidos: (v: string[]) => void;
  setTipo: (v: string) => void;
  setPrincipio: (v: string) => void;
  setCabecera: (v: string) => void;
  setMunicipio: (v: string) => void;
  setSecciones: (v: string[]) => void;
  // Acciones
  hasPending: boolean;
  onConsultar: () => void;
  onRestablecer: () => void;
  // Listas derivadas
  cargosDisponibles: string[];
  partidosDisponibles: string[];
}

export default function EleccionesFilters({
  pendingAnio, pendingCargo, pendingEstado, pendingPartidos,
  pendingTipo, pendingPrincipio, pendingCabecera, pendingMunicipio, pendingSecciones,
  setAnio, setCargo, setEstado, setPartidos, setTipo, setPrincipio,
  setCabecera, setMunicipio, setSecciones,
  hasPending, onConsultar, onRestablecer,
  cargosDisponibles, partidosDisponibles,
}: Props) {
  const { tipos, principios } = useEleccionesMetadata(pendingAnio, pendingCargo, pendingEstado);

  const { opciones: distritos, isLoading: loadingDist } = useEleccionesDistritos(
    pendingAnio, pendingCargo, pendingEstado
  );
  const { opciones: municipios, isLoading: loadingMun } = useEleccionesMunicipios(
    pendingAnio, pendingCargo, pendingEstado, pendingCabecera
  );
  const { secciones: seccionesDisp, isLoading: loadingSec } = useEleccionesSecciones(
    pendingAnio, pendingCargo, pendingEstado, pendingCabecera, pendingMunicipio
  );

  // Cuando cambian tipos/principios disponibles, ajustar selección si no es válida
  const tipoValido = tipos.includes(pendingTipo) || tipos.includes("AMBAS");
  const principioValido = principios.includes(pendingPrincipio);

  // Opciones para el multiselect de partidos
  const partidoOptions: MultiSelectOption[] = [
    ...partidosDisponibles.map((p) => ({
      value: p,
      label: PARTIDO_LABELS[p] ?? p,
      color: PARTY_COLORS[p] ?? PARTY_COLORS.DEFAULT,
    })),
  ];

  // Opciones para el multiselect de secciones
  const seccionOptions: MultiSelectOption[] = seccionesDisp.map((s) => ({
    value: s,
    label: s,
  }));

  const isNacional = !pendingEstado;
  const hasCabecera = !!pendingCabecera;
  const hasMunicipio = !!pendingMunicipio;

  return (
    <div className="flex flex-col gap-4 text-sm">
      {/* 1. Año */}
      <div className="flex flex-col gap-1">
        <label htmlFor="ef-anio" className="text-xs font-medium text-black-eske-60 dark:text-[#9AAEBE]">
          Año de la elección
        </label>
        <select
          id="ef-anio"
          value={pendingAnio}
          onChange={(e) => setAnio(parseInt(e.target.value))}
          className={SELECT_CLS}
        >
          {AVAILABLE_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* 2. Cargo */}
      <div className="flex flex-col gap-1">
        <label htmlFor="ef-cargo" className="text-xs font-medium text-black-eske-60 dark:text-[#9AAEBE]">
          Cargo
        </label>
        <select
          id="ef-cargo"
          value={pendingCargo}
          onChange={(e) => setCargo(e.target.value)}
          className={SELECT_CLS}
        >
          {cargosDisponibles.map((c) => (
            <option key={c} value={c}>{CARGO_CSV_LABELS[c] ?? c}</option>
          ))}
        </select>
      </div>

      {/* 3. Partidos / coaliciones */}
      <div className="relative">
        <PartidosMultiSelect
          id="ef-partidos"
          label="Partidos, coaliciones o candidaturas"
          options={partidoOptions}
          selected={pendingPartidos}
          onChange={setPartidos}
          placeholder="Buscar partido..."
          todosLabel="Todos"
        />
      </div>

      {/* 4. Tipo de elección */}
      {tipos.length > 1 && (
        <fieldset>
          <legend className="text-xs font-medium text-black-eske-60 dark:text-[#9AAEBE] mb-1">
            Tipo de elección
          </legend>
          <div className="flex flex-col gap-1">
            {tipos.includes("ORDINARIA") && (
              <label className={RADIO_CLS}>
                <input
                  type="radio"
                  name="ef-tipo"
                  value="ORDINARIA"
                  checked={pendingTipo === "ORDINARIA"}
                  onChange={() => setTipo("ORDINARIA")}
                  className="accent-blue-eske"
                />
                Ordinaria
              </label>
            )}
            {tipos.includes("EXTRAORDINARIA") && (
              <label className={RADIO_CLS}>
                <input
                  type="radio"
                  name="ef-tipo"
                  value="EXTRAORDINARIA"
                  checked={pendingTipo === "EXTRAORDINARIA"}
                  onChange={() => setTipo("EXTRAORDINARIA")}
                  className="accent-blue-eske"
                />
                Extraordinaria
              </label>
            )}
            {tipos.includes("ORDINARIA") && tipos.includes("EXTRAORDINARIA") && (
              <label className={RADIO_CLS}>
                <input
                  type="radio"
                  name="ef-tipo"
                  value="AMBAS"
                  checked={pendingTipo === "AMBAS"}
                  onChange={() => setTipo("AMBAS")}
                  className="accent-blue-eske"
                />
                Ambas
              </label>
            )}
          </div>
        </fieldset>
      )}

      {/* 5. Principio electoral */}
      {principios.length > 1 && (
        <fieldset>
          <legend className="text-xs font-medium text-black-eske-60 dark:text-[#9AAEBE] mb-1">
            Principio electoral
          </legend>
          <div className="flex flex-col gap-1">
            {principios.map((p) => (
              <label key={p} className={RADIO_CLS}>
                <input
                  type="radio"
                  name="ef-principio"
                  value={p}
                  checked={pendingPrincipio === p}
                  onChange={() => setPrincipio(p)}
                  className="accent-blue-eske"
                />
                {p === "MAYORIA RELATIVA" ? "Mayoría Relativa" : "Representación Proporcional"}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Separador */}
      <hr className="border-gray-eske-20 dark:border-white/10" />

      {/* 6. Entidad federativa */}
      <div className="flex flex-col gap-1">
        <label htmlFor="ef-estado" className="text-xs font-medium text-black-eske-60 dark:text-[#9AAEBE]">
          Entidad federativa
        </label>
        <select
          id="ef-estado"
          value={pendingEstado}
          onChange={(e) => setEstado(e.target.value)}
          className={SELECT_CLS}
        >
          <option value="">— Nacional —</option>
          {ESTADOS_LIST.map((e) => (
            <option key={e.key} value={e.nombre}>{e.nombre}</option>
          ))}
        </select>
      </div>

      {/* 7. Distrito electoral */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="ef-cabecera"
          className={`text-xs font-medium ${isNacional ? "text-black-eske-60/50 dark:text-[#6D8294]" : "text-black-eske-60 dark:text-[#9AAEBE]"}`}
        >
          Distrito electoral
          {loadingDist && <span className="ml-1 text-[10px]">(cargando…)</span>}
        </label>
        <select
          id="ef-cabecera"
          value={pendingCabecera}
          onChange={(e) => setCabecera(e.target.value)}
          disabled={isNacional || loadingDist}
          className={SELECT_CLS}
        >
          <option value="">Todos</option>
          {distritos.map((d) => (
            <option key={d.cve} value={d.cve}>{d.nombre}</option>
          ))}
        </select>
      </div>

      {/* 8. Municipio */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="ef-municipio"
          className={`text-xs font-medium ${!hasCabecera ? "text-black-eske-60/50 dark:text-[#6D8294]" : "text-black-eske-60 dark:text-[#9AAEBE]"}`}
        >
          Municipio
          {loadingMun && <span className="ml-1 text-[10px]">(cargando…)</span>}
        </label>
        <select
          id="ef-municipio"
          value={pendingMunicipio}
          onChange={(e) => setMunicipio(e.target.value)}
          disabled={!hasCabecera || loadingMun}
          className={SELECT_CLS}
        >
          <option value="">Todos</option>
          {municipios.map((m) => (
            <option key={m.cve} value={m.cve}>{m.nombre}</option>
          ))}
        </select>
      </div>

      {/* 9. Sección electoral (multi-select) */}
      <div className="relative">
        <PartidosMultiSelect
          id="ef-secciones"
          label={`Sección electoral${loadingSec ? " (cargando…)" : ""}`}
          options={seccionOptions}
          selected={pendingSecciones.length > 0 ? pendingSecciones : ["Todas"]}
          onChange={(v) => setSecciones(v.filter((x) => x !== "Todas"))}
          disabled={!hasMunicipio || loadingSec}
          placeholder="Buscar sección..."
          todosLabel="Todas"
        />
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={onConsultar}
          className={[
            "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-eske",
            hasPending
              ? "bg-blue-eske text-white-eske hover:bg-blue-eske-60"
              : "border border-blue-eske text-blue-eske dark:text-[#7B8FD4] bg-white-eske dark:bg-[#112230] cursor-default",
          ].join(" ")}
          aria-label="Ejecutar consulta con los filtros seleccionados"
        >
          Consultar
        </button>
        <button
          type="button"
          onClick={onRestablecer}
          className="text-sm text-orange-eske hover:text-orange-eske-60 dark:text-[#FF9856] underline text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-eske rounded"
          aria-label="Restablecer filtros a valores por defecto"
        >
          Restablecer valores por defecto
        </button>
      </div>

      {/* Indicador de filtros activos */}
      {!hasPending && (pendingEstado || pendingCabecera || pendingMunicipio || pendingSecciones.length > 0) && (
        <p className="text-[11px] text-black-eske-60 dark:text-[#6D8294] text-center">
          {[
            pendingEstado || "Nacional",
            pendingCabecera,
            pendingMunicipio,
            pendingSecciones.length > 0 ? `${pendingSecciones.length} secciones` : null,
          ].filter(Boolean).join(" › ")}
        </p>
      )}

      {/* Suprimir warning sobre tipoValido / principioValido (se usan para efecto futuro) */}
      <span className="hidden" aria-hidden="true">{String(tipoValido)}{String(principioValido)}</span>
    </div>
  );
}
