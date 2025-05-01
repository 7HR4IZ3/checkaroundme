import { z } from "zod";
import { CategoryService } from "../../appwrite";
import { categorySchema } from "../../schema";
import type SuperJSON from "superjson";

export function createCategoryProcedures(
  t: ReturnType<
    typeof import("@trpc/server").initTRPC.create<{
      transformer: typeof SuperJSON;
    }>
  >
) {
  return {
    createCategory: t.procedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().url().optional(),
          parentId: z.string().uuid().optional(),
        })
      )
      // .output(categorySchema)
      .mutation(async ({ input }) => {
        const { name, description, imageUrl, parentId } = input;
        return await CategoryService.createCategory(
          name,
          description,
          imageUrl,
          parentId
        );
      }),

    getAllCategories: t.procedure
      // .output(z.array(categorySchema))
      .query(async () => {
        return await CategoryService.getAllCategories();
      }),

    getCategoryById: t.procedure
      .input(z.object({ categoryId: z.string().uuid() }))
      // .output(categorySchema)
      .query(async ({ input }) => {
        return await CategoryService.getCategoryById(input.categoryId);
      }),
  };
}
