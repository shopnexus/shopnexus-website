import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send,XCircleIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import { ScrollArea } from "./ui/Scroll-Area";
import Button from "./ui/Button";
import Input from "./ui/Input";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content?: string;
  images?: string[];
}

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    role: "assistant",
    content: "Hello! I'm the admin assistant for our shoe store. How can I help you today?",
  }]);

  const [input, setInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && selectedImages.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim() || undefined,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSelectedImages([]);
  };

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
                <div className={`flex ${message.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}>
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
                  <div className="space-y-2">
                    {message.content && (
                      <div className={`rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{message.content}</div>
                    )}
                    {Array.isArray(message.images) && message.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {message.images.map((img, i) => (
                          <img key={i} src={img} className="w-32 h-32 object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {selectedImages.length > 0 && (
        <div className="px-4 flex gap-2 flex-wrap m-5">
          {selectedImages.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`preview-${i}`} className="w-20 h-20 object-cover rounded" />
              <button
                onClick={() => setSelectedImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-0 right-0 p-1 bg-black bg-opacity-50 text-white rounded-full m-1"
              >
                <XCircleIcon className="w-3 h-3">

                </XCircleIcon>
              </button>
            </div>
          ))}
        </div>
      )}

      <CardFooter>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            canPastImage
            onImagePaste={(urls) => setSelectedImages((prev) => [...prev, ...urls])}
            className="flex-grow"
          />
          <Button type="submit" disabled={!input.trim() && selectedImages.length === 0}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
