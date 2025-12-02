// app/blog/[slug]/CommentList.tsx
"use client";

import CommentItem from "./CommentItem";
import { CommentWithReplies } from "@/types/post.types";

interface CommentListProps {
  comments: CommentWithReplies[];
  postId: string;
  currentUserId?: string;
  onCommentDeleted: (commentId: string) => void;
  onReply?: (parentId: string, content: string) => void; // ✅ NUEVO
}

export default function CommentList({
  comments,
  postId,
  currentUserId,
  onCommentDeleted,
  onReply,
}: CommentListProps) {
  return (
    <div className="space-y-4">
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

