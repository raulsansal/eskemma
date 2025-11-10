// lib/constants/categories.ts

export interface Category {
  id: string;
  label: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'analisis', label: 'Análisis', color: '#E8624A' },
  { id: 'tactica', label: 'Táctica', color: '#E8B64A' },
  { id: 'comunicacion-politica', label: 'Comunicación Política', color: '#72B84B' },
  { id: 'estrategia', label: 'Estrategia', color: '#4BB8A2' },
  { id: 'investigacion-cualitativa', label: 'Investigación Cualitativa', color: '#50A3C7' },
  { id: 'investigacion-cuantitativa', label: 'Investigación Cuantitativa', color: '#323A99' },
  { id: 'gerencia-electoral', label: 'Gerencia Electoral', color: '#7E3299' },
  { id: 'entrenamiento', label: 'Entrenamiento', color: '#C891DB' },
];

/**
 * Obtiene el color de una categoría por su ID
 */
export function getCategoryColor(categoryId: string): string {
  const category = CATEGORIES.find((cat) => cat.id === categoryId);
  return category?.color || '#CCCCCC'; // Color gris por defecto si no existe
}

/**
 * Obtiene el label de una categoría por su ID
 */
export function getCategoryLabel(categoryId: string): string {
  const category = CATEGORIES.find((cat) => cat.id === categoryId);
  return category?.label || 'Sin categoría';
}

/**
 * Verifica si un post es "nuevo" (publicado en los últimos 30 días)
 */
export function isNewPost(date: Date): boolean {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return date >= thirtyDaysAgo;
}