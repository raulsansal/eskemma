// app/components/componentsBlog/Sidebar.tsx
import { Suspense } from "react";
import { PopularPostItem, TagItem, CategoryCount } from "@/types/post.types";
import PopularPosts from "./PopularPosts";
import CategoryList from "./CategoryList";
import TagCloud from "./TagCloud";
import NewsletterSignup from "./NewsletterSignup";

interface SidebarProps {
  popularPosts: PopularPostItem[];
  categoryCounts: CategoryCount;
  tags: TagItem[];
}

export default function Sidebar({
  popularPosts,
  categoryCounts,
  tags,
}: SidebarProps) {
  return (
    <aside
      className="space-y-6"
      aria-label="Barra lateral del blog con contenido complementario"
    >
      <PopularPosts posts={popularPosts} />
      {/* Suspense requerido por useSearchParams en CategoryList */}
      <Suspense fallback={null}>
        <CategoryList categoryCounts={categoryCounts} />
      </Suspense>
      <TagCloud tags={tags} />
      <NewsletterSignup />
    </aside>
  );
}
