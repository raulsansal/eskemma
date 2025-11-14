// app/components/componentsBlog/Sidebar.tsx
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

export default function Sidebar({ popularPosts, categoryCounts, tags }: SidebarProps) {
  return (
    <aside className="space-y-6">
      <PopularPosts posts={popularPosts} />
      <CategoryList categoryCounts={categoryCounts} />
      <TagCloud tags={tags} />
      <NewsletterSignup />
    </aside>
  );
}