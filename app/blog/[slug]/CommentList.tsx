// app/blog/[slug]/CommentList.tsx
"use client";

import CommentItem from "./CommentItem";
import { CommentWithReplies } from "@/types/post.types";

interface CommentListProps {
  comments: CommentWithReplies[];
  postId: string;
  currentUserId?: string;
  onCommentDeleted: (commentId: string) => void;
  onReply?: (parentId: string, content: string) => void;
}

export default function CommentList({
  comments,
  postId,
  currentUserId,
  onCommentDeleted,
  onReply,
}: CommentListProps) {
  return (
    <div
      className="space-y-4"
      role="list"
      aria-label={`Lista de ${comments.length} comentario${comments.length !== 1 ? "s" : ""}`}
    >
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUserId={currentUserId}
          onDeleted={onCommentDeleted}
          onReply={onReply}
        />
      ))}
    </div>
  );
}
