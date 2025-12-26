// app/blog/FoucheHeroSection.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import FoucheModal from "./FoucheModal";

export default function FoucheHeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section
        className="relative min-h-[250px] sm:h-[200px] md:h-[200px] w-full flex items-center bg-bluegreen-eske overflow-hidden"
        aria-labelledby="hero-title"
      >
        {/* Imagen de Fondo */}
        <Image
          src="/images/yanmin_yang.jpg"
          alt="imagen de fondo"
          fill
          style={{ objectFit: "cover" }}
          className="absolute inset-0 z-0"
          priority
          aria-hidden="true"
        />

        {/* Overlay con opacidad */}
        <div
          className="absolute inset-0 bg-bluegreen-eske opacity-75 z-10"
          aria-hidden="true"
        ></div>
        <div className="relative z-20 w-full max-w-screen-xl mx-auto flex flex-col md:flex-row items-center md:h-full py-6 md:py-0">
          {/* Imagen de Fouché - CLICKEABLE en mobile y desktop */}
          <button
            className="w-full md:w-1/2 relative h-[120px] md:h-full cursor-pointer focus-ring-primary rounded-lg md:rounded-none max-md:mb-4 group"
            onClick={() => setIsModalOpen(true)}
            aria-label="Conocer más sobre Joseph Fouché y el origen del nombre del blog"
          >
            {/* Imagen de Fouché */}
            <Image
              src="/images/fouche.jpg"
              alt="imagen de Joseph Fouché"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
              priority
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-bluegreen-eske/40 to-transparent rounded-lg md:rounded-none pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white-eske/25 backdrop-blur-md border border-white-eske/50 text-white-eske text-xs font-medium rounded-full shadow-lg transition-all duration-300 ease-out opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none"
              aria-hidden="true"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>¿Quién fue Fouché?</span>
            </div>
          </button>

          {/* Contenido del Hero */}
          <div className="w-full md:w-1/2 px-4 sm:px-6 md:px-8 flex flex-col justify-center text-center md:text-left">
            <h1
              id="hero-title"
              className="text-2xl sm:text-[26px] md:text-[32px] leading-tight font-bold text-white-eske"
            >
              El Baúl de Fouché
            </h1>
            <p className="mt-2 text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-light text-white-eske">
              Los secretos del poder contemporáneo
            </p>
          </div>
        </div>
      </section>

      {/* Modal de Fouché */}
      <FoucheModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
