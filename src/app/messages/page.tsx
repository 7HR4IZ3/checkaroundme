// src/components/MessagesPage.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation"; // Added import
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator"; // Optional
import { Search, Phone, Send, ArrowUpCircle, File } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { redirect } from "next/navigation";
import { Conversation as ConversationType } from "@/lib/schema";
import { LoadingSVG } from "@/components/ui/loading";
import Conversation from "@/components/messages/conversation";

// --- Data Fetching and State ---
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

function ConversationItem({
  conversation,
  lastMessages,
  unreadCounts,
  currentUserId,
  selectedChatId,
  setSelectedChatId,
  participant, // Pass the participant data directly
}: {
  conversation: ConversationType;
  lastMessages: Record<string, any>; // Use a more specific type if available
  unreadCounts: Record<string, number>;
  currentUserId: string;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  participant: any; // Use a more specific user type if available
}) {
  if (!participant) return null; // Should not happen if filtered correctly, but as a safeguard

  const lastMessage = lastMessages[conversation.$id];
  const unreadCount = unreadCounts[conversation.$id] || 0;

  return (
    <button
      key={conversation.$id}
      className={`w-full text-left p-4 border-b hover:bg-muted transition-colors ${
        selectedChatId === conversation.$id ? "bg-muted" : ""
      }`}
      onClick={() => setSelectedChatId(conversation.$id)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={participant.avatarUrl} alt={participant.name} />
          <AvatarFallback>
            {participant.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {" "}
          {/* min-w-0 prevents text overflow issues */}
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold truncate">{participant.name}</p>
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {lastMessage?.createdAt
                ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground truncate">
              {lastMessage?.text || lastMessage?.imageName || "No messages yet"}
            </p>
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="h-5 px-2 rounded-full bg-primary text-primary-foreground flex-shrink-0 ml-2"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function MessagesPage() {
  const { user, profile, isAuthenticated } = useAuth(); // Get current user from auth hook
  const searchParams = useSearchParams(); // Get search params
  const recipientId = searchParams.get("recipient"); // Get recipient ID

  if (!isAuthenticated) {
    redirect("/auth");
    return null; // Return null or a loading state while redirecting
  }

  const currentUserId = user.$id; // Assuming user ID is stored in user.$id

  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null); // No default selected chat
  const [isMobile, setIsMobile] = useState(false); // New state for mobile detection

  useEffect(() => {
    const handleResize = () => {
      // Check if window is defined (for SSR)
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768); // Using 768px as the md breakpoint
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Fetch user's conversations
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    refetch: refetchConversations, // Added refetch function
  } = trpc.getUserConversations.useQuery(
    { userId: currentUserId },
    { enabled: !!currentUserId } // Only fetch if user ID is available
  );

  const conversations = conversationsData?.conversations || [];
  const lastMessages = conversationsData?.lastMessages || {};
  const unreadCounts = conversationsData?.unreadCounts || {};
  const participantsData = conversationsData?.participants || {}; // Renamed to avoid conflict

  // Automatically select the first conversation if none is selected and conversations are loaded
  // useEffect(() => {
  //   if (!selectedChatId && conversations.length > 0) {
  //     setSelectedChatId(conversations[0].$id);
  //   }
  // }, [conversations, selectedChatId]);

  // Effect to select chat based on recipientId search param
  // useEffect(() => {
  //   if (
  //     recipientId &&
  //     conversationsData &&
  //     !isLoadingConversations &&
  //     currentUserId
  //   ) {
  //     const existingConversation = conversations.find((conv) => {
  //       // Find the ID of the other participant
  //       const otherParticipantId = conv.participants.find(
  //         (p) => p !== currentUserId
  //       );
  //       // Check if the other participant's ID matches the recipientId from the URL
  //       return otherParticipantId === recipientId;
  //     });

  //     if (existingConversation) {
  //       setSelectedChatId(existingConversation.$id);
  //     } else {
  //       // Optional: Handle case where no conversation exists with the recipient.
  //       // Could clear selection, show a message, or trigger a 'new chat' flow.
  //       // For now, we'll just not select anything if no match is found.
  //       console.log(`No existing conversation found with recipient: ${recipientId}`);
  //     }
  //   }
  // // Add recipientId and conversationsData to dependency array
  // }, [recipientId, conversationsData, isLoadingConversations, currentUserId, conversations]);

  // Fetch messages for the selected conversation
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = trpc.getConversationMessages.useQuery(
    { conversationId: selectedChatId! },
    { enabled: !!selectedChatId } // Only fetch if a chat is selected
  );

  const messages = messagesData || [];

  // Mutation to get or create a conversation
  const getOrCreateConversationMutation =
    trpc.getOrCreateConversation.useMutation({
      onSuccess: (newConversation) => {
        console.log(newConversation);
        // Refetch the conversation list to include the new one
        refetchConversations();
        // Select the newly created/fetched conversation
        setSelectedChatId(newConversation.$id);
      },
      onError: (error) => {
        console.error("Error getting or creating conversation:", error);
        // Handle error appropriately (e.g., show a toast notification)
      },
    });

  // Get the active chat conversation and the other participant's user data
  const activeChatConversation = conversations.find(
    (conv) => conv.$id === selectedChatId
  );
  const activeChatOtherParticipantId =
    activeChatConversation?.participants.find((p) => p !== currentUserId);

  const activeChatUser = activeChatConversation
    ? participantsData[activeChatConversation.$id]?.find(
        (user) => user.$id === activeChatOtherParticipantId
      )
    : null;

  // Send message mutation
  const sendMessageMutation = trpc.sendMessage.useMutation({
    onSuccess: (newMessage) => {
      // Refetch messages after sending a new one
      refetchMessages();
      setMessageInput("");
    },
  });

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChatId && currentUserId) {
      sendMessageMutation.mutate({
        conversationId: selectedChatId,
        senderId: currentUserId,
        text: messageInput.trim(),
        // image: ... // Add image handling if needed
      });
    }
  };

  const markConversationAsRead = trpc.markMessagesAsRead.useMutation({
    onSuccess: () => {
      refetchConversations();
    }
  });
  const handleSelectedChatId = (conversationId: string | null) => {
    if (conversationId && unreadCounts[conversationId]) {
      markConversationAsRead.mutate({
        conversationId,
        userId: currentUserId,
      });
    }
    setSelectedChatId(conversationId);
  };

  // Effect to select chat based on recipientId search param or create a new one
  useEffect(() => {
    if (
      !selectedChatId &&
      recipientId &&
      conversationsData && // Ensure data is loaded before proceeding
      !isLoadingConversations &&
      currentUserId
    ) {
      const existingConversation = conversations.find((conv) => {
        const otherParticipantId = conv.participants.find(
          (p) => p !== currentUserId
        );
        return otherParticipantId === recipientId;
      });

      if (existingConversation) {
        // Only select if it's not already selected to avoid loops
        if (selectedChatId !== existingConversation.$id) {
          setSelectedChatId(existingConversation.$id);
        }
      } else {
        // No existing conversation, try to create or get one
        console.log(
          `No existing conversation found with recipient: ${recipientId}. Creating...`
        );
        getOrCreateConversationMutation.mutate({
          userIds: [currentUserId, recipientId],
        });
      }
    }
    // Add mutation loading state and selectedChatId to dependencies
  }, [
    recipientId,
    conversationsData,
    isLoadingConversations,
    currentUserId,
    conversations,
    selectedChatId, // Add selectedChatId
  ]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conv) => {
    // Find the other participant in a 1:1 chat
    const otherParticipantId = conv.participants.find(
      (p) => p !== currentUserId
    );
    const otherParticipant = otherParticipantId
      ? participantsData[conv.$id].find(
          (user) => user.$id === otherParticipantId
        )
      : null;
    return otherParticipant?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  // Determine the current user's avatar
  const currentUserAvatar = profile?.avatarUrl; // Adjust based on where avatarUrl is stored

  return (
    <div className="flex h-[90vh] border bg-card text-card-foreground">
      {" "}
      {/* Use h-screen or adjust height as needed */}
      {/* Left Column: Chat List */}
      <div
        className={`flex-col md:w-1/3 md:border-r ${
          isMobile && selectedChatId ? "hidden" : "w-full flex"
        }`}
      >
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
            {/* <Button
              size="icon"
              variant="default"
              className="rounded-full bg-primary hover:bg-primary/90"
            >
              <Search className="h-5 w-5 text-primary-foreground" />
              <span className="sr-only">Search Messages</span>
            </Button> */}
          </div>
        </div>

        {/* Chat List Items */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading conversations...
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipantId = conversation.participants.find(
                (p) => p !== currentUserId
              );
              const otherParticipant = otherParticipantId
                ? participantsData[conversation.$id].find(
                    (user) => user.$id === otherParticipantId
                  )
                : null;

              if (!otherParticipant) return null; // Should not happen with correct data, but as safeguard

              return (
                <ConversationItem
                  key={conversation.$id}
                  conversation={conversation}
                  lastMessages={lastMessages}
                  unreadCounts={unreadCounts}
                  currentUserId={currentUserId}
                  selectedChatId={selectedChatId}
                  setSelectedChatId={handleSelectedChatId}
                  participant={otherParticipant} // Pass the participant data
                />
              );
            })
          )}
        </div>
      </div>
      {/* Right Column: Active Chat Window */}
      <div
        className={`flex-1 ${
          isMobile && !selectedChatId ? "hidden" : "w-full md:w-2/3 flex"
        }`}
      >
        <Conversation
          selectedChatId={selectedChatId}
          messages={messages}
          refetchConversations={refetchConversations}
          isLoadingMessages={isLoadingMessages}
          activeChatUser={activeChatUser}
          currentUserAvatar={currentUserAvatar}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          handleSendMessage={handleSendMessage}
          sendMessageMutation={sendMessageMutation}
          currentUserId={currentUserId}
          showBackButton={isMobile && selectedChatId !== null}
          onBackButtonClick={() => setSelectedChatId(null)}
        />
      </div>
    </div>
  );
}
