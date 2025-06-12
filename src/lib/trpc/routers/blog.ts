import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { BlogService } from "../../appwrite";
import { createBlogPostSchema, updateBlogPostSchema } from "../../schema";
import type { AppTRPC } from "../router";
import { AuthService } from "@/lib/appwrite/services/auth";

export const blogFilterSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z
    .enum(["recent", "oldest", "popular", "title"])
    .optional()
    .default("recent"),
});

export const createBlogProcedures = (
  t: AppTRPC,
  protectedProcedure: typeof t.procedure
) => ({
  blog: t.router({
    create: protectedProcedure
      .input(createBlogPostSchema)
      .mutation(async ({ input }) => {
        try {
          return await BlogService.createPost(input);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create blog post",
            cause: error,
          });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          data: updateBlogPostSchema,
        })
      )
      .mutation(async ({ ctx, input }) => {
        const auth = await AuthService.getCurrentUser();
        if (!auth) throw new TRPCError({ code: "UNAUTHORIZED" });

        const post = await BlogService.getPost(input.id);
        if (post.authorId !== auth.user.$id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return await BlogService.updatePost(input.id, input.data);
      }),

    get: t.procedure.input(z.string()).query(async ({ input }) => {
      try {
        return await BlogService.getPost(input);
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found",
          cause: error,
        });
      }
    }),

    getBySlug: t.procedure.input(z.string()).query(async ({ input }) => {
      try {
        return await BlogService.getPostBySlug(input);
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found",
          cause: error,
        });
      }
    }),

    list: t.procedure.input(blogFilterSchema).query(async ({ input }) => {
      try {
        return await BlogService.listPosts(input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list blog posts",
          cause: error,
        });
      }
    }),

    search: t.procedure.input(z.string()).query(async ({ input }) => {
      try {
        return await BlogService.searchPosts(input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search posts",
          cause: error,
        });
      }
    }),

    getCategories: t.procedure.query(async () => {
      try {
        return await BlogService.getCategories();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get categories",
          cause: error,
        });
      }
    }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
      try {
        await BlogService.deletePost(input);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete blog post",
          cause: error,
        });
      }
    }),
  }),
});
