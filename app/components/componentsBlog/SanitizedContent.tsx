// components/SanitizedContent.tsx
'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface SanitizedContentProps {
  content: string;
  className?: string;
}

export default function SanitizedContent({ content, className }: SanitizedContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sanitizar el contenido en el cliente
    const sanitized = DOMPurify.sanitize(content);
    setSanitizedContent(sanitized);
    setIsLoading(false);
  }, [content]);

  if (isLoading) {
    return <div>Cargando contenido...</div>;
  }

  return (
    <article 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
}