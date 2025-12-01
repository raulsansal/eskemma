// types/post.types.ts
export interface BasePostData {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  status: "draft" | "published";
  featureImage?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface PostData extends BasePostData {
  id: string;
  author: {
    uid: string;
    displayName: string;
    email: string;
  };
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Interfaz para la página principal del blog
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  featureImage?: string;
  updatedAt: Date;
  author?: {
    uid: string;
    displayName: string;
    email: string;
  };
  status: string;
  tags?: string[];
}

// ✅ NUEVAS INTERFACES PARA EL SIDEBAR

/**
 * Interfaz para posts populares en el sidebar
 */
export interface PopularPostItem {
  id: string;
  title: string;
  slug: string;
  views: number;
  featureImage?: string;
}

/**
 * Interfaz para tags con contador
 */
export interface TagItem {
  tag: string;
  count: number;
}

/**
 * Interfaz para conteo de categorías
 */
export interface CategoryCount {
  [categoryId: string]: number;
}

/**
 * Interfaz para comentarios
 */
export interface Comment {
  id: string;
  content: string;
  author: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  createdAt: Date;
  postId: string;
}

/**
 * Interfaz para posts guardados
 */
export interface SavedPost {
  postId: string;
  savedAt: Date;
  postTitle: string;
  postSlug: string;
}

/**
 * Interfaz para recursos descargables
 */
export interface DownloadableResource {
  id: string;
  title: string;
  description: string;
  category: string; // Relacionado con categoría del post
  fileType: "pdf" | "xlsx" | "docx" | "zip" | "pptx";
  fileSize: string; // "2.5 MB"
  thumbnail?: string;
  fileStoragePath: string; // Ruta en Firebase Storage
  isFree: boolean; // Si es $0.00
  price?: number; // Precio si no es gratis
  accessLevel: Array<"user" | "basic" | "premium" | "grupal" | "admin">;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "inactive";
}

/**
 * Interfaz para posts relacionados en sidebar (versión compacta)
 */
export interface RelatedPostSidebar {
  id: string;
  slug: string;
  title: string;
  category: string;
  featureImage?: string;
  updatedAt: Date;
}