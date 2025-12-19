// app/blog/FoucheModal.tsx
"use client";
import Image from "next/image";
import { useEffect } from "react";

export default function FoucheModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Manejar cierre con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll del body cuando modal está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fouche-modal-title"
    >
      <div
        className="bg-white-eske rounded-lg shadow-lg w-full max-w-2xl p-8 relative overflow-y-auto max-h-[85vh] m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-black-eske hover:text-red-eske transition-colors duration-300 focus-ring-primary rounded"
          onClick={onClose}
          aria-label="Cerrar modal de información sobre Joseph Fouché"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 
          id="fouche-modal-title"
          className="text-2xl font-bold text-bluegreen-eske mb-6 text-center"
        >
          ¿Quién fue Joseph Fouché?
        </h2>

        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-64">
            <Image
              src="/images/fouche.jpg"
              alt="Retrato de Joseph Fouché, político francés del siglo XVIII"
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
            el jacobinismo radical hasta el Imperio de Napoleón, y luego en la
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

          <div 
            className="bg-gray-eske-20 border-l-4 border-bluegreen-eske p-4 rounded"
            role="note"
            aria-label="Información sobre el nombre del blog"
          >
            <h3 className="text-lg font-semibold text-bluegreen-eske mb-2">
              ¿Por qué "El Baúl de Fouché"?
            </h3>
            <p className="text-[15px] text-gray-eske-90">
              Nuestro blog toma su nombre del legendario{" "}
              <strong>"Joseph Fouché"</strong>, una metáfora de los archivos
              secretos que este político mantenía sobre sus aliados y enemigos.
              Al igual que Fouché recopilaba información valiosa sobre la
              política de su tiempo, este espacio busca analizar, documentar y
              compartir conocimientos sobre estrategias políticas, gerencia electoral y los fenómenos
              sociales que moldean el espacio político contemporáneo.
            </p>
          </div>

          <blockquote className="text-[14px] italic text-center text-bluegreen-eske-60 mt-6">
            "Un hombre que no sabe nada puede ser útil, pero un hombre que lo
            sabe todo es peligroso." — Joseph Fouché
          </blockquote>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-bluegreen-eske text-white-eske px-8 py-3 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 focus-ring-primary"
            aria-label="Cerrar información sobre Joseph Fouché"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}