import { Priorities } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import slugify from "slugify";
import { z } from "zod";

import { formatTimeAgo, getFilterByInput } from "~/utils";
import { slugSettings } from "~/utils/constant";
import { madingSchema } from "~/utils/validation/mading";

export const madingRouter = createTRPCRouter({
  createMading: protectedProcedure
    .input(madingSchema)
    .mutation(async ({ ctx, input }) => {
      const { title, description, thumbnail, categoryId, priority, article } = input;
      const slug = slugify(title, slugSettings);

      const exist = await ctx.db.madings.findFirst({
        where: {
          OR: [{ title }, { slug }],
        },
      });

      if (exist) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Terdapat mading dengan judul yang serupa.",
        });
      }

      const enumPriority = priority ? Priorities.Important : Priorities.Normal;

      const transactionResult = await ctx.db.$transaction(async () => {
        const newMading = await ctx.db.madings.create({
          data: {
            authorId: ctx.session.user.id,
            title: title,
            slug: slug,
            description: description,
            thumbnail: thumbnail,
            article: article,
            priority: enumPriority,
            categoryId: categoryId,
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

  getAllMading: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        authorId: z.string().optional(),
        categoryId: z.string().optional(),
        priority: z.nativeEnum(Priorities).optional(),
        filter: z.string().optional(),
        query: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, skip, cursor, filter } = input;

      const madings = await ctx.db.madings.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        ...(filter
          ? { orderBy: getFilterByInput(filter) }
          : {
              orderBy: {
                createdAt: "desc",
              },
            }),
        include: {
          author: true,
          category: true,
        },
        ...(input.priority && {
          where: {
            priority: input.priority,
          },
        }),
        ...(input.authorId && {
          where: {
            authorId: input.authorId,
          },
        }),
        ...(input.categoryId && {
          where: {
            category: {
              id: input.categoryId,
            },
          },
        }),
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (madings.length > limit) {
        const nextItem = madings.pop();
        nextCursor = nextItem?.id;
      }

      return {
        madings,
        nextCursor,
      };
    }),

  getSingleMading: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const madings = await ctx.db.madings.findFirst({
        where: {
          slug: input.slug,
        },
        include: {
          author: true,
          category: true,
        },
      });

      const formattedDate = formatTimeAgo(madings!.createdAt, { smart: true });

      return {
        ...madings,
        createdAt: formattedDate,
      };
    }),
});
