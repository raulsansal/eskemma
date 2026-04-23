# scripts/preaggregar_semanal.R
# Pre-agregación de series semanales para Firebase
#
# PROPÓSITO:
#   Genera 6 archivos de series nacionales/extranjero (una fila por semana) y
#   3 archivos JSON de series por entidad, y los sube a Firebase Storage.
#
# USO:
#   Ejecutar desde el directorio raíz del proyecto:
#     source("scripts/preaggregar_semanal.R")
#
#   Requiere:
#     - Archivos locales en data/pdln/semanal/derfe_pdln_YYYYMMDD_{tipo}.csv
#     - FIREBASE_API_KEY en .Renviron (o definida antes de sourcing este script)
#     - Paquetes: data.table, httr, jsonlite
#
# ARCHIVOS GENERADOS EN FIREBASE:
#   sefix/pdln/semanal_series/serie_nacional_edad.csv
#   sefix/pdln/semanal_series/serie_extranjero_edad.csv
#   sefix/pdln/semanal_series/serie_nacional_sexo.csv
#   sefix/pdln/semanal_series/serie_extranjero_sexo.csv
#   sefix/pdln/semanal_series/serie_nacional_origen.csv
#   sefix/pdln/semanal_series/serie_extranjero_origen.csv
#   sefix/pdln/semanal_agg/serie_entidades_edad.json
#   sefix/pdln/semanal_agg/serie_entidades_sexo.json
#   sefix/pdln/semanal_agg/serie_entidades_origen.json
#
# MANTENIMIENTO SEMANAL:
#   1. Descargar nuevos CSVs crudos a data/pdln/semanal/
#   2. Ejecutar este script → detecta fechas nuevas y actualiza Firebase

library(data.table)
library(httr)
library(jsonlite)

# ============================================================
# CONFIGURACIÓN
# ============================================================

FIREBASE_BUCKET  <- "eskemma-3c4c3.firebasestorage.app"
FIREBASE_API_KEY <- Sys.getenv("FIREBASE_API_KEY")

DIR_SEMANAL <- "data/pdln/semanal"
DIR_SERIES  <- "data/series"

ORDEN_EDAD <- c("18","19","20_24","25_29","30_34","35_39",
                "40_44","45_49","50_54","55_59","60_64","65_y_mas")

SEXOS <- c("hombres", "mujeres", "no_binario")

# Nombres constitucionales → nombres cortos usados en la UI
NORMALIZAR_ENTIDAD <- c(
  "COAHUILA DE ZARAGOZA"            = "COAHUILA",
  "MICHOACAN DE OCAMPO"             = "MICHOACAN",
  "VERACRUZ DE IGNACIO DE LA LLAVE" = "VERACRUZ",
  "MEXICO"                          = "ESTADO DE MEXICO"
)

# ============================================================
# HELPERS GENERALES
# ============================================================

es_fila_extranjero <- function(df) {
  if (!"cabecera_distrital" %in% colnames(df)) return(rep(FALSE, nrow(df)))
  grepl("RESIDENTES EXTRANJERO", toupper(trimws(df$cabecera_distrital)), fixed = TRUE)
}

extraer_fila_agregada <- function(df, ambito) {
  if (is.null(df) || nrow(df) == 0) return(NULL)

  cols_id <- c("cve_entidad","nombre_entidad","cve_distrito","cabecera_distrital",
               "cve_municipio","nombre_municipio","seccion")

  if (ambito == "extranjero") {
    filas <- df[es_fila_extranjero(df), , drop = FALSE]
  } else {
    mask_excl <- es_fila_extranjero(df)
    if ("cve_entidad" %in% colnames(df)) mask_excl <- mask_excl | is.na(df$cve_entidad)
    filas <- df[!mask_excl, , drop = FALSE]
  }

  if (is.null(filas) || nrow(filas) == 0) return(NULL)

  cols_num <- setdiff(colnames(filas), cols_id)
  cols_num <- cols_num[sapply(filas[, cols_num, drop = FALSE], function(x)
    is.numeric(x) || suppressWarnings(!any(is.na(as.numeric(x)))))]

  ag <- as.data.frame(
    lapply(filas[, cols_num, drop = FALSE], function(x) sum(as.numeric(x), na.rm = TRUE)),
    stringsAsFactors = FALSE)
  ag$nombre_entidad <- if (ambito == "extranjero") "RESIDENTES EXTRANJERO" else "SECCIONES_NAC"
  ag
}

