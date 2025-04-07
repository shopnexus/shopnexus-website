import { useState } from "react"
import CommentEditor from "./CommentEditor"

const ReplyEditor = ({ commentId }: { commentId: number }) => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  const toggleReply = (commentId: number) => {
    setReplyingTo(prev => (prev === commentId ? null : commentId))
  }

  return (
    <div className="mt-2">
      <CommentEditor
        onSubmit={(value) => {
          console.log(`Reply to comment ${commentId}:`, value)
          setReplyingTo(null)
        }}
        onCancel={() => setReplyingTo(null)}
      />
    </div>
  )
}

export default ReplyEditor
