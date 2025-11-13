// app/components/componentsBlog/BlogToolbar.tsx
import CategoryFilter from "./CategoryFilter";

export default function BlogToolbar() {
  return (
    <div className="mb-8 bg-white-eske rounded-lg shadow-sm p-4 sm:p-6">
      {/* Grid de 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Columna 1: Filtro por Categoría */}
        <div>
          <CategoryFilter />
        </div>

        {/* Columna 2: Buscador (próximamente) */}
        <div>
          <label
            htmlFor="search-posts"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Buscar
          </label>
          <div className="relative">
            <input
              id="search-posts"
              type="text"
              placeholder="Próximamente..."
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Columna 3: Ordenamiento (próximamente) */}
        <div>
          <label
            htmlFor="sort-posts"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Ordenar por
          </label>
          <select
            id="sort-posts"
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
          >
            <option>Más recientes</option>
            <option>Más antiguos</option>
            <option>Más populares</option>
          </select>
        </div>
      </div>
    </div>
  );
}