# Sefix — Antecedentes técnicos para desarrollo en R/Shiny

> Documento de contexto para retomar el desarrollo de Sefix en R/Shiny.
> Audiencia: desarrollador R trabajando en el proyecto Sefix con RStudio o Positron.
> Última actualización: 2026-03-18

---

## 1. Qué es Sefix y su relación con Eskemma

**Sefix** es un dashboard de análisis electoral de México orientado a profesionales de la consultoría política: consultores, candidatos y operadores de campaña. Forma parte del ecosistema Eskemma.

**Eskemma** es una plataforma web construida en Next.js que incluye **Moddulo**, una herramienta de inteligencia artificial para el diseño estratégico de proyectos políticos. Moddulo trabaja en 9 fases (Propósito → Exploración → Investigación → Diagnóstico → Estrategia → Táctica → Gerencia → Seguimiento → Evaluación).

### Modelo de coexistencia

Sefix y Eskemma/Moddulo son **apps independientes** que comparten una capa de datos:

```
┌─────────────────────────────────────────────┐
│          Firebase Storage                    │
│   (bucket: eskemma-3c4c3.firebasestorage.app)│
│                                              │
│  sefix/results/federals/*.csv               │
│  sefix/pdln/historico/*.csv                 │
│  sefix/pdln/semanal/*.csv                   │
└────────────┬────────────────────┬────────────┘
             │                    │
             ▼                    ▼
  ┌─────────────────┐   ┌─────────────────────┐
  │   Sefix Shiny   │   │  Eskemma / Next.js  │
  │  (dashboard     │   │  /api/sefix/...     │
  │   analítico)    │   │  (Moddulo F2/F3)    │
  └─────────────────┘   └─────────────────────┘
```

No hay llamadas directas entre Sefix Shiny y Eskemma Next.js. Ambos leen del mismo Firebase Storage de forma independiente.

### Integración visual en Eskemma

El app Shiny está embebido en la ruta `/sefix` de Eskemma como `<iframe>`. El usuario de Eskemma accede al dashboard sin salir de la plataforma.

- **URL de despliegue:** `https://kj6hbt-ra0l-s0nchez.shinyapps.io/sefix/`
- **Variable de entorno en Eskemma:** `NEXT_PUBLIC_SEFIX_DASHBOARD_URL`
- **Permisos CSP:** configurados en `next.config.ts` de Eskemma para permitir el iframe

---

## 2. Arquitectura de datos compartida (Firebase Storage)

> ⚠️ **CRÍTICO:** Las rutas y esquemas descritos aquí son **contratos activos** que el API de Moddulo (Next.js) ya consume. No renombrar archivos, no mover directorios, no cambiar nombres de columna sin coordinar con el equipo Next.js.

### 2.1 Acceso a Firebase Storage

**Proyecto:** `eskemma-3c4c3`
**Bucket:** `eskemma-3c4c3.firebasestorage.app`

Tanto Sefix Shiny como el Next.js API usan las **mismas credenciales de service account** del proyecto Firebase. Las variables de entorno del service account son:

```
FIREBASE_PROJECT_ID=eskemma-3c4c3
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@eskemma-3c4c3.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
FIREBASE_STORAGE_BUCKET=eskemma-3c4c3.firebasestorage.app
```

**Acceso desde R (opciones):**

```r
# Opción A: googleCloudStorageR
library(googleCloudStorageR)
gcs_auth(json_file = "path/to/service-account.json")
gcs_get_object("sefix/results/federals/pef_dip_2024.csv",
               bucket = "eskemma-3c4c3.firebasestorage.app",
               saveToDisk = "local_file.csv")

# Opción B: Firebase Storage REST API con httr2
library(httr2)
# Construir URL: https://storage.googleapis.com/storage/v1/b/{bucket}/o/{object}?alt=media
```

### 2.2 Resultados electorales federales

**Ruta en Storage:** `sefix/results/federals/pef_{cargo}_{año}.csv`

