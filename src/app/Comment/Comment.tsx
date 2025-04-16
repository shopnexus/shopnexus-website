"use client";

import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Check,
  X,
  Image as ImageIcon,
  GripVertical,
  XCircle,
} from "lucide-react";
import { CommentEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/comment_pb";
import { useQuery } from "@connectrpc/connect-query";
import { getUserPublic, getUser } from "shopnexus-protobuf-gen-ts";
import ReplyEditor from "../../components/ReplyEditor";
import { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface CommentProps {
  comment: CommentEntity;
  level: number;
  postId: bigint;
  replyingTo: bigint | null;
  editingComment: bigint | null;
  onLike: (commentId: bigint) => void;
  onDislike: (commentId: bigint) => void;
  onReply: (commentId: bigint) => void;
  onReplySubmit: (commentId: bigint) => void;
  onReplyCancel: (commentId: bigint) => void;
  onEdit: (commentId: bigint, newBody: string) => void;
  onDelete: (commentId: bigint) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  renderReplies: (comment: CommentEntity, level: number) => React.ReactNode;
}

const Comment = ({
  comment,
  level,
  postId,
  replyingTo,
  editingComment,
  onLike,
  onDislike,
  onReply,
  onReplySubmit,
  onReplyCancel,
  onEdit,
  onDelete,
  onStartEdit,
  onCancelEdit,
  renderReplies,
}: CommentProps) => {
  const { data: user } = useQuery(getUserPublic, {
    id: comment.userId,
  });
  const { data: me } = useQuery(getUser);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [editResources, setEditResources] = useState<string[]>(comment.resources || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isUserComment = me && comment.userId === me.id;
  const isEditing = editingComment === comment.id;

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [isEditing]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    setShowContextMenu(false);
    onStartEdit();
  };

  const handleDelete = () => {
    setShowContextMenu(false);
    onDelete(comment.id);
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setEditResources((prev) => [...prev, imageUrl]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditResources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(editResources);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditResources(items);
  };

  const handleSaveEdit = () => {
    onEdit(comment.id, editBody);
  };

  const handleCancelEdit = () => {
    setEditBody(comment.body);
    setEditResources(comment.resources || []);
    onCancelEdit();
  };

  const formatTime = (date: bigint) => {
    const distance = formatDistanceToNow(new Date(Number(date)), {
      addSuffix: false,
    });
    return distance === "less than a minute" ? "just now" : `${distance} ago`;
  };

  return (
    <div className={`flex space-x-3 ${level > 0 ? "ml-8" : ""} ${isUserComment ? 'bg-blue-50 p-4 rounded-lg border border-blue-200' : ''}`}>
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
            {isUserComment && <span className="ml-2 text-xs text-blue-600">(You)</span>}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {formatTime(comment.dateCreated)}
          </span>
        </div>
        {isEditing ? (
          <div className="mt-1">
            <textarea
              ref={editTextareaRef}
              className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
            />
            <div className="mt-2">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="images" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-2 sm:grid-cols-6 md:grid-cols-10 gap-2"
                    >
                      {editResources.map((imageUrl, index) => (
                        <Draggable
                          key={index}
                          draggableId={`image-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="relative group"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="absolute top-0 left-0 p-1 bg-black bg-opacity-50 text-white rounded-br-md cursor-move"
                              >
                                <GripVertical className="w-3 h-3" />
                              </div>
                              <img
                                src={imageUrl}
                                alt={`Image ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-md"
                              />
                              <button
                                className="absolute top-0 right-0 p-1 bg-black bg-opacity-50 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <button
                className="mt-2 flex items-center text-sm text-gray-600 hover:text-gray-800"
                onClick={handleAddImage}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Add Image
              </button>
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                className="flex items-center px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
                onClick={handleSaveEdit}
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </button>
              <button
                className="flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={handleCancelEdit}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 text-sm text-gray-800">{comment.body}</div>
        )}
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
        {!isEditing && (
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
            {isUserComment && (
              <div className="relative" ref={contextMenuRef}>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowContextMenu(!showContextMenu)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showContextMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleEdit}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
