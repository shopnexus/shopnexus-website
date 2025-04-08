import { useState } from "react";
import { Message } from "../../../components/chat";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/Card";
import { ScrollArea } from "../../../components/ui/Scroll-Area";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { Send, Users } from "lucide-react";

// Mock user data
interface User {
  id: string;
  name: string;
}

const mockUsers: User[] = [
  { id: "user1", name: "Alice" },
  { id: "user2", name: "Bob" },
];

export default function ChatManager() {
  const [users] = useState<User[]>(mockUsers);
  const [activeUserId, setActiveUserId] = useState<string | null>(users[0]?.id || null);

  const [chats, setChats] = useState<Record<string, Message[]>>({
    user1: [
      {
        id: "1",
        role: "user",
        content: "Hi Admin!",
      },
    ],
    user2: [],
  });

  const [input, setInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleSend = () => {
    if (!activeUserId || (!input.trim() && selectedImages.length === 0)) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: input.trim() || undefined,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
    };

    setChats((prev) => ({
      ...prev,
      [activeUserId]: [...(prev[activeUserId] || []), newMessage],
    }));

    setInput("");
    setSelectedImages([]);
  };

  return (
    <div className="flex gap-4 h-[85vh] p-4">
      {/* Sidebar Users */}
      <Card className="w-64 flex-shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((user) => (
            <button
              key={user.id}
              className={`w-full text-left p-2 rounded-lg ${
                activeUserId === user.id ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveUserId(user.id)}
            >
              {user.name}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-col flex-grow">
        <CardHeader>
          <CardTitle>Chat with {users.find((u) => u.id === activeUserId)?.name || "..."}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-4 pt-2">
              {activeUserId &&
                (chats[activeUserId] || []).map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[70%] ${msg.role === "user" ? "bg-gray-200" : "bg-blue-500 text-white"} px-4 py-2 rounded-lg`}>
                      {msg.content && <div>{msg.content}</div>}
                      {Array.isArray(msg.images)&&msg.images?.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {msg.images.map((img, idx) => (
                            <img key={idx} src={img} className="w-20 h-20 object-cover rounded" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Preview selected images */}
        {selectedImages.length > 0 && (
          <div className="px-4 flex gap-2 flex-wrap">
            {selectedImages.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt={`preview-${i}`} className="w-20 h-20 object-cover rounded" />
                <button
                  onClick={() => setSelectedImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-0 right-0 p-1 bg-black bg-opacity-50 text-white rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
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
              placeholder="Reply..."
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
    </div>
  );
}
