// app/blog/[slug]/PostSidebar.tsx
import TableOfContents from "./TableOfContents";
import NewsletterSignup from "../../components/componentsBlog/NewsletterSignup";
import RelatedPostsSidebar from "./RelatedPostsSidebar";
import ResourcesCard from "./ResourcesCard";
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
    <aside 
      className="hidden lg:block lg:w-1/3"
      aria-label="Barra lateral con contenido complementario del artículo"
    >
      <div className="space-y-6">
        {/* 1. Tabla de contenidos */}
        {headings.length > 0 && <TableOfContents headings={headings} />}

        {/* 2. Newsletter */}
        <NewsletterSignup />        

        {/* 3. Recursos descargables */}
        {resources.length > 0 && (
          <ResourcesCard
            resources={resources}
            category={currentCategory}
          />
        )}

        {/* 4. Posts relacionados */}
        {relatedPosts.length > 0 && (
          <RelatedPostsSidebar
            posts={relatedPosts}
            currentCategory={currentCategory}
          />
        )}
      </div>
    </aside>
  );
}