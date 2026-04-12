// app/components/componentsCursos/listado/CourseContent.tsx
// ============================================================
// COMPONENTE CLIENTE PARA EL CONTENIDO DE CURSOS
// Gestiona el estado de la vista (Grid vs Lista)
// ============================================================

"use client";

import { useState } from "react";
import type { CourseCardItem } from "@/types/course.types";
import type { UserRole } from "@/types/subscription.types";
import CourseToolbar from "./CourseToolbar";
import CourseCard from "./CourseCard";
import CourseCardList from "./CourseCardList";
import { ViewMode } from "../../componentsBlog/ViewToggle";

interface CourseContentProps {
  courses: CourseCardItem[];
  userRole?: UserRole | null;
  categories: { id: string; name: string }[];
}

export default function CourseContent({ courses, userRole, categories }: CourseContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <>
      <CourseToolbar 
        onViewChange={(view) => setViewMode(view)} 
        categories={categories}
      />

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white-eske rounded-lg border border-gray-eske-10 shadow-sm">
          <p className="text-black-eske text-lg font-normal">
            No se encontraron cursos con los filtros seleccionados.
          </p>
          <button 
            onClick={() => window.location.href = "/cursos"}
            className="mt-4 text-bluegreen-eske hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
          {courses.map((course) => (
            viewMode === "grid" ? (
              <CourseCard key={course.id} course={course} userRole={userRole} />
            ) : (
              <CourseCardList key={course.id} course={course} userRole={userRole} />
            )
          ))}
        </div>
      )}
    </>
  );
}
