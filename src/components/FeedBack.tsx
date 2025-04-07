import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {Comment,bodyProps} from "./CommentList";
import CommentEditor from "./CommentEditor"
import CommentList from "./CommentList"
import { ChevronDown } from "lucide-react";
const FeedBack: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user_id: 1,
      dest_id: 0,
      body: {
        content:"I'm a bit unclear about how condensation forms in the water cycle. Can someone break it down?",
        resources:[
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif"
        ]
      },
      upvote: 25,
      downvote: 0,
      score: 25,
      created_at: new Date(Date.now() - 56 * 60000),
      user: {
        id: 1,
        name: "Noah Pierre",
        avatar: "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
      },
    },
    {
      id: 2,
      user_id: 2,
      dest_id: 0,
      body: {
        content:"I'm a bit unclear about how condensation forms in the water cycle. Can someone break it down?",
        resources:[
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif"
        ]
      },
      upvote: 18,
      downvote: 0,
      score: 18,
      created_at: new Date(Date.now() - 6 * 60000),
      user: {
        id: 2,
        name: "Sara Sprout",
        avatar: "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
        verified: true,
      },
    },
    {
      id: 3,
      user_id: 3,
      dest_id: 0,
      body: {
        content:"I'm a bit unclear about how condensation forms in the water cycle. Can someone break it down?",
        resources:[
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif"
        ]
      },
      upvote: 9,
      downvote: 0,
      score: 9,
      created_at: new Date(Date.now() - 3 * 60 * 60000),
      user: {
        id: 3,
        name: "Mattie Hall",
        avatar: "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
      },
    },
    {
      id: 4,
      user_id: 4,
      dest_id: 0,
      body: {
        content:"I'm a bit unclear about how condensation forms in the water cycle. Can someone break it down?",
        resources:[
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif"
        ]
      },
      upvote: 12,
      downvote: 0,
      score: 12,
      created_at: new Date(Date.now() - 24 * 60 * 60000),
      user: {
        id: 4,
        name: "Lyle Kauffman",
        avatar: "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
      },
    },
    {
      id: 5,
      user_id: 5,
      dest_id: 4,
      body: {
        content:"I'm a bit unclear about how condensation forms in the water cycle. Can someone break it down?",
        resources:[
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif"
        ]
      },
      upvote: 8,
      downvote: 0,
      score: 8,
      created_at: new Date(Date.now() - 12 * 60 * 60000),
      user: {
        id: 5,
        name: "Amanda Lowery",
        avatar: "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
      },
    },
    {
      id: 6,
      user_id: 6,
      dest_id: 0,
      body: {
        content:"I'm a bit unclear about how condensation forms in the water cycle. Can someone break it down?",
        resources:[
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
          "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif"
        ]
      },
      upvote: 5,
      downvote: 0,
      score: 5,
      created_at: new Date(Date.now() - 2 * 60 * 60000),
      user: {
        id: 6,
        name: "Owen Garcia",
        avatar: "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
      },
    },
  ])

  const handleSubmitComment = (body: bodyProps) => {
    const newComment: Comment = {
      id: comments.length + 1,
      user_id: 7, // Current user ID
      dest_id: 0, // Main thread
      body,
      upvote: 0,
      downvote: 0,
      score: 0,
      created_at: new Date(),
      user: {
        id: 7,
        name: "Current User",
        avatar: "https://i.pinimg.com/originals/d6/9d/90/d69d903dcc72999e03f61cc559f0206e.gif",
      },
    }

    setComments([...comments, newComment])
  }

  return (
    <div className="max-w mx-auto pt-4 bg-white">
      <CommentEditor onSubmit={handleSubmitComment} />
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
        <CommentList comments={comments} />
      </div>
    </div>
  )
};

export default FeedBack;