# SEFIX — Resumen técnico para continuación
**Fecha:** 2026-04-11 | **Rama:** `feature/session-cookies` | **Cambios sin commitear**

---

## Contexto

Dashboard electoral `/sefix` migrado de R/Shiny a React/Next.js.
**Regla de oro:** `docs/sefix_R/` es la fuente de verdad — leer esa implementación antes de modificar cualquier gráfica o lógica de datos.

---

## Arquitectura de datos

### Dos vistas: Nacional vs Extranjero

El CSV de DERFE tiene UNA sola estructura, dos tipos de filas:

| Tipo de fila | Condición | Columnas a usar |
|---|---|---|
| Nacional | `cabecera_distrital` NO contiene "RESIDENTES EXTRANJERO" | `padron_nacional`, `lista_nacional`, `padron_nacional_hombres/mujeres/no_binario` |
| Extranjero | `cabecera_distrital` contiene "RESIDENTES EXTRANJERO" (32 filas) | `padron_extranjero`, `lista_extranjero`, `padron_extranjero_hombres/mujeres/no_binario` (2020+) |
| Extranjero pre-2020 | Mismas filas RESIDENTES | Fallback a columnas `_nacional_*` de esas filas (no existen columnas `_extranjero_*`) |

### Tres rutas de datos en React

| Endpoint | Cuándo | Fuente |
|---|---|---|
| `GET /api/sefix/serie-historico` | Vista Nacional sin filtro geo | `semanal_series/serie_historico.csv` |
| `GET /api/sefix/historico-geo?entidad=...` | Cualquier filtro geo | JSONs pre-generados por entidad en Storage |
| `GET /api/sefix/territorios?nivel=distrito&entidad=...` | Cascade GeoFilter | CSV semanal_sexo en Storage |

### JSONs pre-generados

- **Script:** `scripts/pregenerate-sefix.ts` — leer CSVs locales, generar JSONs, subirlos a Storage
- **Storage:** `sefix/pdln/historico_entidad/`
- **Archivos:** `{ENTIDAD}_anual.json` (último mes de cada año 2017-2025) + `{ENTIDAD}_{YYYY}.json` (todos los meses de un año)
- **Formato interno (columnar):**
  ```
  SeccionData: { s, m, d, cvm, cvd, p[], l[], ph[], pm[], pnb[], pe[], le[], peh[]?, pem[]?, penb[]?, leh[]?, lem[]?, lenb[]? }
  ```
  Donde `p/l` = nacional, `pe/le` = extranjero, `ph/pm/pnb` = sexo nacional, `peh/pem/penb` = sexo extranjero (nuevo)

---

## Mapeo de nombres de entidades — CRÍTICO

Existen **dos mapeos** que deben estar sincronizados:

### 1. `scripts/pregenerate-sefix.ts` → `CSV_ENTIDAD_NORMALIZER`
CSV (`nombre_entidad`) → Storage key (nombre del archivo JSON)

```
"MICHOACAN DE OCAMPO"            → "MICHOACAN"
"VERACRUZ DE IGNACIO DE LA LLAVE"→ "VERACRUZ"
"COAHUILA DE ZARAGOZA"           → "COAHUILA"
(resto de entidades usan nombre del CSV sin acentos/espacios)
```

### 2. `lib/sefix/storage.ts` → `DERFE_NOMBRE_MAP`
UI nombre (ESTADOS_LIST) → CSV `nombre_entidad` (para consultas semanal/territorios)

```
"ESTADO DE MEXICO" → "MEXICO"
"COAHUILA"         → "COAHUILA DE ZARAGOZA"
"MICHOACAN"        → "MICHOACAN DE OCAMPO"
"VERACRUZ"         → "VERACRUZ DE IGNACIO DE LA LLAVE"
```

---

## Archivos clave