normalizar_columnas <- function(df) {
  nombres <- colnames(df)
  nombres <- tolower(nombres)
  nombres <- gsub("[áàäâã]", "a", nombres)
  nombres <- gsub("[éèëê]",  "e", nombres)
  nombres <- gsub("[íìïî]",  "i", nombres)
  nombres <- gsub("[óòöôõ]", "o", nombres)
  nombres <- gsub("[úùüû]",  "u", nombres)
  nombres <- gsub("[ñ]",     "n", nombres)
  nombres <- gsub("[^a-z0-9_]", "_", nombres)
  nombres <- gsub("_+", "_", nombres)
  nombres <- gsub("^_|_$", "", nombres)
  colnames(df) <- nombres
  df
}

# Mirrors normalizeEntidadName() from pregenerate-semanal.ts
normalizar_nombre_entidad <- function(nombre) {
  n <- toupper(trimws(nombre))
  # Remove accents
  n <- gsub("[ÁÀÄÂÃ]", "A", n)
  n <- gsub("[ÉÈËÊ]",  "E", n)
  n <- gsub("[ÍÌÏÎ]",  "I", n)
  n <- gsub("[ÓÒÖÔÕ]", "O", n)
  n <- gsub("[ÚÙÜÛ]",  "U", n)
  n <- gsub("[Ñ]",     "N", n)
  n <- gsub("\\s+", " ", trimws(n))
  if (n %in% names(NORMALIZAR_ENTIDAD)) NORMALIZAR_ENTIDAD[[n]] else n
}

# ============================================================
# HELPERS DE CONSTRUCCIÓN DE FILAS — SERIES NACIONALES
# ============================================================

construir_fila_serie_edad <- function(fila_ag, fecha, ambito) {
  if (is.null(fila_ag)) return(NULL)
  resultado <- list(fecha = as.character(fecha))
  for (rango in ORDEN_EDAD) {
    col_ph <- paste0("padron_", rango, "_hombres")
    col_pm <- paste0("padron_", rango, "_mujeres")
    col_pn <- paste0("padron_", rango, "_no_binario")
    col_lh <- paste0("lista_",  rango, "_hombres")
    col_lm <- paste0("lista_",  rango, "_mujeres")
    col_ln <- paste0("lista_",  rango, "_no_binario")

    resultado[[paste0("padron_", rango)]] <- sum(
      if (col_ph %in% colnames(fila_ag)) as.numeric(fila_ag[[col_ph]]) else 0,
      if (col_pm %in% colnames(fila_ag)) as.numeric(fila_ag[[col_pm]]) else 0,
      if (col_pn %in% colnames(fila_ag)) as.numeric(fila_ag[[col_pn]]) else 0,
      na.rm = TRUE)
    resultado[[paste0("lista_", rango)]] <- sum(
      if (col_lh %in% colnames(fila_ag)) as.numeric(fila_ag[[col_lh]]) else 0,
      if (col_lm %in% colnames(fila_ag)) as.numeric(fila_ag[[col_lm]]) else 0,
      if (col_ln %in% colnames(fila_ag)) as.numeric(fila_ag[[col_ln]]) else 0,
      na.rm = TRUE)
  }
  resultado$padron_total <- sum(unlist(resultado[paste0("padron_", ORDEN_EDAD)]), na.rm = TRUE)
  resultado$lista_total  <- sum(unlist(resultado[paste0("lista_",  ORDEN_EDAD)]), na.rm = TRUE)
  as.data.frame(resultado, stringsAsFactors = FALSE)
}

