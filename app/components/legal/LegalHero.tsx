// app/components/legal/LegalHero.tsx
import Image from "next/image";

interface LegalHeroProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
}

export default function LegalHero({ title, subtitle, lastUpdated }: LegalHeroProps) {
  return (
    <section className="relative min-h-[200px] w-full flex items-center justify-center bg-bluegreen-eske overflow-hidden">
      {/* Imagen de fondo */}
      <Image
        src="/images/yanmin_yang.jpg"
        alt="Hero Background"
        fill
        style={{ objectFit: "cover" }}
        className="object-cover"
        priority
      />

      {/* Overlay con transparencia azul */}
      <div className="absolute inset-0 bg-bluegreen-eske opacity-75"></div>

      {/* Contenido del Hero */}
      <div className="relative z-10 text-center text-white-eske px-4 sm:px-6 md:px-8 max-w-screen-xl mx-auto w-full">
        <h1 className="text-[36px] max-sm:text-2xl leading-tight font-bold">
          {title}
        </h1>
        <p className="mt-4 max-sm:mt-2 text-[18px] max-sm:text-base leading-relaxed font-light">
          {subtitle}
        </p>
        {lastUpdated && (
          <p className="mt-2 text-[14px] max-sm:text-[12px] font-light opacity-90">
            Última actualización: {lastUpdated}
          </p>
        )}
      </div>
    </section>
  );
}