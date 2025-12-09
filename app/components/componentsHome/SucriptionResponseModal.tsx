import Link from "next/link";
import { useState } from "react";
import Button from "../Button";

interface SuscriptionResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function SuscriptionResponseModal({
  isOpen,
  onClose,
  userName,
}: SuscriptionResponseModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div
        className="bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-md p-6 relative overflow-y-auto max-h-[80vh]"
        style={{ marginTop: "20px" }}
      >
        {/* Botón de Cierre */}
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-red-eske transition-colors duration-300"
          onClick={onClose}
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

        {/* Contenido del Modal */}
        <div className="space-y-6 text-center">
          {/* Espacio para el logotipo */}
          <div className="flex justify-center mb-4">
            <img
              src="/images/esk_log_csm.svg"
              alt="Eskemma Logo"
              className="w-60 h-24 object-contain"
            />
          </div>

          {/* Saludo personalizado */}
          <p className="text-xl font-bold text-bluegreen-eske">
            Hola, {userName}
          </p>

          {/* Mensaje de felicitaciones */}
          <p className="text-[16px] font-normal text-black-eske">
            ¡Felicidades por suscribirte a Eskemma!
          </p>

          {/* Mensaje destacado */}
          <p className="text-[16px] font-bold text-black-eske">
            Ahora cuentas con el respaldo de profesionales para tu proyecto político.
          </p>

          {/* Información sobre el correo */}
          <p className="text-[16px] font-normal text-black-eske">
            Hemos enviado un email a tu cuenta de correo con la información de tu compra y las indicaciones para la facturación.
          </p>

          {/* Contacto */}
          <p className="text-[16px] font-normal text-black-eske">
            Para cualquier información sobre tu compra contacta con nosotros al correo:{" "}
            <span className="font-bold text-bluegreen-eske">clientes@eskemma.com</span>
          </p>

          {/* Invitación a explorar recursos */}
          <p className="text-[16px] font-normal text-black-eske">
            Te invitamos a iniciar explorando los materiales disponibles para tu proyecto en la{" "}
            <Link
              href="/recursos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske-60 underline"
            >
              sección de recursos
            </Link>
            .
          </p>

          {/* Agradecimiento final */}
          <p className="text-[16px] font-bold text-black-eske">
            Agradecemos tu confianza.
          </p>

          {/* Botón CERRAR */}
          <Button
            label="CERRAR"
            variant="primary"
            onClick={onClose}
          />

          {/* Línea horizontal */}
          <hr className="border-gray-300 my-4" />

          {/* Links adicionales */}
          <p className="text-[14px] text-black-eske">
            Consultar{" "}
            <Link
              href="/terminos-y-condiciones-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske-60 underline"
            >
              términos y condiciones de uso
            </Link>{" "}
            y{" "}
            <Link
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske-60 underline"
            >
              política de privacidad
            </Link>{" "}
            de Eskemma.
          </p>
        </div>
      </div>
    </div>
  );
}