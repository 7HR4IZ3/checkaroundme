import { z } from "zod";
import { MessageService } from "../appwrite";
import { messageSchema } from "../schema";

import type SuperJSON from "superjson";

export function createMessageProcedures(
  t: ReturnType<
    typeof import("@trpc/server").initTRPC.create<{
      transformer: typeof SuperJSON;
    }>
  >
) {
  return {
    sendMessage: t.procedure
      .input(
        z.object({
          conversationId: z.string(),
          senderId: z.string(),
          text: z.string().optional(),
          image: z.any().optional(), // File upload handling may need to be adapted for your setup
        })
      )
      // .output(messageSchema)
      .mutation(async ({ input }) => {
        const { conversationId, senderId, text, image } = input;
        return await MessageService.sendMessage(
          conversationId,
          senderId,
          text,
          image
        );
      }),

    getConversationMessages: t.procedure
      .input(
        z.object({
          conversationId: z.string(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      // .output(z.array(messageSchema))
      .query(async ({ input }) => {
        return await MessageService.getConversationMessages(
          input.conversationId,
          input.limit,
          input.offset
        );
      }),

    markMessagesAsRead: t.procedure
      .input(
        z.object({
          conversationId: z.string(),
          userId: z.string(),
        })
      )
      // .output(z.object({ success: z.boolean() }))
      .mutation(async ({ input }) => {
        await MessageService.markMessagesAsRead(
          input.conversationId,
          input.userId
        );
        return { success: true };
      }),
  };
}
