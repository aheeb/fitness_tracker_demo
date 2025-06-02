import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const workoutRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        exercise: z.string().min(1),
        sets: z.number().int().positive(),
        reps: z.number().int().positive(),
        weight: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In a real app, you'd probably get the userId from `ctx.session.user.id`
      // and add it to the workout record. For now, we'll keep it simple.
      const workout = await ctx.db.workout.create({
        data: {
          exercise: input.exercise,
          sets: input.sets,
          reps: input.reps,
          weight: input.weight,
          // createdAt is handled by @default(now()) in schema
        },
      });
      return workout;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const workouts = await ctx.db.workout.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return workouts;
  }),
});
