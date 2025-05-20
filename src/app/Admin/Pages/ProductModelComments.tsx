import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Trash2,
  Eye,
  MessageSquare,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import { ProductModelEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/product_model_pb";
import { CommentType } from "shopnexus-protobuf-gen-ts/pb/product/v1/comment_pb";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import {
  createComment,
  deleteComment,
  getUserPublic,
  listComments,
} from "shopnexus-protobuf-gen-ts";

interface Comment {
  id: bigint;
  userId: bigint;
  type: CommentType;
  destId: bigint;
  body: string;
  upvote: bigint;
  downvote: bigint;
  score: number;
  dateCreated: bigint;
  dateUpdated: bigint;
  resources: string[];
}

interface CommentTableRowProps {
  comment: Comment;
  isSelected: boolean;
  onSelect: (commentId: bigint, checked: boolean) => void;
  onView: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  onViewMedia: (comment: Comment, index: number) => void;
  onReply: (comment: Comment) => void;
}

const CommentTableRow = ({
  comment,
  isSelected,
  onSelect,
  onView,
  onDelete,
  onViewMedia,
  onReply,
}: CommentTableRowProps) => {
  const { data: user } = useQuery(getUserPublic, {
    id: comment.userId,
  });

  return (
    <tr key={comment.id.toString()} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(comment.id, e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 relative">
            <UserImage userId={comment.userId} />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              User {user?.fullName}
            </div>
            <div className="text-xs text-gray-500">
              ID: {comment.userId.toString()}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 mb-2">{comment.body}</div>
        {comment.resources.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {comment.resources.slice(0, 3).map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-md overflow-hidden cursor-pointer"
                onClick={() => onViewMedia(comment, index)}
              >
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Media ${index + 1}`}
                  className="object-cover w-full h-full"
                />
                {index === 2 && comment.resources.length > 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white font-medium">
                      +{comment.resources.length - 3}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(Number(comment.dateCreated)).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(comment)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReply(comment)}
            className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(comment)}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

interface ProductModelCommentsProps {
  selectedModel: ProductModelEntity;
  onBack: () => void;
}

const ProductModelComments = ({
  selectedModel,
  onBack,
}: ProductModelCommentsProps) => {
  const [viewingComment, setViewingComment] = useState<Comment | null>(null);
  const [viewingMedia, setViewingMedia] = useState<Comment | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaZoom, setMediaZoom] = useState(1);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const [commentFilterDropdownOpen, setCommentFilterDropdownOpen] =
    useState(false);
  const [commentSortOption, setCommentSortOption] = useState("newest");
  const [commentSearchQuery, setCommentSearchQuery] = useState("");
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { mutateAsync: mutateDeleteComment } = useMutation(deleteComment);

  const { data: comments, refetch } = useQuery(
    listComments,
    {
      pagination: {
        page: 1,
        limit: 100,
      },
      destId: selectedModel.id,
    },
    {
      enabled: Boolean(selectedModel.id),
    }
  );
  const modelComments = comments?.data ?? [];

  // Filter comments based on search query
  const filteredComments = modelComments.filter((comment) => {
    if (!commentSearchQuery) return true;
    return comment.body
      .toLowerCase()
      .includes(commentSearchQuery.toLowerCase());
  });

  // Sort comments
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (commentSortOption === "newest") {
      return Number(b.dateCreated - a.dateCreated);
    }
    if (commentSortOption === "oldest") {
      return Number(a.dateCreated - b.dateCreated);
    }
    if (commentSortOption === "most-likes") {
      return Number(b.upvote - a.upvote);
    }
    return 0;
  });

  const handleSelectAllComments = (checked: boolean) => {
    if (checked) {
      setSelectedComments(
        sortedComments.map((comment) => comment.id.toString())
      );
    } else {
      setSelectedComments([]);
    }
  };

  const handleSelectComment = (commentId: bigint, checked: boolean) => {
    if (checked) {
      setSelectedComments([...selectedComments, commentId.toString()]);
    } else {
      setSelectedComments(
        selectedComments.filter((id) => id !== commentId.toString())
      );
    }
  };

  const handleViewComment = (comment: Comment) => {
    setViewingComment(comment);
  };

  const handleViewMedia = (comment: Comment, index = 0) => {
    setViewingMedia(comment);
    setCurrentMediaIndex(index);
    setMediaZoom(1);
  };

  const handleSaveEdit = () => {
    console.log("Saving edited comment:", {
      ...editingComment,
      body: editedContent,
    });
    setEditingComment(null);
  };

  const handleDeleteComment = (comment: Comment) => {
    setDeletingComment(comment);
  };

  const confirmDelete = () => {
    console.log("Deleting comment:", deletingComment);
    mutateDeleteComment({
      id: deletingComment?.id,
    });
    setDeletingComment(null);
    refetch();
  };

  const handleBulkAction = (action: string) => {
    console.log(
      `Performing bulk action: ${action} on comments:`,
      selectedComments
    );
    setSelectedComments([]);
  };

  const handleNextMedia = () => {
    if (!viewingMedia) return;
    const nextIndex = (currentMediaIndex + 1) % viewingMedia.resources.length;
    setCurrentMediaIndex(nextIndex);
    setMediaZoom(1);
  };

  const handlePrevMedia = () => {
    if (!viewingMedia) return;
    const prevIndex =
      (currentMediaIndex - 1 + viewingMedia.resources.length) %
      viewingMedia.resources.length;
    setCurrentMediaIndex(prevIndex);
    setMediaZoom(1);
  };

  const handleZoomIn = () => {
    setMediaZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setMediaZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownloadMedia = () => {
    if (!viewingMedia) return;
    const link = document.createElement("a");
    link.href = viewingMedia.resources[currentMediaIndex];
    link.download = `comment-media-${viewingMedia.id}-${currentMediaIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const { mutateAsync: mutateCreateComment } = useMutation(createComment);

  const handleReplySubmit = () => {
    if (replyingTo && replyContent.trim()) {
      console.log("Submitting reply:", {
        parentCommentId: replyingTo.id,
        content: replyContent,
      });
      mutateCreateComment({
        body: replyContent,
        destId: replyingTo.id,
        type: CommentType.COMMENT,
      });

      setReplyingTo(null);
      setReplyContent("");
    }
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Models
        </button>
        <h1 className="text-2xl font-bold">
          Comments for {selectedModel.name}
        </h1>
      </div>

      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={commentSearchQuery}
                  onChange={(e) => setCommentSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    setCommentFilterDropdownOpen(!commentFilterDropdownOpen)
                  }
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Sort
                </button>
                {commentFilterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCommentSortOption("newest");
                          setCommentFilterDropdownOpen(false);
                        }}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          commentSortOption === "newest"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Newest
                      </button>
                      <button
                        onClick={() => {
                          setCommentSortOption("oldest");
                          setCommentFilterDropdownOpen(false);
                        }}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          commentSortOption === "oldest"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Oldest
                      </button>
                      <button
                        onClick={() => {
                          setCommentSortOption("most-likes");
                          setCommentFilterDropdownOpen(false);
                        }}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          commentSortOption === "most-likes"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Most Likes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedComments.length > 0 && (
          <div className="bg-gray-50 p-3 flex items-center justify-between border-b">
            <div className="text-sm">
              Selected {selectedComments.length}{" "}
              {selectedComments.length === 1 ? "comment" : "comments"}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleBulkAction("delete")}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      sortedComments.length > 0 &&
                      selectedComments.length === sortedComments.length
                    }
                    onChange={(e) => handleSelectAllComments(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedComments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No comments found
                  </td>
                </tr>
              ) : (
                sortedComments.map((comment) => (
                  <CommentTableRow
                    key={comment.id.toString()}
                    comment={comment}
                    isSelected={selectedComments.includes(
                      comment.id.toString()
                    )}
                    onSelect={handleSelectComment}
                    onView={handleViewComment}
                    onDelete={handleDeleteComment}
                    onViewMedia={handleViewMedia}
                    onReply={handleReply}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Comment Modal */}
      {viewingComment && (
        <Modal
          isOpen={true}
          onClose={() => setViewingComment(null)}
          title="Comment Details"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <UserImage userId={viewingComment.userId} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  User {viewingComment.userId.toString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(
                    Number(viewingComment.dateCreated)
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Content:
                </p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {viewingComment.body}
                </p>
              </div>
              {viewingComment.resources.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Media:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {viewingComment.resources.slice(0, 3).map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-md overflow-hidden cursor-pointer"
                        onClick={() => handleViewMedia(viewingComment, index)}
                      >
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Media ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* View Media Modal */}
      {viewingMedia && (
        <Modal
          isOpen={true}
          onClose={() => setViewingMedia(null)}
          title={`Media from User ${viewingMedia.userId} (${
            currentMediaIndex + 1
          }/${viewingMedia.resources.length})`}
        >
          <div className="relative">
            <img
              src={
                viewingMedia.resources[currentMediaIndex] || "/placeholder.svg"
              }
              alt={`Media ${currentMediaIndex + 1}`}
              className="w-full h-auto"
              style={{ transform: `scale(${mediaZoom})` }}
            />
            {viewingMedia.resources.length > 1 && (
              <>
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextMedia}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                disabled={mediaZoom <= 0.5}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm">{Math.round(mediaZoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                disabled={mediaZoom >= 3}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleDownloadMedia}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Comment Modal */}
      {editingComment && (
        <Modal
          isOpen={true}
          onClose={() => setEditingComment(null)}
          title="Edit Comment"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <UserImage userId={editingComment.userId} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  User {editingComment.userId.toString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(
                    Number(editingComment.dateCreated)
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <textarea
                id="content"
                rows={4}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditingComment(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </Modal>
      )}

      {/* Delete Comment Modal */}
      {deletingComment && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingComment(null)}
          title="Delete Comment"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <UserImage userId={deletingComment.userId} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  User {deletingComment.userId.toString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(
                    Number(deletingComment.dateCreated)
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{deletingComment.body}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeletingComment(null)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={confirmDelete}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}

      {/* Reply Modal */}
      {replyingTo && (
        <Modal
          isOpen={true}
          onClose={handleReplyCancel}
          title="Reply to Comment"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <UserImage userId={replyingTo.userId} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  User {replyingTo.userId.toString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(Number(replyingTo.dateCreated)).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <label
                htmlFor="reply"
                className="block text-sm font-medium text-gray-700"
              >
                Your Reply
              </label>
              <textarea
                id="reply"
                rows={4}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Write your reply..."
              ></textarea>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={handleReplyCancel}>
                Cancel
              </Button>
              <Button onClick={handleReplySubmit}>Submit Reply</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

function UserImage({ userId }: { userId: bigint }) {
  const { data: user } = useQuery(getUserPublic, {
    id: userId,
  });

  return (
    <img
      className="h-10 w-10 rounded-full object-cover"
      src={user?.avatar ?? "/avatar_placeholder.png"}
      alt={`User ${userId.toString()}`}
    />
  );
}

export default ProductModelComments;
