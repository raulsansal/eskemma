// app/blog/admin/components/PopularTags.tsx
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import Link from "next/link";

interface TagData {
  tag: string;
  count: number;
}

export default function PopularTags() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/tags", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTags(data.tags.slice(0, 10)); // Top 10 tags
      }
    } catch (error) {
      console.error("Error al cargar tags:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Tags Populares</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-eske-20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...tags.map((t) => t.count));

  return (
    <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-bluegreen-eske"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Tags Populares
        </h3>
        <Link
          href="/blog/admin/tags"
          className="text-sm text-bluegreen-eske hover:text-bluegreen-eske-70 font-semibold"
        >
          Ver todos →
        </Link>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-eske-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <p>No hay tags aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tags.map((tag, index) => {
            const percentage = (tag.count / maxCount) * 100;
            const colorClasses = [
              "bg-bluegreen-eske",
              "bg-blue-eske",
              "bg-green-eske",
              "bg-orange-eske",
              "bg-yellow-eske",
            ];
            const color = colorClasses[index % colorClasses.length];

            return (
              <div key={tag.tag} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 group-hover:text-bluegreen-eske transition-colors">
                    #{tag.tag}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {tag.count}
                  </span>
                </div>
                <div className="w-full bg-gray-eske-20 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}