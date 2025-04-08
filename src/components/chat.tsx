import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import Button from "./ui/Button"
import Input from "./ui/Input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar"
import { ScrollArea } from "./ui/Scroll-Area"
import { MessageCircle, Send } from "lucide-react"

export function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm the admin assistant for our shoe store. How can I help you today?",
      },
    ],
    api: "/api/chat",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) handleSubmit(e)
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          Chat with Admin
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[420px] pr-4 pt-8">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex ${message.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
                >
                  <Avatar className="h-8 w-8">
                    {message.role === "user" ? (
                      <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src="/placeholder.svg?height=32&width=32&text=A" alt="Admin" />
                        <AvatarFallback className="bg-gray-200">A</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-200">A</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter>
        <form onSubmit={handleFormSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask something..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