construir_fila_serie_sexo <- function(fila_ag, fecha, ambito) {
  if (is.null(fila_ag)) return(NULL)
  get_col <- function(col) {
    if (col %in% colnames(fila_ag)) {
      v <- as.numeric(fila_ag[[col]])
      if (is.na(v)) 0 else v
    } else 0
  }
  data.frame(
    fecha             = as.character(fecha),
    padron_hombres    = get_col("padron_hombres"),
    padron_mujeres    = get_col("padron_mujeres"),
    padron_no_binario = get_col("padron_no_binario"),
    lista_hombres     = get_col("lista_hombres"),
    lista_mujeres     = get_col("lista_mujeres"),
    lista_no_binario  = get_col("lista_no_binario"),
    stringsAsFactors  = FALSE
  )
}

construir_fila_serie_origen <- function(fila_ag, fecha, ambito) {
  if (is.null(fila_ag)) return(NULL)
  resultado <- list(fecha = as.character(fecha))
  cols_pad <- grep("^pad_[a-z]|^pad87$|^pad88$", colnames(fila_ag),
                   value = TRUE, ignore.case = TRUE)
  cols_ln  <- grep("^ln_[a-z]|^ln87$|^ln88$",   colnames(fila_ag),
                   value = TRUE, ignore.case = TRUE)
  for (col in cols_pad) {
    resultado[[col]] <- as.numeric(fila_ag[[col]])
    if (is.na(resultado[[col]])) resultado[[col]] <- 0
  }
  for (col in cols_ln) {
    resultado[[col]] <- as.numeric(fila_ag[[col]])
    if (is.na(resultado[[col]])) resultado[[col]] <- 0
  }
  if (length(resultado) == 1) return(NULL)
  as.data.frame(resultado, stringsAsFactors = FALSE)
}

# ============================================================
# HELPERS DE CONSTRUCCIÓN DE FILAS — SERIES POR ENTIDAD
# Mirrors deriveTotals() from pregenerate-semanal.ts
# ============================================================

get_num <- function(df, col) {
  if (col %in% colnames(df)) { v <- as.numeric(df[[col]]); if (is.na(v)) 0 else v } else 0
}

construir_fila_entidad_edad <- function(fila_ag, fecha) {
  if (is.null(fila_ag) || nrow(fila_ag) == 0) return(NULL)
  resultado <- list(fecha = as.character(fecha))
  pad_total <- 0
  lst_total <- 0
  for (rango in ORDEN_EDAD) {
    pad <- sum(sapply(SEXOS, function(sx) get_num(fila_ag, paste0("padron_", rango, "_", sx))))
    lst <- sum(sapply(SEXOS, function(sx) get_num(fila_ag, paste0("lista_",  rango, "_", sx))))
    resultado[[paste0("padron_", rango)]] <- pad
    resultado[[paste0("lista_",  rango)]] <- lst
    pad_total <- pad_total + pad
    lst_total <- lst_total + lst
  }
  resultado$padron_total <- pad_total
  resultado$lista_total  <- lst_total
  as.data.frame(resultado, stringsAsFactors = FALSE)
}

construir_fila_entidad_sexo <- function(fila_ag, fecha) {
  if (is.null(fila_ag) || nrow(fila_ag) == 0) return(NULL)
  pad_h  <- get_num(fila_ag, "padron_hombres")
  pad_m  <- get_num(fila_ag, "padron_mujeres")
  pad_nb <- get_num(fila_ag, "padron_no_binario")
  lst_h  <- get_num(fila_ag, "lista_hombres")
  lst_m  <- get_num(fila_ag, "lista_mujeres")
  lst_nb <- get_num(fila_ag, "lista_no_binario")
  data.frame(
    fecha             = as.character(fecha),
    padron_hombres    = pad_h,
    padron_mujeres    = pad_m,
    padron_no_binario = pad_nb,
    lista_hombres     = lst_h,
    lista_mujeres     = lst_m,
    lista_no_binario  = lst_nb,
    padron_total      = pad_h + pad_m + pad_nb,
    lista_total       = lst_h + lst_m + lst_nb,
    stringsAsFactors  = FALSE
  )
}