| Cargo | Clave | Años disponibles |
|-------|-------|-----------------|
| Diputados federales | `dip` | 2006, 2009, 2012, 2015, 2018, 2021, 2024 |
| Senadores | `sen` | 2006, 2012, 2018, 2021, 2023, 2024 |
| Presidente | `pdte` | 2006, 2012, 2018, 2024 |

**Ejemplo de nombre de archivo:** `pef_dip_2024.csv`, `pef_sen_2018.csv`

**Esquema de columnas (NO modificar nombres):**

```
id              → integer, identificador de fila
anio            → integer, año del proceso electoral
cve_ambito      → integer (1=Federal)
ambito          → text (FEDERAL)
cve_cargo       → integer (1=Presidencia, 2=Senado, 3=Diputados)
cargo           → text (PRESIDENCIA, SENADURIA, DIPUTACION FEDERAL)
cve_principio   → integer (1=Ordinaria, 2=Representación proporcional)
principio       → text
cve_tipo        → integer
tipo            → text
cve_circunscripcion → integer (1-5 para diputados)
circunscripcion → text
cve_estado      → integer (1-32, clave INE del estado)
estado          → text UPPERCASE (e.g., JALISCO, CIUDAD DE MEXICO)
cve_def         → text (clave del distrito)
cabecera        → text (cabecera distrital)
cve_mun         → integer
municipio       → text UPPERCASE
seccion         → integer (número de sección electoral)

--- Votos por partido/coalición ---
PAN             → integer
PRI             → integer
PRD             → integer
PVEM            → integer
PT              → integer
MC              → integer
MORENA          → integer
PAN_PRI_PRD     → integer (coalición, puede estar vacío en años donde no existió)
PAN_PRI         → integer
PAN_PRD         → integer
PRI_PRD         → integer
PVEM_PT_MORENA  → integer
PVEM_PT         → integer
PVEM_MORENA     → integer
PT_MORENA       → integer

--- Totales ---
no_reg          → integer (votos candidatos no registrados)
vot_nul         → integer (votos nulos)
total_votos     → integer (total de votos en la sección)
lne             → integer (Lista Nominal Electoral de la sección)
part_ciud       → numeric (% participación ciudadana en esa sección)
```

**Notas importantes:**
- Las columnas de partido/coalición varían por año. En elecciones anteriores a 2018 no existe `MORENA`. El Next.js API detecta dinámicamente qué columnas son de partido.
- La clave de filtrado que usa el Next.js API es la columna `estado` (texto uppercase).
- Granularidad: ~68,000 filas por archivo (una por sección electoral en todo México).

### 2.3 Padrón Electoral y Lista Nominal — Histórico

**Ruta:** `sefix/pdln/historico/derfe_pdln_{YYYYMMDD}_base.csv`

**Volumen:** 91 archivos. Snapshots mensuales desde aproximadamente 2007 hasta julio 2025.

**Ejemplo:** `derfe_pdln_20250731_base.csv` (corte al 31 de julio de 2025)

**Esquema de columnas:**

```
cve_entidad                     → integer (1-32, clave INE de la entidad)
nombre_entidad                  → text UPPERCASE (e.g., JALISCO)
cve_distrito                    → integer
cabecera_distrital              → text
cve_municipio                   → integer
nombre_municipio                → text UPPERCASE
seccion                         → integer

padron_nacional_hombres         → integer
padron_nacional_mujeres         → integer
padron_nacional_no_binario      → integer
padron_nacional                 → integer (total nacional)
padron_extranjero_hombres       → integer
padron_extranjero_mujeres       → integer
padron_extranjero_no_binario    → integer
padron_extranjero               → integer

lista_nacional_hombres          → integer
lista_nacional_mujeres          → integer
lista_nacional_no_binario       → integer
lista_nacional                  → integer (LNE nacional)
lista_extranjero_hombres        → integer
lista_extranjero_mujeres        → integer
lista_extranjero_no_binario     → integer
lista_extranjero                → integer
```

**Nota:** La fila con `cve_municipio = 0` y `seccion = 0` corresponde a los **residentes en el extranjero** de esa entidad.

### 2.4 Padrón Electoral y Lista Nominal — Semanal

