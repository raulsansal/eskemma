// app/blog/[slug]/RelatedPosts.tsx
import Link from "next/link";
import { getCategoryColor, getCategoryLabel } from "@/lib/constants/categories";
import type { RelatedPost } from "@/lib/server/posts.server"; // ✅ IMPORTAR EL TIPO

interface RelatedPostsProps {
  posts: RelatedPost[]; // ✅ Usa el tipo importado
  currentCategory: string;
}

export default function RelatedPosts({
  posts,
  currentCategory,
}: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  const categoryColor = getCategoryColor(currentCategory);
  const categoryLabel = getCategoryLabel(currentCategory);

  return (
    <section className="mt-16 pt-8 border-t border-gray-eske-30">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Posts relacionados
        </h2>
        <p className="text-sm text-gray-600">
          Más sobre{" "}
          <span
            className="inline-block px-2 py-1 text-xs font-semibold rounded-full text-white"
            style={{ backgroundColor: categoryColor }}
          >
            {categoryLabel}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col bg-white-eske border border-gray-eske-30 rounded-lg hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Imagen */}
            {post.featureImage ? (
              <img
                src={post.featureImage}
                alt={post.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div
                className="w-full h-40 flex items-center justify-center"
                style={{ backgroundColor: categoryColor + "20" }}
              >
                <svg
                  className="w-16 h-16 opacity-30"
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
            <div className="p-4 flex-1 flex flex-col">
              {/* Badge de categoría */}
              <div className="mb-3">
                <span
                  className="inline-block px-2 py-1 text-xs font-semibold rounded-full text-white"
                  style={{ backgroundColor: categoryColor }}
                >
                  {categoryLabel}
                </span>
              </div>

              {/* Título */}
              <h3 className="text-base font-semibold text-gray-800 group-hover:text-bluegreen-eske transition-colors line-clamp-2 mb-2">
                {post.title}
              </h3>

              {/* Fecha */}
              <p className="text-xs text-gray-600 mt-auto">
                {post.updatedAt.toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}