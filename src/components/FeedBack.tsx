import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HorizontalScroll from "./HorizontalScroll";

interface CommentProps {
  title: string;
  image: string[];
}

// Dữ liệu giả dùng để test
const MOCK_COMMENTS: CommentProps[] = [
  {
    title: "Đánh giá 1",
    image: [
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
    ],
  },
  {
    title: "Đánh giá 2",
    image: [
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
    ],
  },
  {
    title: "Đánh giá 1",
    image: [
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
    ],
  },
];

const FeedBack: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // State cho modal zoom ảnh
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchComment = async () => {
      try {
        // Giả lập fetch dữ liệu từ API bằng dữ liệu MOCK
        setComments(MOCK_COMMENTS);
      } catch (error: any) {
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComment();
    }
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );

  if (!comments || comments.length === 0)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-gray-600">No comments found.</p>
      </div>
    );

  // Mở modal zoom ảnh
  const openModal = (images: string[], startIndex = 0) => {
    setModalImages(images);
    setCurrentIndex(startIndex);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev === modalImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? modalImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-4 px-2">
      {/* Container có chiều cao cố định, scroll nếu nội dung vượt quá */}
      <div className="max-h-[600px] overflow-y-auto space-y-4">
        {comments.map((comment, idx) => (
          <div key={idx} className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-2">{comment.title}</h2>
            {/* Sử dụng flex-nowrap để hiển thị ảnh theo hàng ngang, cuộn ngang nếu vượt */}
            
            <HorizontalScroll>
                <div className="flex flex-nowrap gap-2">
                {comment.image.map((imgUrl, index) => (
                    <img
                    key={index}
                    src={imgUrl}
                    alt={`Comment ${idx + 1} Image ${index + 1}`}
                    className="w-1/3 object-cover rounded cursor-pointer"
                    onClick={() => openModal(comment.image, index)}
                    />
                ))}
                </div>
            </HorizontalScroll>
          </div>
        ))}
      </div>

      {/* Modal hiển thị ảnh với điều hướng */}
      {modalOpen && (
        <div
            onClick={closeModal}
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
        >
            <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded p-4 max-w-lg w-full"
            >
            <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-sm"
            >
                Đóng
            </button>
            <div className="flex items-center justify-center">
                <button onClick={prevImage} className="px-2 text-2xl">
                &#9664;
                </button>
                <img
                src={modalImages[currentIndex]}
                alt={`Modal Image ${currentIndex + 1}`}
                className="max-h-96 object-contain mx-2"
                />
                <button onClick={nextImage} className="px-2 text-2xl">
                &#9654;
                </button>
            </div>
            <div className="text-center mt-2 text-sm">
                {currentIndex + 1} / {modalImages.length}
            </div>
            </div>
        </div>
        )}

    </div>
  );
};

export default FeedBack;
