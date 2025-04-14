"use client";

import { formatDistanceToNow } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { CommentEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/comment_pb";
import Comment from "./Comment";

export interface Comment {
  id: bigint;
  user_id: bigint;
  dest_id: bigint;
  body: string;
  upvote: number;
  downvote: number;
  score: number;
  dateCreated: Date;
  dateUpdated?: Date;
  resources?: string[];
}

interface CommentListProps {
  comments: CommentEntity[];
  postId: bigint;
}

const CommentList = ({ comments, postId }: CommentListProps) => {
  const [visibleCount, setVisibleCount] = useState(2);
  const [voteStatus, setVoteStatus] = useState<
    Map<bigint, "up" | "down" | null>
  >(new Map());
  const [replyingTo, setReplyingTo] = useState<bigint | null>(null);
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const handleLikeComment = (commentId: bigint) => {
    setVoteStatus((prev) => {
      const newMap = new Map(prev);
      const currentStatus = newMap.get(commentId);
      newMap.set(commentId, currentStatus === "up" ? null : "up");
      return newMap;
    });
    console.log(`Liked comment ${commentId}`);
  };

  const handleDisLikeComment = (commentId: bigint) => {
    setVoteStatus((prev) => {
      const newMap = new Map(prev);
      const currentStatus = newMap.get(commentId);
      newMap.set(commentId, currentStatus === "down" ? null : "down");
      return newMap;
    });
    console.log(`Disliked comment ${commentId}`);
  };

  const toggleReply = (commentId: bigint) => {
    setReplyingTo((prev) => (prev === commentId ? null : commentId));
  };

  const handleReplySubmit = (commentId: bigint) => {
    //thêm vào database
    toggleReply(commentId);
  };

  const handleCancelReply = (commentId: bigint) => {
    toggleReply(commentId);
    console.log("cancel");
  };

  const handleMoreOptions = (commentId: bigint) => {
    console.log(`More options for comment ${commentId}`);
  };

  const getReplies = (commentId: bigint) => {
    return comments.filter((c) => c.destId === commentId);
  };

  const renderComment = (
    comment: CommentEntity,
    level: number = 0,
    visited: Set<bigint> = new Set()
  ) => {
    if (visited.has(comment.id)) {
      console.warn(`Circular reference detected for comment ${comment.id}`);
      return null;
    }
    visited.add(comment.id);

    const replies = getReplies(comment.id);
    return (
      <Comment
        key={comment.id}
        comment={comment}
        level={level}
        postId={postId}
        replyingTo={replyingTo}
        onLike={handleLikeComment}
        onDislike={handleDisLikeComment}
        onReply={toggleReply}
        onReplySubmit={handleReplySubmit}
        onReplyCancel={handleCancelReply}
        onMoreOptions={handleMoreOptions}
        renderReplies={(comment, level) =>
          replies.length > 0 ? (
            <div className="mt-4 space-y-4">
              {replies.map((reply) =>
                renderComment(reply, level + 1, new Set(visited))
              )}
            </div>
          ) : null
        }
      />
    );
  };

  // Lọc các comment level=0 (dest_id === postId)
  const topLevelComments = comments.filter((c) => c.destId === postId);
  const visibleComments = topLevelComments.slice(0, visibleCount);
  const hasMore = visibleCount < topLevelComments.length;

  return (
    <div className="space-y-4">
      {visibleComments.map((comment) => renderComment(comment))}
      {hasMore && (
        <button
          className="text-blue-500 font-medium flex items-center justify-center w-full mt-4"
          onClick={handleShowMore}
        >
          Show more
          <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      )}
    </div>
  );
};

export default CommentList;