**Ruta base:** `sefix/pdln/semanal/derfe_pdln_{YYYYMMDD}_{tipo}.csv`

Cada semana se publican **tres archivos** con la misma fecha:

| Tipo | Contenido |
|------|-----------|
| `_sexo` | Padrón/LNE desagregado por sexo (H/M/NB) — **el que usa Moddulo** |
| `_edad` | Padrón/LNE por cohortes de edad (18, 19, 20–24, 25–29, 30–34 ... 65+) |
| `_origen` | Padrón por estado de origen registrado (pad_jalisco, pad_cdmx, etc.) |

**Volumen:** 106 archivos totales (aproximadamente 35 semanas × 3 tipos). Actualizaciones enero–16 octubre 2025. Archivo más reciente: `derfe_pdln_20251016_*.csv`.

**Esquema `_sexo` (el que consume Moddulo):**

```
cve_entidad             → integer (1-32)
nombre_entidad          → text UPPERCASE
cve_distrito            → integer
cabecera_distrital      → text
cve_municipio           → integer
nombre_municipio        → text UPPERCASE
seccion                 → integer

padron_hombres          → integer
padron_mujeres          → integer
padron_no_binario       → integer
padron_electoral        → integer (total padrón)
lista_hombres           → integer
lista_mujeres           → integer
lista_no_binario        → integer
lista_nominal           → integer (total LNE)
```

**Esquema `_edad` (cohortes de edad):**
```
[mismas columnas geográficas que _sexo]
padron_hombres, padron_mujeres, padron_no_binario, padron_electoral
lista_hombres, lista_mujeres, lista_no_binario, lista_nominal
padron_18_hombres, padron_18_mujeres, padron_18_no_binario
padron_19_hombres, padron_19_mujeres, padron_19_no_binario
padron_20_24_hombres, ..., padron_25_29_hombres, ..., padron_65_y_mas_hombres, ...
lista_18_hombres, ..., lista_65_y_mas_no_binario
```

**Esquema `_origen`:** una columna por estado de origen (32 estados) tanto para padrón como para LNE. Son columnas muy anchas (~70 columnas de datos).

---

## 3. Qué hace el Next.js API con estos datos (contrato de consumo)

Esta sección documenta cómo Moddulo usa los datos para que el desarrollador Shiny sepa exactamente qué mantener.

### 3.1 Endpoints construidos en Eskemma

```
GET /api/sefix/resultados?estado={estado}&cargo={cargo}&anio={anio}

  Proceso:
  - Normaliza el nombre del estado (elimina acentos, convierte a uppercase)
  - Lista los archivos en sefix/results/federals/ con el cargo dado
  - Selecciona el año solicitado o el más reciente disponible
  - Lee el CSV en streaming (sin cargar todo el archivo)
  - Filtra filas donde columna `estado` == nombre normalizado del estado
  - Agrega votos por partido (suma de todas las filas del estado)
  - Calcula porcentajes sobre total_votos
  - Devuelve los top partidos ordenados por votos

  Respuesta: {
    estado: string,
    cargo: string,
    anio: number,
    totalVotos: number,
    lne: number,
    participacion: number (% redondeado a 1 decimal),
    votosNulos: number,
    partidos: [{ partido: string, votos: number, porcentaje: number }],
    fuente: "INE — Cómputos Distritales {anio}"
  }
```

```
GET /api/sefix/padron?estado={estado}

  Proceso:
  - Lista sefix/pdln/semanal/ y toma el _sexo más reciente
  - Si no encuentra semanal, busca en sefix/pdln/historico/ el _base más reciente
  - Filtra filas donde nombre_entidad == estado normalizado
  - Suma padron_electoral y lista_nominal (y desgloses por sexo)

  Respuesta: {
    estado: string,
    corte: string (fecha del archivo YYYY-MM-DD),
    tipo: "semanal" | "historico",
    listaNominal: number,
    padronElectoral: number,
    padronHombres: number,
    padronMujeres: number,
    padronNoBinario: number,
    fuente: "DERFE — Padrón Electoral vigente al {fecha}"
  }
```

