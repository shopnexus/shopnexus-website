"use client";

import { useRef, useState } from "react";
import { Image, Smile } from "lucide-react";
import { Comment } from "./CommentList";
interface CommentEditorProps {
  onSubmit: (comment: Comment) => void;
  onCancel?: () => void;
  postId: bigint; // id của product model
  isReply?: boolean; // Xác định có phải reply không
  commentId?: bigint; // ID của comment nếu là reply
}

const CommentEditor = ({
  onSubmit,
  onCancel,
  postId,
  isReply = false,
  commentId,
}: CommentEditorProps) => {
  const [body, setBody] = useState("");
  const [resources, setResources] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUserId = () => {
    return BigInt(3);
  };
  const getDestId = () => {
    return isReply && commentId ? commentId : postId;
  };

  const handleSubmit = () => {
    if (body.trim()) {
      const comment: Comment = {
        id: BigInt(Date.now()), // Tạm thời tạo ID bằng timestamp
        user_id: getUserId(),
        dest_id: getDestId(),
        downvote: 0,
        upvote: 0,
        score: 0,
        body,
        resources,
        dateCreated: new Date().toISOString(),
      };
      onSubmit(comment);
      setBody("");
      setResources([]);
    }
  };

  const handleAddImage = () => {
    fileInputRef.current?.click(); // Kích hoạt input file
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setResources((prev) => [...prev, imageUrl]);
      };
      reader.readAsDataURL(file); // Đọc file thành dạng base64
    }
  };

  return (
    <div className="bg-gray-50 rounded-md p-3 m-4">
      <div className="mb-2">
        <textarea
          placeholder={isReply ? "Add reply..." : "Add comment..."}
          className="w-full p-2 text-sm focus:outline-none bg-transparent resize-none"
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      {/* Hiển thị ảnh đã chọn */}
      {resources.length > 0 && (
        <div className="mb-2 grid grid-cols-3 gap-2">
          {resources.map((url, index) => (
            <div key={index} className="relative group w-16 h-16">
              <img
                src={url}
                alt="resource"
                className="w-full h-full object-cover rounded"
              />
              <button
                className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                onClick={() =>
                  setResources(resources.filter((_, i) => i !== index))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={handleAddImage}
          >
            <Image className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Smile className="w-4 h-4" />
          </button>
        </div>
        <div className="flex space-x-2">
          {onCancel && (
            <button
              className="bg-gray-300 text-gray-700 px-4 py-1 rounded-md text-sm font-medium"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded-md text-sm font-medium"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentEditor;