// app/blog/[slug]/BackToButton.tsx
"use client";

import Link from "next/link";

export default function BackToButton() {
  return (
    <div className="mb-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-bluegreen-eske hover:text-bluegreen-eske-70 transition-colors duration-200 font-medium focus-ring-primary rounded"
        aria-label="Volver a la página principal del blog"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Volver al blog</span>
      </Link>
    </div>
  );
}
