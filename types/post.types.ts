// types/post.types.ts

/**
 * Interfaz para imágenes secundarias con metadata
 */
export interface SecondaryImage {
  id: string; // ID único generado
  url: string; // URL de Firebase Storage
  filename: string; // Nombre original del archivo
  uploadedAt: Date; // Fecha de subida
  insertedInContent: boolean; // Si ya está en el markdown
  size?: number; // Tamaño en bytes (opcional)
}

/**
 * Interfaz base para crear/editar posts
 */
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
  secondaryImages?: SecondaryImage[]; // Array de imágenes secundarias
}

/**
 * Interfaz completa de un post (incluye metadata de Firestore)
 */
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

/**
 * Interfaz para la página principal del blog
 */
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
  category: string;
  fileType: "pdf" | "xlsx" | "docx" | "zip" | "pptx";
  fileSize: string;
  thumbnail?: string;
  fileStoragePath: string;
  isFree: boolean;
  price?: number;
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

/**
 * Interfaz extendida para comentarios con respuestas anidadas
 */
export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
  parentId?: string | null;
  isApproved?: boolean;
  moderationStatus?: "pending" | "approved" | "rejected";
}

/**
 * Interfaz para recursos con posts relacionados manualmente
 */
export interface DownloadableResourceExtended extends DownloadableResource {
  relatedPosts?: string[];
}

/**
 * Interfaz para notificaciones
 */
export interface Notification {
  id: string;
  userId: string;
  type: "comment_reply" | "comment_mention" | "resource_download";
  message: string;
  postId?: string;
  postSlug?: string;
  commentId?: string;
  isRead: boolean;
  createdAt: Date;
}