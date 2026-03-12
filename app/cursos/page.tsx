// app/cursos/page.tsx
// ============================================================
// PÁGINA PRINCIPAL DE CURSOS
// Inspirada en app/blog/page.tsx
// CORREGIDO: CourseFilters ahora existe, tags como TagItem[]
// ============================================================

import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import CourseGrid from "./components/CourseGrid";
import CourseFilters from "./components/CourseFilters";
import { getCourses, getCategories, getAllTags } from "@/lib/courses";
import Pagination from "../components/componentsBlog/Pagination";
import Sidebar from "../components/componentsBlog/Sidebar";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Cursos y Talleres | Eskemma",
  description: "Cursos prácticos y talleres hands-on para profesionales de la comunicación política y análisis electoral. Aprende haciendo con datos reales.",
  keywords: [
    "cursos política",
    "talleres electorales",
    "análisis de datos",
    "comunicación política",
    "campañas electorales",
    "formación política",
    "México",
  ],
  openGraph: {
    title: "Cursos y Talleres Eskemma",
    description: "Aprende con nuestros cursos prácticos de análisis electoral y comunicación política.",
    url: `${SITE_URL}/cursos`,
    siteName: "Eskemma",
    images: [
      {
        url: `${SITE_URL}/images/cursos-hero.jpg`,
        width: 1200,
        height: 630,
        alt: "Cursos Eskemma",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  alternates: {
    canonical: `${SITE_URL}/cursos`,
  },
};

interface CursosPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    type?: string;
    difficulty?: string;
    search?: string;
  }>;
}

export default async function CursosPage({ searchParams }: CursosPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const category = params.category || "todos";
  const type = params.type || "todos";
  const difficulty = params.difficulty || "todos";
  const searchTerm = params.search || "";
  const coursesPerPage = 9;

  // Obtener cursos con filtros
  const {
    courses,
    totalPages,
    totalCourses,
  } = await getCourses({
    page: currentPage,
    limit: coursesPerPage,
    category: category === "todos" ? undefined : category,
    type: type === "todos" ? undefined : type,
    difficulty: difficulty === "todos" ? undefined : difficulty,
    search: searchTerm || undefined,
  });

  // Obtener datos para el sidebar
  const [categories, allTags] = await Promise.all([
    getCategories(),
    getAllTags(),
  ]);

  // Convertir categorías al formato que espera el Sidebar
  const categoryCounts: Record<string, number> = {};
  categories.forEach(cat => {
    categoryCounts[cat.id] = cat.count;
  });

  return (
    <main className="min-h-screen bg-white-eske">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-blue-eske-900 to-blue-eske-800 text-white py-20 px-4">
        <div className="w-[90%] mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cursos y Talleres <span className="text-yellow-eske">Eskemma</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Formación práctica para profesionales de la comunicación política y el análisis electoral.
            Aprende haciendo con datos reales y herramientas de vanguardia.
          </p>
          
          {/* Featured Course - Taller de Diagnóstico Electoral */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
            <span className="inline-block bg-yellow-eske text-blue-eske-900 px-4 py-1 rounded-full text-sm font-semibold mb-4">
              🚀 NUEVO TALLER
            </span>
            <h2 className="text-3xl font-bold mb-2">
              Taller de Diagnóstico Electoral
            </h2>
            <p className="text-lg text-gray-200 mb-6">
              Estrategias y herramientas para analizar una elección con datos reales.
              6 módulos · 20 horas · 100% práctico
            </p>
            <Link
              href="/taller/diagnostico-electoral"
              className="inline-block bg-yellow-eske hover:bg-yellow-eske/90 text-blue-eske-900 font-semibold px-8 py-3 rounded-lg transition-colors text-lg focus-ring-light"
              aria-label="Comenzar Taller de Diagnóstico Electoral"
            >
              Comenzar ahora →
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Cursos */}
      <section
        className="bg-gray-eske-10 py-12 px-4 sm:px-6 md:px-8"
        aria-labelledby="cursos-section-title"
      >
        <div className="w-[90%] mx-auto max-w-7xl">
          <h2 id="cursos-section-title" className="sr-only">
            Listado de cursos y talleres
          </h2>

          {/* Filtros - AHORA SÍ EXISTE */}
          <CourseFilters
            currentCategory={category}
            currentType={type}
            currentDifficulty={difficulty}
            currentSearch={searchTerm}
          />

          {/* Contador */}
          <div className="mb-8 text-center" role="status" aria-live="polite">
            {totalCourses === 0 ? (
              <p className="text-gray-600 text-sm">
                No se encontraron cursos con los filtros seleccionados
              </p>
            ) : (
              <p className="text-gray-600 text-sm">
                Mostrando{" "}
                <span className="font-semibold text-bluegreen-eske">
                  {totalCourses}
                </span>{" "}
                {totalCourses === 1 ? "curso" : "cursos"}
                {searchTerm && (
                  <span className="text-gray-700">
                    {" "}
                    para{" "}
                    <span className="font-medium">
                      &quot;{searchTerm}&quot;
                    </span>
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Layout con Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Columna principal - Grid de cursos */}
            <div className="flex-1 lg:w-2/3">
              <Suspense fallback={<CourseGridSkeleton />}>
                <CourseGrid courses={courses} />
              </Suspense>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    categoryFilter={category}
                    searchQuery={searchTerm}
                  />
                </div>
              )}
            </div>

            {/* Sidebar - Desktop */}
            <div className="hidden lg:block lg:w-1/3">
              <Sidebar
                popularPosts={[]} // Los cursos populares podrían ir aquí después
                categoryCounts={categoryCounts}
                tags={allTags} // ← CORREGIDO: ahora pasamos TagItem[], no string[]
              />
            </div>
          </div>

          {/* Sidebar - Móvil */}
          <div className="lg:hidden mt-12">
            <Sidebar
              popularPosts={[]}
              categoryCounts={categoryCounts}
              tags={allTags} // ← CORREGIDO: igual aquí
            />
          </div>
        </div>
      </section>
    </main>
  );
}

// Componente de skeleton para loading
function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white-eske rounded-lg shadow-md p-4 animate-pulse">
          <div className="h-40 bg-gray-eske-20 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-eske-20 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-eske-20 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-eske-20 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}