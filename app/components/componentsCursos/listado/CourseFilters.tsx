// app/cursos/components/CourseFilters.tsx
// ============================================================
// FILTROS PARA LA PÁGINA DE CURSOS
// ============================================================

"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface CourseFiltersProps {
  currentCategory: string;
  currentType: string;
  currentDifficulty: string;
  currentSearch: string;
}

export default function CourseFilters({
  currentCategory,
  currentType,
  currentDifficulty,
  currentSearch,
}: CourseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [category, setCategory] = useState(currentCategory);
  const [type, setType] = useState(currentType);
  const [difficulty, setDifficulty] = useState(currentDifficulty);

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (category && category !== "todos") params.set("category", category);
    if (type && type !== "todos") params.set("type", type);
    if (difficulty && difficulty !== "todos") params.set("difficulty", difficulty);
    if (searchInput) params.set("search", searchInput);
    
    // Resetear a página 1 cuando cambian filtros
    params.set("page", "1");
    
    router.push(`${pathname}?${params.toString()}`);
  }, [category, type, difficulty, searchInput, router, pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // El efecto se encarga de actualizar la URL
  };

  const clearFilters = () => {
    setCategory("todos");
    setType("todos");
    setDifficulty("todos");
    setSearchInput("");
  };

  const hasActiveFilters = 
    category !== "todos" || 
    type !== "todos" || 
    difficulty !== "todos" || 
    searchInput !== "";

  return (
    <div className="bg-white-eske dark:bg-[#18324A] rounded-lg shadow-md p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Búsqueda */}
        <form onSubmit={handleSearch} className="flex-1">
          <label htmlFor="search" className="block text-sm text-black-eske dark:text-[#C7D6E0] font-normal mb-1">
            Buscar cursos
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ej: análisis electoral..."
              className="flex-1 p-2 border border-gray-eske-30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent bg-white-eske dark:bg-[#112230] dark:text-[#EAF2F8] dark:placeholder-[#6D8294]"
              aria-label="Buscar cursos por título, descripción o etiquetas"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-bluegreen-eske text-white-eske rounded-lg hover:bg-bluegreen-eske-70 transition-colors focus-ring-primary"
              aria-label="Aplicar búsqueda"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Filtro por tipo */}
        <div className="w-full md:w-48">
          <label htmlFor="type" className="block text-sm text-black-eske dark:text-[#C7D6E0] font-normal mb-1">
            Tipo
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border border-gray-eske-30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent bg-white-eske dark:bg-[#112230] dark:text-[#EAF2F8]"
            aria-label="Filtrar por tipo de curso"
          >
            <option value="todos">Todos los tipos</option>
            <option value="workshop">Talleres</option>
            <option value="course">Cursos</option>
            <option value="masterclass">Masterclasses</option>
          </select>
        </div>

        {/* Filtro por dificultad */}
        <div className="w-full md:w-48">
          <label htmlFor="difficulty" className="block text-sm text-black-eske font-normal mb-1">
            Dificultad
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border border-gray-eske-30 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent bg-white-eske dark:bg-[#112230] dark:text-[#EAF2F8]"
            aria-label="Filtrar por nivel de dificultad"
          >
            <option value="todos">Todos los niveles</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-black-eske dark:text-[#9AAEBE] font-normal hover:text-bluegreen-eske dark:hover:text-[#4791B3] transition-colors focus-ring-primary"
            aria-label="Limpiar todos los filtros"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}