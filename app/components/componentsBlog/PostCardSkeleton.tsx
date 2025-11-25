// app/components/componentsBlog/PostCardSkeleton.tsx
"use client";

export default function PostCardSkeleton() {
  return (
    <div className="flex flex-col items-center text-center bg-white-eske rounded-lg shadow-md p-6 animate-pulse">
      {/* Skeleton de imagen */}
      <div className="w-full h-48 bg-gray-eske-20 rounded-lg mb-4"></div>

      {/* Skeleton de título */}
      <div className="w-full mb-2">
        <div className="h-6 bg-gray-eske-20 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-6 bg-gray-eske-20 rounded w-1/2 mx-auto"></div>
      </div>

      {/* Skeleton de excerpt */}
      <div className="w-full mb-4 space-y-2">
        <div className="h-4 bg-gray-eske-10 rounded w-full"></div>
        <div className="h-4 bg-gray-eske-10 rounded w-5/6 mx-auto"></div>
        <div className="h-4 bg-gray-eske-10 rounded w-4/6 mx-auto"></div>
      </div>

      {/* Skeleton de metadata (fecha y autor) */}
      <div className="flex justify-between w-full mb-4 px-2">
        <div className="h-4 bg-gray-eske-20 rounded w-24"></div>
        <div className="h-4 bg-gray-eske-20 rounded w-20"></div>
      </div>

      {/* Skeleton de botón */}
      <div className="w-full h-10 bg-gray-eske-20 rounded-lg"></div>
    </div>
  );
}