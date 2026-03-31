"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

  // Determine standard target value based on tier (can be fetched or assumed, e.g., default to 10)
  const targetValue = 10; 

  await prisma.sets.create({
    data: {
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      weight_kg: weightKg,
      completed_value: completedValue,
      target_value: targetValue,
      tier: targetTier,
      is_completed: true
    }
  });

  revalidatePath("/training");
}

export async function finishWorkout(workoutId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  await prisma.$transaction(async (tx) => {
    // 1. Calculate total XP by iterating sets within workout
    // (This is a simplified mock calculation for now)
    const workout = await tx.workouts.findUnique({
      where: { id: workoutId },
      include: {
        workout_exercises: {
          include: { sets: true }
        }
      }
    });

    if (!workout) return;

    let totalXp = 0;
    let totalPoints = 0;

    for (const we of workout.workout_exercises) {
      for (const set of we.sets) {
        if (set.is_completed) {
          totalXp += 50; 
          totalPoints += 10;
        }
      }
    }

    // 2. Mark workout as completed
    await tx.workouts.update({
      where: { id: workoutId },
      data: {
        status: "completed",
        ended_at: new Date(),
        total_xp_earned: totalXp,
        total_points_earned: totalPoints
      }
    });

    if (totalXp > 0) {
      await tx.point_logs.create({
        data: {
          user_id: userId,
          xp_change: totalXp,
          points_change: totalPoints,
          source_type: "Training Session",
          description: `Completed Training Session ID: ${workoutId}`
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

  if (!name) return;

  await prisma.exercise_library.create({
    data: {
      name,
      target_muscle: muscle,
      scale_type: "strength",
      measurement_unit: unit,
      created_by: session.user.id
    }
  });

  revalidatePath("/training");
  revalidatePath("/training/library");
}
