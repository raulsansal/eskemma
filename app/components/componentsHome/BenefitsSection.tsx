// components/Home/BenefitsSection.tsx

"use client";

import { useState, useEffect, useRef } from "react";

const BenefitsSection = () => {
  const [flippedCards, setFlippedCards] = useState<boolean[]>(
    Array(9).fill(false)
  );
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      front: "Respaldo profesional",
      back: "Recibe acompañamiento especializado en cada paso de tu proyecto. Asegura estrategias efectivas y resultados óptimos.",
      bg: "bg-blue-eske-60",
      text: "text-white-eske",
    },
    {
      front: "Impacto rápido",
      back: "Obtén resultados tangibles en poco tiempo gracias a herramientas y estrategias probadas para el éxito político.",
      bg: "bg-white-eske",
      text: "text-bluegreen-eske",
    },
    {
      front: "Valor garantizado",
      back: "Invierte en soluciones que maximizan tu presupuesto. Obtén un retorno favorable en términos de éxito y eficiencia.",
      bg: "bg-bluegreen-eske-60",
      text: "text-white-eske",
    },
    {
      front: "Adaptabilidad",
      back: "Eskemma ayuda en proyectos de cualquier tamaño, proporcionando herramientas y estrategias para cada necesidad.",
      bg: "bg-bluegreen-eske-60",
      text: "text-white-eske",
    },
    {
      front: "Ventajas competitivas",
      back: "Descubre y explota tus ventajas competitivas con metodologías que te diferencian en el campo político.",
      bg: "bg-white-eske",
      text: "text-bluegreen-eske",
    },
    {
      front: "Ahorra dinero",
      back: "Reduce costos en la contratación de personal o servicios. Nuestras herramientas te facilitan la obtención de información útil.",
      bg: "bg-blue-eske-60",
      text: "text-white-eske",
    },
    {
      front: "Integridad y excelencia",
      back: "Trabaja con un equipo comprometido con la transparencia, la calidad y la lealtad, que te asegura un servicio honesto y profesional.",
      bg: "bg-blue-eske-60",
      text: "text-white-eske",
    },
    {
      front: "Aplicación inmediata",
      back: "Implementa acciones estratégicas de inmediato, aprovechando oportunidades y resolviendo desafíos con agilidad.",
      bg: "bg-white-eske",
      text: "text-bluegreen-eske",
    },
    {
      front: "Disponibilidad",
      back: "Consulta con especialistas en cualquier momento. Recibe asesoría personalizada y soluciones adaptadas a tus necesidades.",
      bg: "bg-bluegreen-eske-60",
      text: "text-white-eske",
    },
  ];

  const toggleCard = (
    index: number,
    e: React.MouseEvent | React.KeyboardEvent
  ) => {
    e.stopPropagation();
    setFlippedCards((prev) => {
      const newState = prev.map((_, i) => (i === index ? !prev[i] : false));
      return newState;
    });
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCard(index, e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        cardsContainerRef.current &&
        !cardsContainerRef.current.contains(e.target as Node)
      ) {
        setFlippedCards(Array(9).fill(false));
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <section
      className="bg-bluegreen-eske min-h-[800px] max-sm:min-h-[500px] py-20 max-sm:py-12 px-4 sm:px-6 md:px-8"
      onClick={() => setFlippedCards(Array(9).fill(false))}
    >
      <h2 className="text-3xl max-sm:text-xl font-bold text-white-eske mb-20 max-sm:mb-8 text-center">
        ¿Qué obtienes con Eskemma?
      </h2>

      <div className="w-[90%] mx-auto max-w-screen-xl" ref={cardsContainerRef}>
        {/* Grid optimizado: 3 columnas en mobile, 2 en tablet, 3 en desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {cards.map((card, index) => (
            <button
              key={index}
              className="flip-card h-28 sm:h-48 w-full perspective-1000"
              onClick={(e) => toggleCard(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={`${card.front}. Presiona Enter para ver más detalles.`}
              aria-pressed={flippedCards[index]}
            >
              <div
                className={`flip-card-inner relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                  flippedCards[index] ? "rotate-y-180" : ""
                }`}
              >
                {/* Frente de la tarjeta */}
                <div
                  className={`flip-card-front absolute w-full h-full rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-center ${card.bg} ${card.text} backface-hidden`}
                  aria-hidden={flippedCards[index]}
                >
                  <p className="text-[20px] sm:text-[20px] max-sm:text-[12px] max-sm:leading-tight font-light text-center p-4 max-sm:p-2">
                    {card.front}
                  </p>
                </div>

                {/* Reverso de la tarjeta */}
                <div
                  className="flip-card-back absolute w-full h-full rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center justify-center bg-orange-eske text-white-eske backface-hidden rotate-y-180"
                  aria-hidden={!flippedCards[index]}
                >
                  <p className="text-[18px] sm:text-[18px] max-sm:text-[9px] max-sm:leading-tight font-light text-center p-4 max-sm:p-2">
                    {card.back}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .flip-card {
          cursor: pointer;
          border: none;
          background: transparent;
          padding: 0;
          outline: none;
        }
        /* Solo mostrar borde cuando se navega con teclado, NO con mouse */
        .flip-card:focus {
          outline: none;
        }
        .flip-card:focus-visible {
          outline: 2px solid white;
          outline-offset: 4px;
          border-radius: 0.5rem;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
};

export default BenefitsSection;