construir_fila_entidad_origen <- function(fila_ag, fecha) {
  if (is.null(fila_ag) || nrow(fila_ag) == 0) return(NULL)
  resultado <- list(fecha = as.character(fecha))
  cols_pad <- grep("^pad_[a-z]|^pad87$|^pad88$", colnames(fila_ag),
                   value = TRUE, ignore.case = TRUE)
  cols_ln  <- grep("^ln_[a-z]|^ln87$|^ln88$",   colnames(fila_ag),
                   value = TRUE, ignore.case = TRUE)
  pad_total <- 0
  lst_total <- 0
  for (col in cols_pad) {
    v <- get_num(fila_ag, col)
    resultado[[col]] <- v
    pad_total <- pad_total + v
  }
  for (col in cols_ln) {
    v <- get_num(fila_ag, col)
    resultado[[col]] <- v
    lst_total <- lst_total + v
  }
  if (length(resultado) == 1) return(NULL)
  resultado$padron_total <- pad_total
  resultado$lista_total  <- lst_total
  as.data.frame(resultado, stringsAsFactors = FALSE)
}

# Aggregates rows from a dataframe for one entity + ambito combination
extraer_fila_entidad <- function(df, nombre_entidad_norm, ambito, cols_id) {
  mask_ext <- es_fila_extranjero(df)

  if (ambito == "extranjero") {
    filas <- df[mask_ext, , drop = FALSE]
  } else {
    filas <- df[!mask_ext & !is.na(df$cve_entidad), , drop = FALSE]
  }

  if (!"nombre_entidad" %in% colnames(filas) || nrow(filas) == 0) return(NULL)

  # Filter by normalized entity name
  filas_ent <- filas[
    vapply(filas$nombre_entidad, function(n) normalizar_nombre_entidad(n), character(1)) == nombre_entidad_norm,
    , drop = FALSE
  ]
  if (nrow(filas_ent) == 0) return(NULL)

  cols_num <- setdiff(colnames(filas_ent), cols_id)
  cols_num <- cols_num[sapply(filas_ent[, cols_num, drop = FALSE], function(x)
    is.numeric(x) || suppressWarnings(!any(is.na(as.numeric(x)))))]

  as.data.frame(
    lapply(filas_ent[, cols_num, drop = FALSE], function(x) sum(as.numeric(x), na.rm = TRUE)),
    stringsAsFactors = FALSE
  )
}

# ============================================================
# FIREBASE — SUBIDA
# ============================================================

subir_serie_firebase <- function(df, path_firebase) {
  if (FIREBASE_API_KEY == "") {
    stop("FIREBASE_API_KEY no está definida. Agrégala a .Renviron:\n",
         "  FIREBASE_API_KEY=tu_clave_aqui\n",
         "Luego reinicia R y vuelve a ejecutar este script.")
  }

  tmp <- tempfile(fileext = ".csv")
  on.exit(unlink(tmp))
  fwrite(df, tmp, dateTimeAs = "write")

  contenido <- readBin(tmp, "raw", file.info(tmp)$size)
  path_enc  <- utils::URLencode(path_firebase, reserved = TRUE)
  url <- sprintf(
    "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?uploadType=media&key=%s",
    FIREBASE_BUCKET, path_enc, FIREBASE_API_KEY
  )
  resp <- httr::POST(
    url,
    httr::add_headers("Content-Type" = "text/csv; charset=utf-8"),
    body = contenido
  )
  codigo <- httr::status_code(resp)
  if (codigo != 200) {
    msg <- tryCatch(httr::content(resp, "text", encoding = "UTF-8"), error = function(e) "")
    stop("Error HTTP ", codigo, " subiendo '", path_firebase, "': ", msg)
  }
  invisible(resp)
}

