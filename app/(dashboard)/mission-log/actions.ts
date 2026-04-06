"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getWorkoutFromLog(logId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const log = await prisma.point_logs.findUnique({ where: { id: logId } });
  if (!log) throw new Error("Log not found");

  if (log.source_type !== "Training Session" && log.source_type !== "workout") {
      throw new Error("Not a training session");
  }

  if (!log.created_at) throw new Error("Missing creation timestamp");

  const workout = await prisma.workouts.findFirst({
    where: {
      user_id: log.user_id,
      status: "completed",
      total_xp_earned: (log.xp_change ?? 0) > 0 ? (log.xp_change ?? undefined) : undefined,
      ended_at: {
        gte: new Date(log.created_at.getTime() - 60000), // diff up to 1 minute
        lte: new Date(log.created_at.getTime() + 60000),
      }
    },
    include: {
      workout_exercises: {
        include: {
          exercises: true,
          sets: {
            orderBy: { set_number: 'asc' }
          }
        }
      }
    }
  });

  return workout;
}
