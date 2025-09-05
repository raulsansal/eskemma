//app/components/componentsBlog/SanitizedContent.tsx

'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

interface SanitizedContentProps {
  content: string;
  className?: string;
}

export default function SanitizedContent({ content, className }: SanitizedContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Contenido Markdown original:', content); // Debug

    // Limpiar el contenido Markdown (remover &nbsp; problemáticos)
    const cleanContent = content
      .replace(/&nbsp;/g, ' ') // Convertir &nbsp; a espacios normales
      .replace(/\u00A0/g, ' '); // Convertir espacios no rompibles Unicode

    console.log('Contenido Markdown limpio:', cleanContent); // Debug

    // Convertir Markdown a HTML
    remark()
      .use(remarkHtml, { 
        sanitize: false,
        allowDangerousHtml: true // Permitir HTML en Markdown si es necesario
      })
      .process(cleanContent)
      .then((processedContent) => {
        const htmlContent = processedContent.toString();
        console.log('HTML generado por remark:', htmlContent); // Debug
        
        // Configuración más permisiva de DOMPurify
        const sanitized = DOMPurify.sanitize(htmlContent, {
          ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'strike', 'del',
            'ul', 'ol', 'li', // Elementos de lista
            'a', 'img', 'blockquote', 'code', 'pre',
            'table', 'thead', 'tbody', 'tr', 'td', 'th',
            'div', 'span' // Elementos contenedores
          ],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'],
          KEEP_CONTENT: true,
          ALLOW_DATA_ATTR: false
        });
        
        console.log('HTML sanitizado final:', sanitized); // Debug
        setSanitizedContent(sanitized);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error al procesar el contenido:', error);
        setIsLoading(false);
      });
  }, [content]);

  if (isLoading) {
    return <div className="animate-pulse">Cargando contenido...</div>;
  }

  return (
    <article
      className={`markdown-content ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}