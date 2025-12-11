// app/components/legal/LegalSection.tsx
"use client";

interface LegalSectionProps {
  id: string;                    // Ej: "que-datos-recopilamos" (para anclas)
  title: string;                 // Ej: "2. ¿Qué Datos Recopilamos?"
  children: React.ReactNode;     // Contenido de la sección
  level?: 1 | 2 | 3;            // H2, H3, H4 (default: 1 = H2)
  className?: string;            // Clases adicionales opcionales
}

export default function LegalSection({ 
  id, 
  title, 
  children, 
  level = 1,
  className = "" 
}: LegalSectionProps) {
  
  // Estilos según el nivel de encabezado
  const headingStyles = {
    1: "text-3xl max-sm:text-2xl font-bold text-black-eske mb-4",       // H2
    2: "text-2xl max-sm:text-xl font-semibold text-black-eske-20 mb-3", // H3
    3: "text-xl max-sm:text-lg font-medium text-black-eske-30 mb-2",    // H4
  };

  // Componente de encabezado dinámico
  const HeadingTag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';

  return (
    <section 
      id={id} 
      className={`scroll-mt-20 mb-8 ${className}`}
      // scroll-mt-20: Margen superior al hacer scroll para compensar header fixed
    >
      <HeadingTag className={headingStyles[level]}>
        {title}
      </HeadingTag>
      
      {/* Contenido de la sección */}
      <div className="text-[16px] max-sm:text-[14px] text-black-eske-10 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}