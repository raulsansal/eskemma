// app/blog/[slug]/PostNavigation.tsx
"use client";

import Link from "next/link";
import { getCategoryColor, getCategoryLabel } from "@/lib/constants/categories";

interface Post {
  slug: string;
  title: string;
  category: string;
  featureImage?: string | null;
}

interface PostNavigationProps {
  previous: Post | null;
  next: Post | null;
}

export default function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Post Anterior */}
      {previous ? (
        <Link
          href={`/blog/${previous.slug}`}
          className="group flex flex-col p-6 bg-white-eske border border-gray-eske-30 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-2 text-sm text-gray-800 font-medium mb-3">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Anterior</span>
          </div>

          {previous.featureImage && (
            <img
              src={previous.featureImage}
              alt={previous.title}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
          )}

          <div className="mb-2">
            <span
              className="inline-block px-2 py-1 text-xs font-semibold rounded-full text-white"
              style={{ backgroundColor: getCategoryColor(previous.category) }}
            >
              {getCategoryLabel(previous.category)}
            </span>
          </div>

          <h4 className="text-base font-semibold text-gray-800 group-hover:text-bluegreen-eske transition-colors line-clamp-2">
            {previous.title}
          </h4>
        </Link>
      ) : (
        <div className="hidden md:block"></div>
      )}

      {/* Post Siguiente */}
      {next && (
        <Link
          href={`/blog/${next.slug}`}
          className="group flex flex-col p-6 bg-white-eske border border-gray-eske-30 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-end gap-2 text-sm text-gray-800 font-medium mb-3">
            <span>Siguiente</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          {next.featureImage && (
            <img
              src={next.featureImage}
              alt={next.title}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
          )}

          <div className="mb-2 flex justify-end">
            <span
              className="inline-block px-2 py-1 text-xs font-semibold rounded-full text-white"
              style={{ backgroundColor: getCategoryColor(next.category) }}
            >
              {getCategoryLabel(next.category)}
            </span>
          </div>

          <h4 className="text-base font-semibold text-gray-800 group-hover:text-bluegreen-eske transition-colors line-clamp-2 text-right">
            {next.title}
          </h4>
        </Link>
      )}
    </div>
  );
}

