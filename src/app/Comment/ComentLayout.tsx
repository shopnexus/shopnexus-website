import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommentEditor from "./CommentEditor"
import CommentList ,{Comment}from "./CommentList"
import { ChevronDown } from "lucide-react";
const CommentLayout: React.FC = () => {

  const { id } = useParams<{ id: string }>()

  //fake dâta 
  const [comments, setComments] = useState<Comment[]>([
    {
      id: BigInt(1),
      user_id: BigInt(1),
      dest_id: BigInt(Number(id)), // Comment cho bài viết
      body: "I'm a bit unclear about how condensation forms in the water cycle. Can someone break it down?",
      resources: [
        "https://i.pinimg.com/736x/87/55/fe/8755feac69a09521f99019cb717f79d9.jpg",
        "https://i.pinimg.com/736x/33/93/62/33936262c457e4b43ea742d04ef188cf.jpg",
      ],
      upvote: 25,
      downvote: 0,
      score: 25,
      dateCreated: new Date(Date.now() - 56 * 60000),
    },
    {
      id: BigInt(2),
      user_id: BigInt(2),
      dest_id: BigInt(Number(id)), // Comment cho bài viết
      body: "Another comment on the post.",
      resources: [
        "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
        "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
      ],
      upvote: 15,
      downvote: 1,
      score: 14,
      dateCreated: new Date(Date.now() - 30 * 60000),
    },
    {
      id: BigInt(3),
      user_id: BigInt(3),
      dest_id: BigInt(1), // Reply cho comment id=1
      body: "Sure! Condensation happens when water vapor cools and turns back into liquid water.",
      resources: [],
      upvote: 10,
      downvote: 0,
      score: 10,
      dateCreated: new Date(Date.now() - 25 * 60000),
    },
    {
      id: BigInt(4),
      user_id: BigInt(4),
      dest_id: BigInt(1), // Reply cho comment id=1
      body: "It's like when you see dew on grass in the morning.",
      resources: [],
      upvote: 8,
      downvote: 0,
      score: 8,
      dateCreated: new Date(Date.now() - 20 * 60000),
    },
    {
      id: BigInt(5),
      user_id: BigInt(5),
      dest_id: BigInt(2), // Reply cho comment id=2
      body: "I think your comment is interesting. Can you elaborate more?",
      resources: [],
      upvote: 5,
      downvote: 0,
      score: 5,
      dateCreated: new Date(Date.now() - 15 * 60000),
    },
    {
      id: BigInt(6),
      user_id: BigInt(6),
      dest_id: BigInt(Number(id)), // Comment cho bài viết
      body: "Another top-level comment.",
      resources: [],
      upvote: 3,
      downvote: 0,
      score: 3,
      dateCreated: new Date(Date.now() - 10 * 60000),
    },
  ]);

  const handleSubmitComment = (comment:Comment) => {
    setComments([...comments, comment])
  }

  const handleCancel=()=>{
    console.log("cancle");
    
  } 


  return (
    <div className="max-w mx-auto pt-4 bg-white p-8 mt-8">
      <CommentEditor 
      onSubmit={handleSubmitComment}
      postId={id ? BigInt(id) : BigInt(0)}
       />
        <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium">Comments</h2>
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span>Most recent</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </div>
        </div>
        <CommentList comments={comments} postId={id ? BigInt(id) : BigInt(0)}/>
      </div>
    </div>
  )
};

export default CommentLayout;