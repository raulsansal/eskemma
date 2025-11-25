// app/page.tsx
import { adminDb } from "@/lib/firebase-admin";
import { BlogPost } from "@/types/post.types";
import HomeClient from "./HomeClient";
import PublicModeHandler from "./PublicModeHandler";

export const dynamic = "force-dynamic"; // Forzar SSR

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const postsSnapshot = await adminDb
      .collection("posts")
      .where("status", "==", "published")
      .orderBy("updatedAt", "desc")
      .limit(3)
      .get();

    const posts: BlogPost[] = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Sin título",
        slug: data.slug || "",
        content: data.content || "",
        category: data.category || "general",
        featureImage: data.featureImage,
        updatedAt: data.updatedAt?.toDate() || new Date(),
        author: data.author,
        status: data.status,
        tags: data.tags || [],
      };
    });

    return posts;
  } catch (error) {
    console.error("Error al cargar posts del blog:", error);
    return [];
  }
}

export default async function HomePage() {
  const blogPosts = await getBlogPosts();

  return (
    <>
      <PublicModeHandler />
      <HomeClient blogPosts={blogPosts} />
    </>
  );
}