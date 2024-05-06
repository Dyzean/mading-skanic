import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { madingSchema } from "~/utils/validation/mading";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const madingRouter = createTRPCRouter({
  createMading: protectedProcedure
    .input(madingSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.title, {
        lower: true,
        strict: true,
      });

      const transactionResult = await ctx.db.$transaction(async () => {
        const newMading = await ctx.db.madings.create({
          data: {
            authorId: ctx.session.user.id,
            title: input.title,
            slug: slug,
            description: input.description,
            thumbnail: input.thumbnail,
            article: input.article,
            priority: input.priority,
            categoryId: input.category.id,
          },
        });

        return { newMading };
      });

      if (!transactionResult) {
        throw new TRPCError({ code: "NOT_IMPLEMENTED" });
      }

      return {
        createMading: transactionResult.newMading,
        success: true,
      };
    }),
});
