# Módulo: Centinela | Eskemma
## Documentación para INDAUTOR

**Autor:** Raúl Sánchez Salgado  
**Fecha:** 2026-04-10  
**Estado:** En desarrollo activo (E1-E5 completos)

---

## Descripción

Centinela es el módulo de inteligencia política en tiempo real de Eskemma.
Raúl Sánchez Salgado adaptó la metodología PEST-L al contexto político mexicano,
añadiendo la dimensión Legal con énfasis en LGIPE, INE y legislación electoral.

La IA analiza fuentes de datos mixtas (automáticas + manuales) y produce diagnósticos
estructurados con detección de sesgos. El analista humano supervisa y valida todos
los outputs (human-in-the-loop).

---

## Ruta

`/monitor/centinela` (Next.js App Router)

---

## Arquitectura de Etapas

Raúl diseñó el proceso de 8 etapas:

```
E1: Onboarding        → Tipo de proyecto, nombre, equipo, horizonte temporal
E2: Territorio        → Definición geográfica, electoral e institucional
E3: Variables         → Selección de variables PEST-L por tipo de proyecto
E4: Datos             → Carga mixta (automática + manual) con semáforo de cobertura
E5: Análisis IA       → 5 dimensiones paralelas + sesgos + cadenas de impacto
E6: Interpretación    → Matriz drag-drop, human-in-the-loop ⏳ Pendiente
E7: Informes          → 4 formatos de salida, scorecard ⏳ Pendiente
E8: Monitoreo         → Dashboard continuo + alertas ⏳ Pendiente
```

---

## Componentes Principales

| Archivo | Propósito |
|---------|-----------|
| `app/monitor/centinela/` | Hub y páginas del módulo |
| `app/monitor/centinela/nuevo/` | Wizard E1-E3 |
| `app/monitor/centinela/[projectId]/datos/` | E4 — semáforo + carga manual |
| `app/monitor/centinela/[projectId]/analisis/` | E5 — resultados PEST-L |
| `app/api/monitor/centinela/` | API routes del módulo |
| `functions/src/centinela/` | Cloud Functions (build separado) |
| `functions/src/centinela/scrapeAndAnalyze.ts` | HTTP CF principal |
| `functions/src/centinela/generateFeed.ts` | Orquestador PEST-L |
| `functions/src/centinela/classifier/claudePESTL.ts` | Clasificación con Claude |
| `functions/src/centinela/risk/vectorCalculator.ts` | Sesgos determinísticos |
| `functions/src/centinela/scrapers/` | Google News RSS, DOF, INEGI, Banxico |

---

## Decisiones Metodológicas No Negociables (Raúl Sánchez Salgado)

1. **Human-in-the-loop obligatorio.** Ningún output de IA es definitivo sin
   validación explícita del usuario.

2. **Detección de sesgos determinística.** Raúl rechazó el uso de Claude para
   detectar sesgos. Los 4 tipos de sesgo (urbano, etario digital, sobrerepresentación
   digital, contradicción datos/percepción) se detectan con reglas determinísticas.

3. **Variables por tipo de proyecto.** Cada tipo (electoral, gubernamental,
   legislativo, ciudadano) activa un conjunto distinto de variables PEST-L.

4. **Semáforo de cobertura bloqueador.** Un análisis no avanza si alguna dimensión
   PEST-L está en rojo.

5. **Modo mixto de datos.** Siempre combina fuentes automáticas con carga manual.

---

## Arquitectura de IA

**Modelo:** Claude Sonnet 4.6 (`claude-sonnet-4-6`)

**Llamadas paralelas (Raúl diseñó `Promise.allSettled`):**
- 5 llamadas por dimensión: Política, Económica, Social, Tecnológica, Legal
- 1 llamada adicional: cadenas de impacto entre dimensiones
- Tolerancia a fallos parciales: si una dimensión falla, las demás continúan

**Scrapers automáticos:**
- Google News RSS (política/economía)
- DOF (Diario Oficial de la Federación)
- INEGI (datos socioeconómicos)
- Banxico (datos económicos)

---

## Colecciones Firestore

| Colección | Propósito |
|-----------|-----------|
| `centinela_projects` | Proyectos V2 con tipo, nombre, horizonte, etapa |
| `centinela_variable_configs` | Config variables PEST-L por proyecto (E3) |
| `centinela_analyses` | Resultados PEST-L V2 (`PestlAnalysisV2`) |
| `centinela_data_sources` | Datos manuales cargados en E4 |
| `centinela_jobs` | Estado de jobs (pending/running/completed/failed) |
| `centinela_raw_articles` | Artículos crudos del scraper |
| `centinela_alerts` | Alertas por umbral de riesgo |

---

*Documento bajo supervisión de Raúl Sánchez Salgado — 2026-04-10*
