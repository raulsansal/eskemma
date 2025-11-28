// app/blog/[slug]/CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { Comment } from "@/types/post.types";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, setIsLoginModalOpen } = useAuth(); // ✅ AGREGAR setIsLoginModalOpen
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/posts/comments?postId=${postId}`);

      if (!response.ok) {
        throw new Error("Error al cargar comentarios");
      }

      const data = await response.json();
      const formattedComments = data.comments.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments([newComment, ...comments]);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  return (
    <section className="mt-16 pt-8 border-t border-gray-eske-30">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Comentarios ({comments.length})
      </h2>

      {/* Formulario para comentar */}
      {user ? (
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="bg-gray-eske-10 border border-gray-eske-30 rounded-lg p-6 mb-8 text-center">
          <p className="text-gray-700 mb-4">
            Inicia sesión para dejar un comentario
          </p>          
          <button
            onClick={() => setIsLoginModalOpen(true)} // ✅ CORRECCIÓN
            className="px-6 py-2 bg-bluegreen-eske text-white rounded-lg hover:bg-bluegreen-eske-70 transition-colors font-semibold"
          >
            Iniciar sesión
          </button>
        </div>
      )}

      {/* Lista de comentarios */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando comentarios...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p>Sé el primero en comentar</p>
        </div>
      ) : (
        <CommentList
          comments={comments}
          postId={postId}
          currentUserId={user?.uid}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </section>
  );
}