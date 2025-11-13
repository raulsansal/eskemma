// app/components/componentsBlog/Pagination.tsx
"use client";

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  categoryFilter?: string;
  searchQuery?: string;
  sortBy?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  categoryFilter = "todos",
  searchQuery = "",
  sortBy = "newest",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // ✅ Construir URL manteniendo TODOS los filtros
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    
    params.set("page", page.toString());
    
    if (categoryFilter && categoryFilter !== "todos") {
      params.set("category", categoryFilter);
    }
    if (searchQuery && searchQuery.trim() !== "") {
      params.set("search", searchQuery.trim());
    }
    if (sortBy && sortBy !== "newest") {
      params.set("sort", sortBy);
    }

    return `/blog?${params.toString()}`;
  };

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-3 mt-12 mb-8">
      {/* Botón Anterior */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-bluegreen-eske text-white-eske rounded-lg hover:bg-bluegreen-eske-70 transition-colors duration-300 text-sm sm:text-base flex items-center gap-1"
        >
          <span className="hidden sm:inline">←</span>
          <span className="sm:hidden">←</span>
          <span className="hidden xs:inline sm:inline">Anterior</span>
        </Link>
      ) : (
        <button
          disabled
          className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm sm:text-base flex items-center gap-1"
        >
          <span className="hidden sm:inline">←</span>
          <span className="sm:hidden">←</span>
          <span className="hidden xs:inline sm:inline">Anterior</span>
        </button>
      )}

      {/* Indicador de página actual */}
      <span className="px-2 py-2 sm:px-4 sm:py-2 text-gray-700 font-medium text-xs sm:text-base whitespace-nowrap">
        {currentPage}/{totalPages}
      </span>

      {/* Botón Siguiente */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-bluegreen-eske text-white-eske rounded-lg hover:bg-bluegreen-eske-70 transition-colors duration-300 text-sm sm:text-base flex items-center gap-1"
        >
          <span className="hidden xs:inline sm:inline">Siguiente</span>
          <span className="hidden sm:inline">→</span>
          <span className="sm:hidden">→</span>
        </Link>
      ) : (
        <button
          disabled
          className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm sm:text-base flex items-center gap-1"
        >
          <span className="hidden xs:inline sm:inline">Siguiente</span>
          <span className="hidden sm:inline">→</span>
          <span className="sm:hidden">→</span>
        </button>
      )}
    </div>
  );
}