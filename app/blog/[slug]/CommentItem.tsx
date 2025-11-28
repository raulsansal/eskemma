// app/blog/[slug]/CommentItem.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/firebase/firebaseConfig"; // ✅ AGREGAR
import { Comment } from "@/types/post.types";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  onDeleted: (commentId: string) => void;
}

export default function CommentItem({
  comment,
  postId,
  currentUserId,
  onDeleted,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isOwner = currentUserId === comment.author.uid;
  const isAdmin = user?.role === "admin";
  const canDelete = isOwner || isAdmin;

  // ✅ FUNCIÓN PARA OBTENER INICIALES (igual que en Header)
  const getInitials = (displayName: string): string => {
    const nameParts = displayName.trim().split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "hace un momento";
    if (diffInSeconds < 3600)
      return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400)
      return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800)
      return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 2592000)
      return `hace ${Math.floor(diffInSeconds / 604800)} semanas`;

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);

    try {
      // ✅ CORRECCIÓN: Obtener token de auth.currentUser
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(
        `/api/posts/comments/${comment.id}?postId=${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar comentario");
      }

      onDeleted(comment.id);
    } catch (error: any) {
      console.error("Error al eliminar comentario:", error);
      alert(error.message || "Error al eliminar comentario");
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="bg-white-eske border border-gray-eske-30 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.author.photoURL ? (
            <img
              src={comment.author.photoURL}
              alt={comment.author.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-bluegreen-eske flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(comment.author.displayName)}
            </div>
          )}
        </div>

        {/* Contenido del comentario */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold text-gray-800">
                {comment.author.displayName}
              </span>
              <span className="text-sm text-gray-600 ml-2">
                {getTimeAgo(comment.createdAt)}
              </span>
            </div>

            {canDelete && !showConfirmDelete && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                disabled={isDeleting}
              >
                Eliminar
              </button>
            )}
          </div>

          <p className="text-gray-700 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {showConfirmDelete && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-3">
                ¿Estás seguro de que deseas eliminar este comentario?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