### 3.2 Flujo de uso en Moddulo F2 (Exploración)

1. El consultor crea un proyecto de tipo `electoral` o `gubernamental` en Moddulo
2. En la fase F2, el sistema detecta automáticamente el estado mexicano leyendo el texto libre del XPCTO (hito, sujeto, justificación del proyecto)
3. Si detecta un estado → llama automáticamente a ambos endpoints
4. Muestra un widget compacto en la sección "Político" del análisis PEST-L:
   - Lista Nominal vigente (con fecha de corte)
   - Padrón H/M/NB
   - Última elección: cargo, año, % por partido, participación
5. Los datos también se inyectan en el prompt del sistema de Claude para que el análisis PEST-L cite cifras reales en lugar de generalidades

---

## 4. Estado actual del app Sefix en Shiny

- **URL producción:** `https://kj6hbt-ra0l-s0nchez.shinyapps.io/sefix/`
- **Plataforma:** shinyapps.io (Posit Cloud — plan gratuito o de pago)
- **Lenguaje/framework:** R + Shiny
- **Fuente de datos:** Firebase Storage (mismo bucket que Next.js)
- **Funcionalidades actuales:** visualización de resultados electorales federales y padrón/LNE a nivel estado y sección

**El código fuente de Sefix Shiny NO vive en el repositorio de Eskemma Next.js.** Debe localizarse en el repositorio R/Shiny separado.

---

## 5. Gaps de datos y roadmap de desarrollo Shiny

### 5.1 Datos faltantes en Firebase Storage

Estos datasets no existen aún en Storage. Agregarlos desde Shiny permitirá que Moddulo los consuma automáticamente en fases futuras.

| Dataset | Prioridad | Descripción | Impacto en Moddulo |
|---------|-----------|-------------|-------------------|
| **Elecciones estatales — gubernaturas** | 🔴 Alta | Resultados por cargo de gobernador, por estado y año | F2 para proyectos de gubernatura |
| **Elecciones locales — diputados locales** | 🔴 Alta | Resultados por cargo de diputado local, por estado/distrito | F2 para proyectos legislativos locales |
| **Elecciones locales — presidentes municipales** | 🔴 Alta | Resultados por municipio y año | F2 para proyectos municipales |
| **Gasto de campaña (INE)** | 🟡 Media | Reportes de financiamiento de campañas (INE publica) | F2 sección Económico: recursos del competidor |
| **Encuestas** | 🔵 Baja | Requiere fuente externa, no disponible en INE/DERFE | Necesita acuerdo con proveedor de encuestas |

### 5.2 Ruta propuesta para nuevos datasets

Para mantener compatibilidad con el Next.js API, se propone la siguiente convención para datos estatales:

```
sefix/results/estatales/{cve_entidad}/plo_{cargo}_{año}.csv
```

Donde:
- `cve_entidad` = código INE de 2 dígitos del estado (01=AGS, 09=CDMX, 14=JAL, etc.)
- `plo` = proceso electoral local (vs. `pef` para federal)
- `cargo` = `gob` (gobernador), `dip` (diputado local), `mun` (presidente municipal)
- `año` = año del proceso electoral

**Esquema de columnas recomendado** (compatible con el esquema federal existente):

```
id, anio, cve_ambito, ambito (ESTATAL), cve_cargo, cargo,
cve_estado, estado, cve_mun, municipio, seccion,
[columnas de partido según alianzas de ese año y entidad],
no_reg, vot_nul, total_votos, lne, part_ciud
```

La columna `estado` en uppercase es obligatoria — es la clave de filtrado del Next.js API.

### 5.3 Funcionalidades a desarrollar en Sefix Shiny

**Visualización:**
- Mapa choroplético de resultados por partido y participación (a nivel estado/municipio/sección)
- Selector territorial jerarquizado: estado → municipio → sección electoral
- Comparativa electoral histórica por territorio

