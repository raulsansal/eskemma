// app/blog/admin/tags/page.tsx
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import Link from "next/link";

interface TagData {
  tag: string;
  count: number;
}

export default function TagsManagementPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "count">("count");

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
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
        setTags(data.tags);
      }
    } catch (error) {
      console.error("Error al cargar tags:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar tags
  const filteredTags = tags
    .filter((tag) =>
      tag.tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.tag.localeCompare(b.tag);
      }
      return b.count - a.count;
    });

  const totalUsage = tags.reduce((sum, tag) => sum + tag.count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bluegreen-eske mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-eske to-yellow-eske text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Gestión de Tags 🏷️</h2>
        <p className="text-orange-eske-70">
          Administra las etiquetas de tu blog y analiza su uso
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">
                Total Tags
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {tags.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-bluegreen-eske rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
          </div>
        </div>

        <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">
                Usos Totales
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {totalUsage}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-eske rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">
                Promedio Uso
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {tags.length > 0 ? (totalUsage / tags.length).toFixed(1) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-eske rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
              />
            </div>
          </div>

          {/* Ordenar */}
          <div className="md:w-64">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "count")}
              className="w-full px-4 py-3 border border-gray-eske-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske focus:border-transparent"
            >
              <option value="count">Más usados</option>
              <option value="name">Orden alfabético</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tags */}
      <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 overflow-hidden">
        {filteredTags.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-eske-40"
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No se encontraron tags
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Intenta con otro término de búsqueda"
                : "Comienza agregando tags a tus posts"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredTags.map((tag) => {
              const percentage = (tag.count / totalUsage) * 100;

              return (
                <div
                  key={tag.tag}
                  className="p-4 border border-gray-eske-30 rounded-lg hover:border-bluegreen-eske hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-800 group-hover:text-bluegreen-eske transition-colors">
                      #{tag.tag}
                    </span>
                    <span className="px-3 py-1 bg-bluegreen-eske-10 text-bluegreen-eske text-sm font-bold rounded-full">
                      {tag.count}
                    </span>
                  </div>

                  <div className="w-full bg-gray-eske-20 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="h-full bg-bluegreen-eske rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{percentage.toFixed(1)}% del total</span>
                    <Link
                      href={`/blog?search=${encodeURIComponent(tag.tag)}`}
                      target="_blank"
                      className="text-bluegreen-eske hover:text-bluegreen-eske-70 font-medium"
                    >
                      Ver posts →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}