// app/lib/types.ts
export interface BasePostData {
  title: string;
  date: Date; // Usar Date para representar fechas
  content: string;
  tags?: string[];
  status: "draft" | "published";
  featureImage?: string;
  slug: string; // Obligatorio
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
  likes: number; // Opcional
  views: number; // Opcional
  createdAt: Date;
  updatedAt: Date;
}