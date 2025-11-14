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