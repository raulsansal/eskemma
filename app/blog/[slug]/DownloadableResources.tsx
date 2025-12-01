// app/blog/[slug]/DownloadableResources.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DownloadableResource } from "@/types/post.types";
import { getCategoryColor } from "@/lib/constants/categories";

interface DownloadableResourcesProps {
  resources: DownloadableResource[];
  category: string;
}

export default function DownloadableResources({
  resources,
  category,
}: DownloadableResourcesProps) {
  const { user, setIsLoginModalOpen } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedResource, setSelectedResource] =
    useState<DownloadableResource | null>(null);

  const categoryColor = getCategoryColor(category);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        );
      case "xlsx":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L13 1.586A2 2 0 0011.586 1H9z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const handleDownload = async (resource: DownloadableResource) => {
    // Si no hay usuario, mostrar modal de login
    if (!user) {
      setSelectedResource(resource);
      setShowLoginPrompt(true);
      return;
    }

    // Verificar nivel de acceso
    const userRole = user.role || "visitor";
    const hasAccess = resource.accessLevel.includes(userRole as any);

    if (!hasAccess) {
      alert(
        "Este recurso requiere una suscripción activa. Por favor, actualiza tu plan."
      );
      return;
    }

    // Si es gratis y tiene acceso, procesar descarga
    if (resource.isFree) {
      try {
        // Aquí iría la lógica de descarga
        // Por ahora, simplemente mostramos un mensaje
        alert(
          `Procesando descarga de: ${resource.title}\n\nEn producción, aquí se generaría el link de descarga desde Firebase Storage.`
        );

        // TODO: Implementar descarga real desde Firebase Storage
        // const downloadUrl = await getDownloadUrl(resource.fileStoragePath);
        // window.open(downloadUrl, '_blank');
      } catch (error) {
        console.error("Error al descargar recurso:", error);
        alert("Error al procesar la descarga. Inténtalo de nuevo.");
      }
    } else {
      // Redirigir a página de compra (futura)
      alert(
        `Recurso de pago: $${resource.price}\n\nEn producción, aquí se redirigiría a la página de compra.`
      );
    }
  };

  return (
    <>
      {/* Modal de login */}
      {showLoginPrompt && selectedResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          onClick={() => {
            setShowLoginPrompt(false);
            setSelectedResource(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-red-500 transition-colors"
              onClick={() => {
                setShowLoginPrompt(false);
                setSelectedResource(null);
              }}
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

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: categoryColor + "20" }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: categoryColor }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-black-eske mb-4">
                Debes iniciar sesión para descargar recursos
              </h3>

              <p className="text-black-eske-80 mb-6">
                Si aún no tienes tu usuario y contraseña, te invitamos a
                registrarte en nuestra comunidad de Eskemma.
              </p>

              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setSelectedResource(null);
                  setIsLoginModalOpen(true);
                }}
                className="w-full px-6 py-3 bg-bluegreen-eske text-white rounded-lg hover:bg-bluegreen-eske-70 transition-colors font-semibold"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card de recursos */}
      <div className="bg-white-eske rounded-lg shadow-sm p-6 border border-gray-eske-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-bluegreen-eske"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Recursos descargables
          </h3>
        </div>

        <p className="text-xs text-gray-600 mb-4">
          Materiales complementarios para este tema
        </p>

        <div className="space-y-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="group border border-gray-eske-30 rounded-lg p-3 hover:border-bluegreen-eske hover:shadow-sm transition-all"
            >
              {/* Header con icono y badge */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {getFileIcon(resource.fileType)}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-700 uppercase">
                      {resource.fileType}
                    </span>
                    <span className="text-xs text-gray-600 ml-2">
                      {resource.fileSize}
                    </span>
                  </div>
                </div>

                {resource.isFree && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    Gratis
                  </span>
                )}
              </div>

              {/* Título */}
              <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
                {resource.title}
              </h4>

              {/* Descripción */}
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {resource.description}
              </p>

              {/* Botón de descarga */}
              <button
                onClick={() => handleDownload(resource)}
                className="w-full px-3 py-2 bg-bluegreen-eske text-white text-sm font-medium rounded hover:bg-bluegreen-eske-70 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {resource.isFree
                  ? "Descargar gratis"
                  : `Obtener - $${resource.price}`}
              </button>
            </div>
          ))}
        </div>

        {/* Link a página de recursos */}
        <a
          href="/recursos"
          className="block mt-4 text-center text-sm text-bluegreen-eske hover:text-bluegreen-eske-70 font-medium transition-colors"
        >
          Ver más recursos →
        </a>
      </div>
    </>
  );
}