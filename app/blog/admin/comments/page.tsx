// app/blog/admin/comments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import CommentFilters from "../components/CommentFilters";
import CommentsTable from "../components/CommentsTable";

interface CommentData {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  author: {
    uid: string;
    displayName: string;
    photoURL?: string | null;
  };
  createdAt: string;
  moderationStatus: "pending" | "approved" | "rejected";
  isApproved: boolean;
  parentId?: string | null;
}

interface CommentCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function CommentsManagementPage() {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [counts, setCounts] = useState<CommentCounts>({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Filtros
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadComments();
  }, [currentPage, statusFilter, searchTerm]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const params = new URLSearchParams({
        page: currentPage.toString(),
        status: statusFilter,
        search: searchTerm,
      });

      const response = await fetch(`/api/admin/comments?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setTotalPages(data.pagination.totalPages);
        setTotalComments(data.pagination.totalComments);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commentId: string, postId: string, action: "approve" | "reject" | "pending") => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, action }),
      });

      if (response.ok) {
        // Recargar comentarios
        loadComments();
      } else {
        alert("Error al actualizar el comentario");
      }
    } catch (error) {
      console.error("Error al actualizar comentario:", error);
      alert("Ocurrió un error al actualizar el comentario");
    }
  };

  const handleDelete = async (commentId: string, postId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/admin/comments/${commentId}?postId=${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadComments();
      } else {
        alert("Error al eliminar el comentario");
      }
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      alert("Ocurrió un error al eliminar el comentario");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-eske to-bluegreen-eske text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Gestión de Comentarios</h2>
        <p className="text-green-eske-10">
          Modera, aprueba o rechaza comentarios del blog
        </p>
      </div>

      {/* Filtros */}
      <CommentFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={counts}
      />

      {/* Tabla de Comentarios */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bluegreen-eske mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando comentarios...</p>
          </div>
        </div>
      ) : (
        <>
          <CommentsTable
            comments={comments}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white-eske rounded-lg shadow-md border border-gray-eske-30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Mostrando {comments.length} de {totalComments} comentarios
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-eske-20 text-gray-800 rounded-lg hover:bg-gray-eske-30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-bluegreen-eske text-white rounded-lg hover:bg-bluegreen-eske-70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}