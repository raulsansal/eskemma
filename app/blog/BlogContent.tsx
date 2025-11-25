// app/blog/BlogContent.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import BlogToolbar from "../components/componentsBlog/BlogToolbar";
import PostCardList from "../components/componentsBlog/PostCardList";
import { ViewMode } from "../components/componentsBlog/ViewToggle";

interface Post {
  id: string;
  title: string;
  date: Date;
  excerpt: string;
  slug: string;
  author: string;
  featureImage?: string;
  category: string;
  views: number;
}

interface BlogContentProps {
  posts: Post[];
  sortBy: string;
}

export default function BlogContent({ posts, sortBy }: BlogContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <>
      {/* Barra de herramientas con ViewToggle */}
      <BlogToolbar onViewChange={(view) => setViewMode(view)} />

      {/* Posts en modo Grid o Lista */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-xl text-gray-eske-60 mb-2">
            No se encontraron resultados
          </p>
          <p className="text-gray-500 mb-4">
            Intenta ajustar los filtros o términos de búsqueda
          </p>
          <Link
            href="/blog"
            className="inline-block px-6 py-2 bg-bluegreen-eske text-white-eske rounded-lg hover:bg-bluegreen-eske-70 transition-colors duration-300"
          >
            Limpiar filtros
          </Link>
        </div>
      ) : (
        <>
          {/* Vista Grid (2 columnas en desktop, 1 en móvil - siempre centrado) */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {posts.map(
                ({
                  id,
                  title,
                  date,
                  excerpt,
                  slug,
                  author,
                  featureImage,
                  views,
                  category,
                }) => (
                  <div
                    key={id}
                    className="flex flex-col items-center text-center bg-white-eske rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
                  >
                    {featureImage && (
                      <img
                        src={featureImage}
                        alt={`Imagen destacada para ${title}`}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}

                    <h3 className="text-xl text-bluegreen-eske-60 font-semibold mb-2 hover:text-bluegreen-eske transition-colors duration-300">
                      <Link href={`/blog/${slug}`}>{title}</Link>
                    </h3>

                    <div
                      className="text-[16px] font-light text-gray-eske-90 mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: excerpt }}
                    />

                    <div className="flex justify-between w-full text-sm text-gray-700 mb-4 px-2">
                      <small className="text-gray-eske-60">
                        {date.toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </small>
                      <small className="text-bluegreen-eske font-medium">
                        {author}
                      </small>
                    </div>

                    {sortBy === "popular" && (
                      <div className="w-full text-xs text-gray-500 mb-2 flex items-center justify-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {views} {views === 1 ? "vista" : "vistas"}
                      </div>
                    )}

                    <Link
                      href={`/blog/${slug}`}
                      className="block text-center w-full bg-bluegreen-eske text-white-eske py-2 rounded-lg font-medium hover:bg-bluegreen-eske-70 transition-all duration-300 text-[14px]"
                    >
                      Leer completo →
                    </Link>
                  </div>
                )
              )}
            </div>
          )}

          {/* Vista Lista (1 columna - layout horizontal en móvil y desktop) */}
          {viewMode === "list" && (
            <div className="space-y-6 mb-8">
              {posts.map((post) => (
                <PostCardList key={post.id} {...post} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}