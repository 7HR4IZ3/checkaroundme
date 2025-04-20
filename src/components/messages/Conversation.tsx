"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Phone, Send, ArrowUpCircle, File, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { redirect } from "next/navigation";
import { Conversation as ConversationType, Message } from "@/lib/schema"; // Renamed to avoid conflict
import { LoadingSVG } from "@/components/ui/loading";

interface ConversationProps {
  selectedChatId: string | null;
  messages: Message[];
  isLoadingMessages: boolean;
  activeChatUser: any; // Use a more specific user type if available
  currentUserAvatar: string | undefined;
  messageInput: string;
  setMessageInput: (input: string) => void;
  handleSendMessage: () => void;
  sendMessageMutation: any; // Use a more specific type if available
  currentUserId: string;
  showBackButton: boolean; // New prop for mobile back button
  onBackButtonClick: () => void; // New prop for back button click handler
}

export default function Conversation({
  selectedChatId,
  messages,
  isLoadingMessages,
  activeChatUser,
  currentUserAvatar,
  messageInput,
  setMessageInput,
  handleSendMessage,
  sendMessageMutation,
  currentUserId,
  showBackButton, // Destructure new prop
  onBackButtonClick, // Destructure new prop
}: ConversationProps) {
  return (
    <div className="flex-1 flex flex-col">
      {selectedChatId ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back button for mobile */}
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-muted md:hidden" // Show only on mobile
                  onClick={onBackButtonClick}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {activeChatUser ? (
                <>
                  <Avatar className="h-10 w-10">
                    {/* <AvatarImage
                      src={activeChatUser.avatarUrl}
                      alt={activeChatUser.name}
                    /> */}
                    <AvatarFallback>
                      {activeChatUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{activeChatUser.name}</p>
                    {/* Online status is not available in the provided data */}
                    {/* {activeChatContact.online && (
                      <p className="text-xs text-green-500">Online</p>
                    )} */}
                  </div>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div>
                    <p className="font-semibold text-muted-foreground">
                      Select a chat
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:bg-muted"
              disabled={!activeChatUser}
            >
              <Phone className="h-5 w-5" />
              <span className="sr-only">
                Call {activeChatUser?.name || "this user"}
              </span>
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {isLoadingMessages ? (
              <div className="text-center text-muted-foreground">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                // Determine sender and recipient avatars
                const senderIsMe = message.senderId === currentUserId;
                const messageAvatarUrl = senderIsMe
                  ? currentUserAvatar
                  : // : activeChatUser?.avatarUrl;
                    "";
                const messageSenderName = senderIsMe
                  ? "You"
                  : activeChatUser?.name || "Other";

                return (
                  <div
                    key={message.$id} // Use message.$id from Appwrite
                    className={`flex gap-3 ${
                      senderIsMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar for incoming messages */}
                    {!senderIsMe && (
                      <Avatar className="h-8 w-8 self-end flex-shrink-0">
                        <AvatarImage
                          src={messageAvatarUrl}
                          alt={`${messageSenderName} Avatar`}
                        />
                        <AvatarFallback>
                          {messageSenderName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2  ${
                        senderIsMe
                          ? "bg-[#2E57A9] text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.text && (
                        <p className="text-sm">{message.text}</p>
                      )}

                      {/* Image Attachment */}
                      {message.imageUrl && (
                        <div className="mt-2">
                          <div className="relative aspect-video max-w-xs rounded-md overflow-hidden mb-1">
                            <Image
                              src={message.imageUrl}
                              alt={message.imageName || "Attached image"}
                              fill
                              style={{ objectFit: "cover" }}
                              sizes="(max-width: 640px) 50vw, 33vw"
                            />
                            {/* Upload icon overlay - simplistic representation */}
                            {/* <div className="absolute bottom-1 right-1 bg-orange-500 rounded-full p-0.5">
                                        <ArrowUpCircle className="h-4 w-4 text-white"/>
                                     </div> */}
                          </div>
                          {/* File details card */}
                          <div
                            className={`flex items-center gap-2 p-2 rounded-md ${
                              senderIsMe ? "bg-[#2E57A9]/80" : "bg-background/80"
                            }`}
                          >
                            <File
                              className={`h-5 w-5 flex-shrink-0 ${
                                senderIsMe
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <div>
                              <p
                                className={`text-xs font-medium ${
                                  senderIsMe
                                    ? "text-primary-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {message.imageName || "Image File"}
                              </p>
                              <p
                                className={`text-xs ${
                                  senderIsMe
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Size: {message.imageSize || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <p
                        className={`text-xs mt-1 ${
                          senderIsMe
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Avatar for outgoing messages */}
                    {senderIsMe && (
                      <Avatar className="h-8 w-8 self-end flex-shrink-0">
                        <AvatarImage
                          src={messageAvatarUrl}
                          alt={`${messageSenderName} Avatar`}
                        />
                        <AvatarFallback>
                          {messageSenderName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
            )}
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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={
                !selectedChatId || sendMessageMutation.status === "pending"
              }
            />
            <Button
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 w-10 h-10"
              onClick={handleSendMessage}
              disabled={
                !messageInput.trim() ||
                !selectedChatId ||
                sendMessageMutation.status === "pending"
              }
            >
              <Send className="h-5 w-5 text-primary-foreground" />
              <span className="sr-only">Send Message</span>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select a conversation to start chatting
        </div>
      )}
    </div>
  );
}
