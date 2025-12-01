// app/blog/[slug]/RelatedPostsSidebar.tsx
import Link from "next/link";
import { getCategoryColor, getCategoryLabel } from "@/lib/constants/categories";
import { RelatedPostSidebar } from "@/types/post.types";

interface RelatedPostsSidebarProps {
  posts: RelatedPostSidebar[];
  currentCategory: string;
}

export default function RelatedPostsSidebar({
  posts,
  currentCategory,
}: RelatedPostsSidebarProps) {
  const categoryColor = getCategoryColor(currentCategory);
  const categoryLabel = getCategoryLabel(currentCategory);

  return (
    <div className="bg-white-eske rounded-lg shadow-sm p-6 border border-gray-eske-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-bluegreen-eske"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Posts relacionados
        </h3>
      </div>

      <p className="text-xs text-gray-600 mb-4">
        Más sobre{" "}
        <span
          className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryLabel}
        </span>
      </p>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex gap-3 hover:bg-gray-eske-10 p-2 rounded-lg transition-colors"
          >
            {/* Thumbnail */}
            {post.featureImage ? (
              <img
                src={post.featureImage}
                alt={post.title}
                className="w-20 h-20 object-cover rounded flex-shrink-0 group-hover:opacity-80 transition-opacity"
              />
            ) : (
              <div
                className="w-20 h-20 flex items-center justify-center rounded flex-shrink-0"
                style={{ backgroundColor: categoryColor + "20" }}
              >
                <svg
                  className="w-8 h-8 opacity-40"
                  style={{ color: categoryColor }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-800 group-hover:text-bluegreen-eske transition-colors line-clamp-2 mb-1">
                {post.title}
              </h4>
              <p className="text-xs text-gray-600">
                {post.updatedAt.toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Ver más */}
      <Link
        href="/blog"
        className="block mt-4 text-center text-sm text-bluegreen-eske hover:text-bluegreen-eske-70 font-medium transition-colors"
      >
        Ver más artículos →
      </Link>
    </div>
  );
}