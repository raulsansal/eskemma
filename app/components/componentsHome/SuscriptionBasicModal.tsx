//app/components/componentsHome/SuscriptionBasicModal.tsx

import Link from "next/link";
import { useState } from "react";
import Button from "../Button";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface SuscriptionBasicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export default function SuscriptionBasicModal({
  isOpen,
  onClose,
  onPaymentSuccess,
}: SuscriptionBasicModalProps) {
  const [selectedService, setSelectedService] = useState<string>("Moddulo");

  // Hooks de accesibilidad
  const modalRef = useFocusTrap(isOpen);
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const radioButtonStyle = `
    .custom-radio {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border: 2px solid #6b7280;
      border-radius: 50%;
      outline: none;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
      vertical-align: middle;
      flex-shrink: 0;
    }
    
    .custom-radio:checked {
      border-color: #1e40af;
      background-color: #1e40af;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='3'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
    }
    
    .custom-radio:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
    }
  `;

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{radioButtonStyle}</style>
      
      <div
        ref={modalRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-basic-title"
        className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-md p-6 max-sm:p-4 relative overflow-y-auto max-h-[85vh] max-sm:max-h-[90vh]"
        style={{ marginTop: "20px" }}
      >
        {/* Botón de Cierre */}
        <button
          className="absolute top-4 max-sm:top-3 right-4 max-sm:right-3 text-black-eske hover:text-red-eske transition-colors duration-300 focus-ring-primary rounded"
          onClick={onClose}
          aria-label="Cerrar modal de suscripción básica"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 max-sm:h-5 max-sm:w-5"
            fill="blue-eske"
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

        <div className="space-y-6 max-sm:space-y-4 text-left">
          {/* Título del Modal */}
          <h2 id="subscription-basic-title" className="text-3xl max-sm:text-2xl font-bold text-bluegreen-eske text-center">
            Suscripción
          </h2>

          {/* Imagen */}
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1565350552203-b68085b104df?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Plan Básico - Ilustración de escritorio con computadora"
              className="w-150 max-sm:w-full h-70 max-sm:h-auto object-cover rounded"
            />
          </div>

          {/* Nombre del Plan */}
          <p className="text-2xl max-sm:text-xl font-semibold text-bluegreen-eske">
            Plan Básico
          </p>

          {/* Precio */}
          <p className="text-[16px] max-sm:text-sm font-bold text-black-eske">
            $2,000ºº (mx) pago por persona / mes
          </p>

          {/* Bloque de texto con la descripción */}
          <fieldset className="space-y-2 max-sm:space-y-1.5">
            <legend className="text-[16px] max-sm:text-sm font-normal text-black-eske mb-2 max-sm:mb-1.5">
              Selecciona un servicio:
            </legend>
            <label htmlFor="service-moddulo" className="flex items-center space-x-2 ml-4 max-sm:ml-2 cursor-pointer min-h-[44px] max-sm:min-h-[40px]">
              <input
                type="radio"
                id="service-moddulo"
                name="service"
                value="Moddulo"
                checked={selectedService === "Moddulo"}
                onChange={(e) => setSelectedService(e.target.value)}
                className="custom-radio"
              />
              <span className="ml-2 text-[16px] max-sm:text-sm font-normal text-black-eske">Moddulo</span>
            </label>
            <label htmlFor="service-sefix" className="flex items-center space-x-2 ml-4 max-sm:ml-2 cursor-pointer min-h-[44px] max-sm:min-h-[40px]">
              <input
                type="radio"
                id="service-sefix"
                name="service"
                value="Sefix"
                checked={selectedService === "Sefix"}
                onChange={(e) => setSelectedService(e.target.value)}
                className="custom-radio"
              />
              <span className="ml-2 text-[16px] max-sm:text-sm font-normal text-black-eske">Sefix</span>
            </label>
            <label htmlFor="service-cursos" className="flex items-center space-x-2 ml-4 max-sm:ml-2 cursor-pointer min-h-[44px] max-sm:min-h-[40px]">
              <input
                type="radio"
                id="service-cursos"
                name="service"
                value="Cursos"
                checked={selectedService === "Cursos"}
                onChange={(e) => setSelectedService(e.target.value)}
                className="custom-radio"
              />
              <span className="ml-2 text-[16px] max-sm:text-sm font-normal text-black-eske">Cursos online</span>
            </label>
            <label htmlFor="service-monitor" className="flex items-center space-x-2 ml-4 max-sm:ml-2 cursor-pointer min-h-[44px] max-sm:min-h-[40px]">
              <input
                type="radio"
                id="service-monitor"
                name="service"
                value="Monitor"
                checked={selectedService === "Monitor"}
                onChange={(e) => setSelectedService(e.target.value)}
                className="custom-radio"
              />
              <span className="ml-2 text-[15px] max-sm:text-sm font-normal text-black-eske">Monitor</span>
            </label>
          </fieldset>

          {/* Método de pago */}
          <p className="text-[16px] max-sm:text-sm font-semibold text-bluegreen-eske">
            Método de pago
          </p>
          <div className="flex items-center justify-between">
            {/* Ícono de tarjeta de crédito y texto */}
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 max-sm:h-5 max-sm:w-5 text-black-eske"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <p className="text-[16px] max-sm:text-sm font-normal text-black-eske">
                **** **** **** 1234
              </p>
            </div>
            {/* Botón CAMBIAR - Mantener personalizado */}
            <button
              type="button"
              className="text-10px max-sm:text-[9px] font-medium text-black-eske px-4 max-sm:px-3 py-2 max-sm:py-1.5 border border-gray-90 rounded hover:bg-blue-eske hover:text-white-eske cursor-pointer transition-colors duration-300 focus-ring-primary"
              aria-label="Cambiar método de pago"
            >
              CAMBIAR
            </button>
          </div>

          {/* Botón PAGAR */}
          <Button
            label="PAGAR $ 2,000.ºº"
            variant="primary"
            onClick={onPaymentSuccess}
          />

          {/* Línea horizontal */}
          <hr className="border-gray-300 my-4 max-sm:my-3" />

          {/* Links adicionales */}
          <p className="text-[14px] max-sm:text-xs text-black-eske text-center">
            Consultar{" "}
            <Link
              href="/terminos-y-condiciones-suscripciones"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske underline focus-ring-primary rounded"
            >
              términos y condiciones de suscripciones
              <span className="sr-only"> (se abre en nueva ventana)</span>
            </Link>
          </p>
          <p className="text-[14px] max-sm:text-xs text-black-eske text-center">
            Acepto las{" "}
            <Link
              href="/condiciones-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske underline focus-ring-primary rounded"
            >
              condiciones de uso
              <span className="sr-only"> (se abre en nueva ventana)</span>
            </Link>{" "}
            y{" "}
            <Link
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske underline focus-ring-primary rounded"
            >
              política de privacidad
              <span className="sr-only"> (se abre en nueva ventana)</span>
            </Link>{" "}
            de Eskemma.
          </p>
        </div>
      </div>
    </div>
  );
}

