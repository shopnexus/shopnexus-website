"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Filter,
  Loader,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@connectrpc/connect-query";
import { listComments, listProductModels } from "shopnexus-protobuf-gen-ts";
import { CommentEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/comment_pb";

export default function AdminProductCommentsPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<bigint | null>(null);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [viewingComment, setViewingComment] = useState<any>(null);
  const [viewingMedia, setViewingMedia] = useState<any>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaZoom, setMediaZoom] = useState(1);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [editedContent, setEditedContent] = useState("");
  const [deletingComment, setDeletingComment] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userDataMap, setUserDataMap] = useState<Record<string, any>>({});

  const itemsPerPage = 10;

  // Fetch product models from server
  const {
    data: productModelsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchProductModels,
  } = useInfiniteQuery(
    listProductModels,
    {
      pagination: {
        page: 1,
        limit: itemsPerPage,
      },
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage?.pagination?.nextPage
          ? {
              page: lastPage.pagination.nextPage,
              limit: lastPage.pagination.limit,
              cursor: lastPage.pagination.nextCursor,
            }
          : undefined,
      pageParamKey: "pagination",
    }
  );

  // Get current page items
  const currentItems = productModelsData?.pages[currentPage - 1]?.data || [];

  // Handle page change
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);

    const neededPages = page - (productModelsData?.pages.length ?? 0);

    if (neededPages > 0 && hasNextPage) {
      for (let i = 0; i < neededPages; i++) {
        if (!hasNextPage || isFetchingNextPage) break;
        await fetchNextPage();
      }
    }
  };

  // Filter products based on search query
  const filteredProducts = currentItems.filter((product) => {
    if (!productSearchQuery) return true;
    return (
      product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      product.description
        .toLowerCase()
        .includes(productSearchQuery.toLowerCase())
    );
  });

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setFilterDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: commentData } = useQuery(listComments, {
    destId: selectedProduct ? BigInt(selectedProduct) : undefined,
  });
  const productComments = commentData?.data || [];

  // Filter comments based on search query
  const filteredComments = productComments.filter((comment) => {
    if (!searchQuery) return true;
    return (
      comment.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.userId.toString().includes(searchQuery.toLowerCase())
    );
  });

  // Sort comments
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortOption === "newest") {
      return Number(b.dateCreated - a.dateCreated);
    }
    if (sortOption === "oldest") {
      return Number(a.dateCreated - b.dateCreated);
    }
    if (sortOption === "most-likes") {
      return Number(b.upvote - a.upvote);
    }
    return 0;
  });

  // Update comment rendering to use proper types
  const renderComment = (comment: CommentEntity) => {
    const userData = userDataMap[comment.userId.toString()];

    return (
      <tr key={comment.id.toString()} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={selectedComments.includes(comment.id.toString())}
            onChange={(e) =>
              handleSelectComment(comment.id.toString(), e.target.checked)
            }
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 relative">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={userData?.avatar || "/placeholder.svg"}
                alt={userData?.name || "User"}
              />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {userData?.name || "Unknown User"}
              </div>
              <div className="text-xs text-gray-500">
                ID: {comment.userId.toString()}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 mb-2">{comment.body}</div>
          {comment.resources && comment.resources.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {comment.resources
                .slice(0, 3)
                .map((url: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md overflow-hidden cursor-pointer"
                    onClick={() => handleViewMedia(comment, index)}
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
          <div
            className="relative"
            ref={dropdownOpen === comment.id.toString() ? dropdownRef : null}
          >
            <button
              onClick={() =>
                setDropdownOpen(
                  dropdownOpen === comment.id.toString()
                    ? null
                    : comment.id.toString()
                )
              }
              className="text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {dropdownOpen === comment.id.toString() && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleViewComment(comment);
                      setDropdownOpen(null);
                    }}
                    className="flex items-center px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      handleEditComment(comment);
                      setDropdownOpen(null);
                    }}
                    className="flex items-center px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteComment(comment);
                      setDropdownOpen(null);
                    }}
                    className="flex items-center px-4 py-2 text-sm w-full text-left text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Handlers
  const handleSelectProduct = (productId: bigint) => {
    setSelectedProduct(productId);
    setSelectedComments([]);
    setSearchQuery("");
    setSortOption("newest");
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setSelectedComments([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedComments(
        sortedComments.map((comment) => comment.id.toString())
      );
    } else {
      setSelectedComments([]);
    }
  };

  const handleSelectComment = (commentId: string, checked: boolean) => {
    if (checked) {
      setSelectedComments([...selectedComments, commentId]);
    } else {
      setSelectedComments(selectedComments.filter((id) => id !== commentId));
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleViewComment = (comment: any) => {
    setViewingComment(comment);
  };

  const handleViewMedia = (comment: any, index = 0) => {
    setViewingMedia(comment);
    setCurrentMediaIndex(index);
    setMediaZoom(1);
  };

  const handleEditComment = (comment: any) => {
    setEditingComment(comment);
    setEditedContent(comment.content);
  };

  const handleSaveEdit = () => {
    console.log("Saving edited comment:", {
      ...editingComment,
      content: editedContent,
    });
    setEditingComment(null);
  };

  const handleDeleteComment = (comment: any) => {
    setDeletingComment(comment);
  };

  const confirmDelete = () => {
    console.log("Deleting comment:", deletingComment);
    setDeletingComment(null);
  };

  // const handleChangeStatus = (commentId: string, status: string) => {
  //   console.log(`Changing comment ${commentId} status to ${status}`);
  //   // In a real app, you would update the comment status via API
  // };

  const handleBulkAction = (action: string) => {
    console.log(
      `Performing bulk action: ${action} on comments:`,
      selectedComments
    );
    setSelectedComments([]);
  };

  const handleNextMedia = () => {
    if (!viewingMedia) return;
    const nextIndex = (currentMediaIndex + 1) % viewingMedia.media.length;
    setCurrentMediaIndex(nextIndex);
    setMediaZoom(1);
  };

  const handlePrevMedia = () => {
    if (!viewingMedia) return;
    const prevIndex =
      (currentMediaIndex - 1 + viewingMedia.media.length) %
      viewingMedia.media.length;
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
    link.href = viewingMedia.media[currentMediaIndex];
    link.download = `comment-media-${viewingMedia.id}-${currentMediaIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatPrice = (price?: bigint) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price ?? 0);
  };

  // Get selected product details
  const selectedProductDetails = selectedProduct
    ? currentItems.find((product) => product.id === selectedProduct)
    : null;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Product Comments Management</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </button>
      </div>

      {selectedProduct ? (
        // Comments view for selected product
        <div>
          {/* Product details header */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex items-start">
              <button
                onClick={handleBackToProducts}
                className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex-shrink-0 mr-4">
                <img
                  src={
                    selectedProductDetails?.resources?.[0] || "/placeholder.svg"
                  }
                  alt={selectedProductDetails?.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {selectedProductDetails?.name}
                </h2>
                <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {selectedProductDetails?.description}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  <span className="font-medium">Type:</span>{" "}
                  {selectedProductDetails?.type.toString()}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  <span className="font-medium">Price:</span>{" "}
                  {formatPrice(selectedProductDetails?.listPrice)}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  <span className="font-medium">Manufactured:</span>{" "}
                  {selectedProductDetails?.dateManufactured
                    ? new Date(
                        selectedProductDetails.dateManufactured.toString()
                      ).toLocaleDateString()
                    : "Unknown"}
                </div>
                {selectedProductDetails?.tags &&
                  selectedProductDetails.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedProductDetails.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                <div className="mt-2 flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {productComments.length} comments
                  </span>
                </div>
              </div>
            </div>
            {selectedProductDetails?.resources &&
              selectedProductDetails.resources.length > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Product Resources:
                  </h3>
                  <div className="flex overflow-x-auto space-x-2 pb-2">
                    {selectedProductDetails.resources.map((resource, index) => (
                      <img
                        key={index}
                        src={resource || "/placeholder.svg"}
                        alt={`${selectedProductDetails.name} resource ${
                          index + 1
                        }`}
                        className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Comments management */}
          <div className="bg-white rounded-lg shadow">
            {/* Filters and search */}
            <div className="flex flex-wrap items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search comments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Sort
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  {filterDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setSortOption("newest");
                            setFilterDropdownOpen(false);
                          }}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            sortOption === "newest"
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Newest
                        </button>
                        <button
                          onClick={() => {
                            setSortOption("oldest");
                            setFilterDropdownOpen(false);
                          }}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            sortOption === "oldest"
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Oldest
                        </button>
                        <button
                          onClick={() => {
                            setSortOption("most-likes");
                            setFilterDropdownOpen(false);
                          }}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            sortOption === "most-likes"
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

            {/* Bulk Actions */}
            {selectedComments.length > 0 && (
              <div className="bg-gray-50 p-3 flex items-center justify-between border-b">
                <div className="text-sm">
                  Selected {selectedComments.length}{" "}
                  {selectedComments.length === 1 ? "comment" : "comments"}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </button>
                </div>
              </div>
            )}

            {/* Comments Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <input
                        type="checkbox"
                        checked={
                          sortedComments.length > 0 &&
                          selectedComments.length === sortedComments.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Content
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedComments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No comments found
                      </td>
                    </tr>
                  ) : (
                    sortedComments.map(renderComment)
                  )}
                </tbody>
              </table>
            </div>

            {/* Empty state if no comments */}
            {productComments.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No comments found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This product has no comments yet.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Products list view
        <div>
          {/* Search and filter for products */}
          <div className="mb-6 flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try searching with different keywords.
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Item
                  handleSelectProduct={handleSelectProduct}
                  product={product}
                ></Item>
              ))
            )}
          </div>
        </div>
      )}

      {/* View Comment Modal */}
      {viewingComment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Comment Details
                    </h3>
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={viewingComment.userAvatar || "/placeholder.svg"}
                          alt={viewingComment.userName}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {viewingComment.userName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(viewingComment.dateCreated)}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            viewingComment.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : viewingComment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {viewingComment.status === "approved"
                            ? "Approved"
                            : viewingComment.status === "pending"
                            ? "Pending"
                            : "Rejected"}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Content:
                        </p>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {viewingComment.content}
                        </p>
                      </div>
                      {viewingComment.hasMedia && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Media:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {viewingComment.media.map(
                              (url: string, index: number) => (
                                <div
                                  key={index}
                                  className="relative aspect-square rounded-md overflow-hidden cursor-pointer"
                                  onClick={() =>
                                    handleViewMedia(viewingComment, index)
                                  }
                                >
                                  <img
                                    src={url || "/placeholder.svg"}
                                    alt={`Media ${index + 1}`}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          <span>{viewingComment.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          <span>{viewingComment.dislikes}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span>{viewingComment.replies} replies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setViewingComment(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Media Modal */}
      {viewingMedia && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-90 transition-opacity"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 text-white">
                <h3 className="text-lg font-medium">
                  Media from {viewingMedia.userName} ({currentMediaIndex + 1}/
                  {viewingMedia.media.length})
                </h3>
                <button
                  onClick={() => setViewingMedia(null)}
                  className="text-white hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Media Content */}
              <div className="flex-1 flex items-center justify-center p-4">
                <img
                  src={
                    viewingMedia.media[currentMediaIndex] || "/placeholder.svg"
                  }
                  alt={`Media ${currentMediaIndex + 1}`}
                  className="max-h-full max-w-full object-contain transition-transform"
                  style={{ transform: `scale(${mediaZoom})` }}
                />

                {/* Navigation Buttons */}
                {viewingMedia.media.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevMedia}
                      className="absolute left-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextMedia}
                      className="absolute right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
                <div className="text-sm">
                  {formatDate(viewingMedia.dateCreated)}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                    disabled={mediaZoom <= 0.5}
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-sm">
                    {Math.round(mediaZoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                    disabled={mediaZoom >= 3}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownloadMedia}
                    className="p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Comment Modal */}
      {editingComment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Edit className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Edit Comment
                    </h3>
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={editingComment.userAvatar || "/placeholder.svg"}
                          alt={editingComment.userName}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {editingComment.userName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(editingComment.dateCreated)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
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
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingComment(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingComment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Comment
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this comment? This
                        action cannot be undone.
                      </p>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        {deletingComment.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingComment(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ product, handleSelectProduct }) {
  const { data: commentData } = useQuery(listComments, {
    destId: product.id,
  });
  const comments = commentData?.data || [];

  return (
    <div
      key={product.id}
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleSelectProduct(product.id)}
    >
      <div className="h-48 overflow-hidden">
        <img
          src={product.resources[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {formatPrice(product.listPrice)}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500 line-clamp-2">
          {product.description}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Type: {product.type}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <MessageSquare className="w-3 h-3 mr-1" />
            {comments.length}
          </span>
        </div>
        {product.tags && product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// vnd
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}
