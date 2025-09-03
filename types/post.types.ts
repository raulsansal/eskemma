// types/post.types.ts
export interface BasePostData {
  title: string;
  date?: Date;
  content: string;
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