| Archivo | Propósito |
|---|---|
| `scripts/pregenerate-sefix.ts` | Genera JSONs por entidad. Re-ejecutar con `--all` tras cambios a `SeccionData`/`RowValues` |
| `lib/sefix/storage.ts` | Interfaces `HistoricoMes`, `SeccionData`; funciones `buildSeries`, `getHistoricoSeriesGeo`, `getDistritosPorEntidad`, etc. |
| `lib/sefix/seriesUtils.ts` | Funciones puras: `computeG1Data`, `computeG2Data`, `computeG3Data`, `computeG3SexData`, `computeProjection`, `generateHistoricoTexts` |
| `app/sefix/hooks/useLneHistorico.ts` | Hook principal: carga `raw` (HistoricoMes[]) y calcula g1/g2/g3SexData, nbLatest |
| `app/sefix/hooks/useLneSemanal.ts` | Hook semanal + `useGeoTerritorios` (cascade geo) |
| `app/sefix/components/lne/HistoricoView.tsx` | Vista con GeoFilter + 4 gráficas (G1 tendencia, G2 evolución, G3 comparación mensual, G3 Sexo) + textos dinámicos |
| `app/sefix/components/lne/GeoFilter.tsx` | Cascade Entidad→Distrito→Municipio→Sección; Extranjero solo muestra Entidad + badge estático |
| `app/sefix/components/lne/charts/G3SexChart.tsx` | Líneas H/M + card flotante NB |
| `app/api/sefix/serie-historico/route.ts` | Lee `serie_historico.csv`, retorna HistoricoMes[] |
| `app/api/sefix/historico-geo/route.ts` | Lee JSONs pre-generados, aplica filtros geo, retorna HistoricoMes[] |
| `app/api/sefix/territorios/route.ts` | Cascade geográfica: distritos/municipios/secciones |

---

## Interfaces principales

### `HistoricoMes` (lib/sefix/storage.ts)
```typescript
interface HistoricoMes {
  fecha: string; year: number; month: number;
  padronNacional: number; listaNacional: number;
  padronExtranjero: number; listaExtranjero: number;
  padronHombres: number; padronMujeres: number; padronNoBinario: number;
  // Sexo extranjero — nuevo, disponible 2020+; pre-2020 via fallback
  padronExtranjeroHombres: number; padronExtranjeroMujeres: number; padronExtranjeroNoBinario: number;
  listaExtranjeroHombres: number; listaExtranjeroMujeres: number; listaExtranjeroNoBinario: number;
}
```

### `G3SexPoint` (lib/sefix/seriesUtils.ts)
```typescript
interface G3SexPoint {
  year: number;
  padronHombres: number; padronMujeres: number; padronNoBinario: number;
  listaHombres: number; listaMujeres: number; listaNoBinario: number;
  padronExtranjeroHombres: number; padronExtranjeroMujeres: number; padronExtranjeroNoBinario: number;
  listaExtranjeroHombres: number; listaExtranjeroMujeres: number; listaExtranjeroNoBinario: number;
}
```

---

## Estado: qué funciona / qué no

### ✅ Implementado en código

| Feature | Archivos |
|---|---|
| Pre-generación JSONs por entidad | `pregenerate-sefix.ts` |
| Proyección G1 (tasa compuesta geométrica, idéntica a Shiny) | `seriesUtils.ts:computeProjection` |
| `lastMonths[]` en `_anual.json` (evita spike diciembre en G1) | `pregenerate-sefix.ts`, `storage.ts:buildSeries` |
| Modal "Metodología" en G1 | `HistoricoView.tsx` |
| Metadata de distrito/municipio desde año más reciente | `pregenerate-sefix.ts` |
| Guard `"NA"` en pregenerate (evita `NA.json`) | `pregenerate-sefix.ts` |
| Nombres cortos MICHOACAN/VERACRUZ/COAHUILA | `pregenerate-sefix.ts:CSV_ENTIDAD_NORMALIZER`, `normalizeEntidadName` con strip de acentos |
| Cascade geo funciona para COAHUILA/MICHOACAN/VERACRUZ | `storage.ts:DERFE_NOMBRE_MAP` |
| G3 Sexo habilitado para ambito Extranjero | `seriesUtils.ts:computeG3SexData`, `HistoricoView.tsx` |
| Card NB usa `nbLatest` (semanal) como señal primaria | `G3SexChart.tsx` |
| `serie-historico` retorna `padronNoBinario` + campos extranjero-sex | `serie-historico/route.ts` |
| GeoFilter simplificado en modo Extranjero | `GeoFilter.tsx` |
| Sexo Extranjero en pre-generación (arrays `peh/pem/penb/leh/lem/lenb`) | `pregenerate-sefix.ts`, `storage.ts:buildSeries` |
| `generateHistoricoTexts` funciona para ambos ámbitos | `seriesUtils.ts` |

### ⚠️ Pendiente de ejecución manual

```bash
# RE-GENERAR TODOS LOS JSONs (OBLIGATORIO tras cambios a SeccionData)
npx tsx scripts/pregenerate-sefix.ts --all

# LIMPIAR Storage (archivos obsoletos):
# sefix/pdln/historico_entidad/NA_anual.json + NA_*.json
# sefix/pdln/historico_entidad/MICHOACAN_DE_OCAMPO_*.json
# sefix/pdln/historico_entidad/VERACRUZ_DE_IGNACIO_DE_LA_LLAVE_*.json
# sefix/pdln/historico_entidad/COAHUILA_DE_ZARAGOZA_*.json
```

