// app/components/componentsBlog/SanitizedContent.tsx
"use client";

import { useEffect, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { remark } from "remark";
import remarkHtml from "remark-html";

interface SanitizedContentProps {
  content: string;
  className?: string;
}

export default function SanitizedContent({
  content,
  className,
}: SanitizedContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Contenido Markdown original:", content);

    // Limpiar el contenido Markdown
    const cleanContent = content
      .replace(/&nbsp;/g, " ")
      .replace(/\u00A0/g, " ");

    console.log("Contenido Markdown limpio:", cleanContent);

    // Convertir Markdown a HTML
    remark()
      .use(remarkHtml, {
        sanitize: false,
        allowDangerousHtml: true,
      })
      .process(cleanContent)
      .then((processedContent) => {
        let htmlContent = processedContent.toString();
        console.log("HTML generado por remark:", htmlContent);

        // ✅ NUEVO: Agregar IDs a los encabezados
        htmlContent = addIdsToHeadings(htmlContent);

        // Configuración de DOMPurify
        const sanitized = DOMPurify.sanitize(htmlContent, {
          ALLOWED_TAGS: [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "p",
            "br",
            "strong",
            "em",
            "b",
            "i",
            "u",
            "strike",
            "del",
            "ul",
            "ol",
            "li",
            "a",
            "img",
            "blockquote",
            "code",
            "pre",
            "table",
            "thead",
            "tbody",
            "tr",
            "td",
            "th",
            "div",
            "span",
          ],
          ALLOWED_ATTR: [
            "href",
            "src",
            "alt",
            "title",
            "target",
            "rel",
            "class",
            "id",
          ], // ✅ Agregado 'id'
          KEEP_CONTENT: true,
          ALLOW_DATA_ATTR: false,
        });

        console.log("HTML sanitizado final:", sanitized);
        setSanitizedContent(sanitized);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error al procesar el contenido:", error);
        setIsLoading(false);
      });
  }, [content]);

  if (isLoading) {
    return (
      <div
        className="animate-pulse"
        role="status"
        aria-live="polite"
        aria-label="Cargando contenido del artículo"
      >
        <span className="sr-only">Cargando contenido...</span>
        <div className="h-4 bg-gray-eske-20 dark:bg-[#21425E] rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-eske-20 dark:bg-[#21425E] rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-eske-20 dark:bg-[#21425E] rounded w-4/6"></div>
      </div>
    );
  }

  return (
    <article
      className={`markdown-content ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      role="article"
      aria-label="Contenido del artículo"
    />
  );
}

/**
 * ✅ NUEVA FUNCIÓN: Agrega IDs a los encabezados HTML
 */
function addIdsToHeadings(html: string): string {
  // Regex para encontrar encabezados H1-H6
  const headingRegex = /<(h[1-6])>(.*?)<\/\1>/gi;

  return html.replace(headingRegex, (match, tag, content) => {
    // Extraer el texto limpio del encabezado
    const textContent = content.replace(/<[^>]*>/g, "").trim();

    // Generar ID igual que en extractHeadings() de lib/posts.ts
    const id = textContent
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñ\s-]/g, "")
      .replace(/\s+/g, "-");

    // Retornar el encabezado con el atributo id
    return `<${tag} id="${id}">${content}</${tag}>`;
  });
}
