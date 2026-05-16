"use client";
import { useState, useEffect, useRef } from "react";
import { EleccionesLocalesFilterParams } from "@/types/sefix.types";
import { TABLA_COLUMN_LABELS_LOC, getPartidoLabelLoc } from "@/lib/sefix/eleccionesLocalesConstants";

interface TableRow {
  anio: number; cargo: string; estado: string; cabecera: string;
  municipio: string; seccion: string; tipo: string; principio: string;
  total_votos: number; lne: number; part_ciud: number;
  [key: string]: string | number;
}

const PAGE_SIZES = [15, 25, 50, 100];
const FMT = (n: number) => n.toLocaleString("es-MX");

export default function EleccionesLocalesDataTable({
  committed,
  queryVersion,
}: {
  committed: EleccionesLocalesFilterParams;
  queryVersion: number;
}) {
  const [rows, setRows] = useState<TableRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const cancelRef = useRef(false);
  const lastVersion = useRef(-1);

  function buildParams(extra?: Record<string, string>) {
    const sp = new URLSearchParams({
      estado: committed.estado,
      anio: String(committed.anio),
      cargo: committed.cargo,
      page: String(page),
      pageSize: String(pageSize),
    });
    if (committed.tipo && committed.tipo !== "AMBAS") sp.set("tipo", committed.tipo);
    if (committed.principio) sp.set("principio", committed.principio);
    if (committed.cabecera) sp.set("cabecera", committed.cabecera);
    if (committed.municipio) sp.set("municipio", committed.municipio);
    if (committed.secciones.length) sp.set("secciones", committed.secciones.join(","));
    if (!committed.partidos.includes("Todos") && committed.partidos.length)
      sp.set("partidos", committed.partidos.join(","));
    if (extra) Object.entries(extra).forEach(([k, v]) => sp.set(k, v));
    return sp;
  }

  useEffect(() => {
    if (queryVersion === 0) return;
    if (queryVersion !== lastVersion.current) {
      lastVersion.current = queryVersion;
      setPage(1);
    }
    cancelRef.current = false;
    setIsLoading(true);
    fetch(`/api/sefix/elecciones-locales-tabla?${buildParams()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelRef.current) { setRows(d.rows ?? []); setTotal(d.total ?? 0); }
      })
      .catch(() => { if (!cancelRef.current) setRows([]); })
      .finally(() => { if (!cancelRef.current) setIsLoading(false); });
    return () => { cancelRef.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryVersion, page, pageSize]);

  const partidoCols = rows.length
    ? Object.keys(rows[0]).filter(
        (k) => !["anio","cargo","estado","cabecera","municipio","seccion","tipo","principio","total_votos","lne","part_ciud"].includes(k)
      )
    : [];
  const allCols = ["seccion","cabecera","municipio","tipo","principio",...partidoCols,"total_votos","lne","part_ciud"];
  const totalPages = Math.ceil(total / pageSize);

  function handleDownload() {
    window.open(
      `/api/sefix/elecciones-locales-tabla?${buildParams({ download: "true" })}`,
      "_blank"
    );
  }

  const cellCls = "px-3 py-2 text-xs text-black-eske dark:text-[#C7D6E0] whitespace-nowrap";
  const headCls = "px-3 py-2 text-[11px] font-semibold text-black-eske-60 dark:text-[#9AAEBE] uppercase tracking-wide whitespace-nowrap text-left";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs text-black-eske-60 dark:text-[#9AAEBE]">
          {total.toLocaleString("es-MX")} filas
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="loc-page-size" className="text-xs text-black-eske-60 dark:text-[#9AAEBE]">Filas:</label>
          <select
            id="loc-page-size"
            value={pageSize}
            onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
            className="text-xs border border-gray-eske-20 dark:border-white/10 rounded px-1.5 py-0.5 bg-white-eske dark:bg-[#112230] text-black-eske dark:text-[#EAF2F8]"
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            type="button"
            onClick={handleDownload}
            className="text-xs px-2.5 py-1 rounded bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bluegreen-eske"
          >
            Descargar CSV
          </button>
        </div>
      </div>

      <div
        className="overflow-x-auto rounded-lg border border-gray-eske-20 dark:border-white/10"
        style={{ minHeight: `${pageSize * 37 + 44}px` }}
      >
        <table className="min-w-full divide-y divide-gray-eske-20 dark:divide-white/10">
          <thead className="bg-gray-eske-10 dark:bg-[#0D1E2C]">
            <tr>
              {allCols.map((c) => (
                <th key={c} className={headCls}>
                  {TABLA_COLUMN_LABELS_LOC[c] ?? getPartidoLabelLoc(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-eske-10 dark:divide-white/5 bg-white-eske dark:bg-[#112230]">
            {isLoading ? (
              <tr>
                <td colSpan={allCols.length} className="py-8 text-center text-xs text-red-eske">
                  Cargando…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={allCols.length} className="py-8 text-center text-xs text-black-eske-60 dark:text-[#9AAEBE]">
                  Sin resultados
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-eske-10 dark:hover:bg-white/5">
                {allCols.map((c) => (
                  <td key={c} className={cellCls}>
                    {c === "part_ciud"
                      ? `${(row[c] as number).toFixed(2)}%`
                      : typeof row[c] === "number" && !["anio"].includes(c)
                        ? FMT(row[c] as number)
                        : row[c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs px-2 py-1 rounded border border-gray-eske-20 dark:border-white/10 disabled:opacity-40 hover:bg-gray-eske-10 dark:hover:bg-white/5"
          >
            ‹ Anterior
          </button>
          <span className="text-xs text-black-eske-60 dark:text-[#9AAEBE]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-xs px-2 py-1 rounded border border-gray-eske-20 dark:border-white/10 disabled:opacity-40 hover:bg-gray-eske-10 dark:hover:bg-white/5"
          >
            Siguiente ›
          </button>
        </div>
      )}
    </div>
  );
}
