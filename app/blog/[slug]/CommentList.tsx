// app/blog/[slug]/CommentList.tsx
"use client";

import CommentItem from "./CommentItem";
import { Comment } from "@/types/post.types";

interface CommentListProps {
  comments: Comment[];
  postId: string;
  currentUserId?: string;
  onCommentDeleted: (commentId: string) => void;
}

export default function CommentList({
  comments,
  postId,
  currentUserId,
  onCommentDeleted,
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
        />
      ))}
    </div>
  );
}