**Padrón/LNE:**
- Serie histórica de padrón y LNE (uso de los 91 archivos históricos 2007–2025)
- Pirámide poblacional por edad y sexo (uso del archivo `_edad`)
- Mapa de origen: distribución de electores por estado de origen (archivo `_origen`)
- Proyección de electores nuevos (crecimiento de la LNE)

**Exportación:**
- Descarga de datos filtrados por territorio en CSV/Excel
- Generación de reportes PDF del perfil electoral del territorio

---

## 6. Entorno de desarrollo Shiny

### IDE recomendado

- **RStudio** (Posit) — IDE tradicional para R
- **Positron** — IDE moderno de Posit basado en VS Code, recomendado si se trabaja en paralelo con otros IDEs

### Paquetes R necesarios

```r
# Shiny y UI
library(shiny)
library(shinydashboard)  # o bslib para UI moderno
library(DT)              # tablas interactivas
library(plotly)          # gráficos interactivos
library(leaflet)         # mapas

# Firebase Storage
library(googleCloudStorageR)  # acceso a GCS/Firebase Storage
# o alternativamente:
library(httr2)           # HTTP requests para REST API de Firebase

# Procesamiento de datos
library(data.table)      # lectura eficiente de CSV grandes (68k filas)
library(dplyr)
library(tidyr)
library(scales)          # formateo de números
```

### Acceso a Firebase Storage desde R

```r
library(googleCloudStorageR)

# Autenticación con service account
gcs_auth(json_file = "path/to/service-account-key.json")
# O con variables de entorno (recomendado para producción):
# Sys.setenv(GCS_AUTH_FILE = "path/to/service-account-key.json")

gcs_global_bucket("eskemma-3c4c3.firebasestorage.app")

# Leer un archivo CSV directamente en memoria
temp <- tempfile(fileext = ".csv")
gcs_get_object("sefix/results/federals/pef_dip_2024.csv", saveToDisk = temp)
df <- data.table::fread(temp)
```

### Despliegue a shinyapps.io

```r
library(rsconnect)

# La cuenta ya está configurada en shinyapps.io
rsconnect::deployApp(
  appDir = "path/to/sefix/",
  appName = "sefix",
  account = "kj6hbt-ra0l-s0nchez"
)
```

### Variables de entorno en shinyapps.io

Configurar en el panel de shinyapps.io (Settings → Environment Variables) o en el archivo `.Renviron` local:

```
FIREBASE_PROJECT_ID=eskemma-3c4c3
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_PRIVATE_KEY=<private-key>
FIREBASE_STORAGE_BUCKET=eskemma-3c4c3.firebasestorage.app
```

---

## 7. Contrato de integración Sefix ↔ Eskemma

**Reglas que NO deben romperse al desarrollar en Shiny para que Moddulo siga funcionando:**

| Regla | Razón |
|-------|-------|
| No renombrar ni mover `sefix/results/federals/` ni `sefix/pdln/` | El Next.js API lista estos directorios con prefijo exacto |
| No cambiar nombres de columnas en archivos existentes | El Next.js API filtra por `estado` (resultados) y `nombre_entidad` (padrón) |
| Mantener el patrón `pef_{cargo}_{año}.csv` en nombres de archivo | El API parsea el nombre para determinar cargo y año sin leer el contenido |
| La columna `estado` siempre en UPPERCASE | El normalizador de Next.js compara contra nombres uppercase de los 32 estados |
| Al agregar datos nuevos (estatales/locales), notificar para extender el API | Evita que datos nuevos queden invisibles para Moddulo |

---

## 8. Referencia cruzada con documentación Next.js

Si necesitas entender en detalle cómo el lado Next.js consume los datos, consultar:

- `_docs/sefix-technical-brief.md` — documento orientado al desarrollo Next.js/API
- `lib/sefix/storage.ts` — código de lectura de CSV desde Firebase Storage
- `app/api/sefix/resultados/route.ts` — endpoint de resultados electorales
- `app/api/sefix/padron/route.ts` — endpoint de padrón/LNE
- `app/moddulo/proyecto/[projectId]/exploracion/page.tsx` — integración en F2 (función `detectEstadoFromXpcto`, componente `SefixWidget`)
