// app/components/componentsBlog/PostsLoadingGrid.tsx
"use client";

import PostCardSkeleton from "./PostCardSkeleton";

interface PostsLoadingGridProps {
  count?: number;
}

export default function PostsLoadingGrid({ count = 6 }: PostsLoadingGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {Array.from({ length: count }, (_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}