import { Comment } from "../app/Comment/CommentList";
import CommentEditor from "../app/Comment/CommentEditor";

interface ReplyEditorProps {
  commentId: bigint;
  postId: bigint;
  onSubmit: (comment: Comment) => void;
  onCancel: () => void;
}

const ReplyEditor: React.FC<ReplyEditorProps> = ({
  commentId,
  postId,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="mt-2">
      <CommentEditor
        isReply
        commentId={commentId}
        postId={postId}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

export default ReplyEditor;