subir_json_firebase <- function(objeto_r, path_firebase) {
  if (FIREBASE_API_KEY == "") {
    stop("FIREBASE_API_KEY no está definida.")
  }

  json_str  <- jsonlite::toJSON(objeto_r, auto_unbox = TRUE, null = "null", na = "null")
  contenido <- chartr("\n", " ", as.character(json_str))   # flat JSON, no newlines
  raw_body  <- chartr("", "", contenido)                   # keep as character for httr

  path_enc <- utils::URLencode(path_firebase, reserved = TRUE)
  url <- sprintf(
    "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?uploadType=media&key=%s",
    FIREBASE_BUCKET, path_enc, FIREBASE_API_KEY
  )
  resp <- httr::POST(
    url,
    httr::add_headers("Content-Type" = "application/json; charset=utf-8"),
    body = contenido,
    encode = "raw"
  )
  codigo <- httr::status_code(resp)
  if (codigo != 200) {
    msg <- tryCatch(httr::content(resp, "text", encoding = "UTF-8"), error = function(e) "")
    stop("Error HTTP ", codigo, " subiendo '", path_firebase, "': ", msg)
  }
  invisible(resp)
}

# ============================================================
# DETECCIÓN DE FECHAS
# ============================================================

if (!dir.exists(DIR_SEMANAL)) {
  stop("No se encontró el directorio '", DIR_SEMANAL, "'.\n",
       "Asegúrate de ejecutar este script desde el directorio raíz del proyecto.")
}

archivos_origen <- list.files(DIR_SEMANAL,
                               pattern = "derfe_pdln_\\d{8}_origen\\.csv$",
                               full.names = FALSE)
if (length(archivos_origen) == 0) {
  stop("No se encontraron archivos en '", DIR_SEMANAL, "'.")
}

fechas <- sort(as.Date(
  sub("derfe_pdln_(\\d{8})_origen\\.csv", "\\1", archivos_origen),
  format = "%Y%m%d"
))
fechas <- fechas[!is.na(fechas)]
message("→ Fechas detectadas: ", length(fechas),
        " (", format(min(fechas), "%Y-%m-%d"),
        " — ", format(max(fechas), "%Y-%m-%d"), ")")

dir.create(DIR_SERIES, showWarnings = FALSE, recursive = TRUE)

tipos   <- c("edad", "sexo", "origen")
ambitos <- c("nacional", "extranjero")

construir_fila_nac <- list(
  edad   = construir_fila_serie_edad,
  sexo   = construir_fila_serie_sexo,
  origen = construir_fila_serie_origen
)

construir_fila_ent <- list(
  edad   = construir_fila_entidad_edad,
  sexo   = construir_fila_entidad_sexo,
  origen = construir_fila_entidad_origen
)

cols_id <- c("cve_entidad","nombre_entidad","cve_distrito","cabecera_distrital",
             "cve_municipio","nombre_municipio","seccion")

# ============================================================
# PASO 1: SERIES NACIONALES / EXTRANJERO (6 CSVs)
# ============================================================

message("\n══ PASO 1 — Series nacionales/extranjero (6 CSVs) ══════════════")

