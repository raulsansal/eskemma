"use client"; // Indica que este es un Client Component

// components/TeamModal.tsx
import { useState } from "react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  contact: string;
  image: string;
}

const TeamModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Raúl Sánchez Salgado",
      role: "Especialista en comunicación política",
      bio: "Raúl es el fundador de Eskemma y tiene más de 20 años de experiencia en el sector público, legislativo y electoral. Politólogo, con especialidad en Opinión Pública, Comunicación Política y Marketing Electoral.",
      image:
        "https://res.cloudinary.com/dngirajdx/image/upload/v1742071658/RSS_px_ma1vf8.jpg ",
      contact: "raulsanchezs@eskemma.com",
    },
    {
      id: 2,
      name: "Alicia García Cortés",
      role: "Productora Audiovisual",
      bio: "Alicia es el motor creativo de Eskemma. Ha producido eventos y participado en producciones audiovisuales cinematográficas. Tiene amplia experiencia en proyectos públicos y privados.",
      image: "https://i.pravatar.cc/150?img=38 ",
      contact: "aliciagarciac@eskemma.com",
    },
    {
      id: 3,
      name: "Yolanda Orozco López",
      role: "Administradora",
      bio: "Contadora de profesión y administradora por vocación, Yolanda combina su experiencia y creatividad para hacer posibles los proyectos de los clientes de Eskemma.",
      image: "https://i.pravatar.cc/150?img=10 ",
      contact: "yolandaorozcol@eskemma.com",
    },
    {
      id: 4,
      name: "David Quezada Mendoza",
      role: "Consultor político",
      bio: "David ha participado en más de 50 proyectos de comunicación política en México y otros países latinoamericanos. Politólogo con especialidad en marketing electoral.",
      image: "https://i.pravatar.cc/150?img=52 ",
      contact: "davidquezadac@eskemma.com",
    },
  ];

  const nextMember = () =>
    setCurrentIndex((prevIndex) =>
      prevIndex === teamMembers.length - 1 ? 0 : prevIndex + 1
    );

  const prevMember = () =>
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? teamMembers.length - 1 : prevIndex - 1
    );

  const currentMember = teamMembers[currentIndex];

  return (
    <>
      {/* Enlace "Ver más" */}
      <button
        className="text-[18px] font-medium text-bluegreen-eske hover:text-bluegreen-80 focus:outline-none cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        Conoce al equipo
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0, 0.6)" }}
        >
          <div className="bg-white-eske rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-hidden">
            {/* Botón de Cierre */}
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-red-eske transition-colors duration-300"
              onClick={() => setIsOpen(false)}
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

            {/* Encabezado */}
            <h3 className="text-2xl font-medium text-bluegreen-eske mb-1 text-center">
              {currentMember.name}
            </h3>
            <p className="text-xl text-orange-eske mb-8 text-center">
              {currentMember.role}
            </p>

            {/* Contenido Principal */}
            <div className="flex flex-col items-center gap-6">
              {/* Imagen Circular */}
              <div className="w-36 h-36 rounded-full bg-bluegreen-eske border-blue-eske p-0.5 overflow-hidden flex items-center justify-center">
                <img
                  src={currentMember.image}
                  alt={currentMember.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Biografía */}
              <div className="mt-2 text-center">
                <p className="text-10px text-gray-700">{currentMember.bio}</p>
              </div>
            </div>

            {/* Navegación entre Miembros */}
            <div className="flex justify-between mt-6">
              {/* Botón Anterior */}
              <button
                className="text-gray-700 hover:text-blue-eske transition-colors duration-300"
                onClick={prevMember}
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Indicadores de Carrusel */}
              <div className="flex gap-2">
                {teamMembers.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === currentIndex ? "bg-orange-eske" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Botón Siguiente */}
              <button
                className="text-gray-700 hover:text-blue-eske transition-colors duration-300"
                onClick={nextMember}
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamModal;