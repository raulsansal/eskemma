// lib/cursos/shared/courses.ts
// ============================================================
// FUNCIONES PARA OBTENER CURSOS (similar a lib/posts.ts)
// CORREGIDO: Ruta de importación para TALLER_DIAGNOSTICO
// ============================================================

import { TALLER_DIAGNOSTICO } from "../taller/diagnostico-electoral/config";
import type { CourseCardItem } from "@/types/course.types";

// Configuración para evitar importación en cliente
if (typeof window !== "undefined") {
  throw new Error("Este archivo solo debe ser importado en el servidor.");
}

// Datos simulados por ahora (en producción vendrían de Firestore)
const MOCK_COURSES: CourseCardItem[] = [
  {
    id: TALLER_DIAGNOSTICO.id,
    title: TALLER_DIAGNOSTICO.title,
    slug: TALLER_DIAGNOSTICO.slug,
    description: TALLER_DIAGNOSTICO.description,
    type: TALLER_DIAGNOSTICO.type,
    difficulty: TALLER_DIAGNOSTICO.difficulty,
    thumbnail: "/images/cursos/diagnostico_electoral.png",
    estimatedDuration: TALLER_DIAGNOSTICO.estimatedDuration,
    enrolledStudents: 156,
    requiredRole: TALLER_DIAGNOSTICO.requiredRole,
    category: "Análisis Electoral",
    tags: ["elecciones", "datos", "estrategia"],
  },
  {
    id: "comunicacion-politica-avanzada",
    title: "Comunicación Política Avanzada",
    slug: "comunicacion-politica-avanzada",
    description: "Estrategias de comunicación para campañas modernas, incluyendo manejo de crisis y narrativa digital.",
    type: "course",
    difficulty: "advanced",
    thumbnail: "/images/cursos/comunicacion_politica.png",
    estimatedDuration: 900,
    enrolledStudents: 89,
    requiredRole: "premium",
    category: "Comunicación",
    tags: ["comunicación", "crisis", "narrativa"],
  },
  {
    id: "introduccion-al-analisis-de-datos",
    title: "Introducción al Análisis de Datos Electorales",
    slug: "introduccion-analisis-datos",
    description: "Curso básico para entender y analizar datos electorales con herramientas accesibles.",
    type: "course",
    difficulty: "beginner",
    thumbnail: "/images/cursos/analisis_datos.png",
    estimatedDuration: 480,
    enrolledStudents: 234,
    requiredRole: "user",
    category: "Datos",
    tags: ["datos", "estadística", "principiantes"],
  },
];

interface GetCoursesParams {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  difficulty?: string;
  search?: string;
}

export async function getCourses({
  page = 1,
  limit = 9,
  category,
  type,
  difficulty,
  search,
}: GetCoursesParams = {}) {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let filtered = [...MOCK_COURSES];
  
  // Aplicar filtros
  if (category && category !== "todos") {
    filtered = filtered.filter(c => c.category === category);
  }
  
  if (type && type !== "todos") {
    filtered = filtered.filter(c => c.type === type);
  }
  
  if (difficulty && difficulty !== "todos") {
    filtered = filtered.filter(c => c.difficulty === difficulty);
  }
  
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(c => 
      c.title.toLowerCase().includes(term) || 
      c.description.toLowerCase().includes(term) ||
      c.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  }
  
  // Paginación
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedCourses = filtered.slice(start, end);
  
  return {
    courses: paginatedCourses,
    totalPages: Math.ceil(filtered.length / limit),
    totalCourses: filtered.length,
  };
}

export async function getCourseBySlug(slug: string) {
  await new Promise(resolve => setTimeout(resolve, 50));
  return MOCK_COURSES.find(c => c.slug === slug) || null;
}

export async function getCategories() {
  const categories = new Set(MOCK_COURSES.map(c => c.category));
  return Array.from(categories).map(cat => ({
    id: cat.toLowerCase().replace(/\s+/g, "-"),
    name: cat,
    count: MOCK_COURSES.filter(c => c.category === cat).length,
  }));
}

export async function getAllTags() {
  const tags = new Set<string>();
  MOCK_COURSES.forEach(c => c.tags?.forEach(t => tags.add(t)));
  return Array.from(tags).map(tag => ({
    tag,
    count: MOCK_COURSES.filter(c => c.tags?.includes(tag)).length,
  }));
}

export async function getPopularCourses(limit: number = 5) {
  // Por ahora simulamos popularidad con el orden del mock
  // En producción se usaría un campo 'views' o 'enrolledStudents'
  return [...MOCK_COURSES]
    .sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
    .slice(0, limit);
}