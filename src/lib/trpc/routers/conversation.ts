import { z } from "zod";
import { ConversationService } from "../../appwrite";
import { conversationSchema, messageSchema, userSchema } from "../../schema";

import type { AppTRPC } from "../router";

export function createConversationProcedures(
  t: AppTRPC,
  protectedProcedure: typeof t.procedure,
) {
  return {
    getOrCreateConversation: t.procedure
      .input(
        z.object({
          userIds: z.array(z.string()),
        }),
      )
      // .output(conversationSchema)
      .mutation(async ({ input }) => {
        return await ConversationService.getOrCreateConversation(input.userIds);
      }),

    getUserConversations: t.procedure
      .input(
        z.object({
          userId: z.string(),
        }),
      )
      // .output(
      //   z.object({
      //     conversations: z.array(conversationSchema),
      //     lastMessages: z.record(z.string(), messageSchema),
      //     unreadCounts: z.record(z.string(), z.number()),
      //     participants: z.record(z.string(), z.array(userSchema)),
      //   })
      // )
      .query(async ({ input }) => {
        return await ConversationService.getUserConversations(input.userId);
      }),
  };
}
