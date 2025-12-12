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
 */
export default function LegalSection({
  id,
  title,
  icon,
  level = 1,
  children,
  className = "",
}: LegalSectionProps) {
  // Estilos según el nivel
  const titleStyles = {
    1: "text-2xl md:text-3xl font-bold text-bluegreen-eske mb-4",
    2: "text-xl md:text-2xl font-bold text-bluegreen-eske-70 mb-3",
  };

  const containerStyles = {
    1: "mb-12 scroll-mt-24",
    2: "mb-8 pl-4 border-l-4 border-bluegreen-eske-20 scroll-mt-24",
  };

  return (
    <section
      id={id}
      className={`${containerStyles[level]} ${className}`}
    >
      {/* Título de la sección */}
      <h2 className={titleStyles[level]}>
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h2>

      {/* Contenido de la sección */}
      <div className="text-[15px] text-black-eske leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}