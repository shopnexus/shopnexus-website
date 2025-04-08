"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { ChatComponent } from "./chat" // Đặt tên đúng theo đường dẫn bạn lưu

export function ChatBubbleWrapper() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-all bg-blue-500"
        >
          <MessageCircle className="" />
        </button>
      )}

      {/* Full Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] max-w-md shadow-xl rounded-xl bg-white border border-gray-300 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <span className="font-semibold">Chat with Admin</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-[500px] overflow-hidden">
            <div className="transition-all duration-300 transform scale-100 opacity-100">
                <ChatComponent />
            </div>

            
          </div>
        </div>
      )}
    </>
  )
}
