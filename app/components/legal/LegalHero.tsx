// app/components/legal/LegalHero.tsx
import Image from "next/image";

interface LegalHeroProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
}

/**
 * Hero Section para páginas legales
 * Usado en: Política de Privacidad, Condiciones de Uso, Política de Cookies, etc.
 * 
 * CARACTERÍSTICAS:
 * - Imagen de fondo con overlay
 * - Título, subtítulo y fecha de actualización
 * - Totalmente responsive
 * 
 * ACCESIBILIDAD:
 * - Estructura semántica con <section>
 * - Imagen decorativa con aria-hidden
 * - Jerarquía de headings correcta (h1)
 * 
 * MOBILE:
 * - Height responsive (200px → 160px mobile)
 * - Padding responsive
 * - Textos responsive
 * - Overlay optimizado para contraste
 */
export default function LegalHero({ title, subtitle, lastUpdated }: LegalHeroProps) {
  return (
    <section
      className="relative min-h-[200px] max-sm:min-h-[160px] w-full flex items-center justify-center bg-bluegreen-eske overflow-hidden"
      aria-labelledby="legal-hero-title"
    >
      {/* Imagen de fondo decorativa */}
      <Image
        src="/images/yanmin_yang.jpg"
        alt=""
        fill
        style={{ objectFit: "cover" }}
        className="object-cover"
        priority
        aria-hidden="true"
      />

      {/* Overlay con transparencia azul mejorada para contraste */}
      <div className="absolute inset-0 bg-bluegreen-eske dark:bg-bluegreen-eske-80 opacity-85" aria-hidden="true"></div>

      {/* Contenido del Hero */}
      <div className="relative z-10 text-center text-white-eske px-4 sm:px-6 md:px-8 max-w-screen-xl mx-auto w-full py-8 max-sm:py-6">
        <h1
          id="legal-hero-title"
          className="text-[36px] max-sm:text-2xl leading-tight font-bold"
        >
          {title}
        </h1>
        <p className="mt-4 max-sm:mt-2 text-[18px] max-sm:text-base leading-relaxed font-light">
          {subtitle}
        </p>
        {lastUpdated && (
          <p className="mt-2 max-sm:mt-1.5 text-[14px] max-sm:text-[12px] font-light opacity-90">
            Última actualización: <time>{lastUpdated}</time>
          </p>
        )}
      </div>
    </section>
  );
}

