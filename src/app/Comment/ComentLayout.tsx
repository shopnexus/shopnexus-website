import React from "react";
import CommentEditor from "./CommentEditor";
import CommentList, { Comment } from "./CommentList";
import { ChevronDown } from "lucide-react";
import {
  createComment,
  listComments,
} from "shopnexus-protobuf-gen-ts/pb/product/v1/service-ProductService_connectquery";
import { useInfiniteQuery, useMutation } from "@connectrpc/connect-query";
const CommentLayout: React.FC<{
  dest_id: bigint;
}> = ({ dest_id }) => {
  const { data: listcomments } = useInfiniteQuery(
    listComments,
    {
      destId: dest_id,
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

  const { mutateAsync: mutateCreateComment } = useMutation(createComment);

  const handleSubmitComment = (comment: Comment) => {
    mutateCreateComment({
      body: comment.body,
      destId: dest_id,
      resources: comment.resources,
    });
  };

  return (
    <div className="max-w mx-auto pt-4 bg-white p-8 mt-8">
      <CommentEditor onSubmit={handleSubmitComment} postId={dest_id} />
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
        <CommentList comments={comments} postId={dest_id} />
      </div>
    </div>
  );
};

export default CommentLayout;
