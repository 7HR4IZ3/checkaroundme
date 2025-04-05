// src/components/MessagesPage.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator"; // Optional
import { Search, Phone, Send, ArrowUpCircle, File } from "lucide-react";

// --- Mock Data ---
interface ChatContact {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  online?: boolean;
}

interface Message {
  id: string;
  sender: "me" | "other";
  text?: string;
  imageUrl?: string;
  imageName?: string;
  imageSize?: string;
  timestamp: string; // Simplified timestamp for display
  avatarUrl?: string; // Only for 'other' sender
}

const mockContacts: ChatContact[] = [
  { id: "1", name: "Amaka Okonkwo", avatarUrl: "/placeholder-avatars/amaka.jpg", lastMessage: "Hi Janet, reaching out to inform you about the...", timestamp: "2:30 PM" },
  { id: "2", name: "Mimi Oko", avatarUrl: "/placeholder-avatars/mimi.jpg", lastMessage: "Hi Janet, reaching out to inform you about the...", timestamp: "2:30 PM", unreadCount: 3 },
  { id: "3", name: "Ali Ushman", avatarUrl: "/placeholder-avatars/ali.jpg", lastMessage: "Hi Janet, reaching out to inform you about the...", timestamp: "2:30 PM" },
  { id: "4", name: "Kelvin Gates", avatarUrl: "/placeholder-avatars/kelvin.jpg", lastMessage: "Hi Janet, reaching out to inform you about the...", timestamp: "2:30 PM" },
  { id: "5", name: "Mooverr Support", avatarUrl: "/placeholder-avatars/support.jpg", lastMessage: "Hi Janet, reaching out to inform you about the...", timestamp: "2:30 PM" },
];

const mockMessages: Message[] = [
    { id: "m1", sender: "other", avatarUrl: "/placeholder-avatars/vincent.jpg", text: "Hi Janet, reaching out to inform you about the product with Kyle about the Dash & Cams case. We have all the files you requested set for the meet. Regards.", timestamp: "2:35 PM" },
    { id: "m2", sender: "other", avatarUrl: "/placeholder-avatars/vincent.jpg", imageUrl: "/placeholder-images/screenshot.png", imageName: "Screensho.png", imageSize: "1.9 mb", timestamp: "2:36 PM"},
    { id: "m3", sender: "me", text: "Hi Janet, reaching out to inform you about the meeting with Kyle about the Dash & Cams case. We have all the files you requested set for the meet. Regards.", timestamp: "2:38 PM", avatarUrl: "/placeholder-avatars/mary.jpg" }, // Added user avatar for outgoing message display
];

const activeChatContact: ChatContact = {
    id: "vincent",
    name: "Vincent Kalu",
    avatarUrl: "/placeholder-avatars/vincent.jpg",
    lastMessage: "", // Not needed here
    timestamp: "", // Not needed here
    online: true,
};

const currentUserAvatar = "/placeholder-avatars/mary.jpg"; // User's avatar for input

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(mockContacts[1].id); // Default to Mimi Oko who has unread msgs

  // Filter contacts based on search term (simple implementation)
  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log("Sending message:", messageInput);
      // Add logic to append message to state/API
      setMessageInput("");
    }
  };

  return (
    <div className="flex h-screen border bg-card text-card-foreground"> {/* Use h-screen or adjust height as needed */}
      {/* Left Column: Chat List */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header & Search */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Search"
              className="flex-1 rounded-full bg-muted border-none focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Design shows search icon in a button, implementing that */}
            <Button size="icon" variant="default" className="rounded-full bg-primary hover:bg-primary/90">
                <Search className="h-5 w-5 text-primary-foreground" />
                <span className="sr-only">Search Messages</span>
            </Button>
          </div>
        </div>

        {/* Chat List Items */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              className={`w-full text-left p-4 border-b hover:bg-muted transition-colors ${
                selectedChatId === contact.id ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedChatId(contact.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                  <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0"> {/* min-w-0 prevents text overflow issues */}
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold truncate">{contact.name}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{contact.timestamp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                         <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                         {contact.unreadCount && contact.unreadCount > 0 && (
                            <Badge variant="default" className="h-5 px-2 rounded-full bg-primary text-primary-foreground flex-shrink-0 ml-2">
                                {contact.unreadCount}
                            </Badge>
                         )}
                    </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Active Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activeChatContact.avatarUrl} alt={activeChatContact.name} />
              <AvatarFallback>{activeChatContact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{activeChatContact.name}</p>
              {activeChatContact.online && (
                <p className="text-xs text-green-500">Online</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-primary hover:bg-muted">
            <Phone className="h-5 w-5" />
            <span className="sr-only">Call {activeChatContact.name}</span>
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === 'me' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Avatar for incoming messages */}
              {message.sender === 'other' && (
                <Avatar className="h-8 w-8 self-end flex-shrink-0">
                  <AvatarImage src={message.avatarUrl} alt="Sender Avatar" />
                  <AvatarFallback>??</AvatarFallback>
                </Avatar>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender === 'me'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.text && <p className="text-sm">{message.text}</p>}

                {/* Image Attachment */}
                {message.imageUrl && (
                    <div className="mt-2">
                        <div className="relative aspect-video max-w-xs rounded-md overflow-hidden mb-1">
                            <Image
                                src={message.imageUrl}
                                alt={message.imageName || "Attached image"}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 640px) 50vw, 33vw"
                            />
                             {/* Upload icon overlay - simplistic representation */}
                             <div className="absolute bottom-1 right-1 bg-orange-500 rounded-full p-0.5">
                                <ArrowUpCircle className="h-4 w-4 text-white"/>
                             </div>
                        </div>
                        {/* File details card */}
                        <div className={`flex items-center gap-2 p-2 rounded-md ${message.sender === 'me' ? 'bg-primary/80' : 'bg-background/80'}`}>
                           <File className={`h-5 w-5 flex-shrink-0 ${message.sender === 'me' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}/>
                            <div>
                                <p className={`text-xs font-medium ${message.sender === 'me' ? 'text-primary-foreground' : 'text-foreground'}`}>{message.imageName || 'Image File'}</p>
                                <p className={`text-xs ${message.sender === 'me' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>Size: {message.imageSize || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timestamp (Optional - place below text/image) */}
                {/* <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{message.timestamp}</p> */}
              </div>

               {/* Avatar for outgoing messages (as shown in design near input) - simpler to place here */}
               {message.sender === 'me' && (
                <Avatar className="h-8 w-8 self-end flex-shrink-0">
                  <AvatarImage src={message.avatarUrl} alt="My Avatar" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>

        {/* Message Input Area */}
        <div className="p-4 border-t flex items-center gap-3 bg-card">
          <Avatar className="h-9 w-9 flex-shrink-0">
             <AvatarImage src={currentUserAvatar} alt="Your Avatar" />
             <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="Your message"
            className="flex-1 resize-none border rounded-full px-4 py-2 bg-muted focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 min-h-[40px] max-h-[100px]" // Adjust height as needed
            rows={1} // Start with 1 row, auto-expands slightly
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
                 // Optional: Send on Enter, new line on Shift+Enter
                 if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                 }
            }}
          />
          <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90 w-10 h-10" onClick={handleSendMessage} disabled={!messageInput.trim()}>
            <Send className="h-5 w-5 text-primary-foreground" />
            <span className="sr-only">Send Message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}