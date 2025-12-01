// app/blog/[slug]/PostSidebar.tsx
import TableOfContents from "./TableOfContents";
import NewsletterSignup from "../../components/componentsBlog/NewsletterSignup";
import RelatedPostsSidebar from "./RelatedPostsSidebar";
import DownloadableResources from "./DownloadableResources";
import { RelatedPostSidebar, DownloadableResource } from "@/types/post.types";

interface PostSidebarProps {
  headings: Array<{ level: number; text: string; id: string }>;
  relatedPosts: RelatedPostSidebar[];
  resources: DownloadableResource[];
  currentCategory: string;
}

export default function PostSidebar({
  headings,
  relatedPosts,
  resources,
  currentCategory,
}: PostSidebarProps) {
  return (
    <aside className="hidden lg:block lg:w-1/3">
      <div className="sticky top-24 space-y-6">
        {/* 1. Tabla de contenidos */}
        {headings.length > 0 && <TableOfContents headings={headings} />}

        {/* 2. Newsletter */}
        <NewsletterSignup />

        {/* 3. Posts relacionados */}
        {relatedPosts.length > 0 && (
          <RelatedPostsSidebar
            posts={relatedPosts}
            currentCategory={currentCategory}
          />
        )}

        {/* 4. Recursos descargables */}
        {resources.length > 0 && (
          <DownloadableResources
            resources={resources}
            category={currentCategory}
          />
        )}
      </div>
    </aside>
  );
}