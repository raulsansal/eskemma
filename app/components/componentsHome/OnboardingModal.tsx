//app/components/componentsHome/OnboardingModal.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../Button";

export default function OnboardingModal({
  isOpen,
  onClose,
  userName,
}: {
  isOpen: boolean;
  onClose: (showOnLogin?: boolean) => void;
  userName: string;
}) {
  const [showOnLogin, setShowOnLogin] = useState(true);
  const router = useRouter();

  if (!isOpen) return null;

  // Funciones para manejar las acciones de los botones
  const handleExploreResources = () => {
    console.log("Navegando a recursos...");
    onClose(showOnLogin);
    router.push("/recursos");
  };

  const handleScheduleConsultationSefix = () => {
    console.log("Navegando a Sefix...");
    onClose(showOnLogin);
    router.push("/sefix");
  };

  const handleConfigureProfile = () => {
    console.log("Configurando perfil...");
    onClose(showOnLogin);
    router.push("/profile");
  };

  // Manejar el cierre del modal con el botón de cierre
  const handleClose = () => {
    onClose(showOnLogin);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-md p-6 relative">
        {/* Botón de Cierre */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-black-eske hover:text-red-eske transition-colors duration-300"
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
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Título Personalizado */}
        <h2 className="text-2xl font-bold text-bluegreen-eske text-center mb-6">
          ¡Hola, {userName}!
        </h2>

        {/* Mensaje de Introducción */}
        <p className="text-[18px] text-black-eske text-center mb-6">
          Te damos la bienvenida a{" "}<br></br>
          <span className="text-blue-eske font-bold">Eskemma</span> <br></br>{" "}
          <span className="text-center text-[13px] text-bluegreen-eske font-semibold">
            El ecosistema digital para tu proyecto político
          </span>
        </p>

        <p className="text-[16px] text-black-eske text-center mb-6">
          Aquí tienes nuestras sugerencias para comenzar:
        </p>

        {/* Botones de Acción */}
        <div className="space-y-4">
          <Button
            label="EXPLORAR RECURSOS"
            variant="primary"
            onClick={handleExploreResources}
          />
          <Button
            label="CONSULTAR ESTADÍSTICAS ELECTORALES"
            variant="primary"
            onClick={handleScheduleConsultationSefix}
          />
          <Button
            label="CONFIGURAR PERFIL"
            variant="primary"
            onClick={handleConfigureProfile}
          />
        </div>

        {/* Casilla de Verificación */}
        <div className="mt-4 flex items-center justify-center">
          <input
            type="checkbox"
            id="showOnLogin"
            checked={showOnLogin}
            onChange={(e) => setShowOnLogin(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showOnLogin" className="text-[14px] text-black-eske">
            Volver a mostrar
          </label>
        </div>
      </div>
    </div>
  );
}