### ❓ Por verificar en el próximo chat

1. **G1 Nacional default (sin filtro):** ¿El `serie_historico.csv` tiene columnas `padron_extranjero`/`lista_extranjero`? Verificar que G1 extranjero funciona en vista nacional-default.
2. **G2 Nacional default:** ¿Muestra 2017-2025 correctamente (9 puntos)?
3. **G3 comparación mensual:** Verificar comportamiento con y sin filtros geo.
4. **Card NB en vista geo-filtrada:** Solo funcionará tras regenerar JSONs con `peh/pem/penb`.
5. **Vista Semanal (Edad, Sexo, Origen):** No trabajada en esta sesión — estado desconocido.
6. **Textos dinámicos (sidebar):** Verificar para ambos ámbitos.
7. **G2 Extranjero:** Shiny muestra nota "disponible desde 2020" para años anteriores — ¿está implementado?

---

## Fórmulas clave (Shiny original)

### Proyección G1
```
tasa_mensual = (valor_final / valor_inicial) ^ (1 / (n-1)) - 1
proyeccion(i) = ultimo_valor × (1 + tasa_mensual) ^ i
```

### NB card
- Valor del header: `nbLatest` (dato semanal más reciente vía `/api/sefix/serie-semanal?tipo=sexo&ambito=nacional`)
- Tabla de evolución anual (hover): `data.filter(d => d.padronNoBinario > 0)` de g3SexData

---

## Cómo ejecutar el script

```bash
# Requiere en .env:
# FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

npx tsx scripts/pregenerate-sefix.ts --entidad JALISCO    # prueba rápida
npx tsx scripts/pregenerate-sefix.ts --entidad __EXTRANJERO__
npx tsx scripts/pregenerate-sefix.ts --all                 # produce ~35 archivos JSON
```

Los CSVs fuente se leen desde `DATA_DIR` (constante al inicio del script, apunta a carpeta local con CSVs de DERFE descargados de Storage).

---

## Descripción de las 4 gráficas (pestaña Histórico)

Todas se renderizan en `HistoricoView.tsx`. Los datos llegan vía `useLneHistorico(ambito, selectedYear, geoInfo)`.

| Gráfica | Función | Qué muestra |
|---|---|---|
| **G1** — Tendencia del año actual | `computeG1Data(raw, year, ambito)` | Líneas Padrón + Lista del año seleccionado (meses reales) + proyección a diciembre (líneas punteadas). Solo proyecta si el año está incompleto. Botón "Metodología" aparece cuando hay proyección. |
| **G2** — Evolución anual | `computeG2Data(raw, ambito)` | Un punto por año (2017-2025), tomando el último mes disponible de cada año. Barras o líneas Padrón vs Lista. |
| **G3** — Comparación mensual | `computeG3Data(raw, ambito, years?)` | Todas las líneas por mes (1-12) de todos los años disponibles, para comparar patrones estacionales entre años. |
| **G3 Sexo** — Evolución por sexo | `computeG3SexData(raw, ambito)` | Un punto por año: líneas Padrón/Lista H/M. Card flotante NB en esquina superior. Hover muestra tabla anual de NB. Funciona para Nacional y Extranjero (2020+ para ext). |

**Selector de año (`selectedYear`):** Solo afecta G1. G2, G3 y G3-Sexo siempre usan TODOS los años disponibles en `raw`.

---

## Flujo de datos completo en `useLneHistorico`

```
ambito + selectedYear + geoInfo
        ↓
  isGeo? (geoInfo.entidad !== "Nacional")
    ├── Sí → loadGeoSeries(geoInfo, year) → GET /api/sefix/historico-geo
    │         → lee {ENTIDAD}_anual.json + {ENTIDAD}_{YYYY}.json de Storage
    │         → buildSeries() → HistoricoMes[]
    └── No → loadNacionalSeries() → GET /api/sefix/serie-historico
              → lee semanal_series/serie_historico.csv de Storage
              → HistoricoMes[]
        ↓
  raw: HistoricoMes[]  (todos los años/meses disponibles)
        ↓
  g1Data    = computeG1Data(raw, year, ambito)
  g2Data    = computeG2Data(raw, ambito)
  g3Data    = computeG3Data(raw, ambito)
  g3SexData = computeG3SexData(raw, ambito)
  texts     = generateHistoricoTexts(raw, year, ambito)
  nbLatest  → GET /api/sefix/serie-semanal?tipo=sexo&ambito=nacional  (paralelo, solo cuando no es geo)
```

**Punto crítico:** `loadGeoSeries` cachea por `entidad+year+distrito+municipio+secciones`. Si el año cambia, hace nueva petición. Si solo cambia `ambito`, usa el mismo `raw` y recalcula con `computeX`.

---

## Bugs conocidos / comportamientos por validar

### Confirmados pendientes de re-generación de JSONs
- **Card NB en vista geo-filtrada:** El popover con evolución anual H/M/NB extranjero solo aparecerá correctamente después de `npx tsx scripts/pregenerate-sefix.ts --all`. Los JSONs actuales en Storage no tienen `peh/pem/penb/leh/lem/lenb`.

### Por verificar en pruebas
- **G1 Nacional default — Extranjero:** `serie_historico.csv` podría no tener `padron_extranjero`/`lista_extranjero`. Si es así, G1 extranjero mostrará 0. Solución: verificar columnas del CSV; si no existen, este dato solo estará disponible con filtro geo.
- **G2 Extranjero — años pre-2020:** Shiny muestra aviso "datos disponibles desde 2020". React actualmente no tiene ese aviso — mostrará valores 0 o línea plana para 2017-2019.
- **GeoFilter modo Extranjero — carga de datos:** Al seleccionar Entidad en modo Extranjero, `loadGeoSeries` pasa `geo.entidad` pero no pasa distrito. El endpoint `historico-geo` debe saber que debe filtrar por filas RESIDENTES EXTRANJERO. **Revisar si `historico-geo/route.ts` maneja este caso.**
- **`availableYears` en modo geo:** El hook las extrae de `raw`. Verificar que el selector de año se puebla correctamente para todas las entidades.
- **Textos dinámicos sidebar (Extranjero):** `generateHistoricoTexts` ahora usa `padronExtranjeroHombres/Mujeres` para el bloque `sexo`. Verificar que el texto tiene sentido cuando `padronExtranjeroHombres = 0` (pre-2020 o JSONs sin regenerar).

### No trabajado en esta sesión (estado desconocido)
- **Vista Semanal** — pestañas Edad, Sexo, Origen
- **Filtro de resultados electorales** (si existe en la UI)

---

## Estado de Storage (Firebase)

```
sefix/pdln/historico_entidad/
  AGUASCALIENTES_anual.json    ✅ generado
  AGUASCALIENTES_2017.json     ✅ generado
  ...
  MICHOACAN_anual.json         ✅ generado (nombre corto correcto)
  MICHOACAN_DE_OCAMPO_*.json   ❌ BORRAR (nombre largo obsoleto)
  COAHUILA_anual.json          ✅ generado
  COAHUILA_DE_ZARAGOZA_*.json  ❌ BORRAR
  VERACRUZ_anual.json          ✅ generado
  VERACRUZ_DE_IGNACIO_*.json   ❌ BORRAR
  NA_anual.json                ❌ BORRAR (artifact de R exportando NA)
  NA_*.json                    ❌ BORRAR
  __EXTRANJERO___anual.json    ✅ generado (agrega 32 estados)
  __EXTRANJERO___*.json        ✅ generado

sefix/pdln/semanal_series/
  serie_historico.csv          ✅ (archivo que usa /api/sefix/serie-historico)

sefix/pdln/semanal_sexo/
  pdln_semanal_YYYYMMDD_sexo.csv  (cascade geo, territorios)

sefix/pdln/historico/
  pdln_YYYYMMDD_base.csv       (195 CSVs — REDUNDANTES, seguros a borrar)
```

---

## Instrucciones para el próximo chat

1. **Leer `docs/sefix_R/` antes de modificar cualquier gráfica.** Es la fuente de verdad.
2. **Leer los archivos actuales** con la herramienta `Read` antes de proponer cambios. No asumir contenido.
3. **Verificar TypeScript:** `npx tsc --noEmit` debe dar 0 errores antes de dar por terminado cualquier cambio.
4. **Tras cambios a `SeccionData`/`RowValues`:** ejecutar `npx tsx scripts/pregenerate-sefix.ts --all`.
5. **Los nombres de columnas CSV** los define el Shiny — siempre verificar en `docs/sefix_R/` antes de leer/escribir columnas.
6. **Prioridad inmediata:** Ejecutar `--all` en el script y validar las 4 gráficas en Nacional y Extranjero con y sin filtros geo.
