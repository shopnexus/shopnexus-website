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
import CommentEditor from "./CommentEditor";
import ReplyEditor from "./ReplyEditor";

export interface User {
  id: number;
  name: string;
  avatar: string;
  verified?: boolean;
}

export interface bodyProps {
  content: string;
  resources?: string[];
}

export interface Comment {
  id: number;
  user_id: number;
  dest_id: number;
  body: bodyProps;
  upvote: number;
  downvote: number;
  score: number;
  created_at: Date;
  user: User;
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [voteStatus, setVoteStatus] = useState<{
    [key: number]: "up" | "down" | null;
  }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const formatTime = (date: Date) => {
    const distance = formatDistanceToNow(date, { addSuffix: false });
    return distance === "less than a minute" ? "just now" : `${distance} ago`;
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const handleLikeComment = (commentId: number) => {
    setVoteStatus((prev) => {
      const currentStatus = prev[commentId];
      if (currentStatus === "up") {
        return { ...prev, [commentId]: null };
      } else {
        return { ...prev, [commentId]: "up" };
      }
    });
    // Gọi API để cập nhật
    console.log(`Liked comment ${commentId}`);
  };

  const handleDisLikeComment = (commentId: number) => {
    setVoteStatus((prev) => {
      const currentStatus = prev[commentId];
      if (currentStatus === "down") {
        return { ...prev, [commentId]: null };
      } else {
        return { ...prev, [commentId]: "down" };
      }
    });
    // Gọi API để cập nhật
    console.log(`Disliked comment ${commentId}`);
  };

  const toggleReply = (commentId: number) => {
    setReplyingTo((prev) => (prev === commentId ? null : commentId));
  };

  const handleMoreOptions = (commentId: number) => {
    // Logic để hiển thị menu tùy chọn (ví dụ: report, delete, edit)
    console.log(`More options for comment ${commentId}`);
    // Có thể hiển thị dropdown menu tại đây
  };

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  return (
    <div className="space-y-4">
      {Array.isArray(comments) ? (
        visibleComments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <div className="flex-shrink-0">
              <img
                src={comment.user.avatar || "/placeholder.svg"}
                alt={comment.user.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-medium text-sm">{comment.user.name}</span>
                {comment.user.verified && (
                  <CheckCircle className="w-3 h-3 ml-1 text-blue-500 fill-blue-500" />
                )}
                <span className="ml-2 text-xs text-gray-500">
                  {formatTime(comment.created_at)}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-800">
                {comment.body.content}
              </div>

              {/* Image resources grid */}
              {comment.body.resources && comment.body.resources.length > 0 && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {comment.body.resources.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-md"
                    >
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Attachment ${index + 1}`}
                        className="object-cover max-w-[300px] max-h-[300px] hover:opacity-90 transition-opacity"
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
              {replyingTo === comment.id && (<ReplyEditor commentId={comment.id} />)}
            </div>
            
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-sm">No comments to display</div>
      )}

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
