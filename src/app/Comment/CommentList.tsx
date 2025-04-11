"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  MoreHorizontal,
  CheckCircle,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useState } from "react";
import ReplyEditor from "../../components/ReplyEditor";

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
  comments: Comment[];
  postId: bigint;
}

const CommentList = ({ comments, postId }: CommentListProps) => {
  const [visibleCount, setVisibleCount] = useState(2);
  const [voteStatus, setVoteStatus] = useState<Map<bigint, "up" | "down" | null>>(new Map());
  const [replyingTo, setReplyingTo] = useState<bigint | null>(null);

  const formatTime = (date: Date) => {
    const distance = formatDistanceToNow(date, { addSuffix: false });
    return distance === "less than a minute" ? "just now" : `${distance} ago`;
  };

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
    return comments.filter((c) => c.dest_id === commentId);
  };

  const renderComment = (comment: Comment, level: number = 0) => {
    const replies = getReplies(comment.id);
    return (
      <div key={comment.id} className={`flex space-x-3 ${level > 0 ? "ml-8" : ""}`}>
        <div className="flex-shrink-0">
          <img
            src={"https://i.pinimg.com/736x/72/26/c1/7226c196f74e1991e16350404b5e1706.jpg"}
            alt={"avatar user"}
            className="w-8 h-8 rounded-full"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-sm">{"user Name"}</span>
            <span className="ml-2 text-xs text-gray-500">{formatTime(comment.dateCreated)}</span>
          </div>
          <div className="mt-1 text-sm text-gray-800">{comment.body}</div>
          {comment.resources && comment.resources.length > 0 && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-6 md:grid-cols-10 gap-2">
              {comment.resources.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-md"
                >
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Attachment ${index + 1}`}
                    className="object-cover w-20 h-20 hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => handleLikeComment(comment.id)}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <span className="text-gray-700">{comment.score}</span>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => handleDisLikeComment(comment.id)}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
            <button
              className="flex items-center text-gray-500 hover:text-gray-700"
              onClick={() => toggleReply(comment.id)}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>Reply</span>
            </button>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => handleMoreOptions(comment.id)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          {replyingTo === comment.id && (
            <ReplyEditor
              commentId={comment.id}
              postId={postId}
              onSubmit={() => handleReplySubmit(comment.id)}
              onCancel={() => handleCancelReply(comment.id)}
            />
          )}
          {replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => renderComment(reply, level + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Lọc các comment level=0 (dest_id === postId)
  const topLevelComments = comments.filter((c) => c.dest_id === postId);
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