import React from "react";
import CommentEditor from "./CommentEditor";
import CommentList, { Comment } from "./CommentList";
import { ChevronDown } from "lucide-react";
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from "shopnexus-protobuf-gen-ts/pb/product/v1/service-ProductService_connectquery";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@connectrpc/connect-query";
import { getUser } from "shopnexus-protobuf-gen-ts";
import { CommentType } from "shopnexus-protobuf-gen-ts/pb/product/v1/comment_pb";

const CommentLayout: React.FC<{
  dest_id: bigint;
}> = ({ dest_id }) => {
  const { data: listcomments, refetch } = useInfiniteQuery(
    listComments,
    {
      destId: dest_id,
      type: CommentType.PRODUCT_MODEL,
      pagination: {
        limit: 100,
        page: 1,
      },
    },
    {
      pageParamKey: "pagination",
      getNextPageParam: (lastPage) => {
        return {
          page: lastPage.pagination?.nextPage,
          limit: lastPage.pagination?.limit,
        };
      },
    }
  );
  const comments = listcomments?.pages.flatMap((page) => page.data) || [];
  const { data: me } = useQuery(getUser);

  // Check if the first comment belongs to the current user
  const hasUserCommented =
    comments.length > 0 && me && comments[0].userId === me.id;

  const { mutateAsync: mutateCreateComment } = useMutation(createComment);
  const { mutateAsync: mutateDeleteComment } = useMutation(deleteComment);
  const { mutateAsync: mutateUpdateComment } = useMutation(updateComment);

  const handleSubmitComment = async (comment: Comment) => {
    await mutateCreateComment({
      body: comment.body,
      destId: dest_id,
      resources: comment.resources,
    });
    refetch();
  };

  const handleDeleteComment = async (commentId: bigint) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await mutateDeleteComment({
          id: commentId,
        });
        refetch();
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
  };

  const handleEditComment = async (commentId: bigint, newBody: string) => {
    try {
      await mutateUpdateComment({
        id: commentId,
        body: newBody,
      });
      refetch();
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  return (
    <div className="max-w mx-auto pt-4 bg-white p-8 mt-8">
      {!hasUserCommented && (
        <CommentEditor onSubmit={handleSubmitComment} postId={dest_id} />
      )}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium">Comments</h2>
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span>Most recent</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </div>
        </div>
        <CommentList
          comments={comments}
          postId={dest_id}
          handleDeleteComment={handleDeleteComment}
          handleEditComment={handleEditComment}
        />
      </div>
    </div>
  );
};

export default CommentLayout;
