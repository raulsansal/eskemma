// types/course.types.ts
// ============================================================
// TIPOS PARA CURSOS Y TALLERES ESKEMMA
// Versión: 1.0.1
// Fecha: Marzo 2026
// Cambios: content en CourseSession ahora es opcional
// ============================================================

import type { UserRole } from "./subscription.types";

// ============================================================
// TIPOS BASE
// ============================================================

export type CourseStatus = "draft" | "published" | "archived";
export type CourseType = "course" | "workshop" | "masterclass";
export type ContentType = "video" | "text" | "exercise" | "quiz" | "downloadable";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// ============================================================
// ESTRUCTURA DE UN CURSO/TALLER
// ============================================================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: CourseType;
  difficulty: DifficultyLevel;
  
  // Metadatos
  author: {
    uid: string;
    displayName: string;
    email: string;
  };
  featuredImage?: string;
  thumbnail?: string;
  
  // Duración estimada (en minutos)
  estimatedDuration: number;
  
  // Nivel de acceso requerido
  requiredRole: UserRole | "public";
  
  // Estadísticas
  enrolledStudents: number;
  completionRate: number;
  averageRating: number;
  
  // Fechas
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Estado
  status: CourseStatus;
  
  // Relaciones
  modules: CourseModule[];
  tags?: string[];
  category: string;
  
  // Recursos adicionales
  resources?: CourseResource[];
}

// ============================================================
// MÓDULO DE CURSO
// ============================================================

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  sessions: CourseSession[];
  estimatedDuration: number;
}

// ============================================================
// SESIÓN DE CURSO
// ============================================================

export interface CourseSession {
  id: string;
  title: string;
  description?: string;
  order: number;
  
  // Contenido (ahora opcional porque vive en archivos MDX separados)
  content?: string;
  
  // Tipo de contenido
  contentType: ContentType[];
  
  // Recursos específicos de la sesión
  resources?: SessionResource[];
  
  // Ejercicios prácticos
  exercises?: SessionExercise[];
  
  // Duración estimada (minutos)
  estimatedDuration: number;
  
  // Requisitos (sesiones que deben completarse antes)
  prerequisites?: string[];
  
  // Progreso del usuario (se llena en runtime)
  completed?: boolean;
  completionDate?: Date;
}

// ============================================================
// RECURSOS DESCARGABLES
// ============================================================

export interface CourseResource {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "xlsx" | "docx" | "zip" | "ipynb" | "csv" | "code";
  fileSize: string;
  fileStoragePath: string;
  isFree: boolean;
  requiredRole?: UserRole;
}

export interface SessionResource extends CourseResource {
  sessionId: string;
}

// ============================================================
// EJERCICIOS PRÁCTICOS
// ============================================================

export interface SessionExercise {
  id: string;
  title: string;
  description: string;
  type: "code" | "quiz" | "analysis" | "upload" | "api-call";
  
  // Configuración según tipo
  codeConfig?: {
    language: "python" | "javascript" | "r";
    initialCode: string;
    solution?: string;
    testCases?: TestCase[];
  };
  
  quizConfig?: {
    questions: QuizQuestion[];
    passingScore: number;
  };
  
  uploadConfig?: {
    allowedTypes: string[];
    maxSize: number; // en MB
  };
  
  apiConfig?: {
    apiType: "twitter" | "googleCivic" | "ine" | "custom";
    endpoint?: string;
    exampleResponse?: any;
  };
  
  // Evaluación
  points?: number;
  isRequired: boolean;
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  description: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

// ============================================================
// PROGRESO DEL USUARIO
// ============================================================

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  
  // Progreso general
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  completionPercentage: number;
  
  // Progreso por sesión
  sessionsCompleted: {
    sessionId: string;
    completedAt: Date;
    exercisesCompleted?: string[];
  }[];
  
  // Datos del usuario para el taller
  userData?: {
    uploadedFile?: {
      path: string;
      name: string;
      uploadedAt: Date;
    };
    apiKeys?: {
      twitter?: string; // cifrado
      googleCivic?: string; // cifrado
    };
  };
  
  // Notas y bookmarks
  bookmarks?: string[]; // IDs de sesiones guardadas
  notes?: {
    sessionId: string;
    content: string;
    createdAt: Date;
  }[];
}

// ============================================================
// VERSIONES PARA LISTADOS (más ligeras)
// ============================================================

export interface CourseCardItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: CourseType;
  difficulty: DifficultyLevel;
  thumbnail?: string;
  estimatedDuration: number;
  enrolledStudents: number;
  requiredRole: UserRole | "public";
  category: string;
  tags?: string[];
}

export interface CourseInProgress extends CourseCardItem {
  progress: number;
  lastAccessedAt: Date;
  nextSession?: {
    moduleId: string;
    sessionId: string;
    title: string;
  };
}