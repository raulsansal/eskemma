// app/components/componentsHome/FaqSection.tsx
import { useState } from "react";
import Link from "next/link";
import Button from "../Button";

const FaqSection = () => {
  // Estados para controlar qué dropdown está abierto
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  // Estados para controlar la visibilidad de los modales
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Función para alternar el estado del dropdown
  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Handler para teclado (Enter/Space)
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown(index);
    }
  };

  return (
    <section className="bg-gray-eske-10 py-16 px-4 sm:px-6 md:px-8">
      <div className="w-[90%] mx-auto max-w-screen-xl">
        {/* Título de la Sección */}
        <h2 className="text-3xl font-bold text-bluegreen-eske text-center mb-12">
          Preguntas frecuentes
        </h2>
        {/* Contenedor de las Tarjetas Dropdown */}
        <div className="space-y-6">
          {/* Dropdown 1 */}
          <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
            <button
              className="flex items-center justify-between w-full text-left focus-ring-primary rounded"
              onClick={() => toggleDropdown(1)}
              onKeyDown={(e) => handleKeyDown(1, e)}
              aria-expanded={openDropdown === 1}
              aria-controls="faq-answer-1"
              id="faq-question-1"
            >
              <span className="text-xl font-medium text-bluegreen-eske">
                ¿Qué es Eskemma?
              </span>
              <svg
                className={`w-6 h-6 text-bluegreen-eske transform transition-transform duration-300 ease-in-out ${
                  openDropdown === 1 ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {/* Respuesta del Dropdown */}
            {openDropdown === 1 && (
              <div 
                id="faq-answer-1"
                role="region"
                aria-labelledby="faq-question-1"
                className="mt-4 text-[16px] text-black-eske"
              >
                <p>
                  Eskemma es un ecosistema digital para el triunfo político. Te
                  invitamos a explorar los recursos gratuitos y de pago para tu
                  proyecto y que nos permiten acompañarte permanentemente hacia
                  el logro de tus objetivos políticos.
                </p>
              </div>
            )}
          </div>
          {/* Dropdown 2 */}
          <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
            <button
              className="flex items-center justify-between w-full text-left focus-ring-primary rounded"
              onClick={() => toggleDropdown(2)}
              onKeyDown={(e) => handleKeyDown(2, e)}
              aria-expanded={openDropdown === 2}
              aria-controls="faq-answer-2"
              id="faq-question-2"
            >
              <span className="text-xl font-medium text-bluegreen-eske">
                ¿Cómo puedo agendar una asesoría gratuita?
              </span>
              <svg
                className={`w-6 h-6 text-bluegreen-eske transform transition-transform duration-300 ease-in-out ${
                  openDropdown === 2 ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {/* Respuesta del Dropdown */}
            {openDropdown === 2 && (
              <div 
                id="faq-answer-2"
                role="region"
                aria-labelledby="faq-question-2"
                className="mt-4 text-[16px] text-black-eske"
              >
                <p>
                  Puedes agendar una asesoría gratuita haciendo clic en el botón
                  "AGENDAR ASESORÍA GRATUITA" en esta página.
                </p>
              </div>
            )}
          </div>
          {/* Dropdown 3 */}
          <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
            <button
              className="flex items-center justify-between w-full text-left focus-ring-primary rounded"
              onClick={() => toggleDropdown(3)}
              onKeyDown={(e) => handleKeyDown(3, e)}
              aria-expanded={openDropdown === 3}
              aria-controls="faq-answer-3"
              id="faq-question-3"
            >
              <span className="text-xl font-medium text-bluegreen-eske">
                ¿Qué diferencia a Eskemma de otros consultores políticos?
              </span>
              <svg
                className={`w-6 h-6 text-bluegreen-eske transform transition-transform duration-300 ease-in-out ${
                  openDropdown === 3 ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {/* Respuesta del Dropdown */}
            {openDropdown === 3 && (
              <div 
                id="faq-answer-3"
                role="region"
                aria-labelledby="faq-question-3"
                className="mt-4 text-[16px] text-black-eske"
              >
                <p>
                  Eskemma combina tecnología, análisis de datos y experiencia
                  política para ofrecer soluciones personalizadas y efectivas.
                </p>
              </div>
            )}
          </div>
          {/* Dropdown 4 */}
          <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
            <button
              className="flex items-center justify-between w-full text-left focus-ring-primary rounded"
              onClick={() => toggleDropdown(4)}
              onKeyDown={(e) => handleKeyDown(4, e)}
              aria-expanded={openDropdown === 4}
              aria-controls="faq-answer-4"
              id="faq-question-4"
            >
              <span className="text-xl font-medium text-bluegreen-eske">
                ¿Ofrecen servicios internacionales?
              </span>
              <svg
                className={`w-6 h-6 text-bluegreen-eske transform transition-transform duration-300 ease-in-out ${
                  openDropdown === 4 ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {/* Respuesta del Dropdown */}
            {openDropdown === 4 && (
              <div 
                id="faq-answer-4"
                role="region"
                aria-labelledby="faq-question-4"
                className="mt-4 text-[16px] text-black-eske"
              >
                <p>
                  Sí, Eskemma tiene experiencia trabajando en proyectos
                  políticos a nivel internacional. Contáctenos para más
                  detalles.
                </p>
              </div>
            )}
          </div>
          {/* Dropdown 5 */}
          <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
            <button
              className="flex items-center justify-between w-full text-left focus-ring-primary rounded"
              onClick={() => toggleDropdown(5)}
              onKeyDown={(e) => handleKeyDown(5, e)}
              aria-expanded={openDropdown === 5}
              aria-controls="faq-answer-5"
              id="faq-question-5"
            >
              <span className="text-xl font-medium text-bluegreen-eske">
                ¿Cuál es el costo de los servicios?
              </span>
              <svg
                className={`w-6 h-6 text-bluegreen-eske transform transition-transform duration-300 ease-in-out ${
                  openDropdown === 5 ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {/* Respuesta del Dropdown */}
            {openDropdown === 5 && (
              <div 
                id="faq-answer-5"
                role="region"
                aria-labelledby="faq-question-5"
                className="mt-4 text-[16px] text-black-eske"
              >
                <p>
                  Los costos varían dependiendo del alcance y la naturaleza del
                  proyecto. Ofrecemos planes personalizados para satisfacer tus
                  necesidades.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ver más FAQ */}
        <div className="text-center mt-8 max-w-[200px] mx-auto">
          <Link
            href="/faq"
            className="block text-center w-full py-2 rounded-lg font-medium transition-all duration-300 text-[14px] bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske-70 focus-ring-light"
          >
            VER MÁS FAQ
          </Link>
        </div>

        {/* Texto Adicional */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-2xl font-medium text-bluegreen-eske">
            ¡Conéctate con el éxito político!
          </p>
          <p className="text-[18px] font-medium text-black-eske">
            Queremos ser tus aliados para impulsar tu proyecto.
          </p>
        </div>
        {/* Botón CONTACTAR CON ESKEMMA */}
        <div className="text-center mt-8 max-w-[300px] mx-auto">
          <Link href="/contacto" passHref>
            <Button label="CONTACTAR CON ESKEMMA" variant="secondary" />
          </Link>
        </div>
      </div>
    </section>
  );
};
export default FaqSection;