for (tipo in tipos) {
  for (ambito in ambitos) {
    message("\n── ", toupper(tipo), " / ", toupper(ambito), " ──────────────────────────")
    filas  <- list()
    n_ok   <- 0L
    n_err  <- 0L

    for (fecha in fechas) {
      fecha_d  <- as.Date(fecha, origin = "1970-01-01")
      ruta_csv <- file.path(DIR_SEMANAL,
                            sprintf("derfe_pdln_%s_%s.csv", format(fecha_d, "%Y%m%d"), tipo))
      if (!file.exists(ruta_csv)) {
        message("  ⚠  No encontrado: ", basename(ruta_csv))
        n_err <- n_err + 1L
        next
      }

      raw <- tryCatch(
        as.data.frame(fread(ruta_csv, encoding = "UTF-8", stringsAsFactors = FALSE,
              na.strings = c("", "NA"), strip.white = TRUE,
              showProgress = FALSE, blank.lines.skip = TRUE)),
        error = function(e) { message("  ✗ Error leyendo: ", basename(ruta_csv)); NULL }
      )
      if (is.null(raw) || nrow(raw) == 0) { n_err <- n_err + 1L; next }

      raw     <- normalizar_columnas(raw)
      fila_ag <- extraer_fila_agregada(raw, ambito)
      rm(raw); gc()

      if (is.null(fila_ag)) {
        message("  ⚠  Sin filas para ámbito '", ambito, "' en ", format(fecha_d, "%Y-%m-%d"))
        n_err <- n_err + 1L
        next
      }

      fila <- construir_fila_nac[[tipo]](fila_ag, fecha_d, ambito)
      rm(fila_ag)
      if (!is.null(fila)) { filas[[length(filas) + 1]] <- fila; n_ok <- n_ok + 1L
      } else { n_err <- n_err + 1L }
    }

    if (length(filas) == 0) {
      message("  ✗ Sin datos válidos para esta combinación. Se omite.")
      next
    }

    serie <- if (tipo == "origen") {
      tryCatch(dplyr::bind_rows(filas), error = function(e) do.call(rbind, filas))
    } else {
      do.call(rbind, filas)
    }
    if (tipo == "origen") serie[is.na(serie)] <- 0
    serie <- serie[order(serie$fecha), ]
    rownames(serie) <- NULL

    message("  ✓ Serie construida: ", nrow(serie), " semanas (OK=", n_ok, " ERR=", n_err, ")")

    ruta_local <- file.path(DIR_SERIES, sprintf("serie_%s_%s.csv", ambito, tipo))
    fwrite(serie, ruta_local)
    message("  💾 Guardado localmente: ", ruta_local)

    path_firebase <- sprintf("sefix/pdln/semanal_series/serie_%s_%s.csv", ambito, tipo)
    tryCatch({
      subir_serie_firebase(serie, path_firebase)
      message("  ☁ Subido a Firebase: ", path_firebase)
    }, error = function(e) {
      message("  ✗ Error subiendo a Firebase: ", e$message)
      message("     Archivo guardado localmente en: ", ruta_local)
    })
  }
}

# ============================================================
# PASO 2: SERIES POR ENTIDAD (3 JSONs)
# Estructura: { ENTIDAD: { nacional: [...], extranjero: [...] } }
# Mirrors buildAndUploadEntitySeries() de pregenerate-semanal.ts
# ============================================================

message("\n══ PASO 2 — Series por entidad (3 JSONs) ═══════════════════════")

