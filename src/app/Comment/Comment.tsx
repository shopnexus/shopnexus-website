"use client";

import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { CommentEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/comment_pb";
import { useQuery } from "@connectrpc/connect-query";
import { getUserPublic } from "shopnexus-protobuf-gen-ts";
import ReplyEditor from "../../components/ReplyEditor";

interface CommentProps {
  comment: CommentEntity;
  level: number;
  postId: bigint;
  replyingTo: bigint | null;
  onLike: (commentId: bigint) => void;
  onDislike: (commentId: bigint) => void;
  onReply: (commentId: bigint) => void;
  onReplySubmit: (commentId: bigint) => void;
  onReplyCancel: (commentId: bigint) => void;
  onMoreOptions: (commentId: bigint) => void;
  renderReplies: (comment: CommentEntity, level: number) => React.ReactNode;
}

const Comment = ({
  comment,
  level,
  postId,
  replyingTo,
  onLike,
  onDislike,
  onReply,
  onReplySubmit,
  onReplyCancel,
  onMoreOptions,
  renderReplies,
}: CommentProps) => {
  const { data: user } = useQuery(getUserPublic, {
    id: comment.userId,
  });

  const formatTime = (date: bigint) => {
    const distance = formatDistanceToNow(new Date(Number(date)), {
      addSuffix: false,
    });
    return distance === "less than a minute" ? "just now" : `${distance} ago`;
  };

  return (
    <div className={`flex space-x-3 ${level > 0 ? "ml-8" : ""}`}>
      <div className="flex-shrink-0">
        <img
          src={
            user?.avatar ||
            "https://i.pinimg.com/736x/72/26/c1/7226c196f74e1991e16350404b5e1706.jpg"
          }
          alt={"avatar user"}
          className="w-8 h-8 rounded-full"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-medium text-sm">
            {user?.fullName || "Anonymous"}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {formatTime(comment.dateCreated)}
          </span>
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
              onClick={() => onLike(comment.id)}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <span className="text-gray-700">{comment.score}</span>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => onDislike(comment.id)}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
          <button
            className="flex items-center text-gray-500 hover:text-gray-700"
            onClick={() => onReply(comment.id)}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>Reply</span>
          </button>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => onMoreOptions(comment.id)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        {replyingTo === comment.id && (
          <ReplyEditor
            commentId={comment.id}
            postId={postId}
            onSubmit={() => onReplySubmit(comment.id)}
            onCancel={() => onReplyCancel(comment.id)}
          />
        )}
        {renderReplies(comment, level)}
      </div>
    </div>
  );
};

export default Comment;
