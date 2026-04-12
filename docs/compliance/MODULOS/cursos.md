# Módulo: Cursos | Eskemma
## Documentación para INDAUTOR

**Autor:** Raúl Sánchez Salgado  
**Fecha:** 2026-04-10  
**Estado:** Activo en producción

---

## Descripción

El módulo de Cursos ofrece talleres interactivos sobre consultoría política,
gestión de campañas y metodologías de análisis. Raúl Sánchez Salgado diseñó la
estructura de cursos como talleres modulares con seguimiento de progreso por usuario.

---

## Ruta

`/cursos` (Next.js App Router)

---

## Arquitectura

- **Contenido:** Talleres modulares con unidades y lecciones
- **Progreso:** Almacenado por usuario en Firestore (`users` colección, subcolección de progreso)
- **Acceso:** Plan Basic o superior

---

## Colecciones Firestore

| Colección | Propósito |
|-----------|-----------|
| `users` → progreso | Progreso de cada usuario por taller |

---

## Decisiones de Diseño (Raúl Sánchez Salgado)

1. **Estructura modular** — cada taller se divide en unidades independientes
2. **Progreso persistente** — el usuario puede retomar donde dejó
3. **Acceso por plan** — disponible en Basic, Premium y Professional

---

## Estado

| Feature | Estado |
|---------|--------|
| Talleres y cursos | ✅ Activo |
| Seguimiento de progreso | ✅ Activo |
| Certificados | ⏳ Pendiente |

---

*Documento bajo supervisión de Raúl Sánchez Salgado — 2026-04-10*
