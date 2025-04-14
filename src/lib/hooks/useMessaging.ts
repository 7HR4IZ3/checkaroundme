import { useState, useEffect } from "react";
import { ConversationService, MessageService } from "../appwrite";
import { useAuth } from "../hooks/useAuth";
import { Message, Conversation, User } from "../schema";

interface ConversationWithDetails {
  conversation: Conversation;
  lastMessage: Message | null;
  unreadCount: number;
  participants: User[];
}

export function useMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    []
  );
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) {
        setConversations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await ConversationService.getUserConversations(user.$id);

        const conversationsWithDetails: ConversationWithDetails[] =
          result.conversations.map((conv) => ({
            conversation: conv,
            lastMessage: result.lastMessages[conv.$id] || null,
            unreadCount: result.unreadCounts[conv.$id] || 0,
            participants: result.participants[conv.$id] || [],
          }));

        // Sort by last message timestamp, newest first
        conversationsWithDetails.sort((a, b) => {
          const timeA = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt).getTime()
            : 0;
          const timeB = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt).getTime()
            : 0;
          return timeB - timeA;
        });

        setConversations(conversationsWithDetails);

        // Set active conversation to the one with most recent message if not already set
        if (!activeConversation && conversationsWithDetails.length > 0) {
          setActiveConversation(conversationsWithDetails[0].conversation.$id);
        }
      } catch (err) {
        console.error("Error loading conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Implement real-time updates with a WebSocket or polling mechanism
    const interval = setInterval(loadConversations, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [user, activeConversation]);

  // Load messages for active conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversation || !user) {
        setMessages([]);
        return;
      }

      try {
        setLoading(true);
        const result = await MessageService.getConversationMessages(
          activeConversation
        );
        setMessages(result.reverse()); // Reverse to get oldest first

        // Mark messages as read
        await MessageService.markMessagesAsRead(activeConversation, user.$id);

        // Update unread count in conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversation.$id === activeConversation
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      } catch (err) {
        console.error("Error loading messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [activeConversation, user]);

  // Function to send a message
  const sendMessage = async (text?: string, image?: File) => {
    if (!activeConversation || !user || (!text && !image)) {
      return;
    }

    try {
      const newMessage = await MessageService.sendMessage(
        activeConversation,
        user.$id,
        text,
        image
      );

      // Update messages list
      setMessages((prev) => [...prev, newMessage]);

      // Update conversations list with new last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversation.$id === activeConversation
            ? {
                ...conv,
                lastMessage: newMessage,
              }
            : conv
        )
      );

      return newMessage;
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      throw err;
    }
  };

  // Function to start a new conversation
  const startConversation = async (
    otherUserId: string,
    initialMessage?: string
  ) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Create or get conversation
      const conversation = await ConversationService.getOrCreateConversation([
        user.$id,
        otherUserId,
      ]);

      // Set as active conversation
      setActiveConversation(conversation.$id);

      // Send initial message if provided
      if (initialMessage) {
        await sendMessage(initialMessage);
      }

      return conversation;
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Failed to start conversation");
      throw err;
    }
  };

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    setActiveConversation,
    sendMessage,
    startConversation,
  };
}
