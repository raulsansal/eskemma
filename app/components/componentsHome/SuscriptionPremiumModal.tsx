import Link from "next/link";
import { useState } from "react";
import Button from "../Button";

interface SuscriptionPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export default function SuscriptionPremiumModal({
  isOpen,
  onClose,
  onPaymentSuccess,
}: SuscriptionPremiumModalProps) {
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

        <div className="space-y-6 text-left">
          {/* Título del Modal */}
          <h2 className="text-3xl font-bold text-bluegreen-eske text-center">
            Suscripción
          </h2>

          {/* Imagen */}
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1611095973763-414019e72400?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Plan Premium"
              className="w-150 h-70"
            />
          </div>

          {/* Nombre del Plan */}
          <p className="text-2xl font-semibold text-bluegreen-eske">
            Plan Premium
          </p>

          {/* Precio */}
          <p className="text-[16px] font-bold text-black-eske">
            $4,000 (MX) por persona / mes
          </p>

          {/* Descripción */}
          <div className="space-y-2">
            <p className="text-[16px] font-normal text-black-eske">
              Tu suscripción mensual incluye:
            </p>
            <ul className="list-disc pl-6 text-[16px] text-black-eske space-y-1">
              <li>Acceso total al ecosistema de Eskemma</li>
              <li>Acceso a recursos exclusivos</li>
              <li>Una sesión de asesoría gratuita al mes</li>
              <li>Asistencia online 24/7</li>
              <li>Acceso total a eBooks y plantillas</li>
            </ul>
          </div>

          {/* Método de pago */}
          <p className="text-[16px] font-semibold text-bluegreen-eske">
            Método de pago
          </p>
          <div className="flex items-center justify-between">
            {/* Ícono de tarjeta de crédito y texto */}
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <p className="text-[16px] font-normal text-black-eske">
                **** **** **** 1234
              </p>
            </div>
            {/* Botón CAMBIAR - Mantener personalizado */}
            <button
              type="button"
              className="text-10px font-medium text-gray-700 px-4 py-2 border border-gray-90 rounded hover:bg-blue-eske hover:text-white-eske cursor-pointer transition-colors duration-300"
            >
              CAMBIAR
            </button>
          </div>

          {/* Botón PAGAR */}
          <Button
            label="PAGAR $4,000.ºº"
            variant="primary"
            onClick={onPaymentSuccess}
          />

          {/* Línea horizontal */}
          <hr className="border-gray-300 my-4" />

          {/* Links adicionales */}
          <p className="text-[14px] text-black-eske text-center">
            Consultar{" "}
            <Link
              href="/terminos-y-condiciones-suscripciones"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske underline"
            >
              términos y condiciones de suscripciones
            </Link>
          </p>
          <p className="text-[14px] text-black-eske text-center">
            Acepto las{" "}
            <Link
              href="/condiciones-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske underline"
            >
              condiciones de uso
            </Link>{" "}
            y{" "}
            <Link
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-eske underline"
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