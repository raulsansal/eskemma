# Módulo: Blog — El Baúl de Fouché | Eskemma
## Documentación para INDAUTOR

**Autor:** Raúl Sánchez Salgado  
**Fecha:** 2026-04-10  
**Estado:** Activo en producción

---

## Descripción

"El Baúl de Fouché" es el espacio editorial de Eskemma. Raúl Sánchez Salgado
nombró el blog como referencia a Joseph Fouché, ministro de policía y estratega
político del período napoleónico — en línea con el enfoque de inteligencia política
de la plataforma.

El blog publica contenido sobre política, estrategia, análisis político y gestión
de campañas en México. Raúl es el editor y autor principal.

---

## Ruta

`/blog` (Next.js App Router)

---

## Decisiones de Diseño (Raúl Sánchez Salgado)

1. **Nombre editorial** — "El Baúl de Fouché" como marca diferenciada
2. **Tipografía Philosopher** — Raúl eligió esta tipografía específicamente para
   el blog, diferenciándolo visualmente del resto de la plataforma
3. **Sistema de comentarios** — interacción con lectores
4. **Suscripciones** — newsletter para lectores recurrentes

---

## Colecciones Firestore

| Colección | Propósito |
|-----------|-----------|
| `posts` | Artículos del blog |
| `posts/{id}/comments` | Comentarios por artículo |
| `newsletter_subscribers` | Suscriptores al newsletter |

---

## Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `app/blog/` | Páginas del blog |
| `app/api/blog/` | API routes (posts, comentarios) |

---

## Estado

| Feature | Estado |
|---------|--------|
| Publicación de artículos | ✅ Activo |
| Sistema de comentarios | ✅ Activo |
| Newsletter (Resend) | ✅ Activo |
| Buscador de contenido | ⏳ Pendiente |

---

*Documento bajo supervisión de Raúl Sánchez Salgado — 2026-04-10*
