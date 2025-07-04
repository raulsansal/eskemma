import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingModal({
  isOpen,
  onClose,
  userName, // Prop para recibir el nombre del usuario
}: {
  isOpen: boolean;
  onClose: (showOnLogin?: boolean) => void; // Ajustamos la firma para aceptar un argumento opcional
  userName: string; // Nombre del usuario
}) {
  const [showOnLogin, setShowOnLogin] = useState(true); // Estado para la casilla de verificación
  const router = useRouter(); // Hook para manejar la navegación

  if (!isOpen) return null;

  // Funciones para manejar las acciones de los botones
  const handleExploreResources = () => {
    console.log("Explorando recursos...");
    onClose(showOnLogin); // Pasar el valor de showOnLogin al cerrar el modal
  };

  const handleScheduleConsultationSefix = () => {
    console.log("Consultando estadísticas electorales");
    onClose(showOnLogin); // Pasar el valor de showOnLogin al cerrar el modal
  };

  const handleConfigureProfile = () => {
    console.log("Configurando perfil...");
    router.push("/profile"); // Redirigir al usuario a la página de perfil
    onClose(showOnLogin); // Pasar el valor de showOnLogin al cerrar el modal
  };

  // Manejar el cierre del modal con el botón de cierre
  const handleClose = () => {
    onClose(showOnLogin); // Pasar el valor de showOnLogin al cerrar el modal
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="bg-white-eske rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Botón de Cierre */}
        <button
          onClick={handleClose} // Usar la función handleClose
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
          Te damos la bienvenida a{" "}
          <span className="text-blue-eske font-bold">Eskemma</span> <br></br>{" "}
          <span className="text-center text-[14px] text-orange-eske font-semibold">
            El ecosistema digital para tu proyecto político
          </span>
        </p>

        <p className="text-[16px] text-black-eske text-center mb-6">
          Aquí tienes nuestras sugerencias para comenzar:
        </p>

        {/* Botones de Acción */}
        <div className="space-y-4">
          <button
            onClick={handleExploreResources}
            className="w-full bg-blue-eske-40 text-white-eske py-2 rounded hover:bg-bluegreen-eske-70 transition-colors duration-300"
          >
            Explorar recursos
          </button>
          <button
            onClick={handleScheduleConsultationSefix}
            className="w-full bg-blue-eske text-white-eske py-2 rounded hover:bg-bluegreen-eske-70 transition-colors duration-300"
          >
            Consultar estadísticas electorales
          </button>
          <button
            onClick={handleConfigureProfile}
            className="w-full bg-blue-eske-60 text-white-eske py-2 rounded hover:bg-bluegreen-eske-70 transition-colors duration-300"
          >
            Configurar perfil
          </button>
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
            Mostrar al iniciar sesión
          </label>
        </div>
      </div>
    </div>
  );
}