// app/blog/admin/components/CommentsTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import CommentModal from "./CommentModal";

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

interface CommentsTableProps {
  comments: CommentData[];
  onStatusChange: (commentId: string, postId: string, action: "approve" | "reject" | "pending") => void;
  onDelete: (commentId: string, postId: string) => void;
}

export default function CommentsTable({
  comments,
  onStatusChange,
  onDelete,
}: CommentsTableProps) {
  const [selectedComment, setSelectedComment] = useState<CommentData | null>(null);

  if (comments.length === 0) {
    return (
      <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 p-12 text-center">
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay comentarios</h3>
        <p className="text-gray-600">No se encontraron comentarios con los filtros seleccionados</p>
      </div>
    );
  }

  const getStatusBadge = (status: "pending" | "approved" | "rejected") => {
    const styles = {
      pending: "bg-yellow-eske-20 text-yellow-eske-90",
      approved: "bg-green-eske-20 text-green-eske-90",
      rejected: "bg-red-eske-20 text-red-eske-90",
    };

    const labels = {
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
    };

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white-eske rounded-xl shadow-md border border-gray-eske-30 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-eske-20 border-b border-gray-eske-30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Comentario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-eske-30">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-eske-10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {comment.author.photoURL ? (
                        <img
                          src={comment.author.photoURL}
                          alt={comment.author.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-bluegreen-eske rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {comment.author.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {comment.author.displayName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* ✅ CLICKEABLE para abrir modal */}
                    <button
                      onClick={() => setSelectedComment(comment)}
                      className="text-sm text-gray-700 line-clamp-2 max-w-md text-left hover:text-bluegreen-eske hover:underline transition-colors"
                    >
                      {comment.content}
                    </button>
                    <p className="text-xs text-bluegreen-eske mt-1 font-medium">
                      Clic para ver completo
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/blog/admin/blog/edit/${comment.postId}`}
                      className="text-sm text-bluegreen-eske hover:text-bluegreen-eske-70 font-medium line-clamp-1 max-w-xs block"
                    >
                      {comment.postTitle}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(comment.moderationStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(comment.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {comment.moderationStatus !== "approved" && (
                        <button
                          onClick={() => onStatusChange(comment.id, comment.postId, "approve")}
                          className="p-2 text-green-eske hover:bg-green-eske-20 rounded-lg transition-colors"
                          title="Aprobar"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                      {comment.moderationStatus !== "rejected" && (
                        <button
                          onClick={() => onStatusChange(comment.id, comment.postId, "reject")}
                          className="p-2 text-red-eske hover:bg-red-eske-20 rounded-lg transition-colors"
                          title="Rechazar"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(comment.id, comment.postId)}
                        className="p-2 text-gray-600 hover:bg-red-eske-20 hover:text-red-eske rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-eske-30">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {comment.author.photoURL ? (
                    <img
                      src={comment.author.photoURL}
                      alt={comment.author.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-bluegreen-eske rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {comment.author.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {comment.author.displayName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(comment.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(comment.moderationStatus)}
              </div>

              {/* Content - Clickeable */}
              <button
                onClick={() => setSelectedComment(comment)}
                className="text-sm text-gray-700 text-left w-full hover:text-bluegreen-eske transition-colors"
              >
                <p className="line-clamp-3">{comment.content}</p>
                <p className="text-xs text-bluegreen-eske mt-1 font-medium">
                  Toca para ver completo
                </p>
              </button>

              {/* Post Link */}
              <Link
                href={`/blog/admin/blog/edit/${comment.postId}`}
                className="text-sm text-bluegreen-eske hover:text-bluegreen-eske-70 font-medium block"
              >
                📄 {comment.postTitle}
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {comment.moderationStatus !== "approved" && (
                  <button
                    onClick={() => onStatusChange(comment.id, comment.postId, "approve")}
                    className="flex-1 px-4 py-2 bg-green-eske text-white rounded-lg hover:bg-green-eske-70 transition-colors text-sm font-semibold"
                  >
                    ✓ Aprobar
                  </button>
                )}
                {comment.moderationStatus !== "rejected" && (
                  <button
                    onClick={() => onStatusChange(comment.id, comment.postId, "reject")}
                    className="flex-1 px-4 py-2 bg-red-eske text-white rounded-lg hover:bg-red-eske-70 transition-colors text-sm font-semibold"
                  >
                    ✗ Rechazar
                  </button>
                )}
                <button
                  onClick={() => onDelete(comment.id, comment.postId)}
                  className="px-4 py-2 bg-gray-eske-40 text-gray-800 rounded-lg hover:bg-red-eske-20 hover:text-red-eske transition-colors text-sm font-semibold"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedComment && (
        <CommentModal
          isOpen={true}
          onClose={() => setSelectedComment(null)}
          comment={selectedComment}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      )}
    </>
  );
}