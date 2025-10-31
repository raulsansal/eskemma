// app/blog/FoucheModalClient.tsx
"use client";
import { useState } from "react";
import Image from "next/image";

// Componente del Modal
function FoucheModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-white-eske rounded-lg shadow-lg w-full max-w-2xl p-8 relative overflow-y-auto max-h-[85vh] m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-black-eske hover:text-red-eske transition-colors duration-300"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-bluegreen-eske mb-6 text-center">
          ¿Quién fue Joseph Fouché?
        </h2>

        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-64">
            <Image
              src="/images/fouche.jpg"
              alt="Joseph Fouché"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg shadow-md"
            />
          </div>
        </div>

        <div className="space-y-4 text-gray-eske-90 leading-relaxed">
          <p className="text-[16px]">
            <strong className="text-bluegreen-eske">Joseph Fouché</strong>{" "}
            (1759-1820) fue un político francés que desempeñó un papel crucial
            durante la Revolución Francesa y el Imperio Napoleónico. Conocido
            como el <em>"Ministro de la Policía"</em>, Fouché fue maestro en el
            arte de la intriga política y la supervivencia en tiempos
            turbulentos.
          </p>

          <p className="text-[16px]">
            Su capacidad para adaptarse a diferentes regímenes políticos —desde
            el jacobinismo radical hasta el Imperio de Napoleón, y luego la
            Restauración borbónica— lo convirtió en una figura fascinante y
            controvertida de la historia europea.
          </p>

          <p className="text-[16px]">
            Fouché era célebre por su vasta red de informantes y espías, que le
            permitía conocer los secretos más íntimos de sus contemporáneos. Se
            dice que guardaba archivos detallados sobre prácticamente todos los
            personajes importantes de su época, información que usaba
            estratégicamente para mantener su poder e influencia.
          </p>

          <div className="bg-gray-eske-20 border-l-4 border-bluegreen-eske p-4 rounded">
            <h3 className="text-lg font-semibold text-bluegreen-eske mb-2">
              ¿Por qué "El Baúl de Fouché"?
            </h3>
            <p className="text-[15px] text-gray-eske-90">
              Nuestro blog toma su nombre del legendario{" "}
              <strong>"baúl de Fouché"</strong>, una metáfora de los archivos
              secretos que este político mantenía sobre sus aliados y enemigos.
              Al igual que Fouché recopilaba información valiosa sobre la
              política de su tiempo, este espacio busca analizar, documentar y
              compartir conocimientos profundos sobre la política
              contemporánea, las estrategias electorales y los fenómenos
              sociales que moldean nuestro mundo.
            </p>
          </div>

          <p className="text-[14px] italic text-center text-bluegreen-eske-60 mt-6">
            "Un hombre que no sabe nada puede ser útil, pero un hombre que lo
            sabe todo es peligroso." — Joseph Fouché
          </p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-bluegreen-eske text-white-eske px-8 py-3 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Componente clickeable + modal
export default function FoucheImageWithModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* ✅ IMAGEN CLICKEABLE - EXACTAMENTE IGUAL QUE EN CONTACTO */}
      <div className="hidden md:block md:w-1/2 relative h-full">
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative w-full h-full cursor-pointer transition-transform duration-300 hover:scale-105 focus:outline-none"
          aria-label="Conocer más sobre Joseph Fouché"
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
          {/* Indicador visual de que es clickeable */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white-eske text-bluegreen-eske px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
              ℹ️ Click para conocer más
            </span>
          </div>
        </button>
      </div>

      {/* Modal */}
      <FoucheModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}