for (tipo in tipos) {
  message("\n── ENTIDADES / ", toupper(tipo), " ─────────────────────────────────────")

  # entity_series[["JALISCO"]][["nacional"]] = list of rows (data.frames)
  entity_series <- list()
  n_fechas_ok <- 0L

  for (fecha in fechas) {
    fecha_d  <- as.Date(fecha, origin = "1970-01-01")
    ruta_csv <- file.path(DIR_SEMANAL,
                          sprintf("derfe_pdln_%s_%s.csv", format(fecha_d, "%Y%m%d"), tipo))
    if (!file.exists(ruta_csv)) next

    raw <- tryCatch(
      as.data.frame(fread(ruta_csv, encoding = "UTF-8", stringsAsFactors = FALSE,
            na.strings = c("", "NA"), strip.white = TRUE,
            showProgress = FALSE, blank.lines.skip = TRUE)),
      error = function(e) NULL
    )
    if (is.null(raw) || nrow(raw) == 0) next
    raw <- normalizar_columnas(raw)

    if (!"nombre_entidad" %in% colnames(raw)) { rm(raw); gc(); next }

    # Get unique normalized entity names in this file
    nombres_raw    <- unique(trimws(raw$nombre_entidad))
    nombres_validos <- nombres_raw[!is.na(nombres_raw) & nombres_raw != "NA" & nombres_raw != ""]
    nombres_norm   <- unique(vapply(nombres_validos, normalizar_nombre_entidad, character(1)))
    # Exclude the pseudo-entities
    nombres_norm <- nombres_norm[!nombres_norm %in% c("SECCIONES_NAC", "RESIDENTES EXTRANJERO")]

    mask_ext <- es_fila_extranjero(raw)

    for (nombre_norm in nombres_norm) {
      if (!nombre_norm %in% names(entity_series)) {
        entity_series[[nombre_norm]] <- list(nacional = list(), extranjero = list())
      }

      for (ambito in ambitos) {
        if (ambito == "extranjero") {
          filas_amb <- raw[mask_ext, , drop = FALSE]
        } else {
          filas_amb <- raw[!mask_ext & !is.na(raw$cve_entidad), , drop = FALSE]
        }

        if (nrow(filas_amb) == 0) next

        # Filter to this entity
        nombre_matches <- vapply(
          trimws(filas_amb$nombre_entidad),
          normalizar_nombre_entidad, character(1)
        ) == nombre_norm
        filas_ent <- filas_amb[nombre_matches, , drop = FALSE]
        if (nrow(filas_ent) == 0) next

        # Sum numeric columns
        cols_num <- setdiff(colnames(filas_ent), cols_id)
        cols_num <- cols_num[sapply(filas_ent[, cols_num, drop = FALSE], function(x)
          is.numeric(x) || suppressWarnings(!any(is.na(as.numeric(x)))))]

        fila_ag <- as.data.frame(
          lapply(filas_ent[, cols_num, drop = FALSE],
                 function(x) sum(as.numeric(x), na.rm = TRUE)),
          stringsAsFactors = FALSE
        )

        fila <- construir_fila_ent[[tipo]](fila_ag, fecha_d)
        if (!is.null(fila)) {
          entity_series[[nombre_norm]][[ambito]] <-
            c(entity_series[[nombre_norm]][[ambito]], list(fila))
        }
      }
    }

    rm(raw); gc()
    n_fechas_ok <- n_fechas_ok + 1L
    if (n_fechas_ok %% 10 == 0) message("  … ", n_fechas_ok, " fechas procesadas")
  }

  message("  ✓ Fechas procesadas: ", n_fechas_ok, " | Entidades: ", length(entity_series))

  # Consolidate: list of data.frames → data.frame per entity+ambito → list of rows (for JSON)
  entity_json <- lapply(entity_series, function(ent) {
    lapply(ent, function(filas) {
      if (length(filas) == 0) return(list())
      df <- tryCatch(
        { d <- dplyr::bind_rows(filas); d[order(d$fecha), ]; rownames(d) <- NULL; d },
        error = function(e) {
          d <- do.call(rbind, filas)
          d <- d[order(d$fecha), ]
          rownames(d) <- NULL
          d
        }
      )
      # Convert each row to a named list (for JSON object structure)
      lapply(seq_len(nrow(df)), function(i) as.list(df[i, ]))
    })
  })

  # Save local JSON copy
  dir.create("data/series", showWarnings = FALSE, recursive = TRUE)
  ruta_local <- file.path("data/series", sprintf("serie_entidades_%s.json", tipo))
  jsonlite::write_json(entity_json, ruta_local, auto_unbox = TRUE, null = "null", na = "null")
  size_kb <- round(file.info(ruta_local)$size / 1024)
  message("  💾 Guardado localmente: ", ruta_local, " (", size_kb, " KB)")

  path_firebase <- sprintf("sefix/pdln/semanal_agg/serie_entidades_%s.json", tipo)
  tryCatch({
    subir_json_firebase(entity_json, path_firebase)
    message("  ☁ Subido a Firebase: ", path_firebase)
  }, error = function(e) {
    message("  ✗ Error subiendo a Firebase: ", e$message)
    message("     Archivo guardado localmente en: ", ruta_local)
  })
}

message("\n✓ Pre-agregación completada.")
message("  Verifica los archivos en Firebase Console:")
message("  Bucket → sefix/pdln/semanal_series/  (6 CSVs)")
message("  Bucket → sefix/pdln/semanal_agg/     (3 JSONs de series por entidad)")
