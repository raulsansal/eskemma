// app/cursos/components/CourseGrid.tsx
// ============================================================
// GRID DE CURSOS
// Muestra los cursos en formato de cuadrícula
// ============================================================

"use client";

import type { CourseCardItem } from "@/types/course.types";
import CourseCard from "./CourseCard";

interface CourseGridProps {
  courses: CourseCardItem[];
}

export default function CourseGrid({ courses }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-eske-70 text-lg">
          No hay cursos que coincidan con tu búsqueda.
        </p>
        <p className="text-gray-eske-60 mt-2">
          Intenta con otros filtros o términos de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      role="list"
      aria-label="Listado de cursos disponibles"
    >
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}