// lib/constants/resources.config.ts 

/**
   * Controla el comportamiento de vinculación de recursos con posts
   * 
   * USE_MANUAL_RESOURCES_ONLY:
   * - true:  SOLO muestra recursos vinculados manualmente via relatedPosts
   *          Si un post no tiene recursos vinculados, no muestra ninguno
   *          (Control total, ideal para curación de contenido)
   * 
   * - false: Si no hay suficientes recursos vinculados manualmente,
   *          completa automáticamente con recursos de la misma categoría
   *          (Modo híbrido, siempre muestra recursos)
   * 
   * Recomendación: Empieza con true para tener control total
   */

export const RESOURCES_CONFIG = {  
  USE_MANUAL_RESOURCES_ONLY: true, // ← Cambiar según necesites
};