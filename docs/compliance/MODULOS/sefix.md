# Módulo: SEFIX | Eskemma
## Documentación para INDAUTOR

**Autor:** Raúl Sánchez Salgado  
**Fecha:** 2026-04-10  
**Estado:** Activo en producción

---

## Descripción

SEFIX (Sistema Electoral de Filtrado e Información por Sección) es el dashboard
electoral de Eskemma. Raúl Sánchez Salgado diseñó el módulo como una herramienta
de análisis del Padrón Electoral y la Lista Nominal Estática (LNE) publicados por el
Instituto Nacional Electoral (INE) de México.

Los datos cubren series históricas desde 2017 a nivel de sección electoral, con
filtros geográficos progresivos: nacional → estatal → distrital → municipal → sección.

---

## Ruta

`/sefix` (Next.js App Router)

---

## Fuentes de Datos

- **Instituto Nacional Electoral (INE):** Archivos CSV del Padrón Electoral y Lista Nominal
- **Formato:** `derfe_pdln_YYYYMMDD_base.csv` (~195 archivos, ~5MB cada uno)
- **Cobertura temporal:** Enero 2017 – presente (actualización mensual del INE)
- **Nivel mínimo:** Sección electoral (unidad mínima de análisis)

---

## Arquitectura de Datos (diseñada por Raúl)

### Problema resuelto (2026-04-10)

El sistema original leía los 195 archivos CSV desde Firebase Storage en tiempo
de consulta — tardaba 5-15 minutos. Raúl diagnosticó la causa raíz y diseñó la
solución de pre-generación offline.

### Solución: Pre-generación offline

```
Script local (scripts/pregenerate-sefix.ts)
  → Lee 195 CSVs desde data/pdln/historico/ (local)
  → Agrega datos por sección electoral
  → Genera JSONs columnares por entidad
  → Sube a Firebase Storage

En consulta del usuario:
  → API descarga {ENTIDAD}_anual.json (~500KB) → G2 y G3
  → API descarga {ENTIDAD}_{YYYY}.json (~150KB) → G1
  → Filtra en memoria por municipio/distrito/sección
  → Resultado: 500-800ms (antes: 5-15 minutos)
```

### Evolución de esquemas CSV (manejado por Raúl)

| Período | Columnas | Cambios |
|---------|----------|---------|
| 2017–2019 | 13 | Sin No Binario, sin extranjero desglosado |
| 2020–2025-06 | 21 | Con NB nacional, extranjero agregado |
| 2025-07+ | 23 | Con NB extranjero también |

El script detecta el esquema por nombre de columna (no posición) y llena con 0
los campos ausentes en esquemas anteriores.

---

## Visualizaciones Diseñadas por Raúl

| Gráfica | Tipo | Datos |
|---------|------|-------|
| G1 — Proyección anual | LineChart | Todos los meses del año seleccionado |
| G2 — Evolución histórica | LineChart | Último mes de cada año 2017-presente |
| G3 — Desglose por sexo | BarChart + Card | Hombres, Mujeres, No Binario por año |

**Decisión de Raúl:** El dato No Binario se muestra como card flotante en G3
(no como barra) por el volumen muy pequeño de registros vs hombres/mujeres.

---

## Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `app/sefix/` | Páginas del módulo |
| `app/api/sefix/historico-geo/route.ts` | API de datos históricos geo-filtrados |
| `app/api/sefix/serie-semanal/route.ts` | Serie nacional semanal |
| `app/api/sefix/semanal-nb/route.ts` | Serie No Binario con filtro geo |
| `lib/sefix/storage.ts` | Carga y filtrado de datos desde Firebase Storage |
| `app/sefix/hooks/useLneHistorico.ts` | Hook de carga de datos históricos |
| `app/sefix/components/lne/HistoricoView.tsx` | Vista principal del dashboard |
| `scripts/pregenerate-sefix.ts` | Script offline de pre-generación |

---

## Decisiones de Diseño (Raúl Sánchez Salgado)

1. **Sección electoral como mínima unidad** — consistente con el sistema Shiny original
2. **Pre-generación offline** — replica la velocidad del sistema R/Shiny anterior
3. **JSON columnar** — Raúl especificó el formato con claves cortas para minimizar tamaño
4. **Dos archivos por entidad** — `_anual.json` + `_{YYYY}.json` para descarga selectiva
5. **Manejo de No Binario** — card flotante por volumen vs barra en chart

---

*Documento bajo supervisión de Raúl Sánchez Salgado — 2026-04-10*
