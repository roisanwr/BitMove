"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function toggleTask(
  taskId: string,
  isCompleted: boolean,
  priority: string = "Medium",
  polarity: string = "POSITIVE"
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  if (isCompleted) {
    // Undo — un-complete task (dev utility)
    await prisma.tasks.update({
      where: { id: taskId, user_id: userId },
      data: { is_completed: false, current_value: 0 }
    });
  } else if (polarity === "NEGATIVE") {
    // Task negatif: user menekan = melanggar pantangan → PENALTI
    const xpPenalty  = priority === "High" ? -200 : priority === "Medium" ? -100 : -50;
    const ptsPenalty = priority === "High" ? -100 : priority === "Medium" ? -50  : -25;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Tandai sudah dilanggar hari ini
      await tx.tasks.update({
        where: { id: taskId, user_id: userId },
        data: {
          is_completed: true,
          last_completed_at: new Date(),
        }
      });

      // 2. Catat penalti di point_logs (nilai negatif)
      await tx.point_logs.create({
        data: {
          user_id: userId,
          xp_change: xpPenalty,
          points_change: ptsPenalty,
          source_type: "PENALTY",
          description: `Violated forbidden task — ID: ${taskId}`,
        }
      });

      // 3. Update profil langsung (kurangi XP & Points, minimum 0)
      await tx.$executeRaw`
        UPDATE profiles
        SET
          current_xp     = GREATEST(0, current_xp + ${xpPenalty}),
          current_points = GREATEST(0, current_points + ${ptsPenalty}),
          updated_at     = NOW()
        WHERE id = ${userId}::uuid
      `;
    });
  } else {
    // Task positif checklist: tandai selesai → XP via DB trigger
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.tasks.update({
        where: { id: taskId, user_id: userId },
        data: {
          is_completed: true,
          last_completed_at: new Date(),
          current_value: 1
        }
      });
    });
  }

  revalidatePath("/quests");
}

/**
 * Update progress untuk task bertipe Numeric (unit !== "Checklist").
 * DB trigger `on_task_completion` akan otomatis memberi XP reward saat
 * is_completed berubah false → true.
 */
export async function updateTaskProgress(
  taskId: string,
  addValue: number,
  targetValue: number
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Fetch current state
    const task = await tx.tasks.findUnique({
      where: { id: taskId, user_id: userId },
      select: { current_value: true, is_completed: true }
    });
    if (!task) throw new Error("Task not found");

    const prevValue    = task.current_value ?? 0;
    const prevCompleted = task.is_completed ?? false;

    // Clamp: tidak boleh < 0, tidak boleh > target
    const newValue     = Math.max(0, Math.min(prevValue + addValue, targetValue));
    const newCompleted = newValue >= targetValue;

    await tx.tasks.update({
      where: { id: taskId, user_id: userId },
      data: {
        current_value:    newValue,
        is_completed:     newCompleted,
        // Catat waktu selesai saat pertama kali complete; hapus jika di-undo
        last_completed_at: newCompleted && !prevCompleted ? new Date() : (!newCompleted ? null : undefined),
      }
    });
    // XP reward ditangani otomatis oleh DB trigger on_task_completion
    // yang fire pada AFTER UPDATE OF is_completed
  });

  revalidatePath("/quests");
}

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title     = formData.get("title") as string;
  const category  = (formData.get("category") as string) || "General";
  const priority  = (formData.get("priority") as any) || "Medium";
  const frequency = (formData.get("frequency") as any) || "Daily";
  const polarity  = (formData.get("polarity") as string) || "POSITIVE";
  const unit      = (formData.get("unit") as string) || "Checklist";
  // target_value: 1 untuk Checklist, nilai numerik untuk Numeric
  const targetValueRaw = formData.get("target_value") as string;
  const targetValue    = unit === "Checklist" ? 1 : Math.max(1, parseInt(targetValueRaw) || 1);

  if (!title) return { error: "Title is required" };

  await prisma.tasks.create({
    data: {
      user_id: session.user.id,
      title,
      category,
      priority,
      frequency,
      polarity,
      is_custom: true,
      unit,
      target_value:  targetValue,
      current_value: 0
    }
  });

  revalidatePath("/quests");
  return { success: true };
}

export async function createTaskFromLibrary(libraryId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const template = await prisma.task_library.findUnique({
    where: { id: libraryId }
  });

  if (!template) return { error: "Template not found" };

  // Cek apakah task dengan judul yang sama sudah ada
  const duplicate = await prisma.tasks.findFirst({
    where: {
      user_id: session.user.id,
      title: template.title,
    }
  });

  if (duplicate) return { error: "Task sudah ada di daftar kamu" };

  await prisma.tasks.create({
    data: {
      user_id: session.user.id,
      title: template.title,
      category: template.category,
      priority: template.default_priority ?? "Medium",
      frequency: template.default_frequency ?? "Daily",
      target_value: template.default_target_value ?? 1,
      unit: template.default_unit ?? "Checklist",
      polarity: template.polarity ?? "POSITIVE",
      is_custom: false,
      current_value: 0,
    }
  });

  revalidatePath("/quests");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.tasks.delete({
    where: {
      id: taskId,
      user_id: session.user.id
    }
  });

  revalidatePath("/quests");
}