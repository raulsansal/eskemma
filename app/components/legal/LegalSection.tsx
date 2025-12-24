// app/components/legal/LegalSection.tsx
import { ReactNode } from "react";

/**
 * Interfaz para las props del componente LegalSection
 */
interface LegalSectionProps {
  id: string; // ID único para la sección (para navegación con TableOfContents)
  title: string; // Título de la sección
  icon?: string; // Emoji o icono opcional (ej: "🍪", "📊")
  level?: 1 | 2; // Nivel de anidación (1 = principal, 2 = subsección)
  children: ReactNode; // Contenido de la sección
  className?: string; // Clases adicionales de Tailwind
}

/**
 * Componente para secciones legales reutilizables
 * Se usa en páginas como Política de Privacidad, Condiciones de Uso, etc.
 * 
 * CARACTERÍSTICAS:
 * - 2 niveles de anidación (principal y subsección)
 * - Soporte para iconos/emojis
 * - Scroll offset para navegación con TableOfContents
 * - Totalmente responsive
 * 
 * ACCESIBILIDAD:
 * - Jerarquía de headings correcta (h2/h3 según nivel)
 * - IDs únicos para navegación
 * - Iconos decorativos con aria-hidden
 * - Semántica con <section>
 * 
 * MOBILE:
 * - Títulos responsive
 * - Margins responsive
 * - Padding responsive (nivel 2)
 * - Texto responsive
 * - Border responsive (nivel 2)
 */
export default function LegalSection({
  id,
  title,
  icon,
  level = 1,
  children,
  className = "",
}: LegalSectionProps) {
  // Estilos según el nivel - RESPONSIVE
  const titleStyles = {
    1: "text-2xl md:text-3xl max-sm:text-xl font-bold text-bluegreen-eske mb-4 max-sm:mb-3",
    2: "text-xl md:text-2xl max-sm:text-lg font-bold text-bluegreen-eske-70 mb-3 max-sm:mb-2",
  };

  const containerStyles = {
    1: "mb-12 max-sm:mb-8 scroll-mt-24",
    2: "mb-8 max-sm:mb-6 pl-4 max-sm:pl-3 border-l-4 max-sm:border-l-3 border-bluegreen-eske-20 scroll-mt-24",
  };

  // Usar el heading correcto según el nivel jerárquico
  const HeadingTag = level === 1 ? "h2" : "h3";

  return (
    <section
      id={id}
      className={`${containerStyles[level]} ${className}`}
    >
      {/* Título de la sección con heading jerárquico correcto */}
      <HeadingTag className={titleStyles[level]}>
        {icon && (
          <span 
            className="mr-2 max-sm:mr-1.5 text-2xl max-sm:text-xl" 
            role="img" 
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        {title}
      </HeadingTag>

      {/* Contenido de la sección - RESPONSIVE */}
      <div className="text-[15px] max-sm:text-[14px] text-black-eske leading-relaxed space-y-4 max-sm:space-y-3">
        {children}
      </div>
    </section>
  );
}

