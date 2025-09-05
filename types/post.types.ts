// types/post.types.ts

export interface BasePostData {
  title: string;
  date?: Date; // Opcional: permite drafts sin fecha definida
  content: string;
  tags?: string[];
  status: "draft" | "published";
  featureImage?: string;
  slug: string; // Obligatorio: necesario para generar URLs
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
  likes: number; // Obligatorio: valor predeterminado 0
  views: number; // Obligatorio: valor predeterminado 0
  createdAt: Date;
  updatedAt: Date;
}