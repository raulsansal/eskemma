// app/blog/FoucheHeroSection.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import FoucheModal from "./FoucheModal";  // ✅ CORREGIDO

export default function FoucheHeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative h-[250px] sm:h-[200px] md:h-[200px] w-full flex items-center bg-bluegreen-eske overflow-hidden">
        {/* Imagen de Fondo */}
        <Image
          src="/images/yanmin_yang.jpg"
          alt="Hero Background"
          fill
          style={{ objectFit: "cover" }}
          className="absolute inset-0 z-0"
          priority
        />

        {/* Overlay con opacidad */}
        <div className="absolute inset-0 bg-bluegreen-eske opacity-75 z-10"></div>

        {/* Contenedor Principal */}
        <div className="relative z-20 w-full max-w-screen-xl mx-auto flex items-center h-full">
          {/* Imagen de Fouché (Izquierda) - Solo en desktop - CLICKEABLE */}
          <div
            className="hidden md:block md:w-1/2 relative h-full cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Image
              src="/images/fouche.jpg"
              alt="Joseph Fouché - Click para conocer más"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
              priority
            />
          </div>

          {/* Contenido del Hero (Derecha en desktop, centrado en móvil) */}
          <div className="w-full md:w-1/2 px-4 sm:px-6 md:px-8 flex flex-col justify-center text-center md:text-left py-4">
            <h1 className="text-2xl sm:text-[26px] md:text-[32px] leading-tight font-bold text-white-eske">
              El Baúl de Fouché
            </h1>
            <p className="mt-2 text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-light text-white-eske">                            
              <span className="sm:hidden"> </span>Los secretos del poder contemporáneo
            </p>
          </div>
        </div>
      </section>

      {/* Modal de Fouché */}
      <FoucheModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}