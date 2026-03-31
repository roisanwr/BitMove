"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { tier_enum } from "@prisma/client";

export async function addExerciseToWorkout(workoutId: string, exerciseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.workout_exercises.create({
    data: {
      workout_id: workoutId,
      exercise_id: exerciseId,
    }
  });

  revalidatePath("/training");
}

export async function logSet(
  workoutExerciseId: string,
  setNumber: number,
  weightKg: number,
  completedValue: number,
  targetTier: "D" | "C" | "B" | "A" | "S" | "SS"
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Ambil target_value dari difficulty_scales sesuai tier dan scale_type exercise
  const workoutExercise = await prisma.workout_exercises.findUnique({
    where: { id: workoutExerciseId },
    include: { exercises: true },
  });

  let targetValue = 10; // fallback
  if (workoutExercise) {
    const scale = await prisma.difficulty_scales.findUnique({
      where: {
        scale_type_tier: {
          scale_type: workoutExercise.exercises.scale_type,
          tier: targetTier as tier_enum,
        },
      },
    });
    if (scale) targetValue = scale.target_value;
  }

  await prisma.sets.create({
    data: {
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      weight_kg: weightKg,
      completed_value: completedValue,
      target_value: targetValue,
      tier: targetTier as tier_enum,
      is_completed: true,
    }
  });

  revalidatePath("/training");
}

export async function finishWorkout(workoutId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const workout = await tx.workouts.findUnique({
      where: { id: workoutId },
      include: {
        workout_exercises: {
          include: { sets: true }
        }
      }
    });

    if (!workout) return;

    // Hitung XP dari tier_rewards
    const tierRewards = await tx.tier_rewards.findMany();
    const rewardMap = Object.fromEntries(tierRewards.map((r) => [r.tier, r]));

    let totalXp = 0;
    let totalPoints = 0;

    for (const we of workout.workout_exercises) {
      for (const set of we.sets) {
        if (set.is_completed) {
          const reward = rewardMap[set.tier];
          if (reward) {
            totalXp += reward.xp_reward;
            totalPoints += reward.points_reward;
          }
        }
      }
    }

    await tx.workouts.update({
      where: { id: workoutId },
      data: {
        status: "completed",
        ended_at: new Date(),
        total_xp_earned: totalXp,
        total_points_earned: totalPoints,
      }
    });

    if (totalXp > 0) {
      await tx.point_logs.create({
        data: {
          user_id: userId,
          xp_change: totalXp,
          points_change: totalPoints,
          source_type: "Training Session",
          description: `Completed Training Session`,
        }
      });
    }
  });

  revalidatePath("/training");
  revalidatePath("/");
}

export async function createExercise(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const muscle = formData.get("muscle") as string;
  const unit = formData.get("unit") as string || "reps";
  const scaleType = formData.get("scale_type") as string || "strength";

  if (!name) return;

  await prisma.exercise_library.create({
    data: {
      name,
      target_muscle: muscle,
      scale_type: scaleType as any,
      measurement_unit: unit,
      created_by: session.user.id
    }
  });

  revalidatePath("/training");
  revalidatePath("/training/library");
}

/** Buat workout baru dari jadwal hari ini (pre-populate exercise dari program) */
export async function startWorkoutFromPlan(scheduleExerciseIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const workout = await prisma.workouts.create({
    data: {
      user_id: userId,
      status: "in_progress",
    },
  });

  if (scheduleExerciseIds.length > 0) {
    await prisma.workout_exercises.createMany({
      data: scheduleExerciseIds.map((exerciseId) => ({
        workout_id: workout.id,
        exercise_id: exerciseId,
      })),
    });
  }

  revalidatePath("/training");
}

/** Buat workout kosong (ad-hoc, tanpa jadwal) */
export async function startEmptyWorkout() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.workouts.create({
    data: {
      user_id: session.user.id,
      status: "in_progress",
    },
  });

  revalidatePath("/training");
}
