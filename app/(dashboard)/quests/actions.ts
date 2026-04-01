"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client" // <-- Ini wajib ada jika di bawah pakai Prisma.TransactionClient

export async function toggleTask(taskId: string, isCompleted: boolean, priority: string = "Medium") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  if (isCompleted) {
    // If we are un-completing (not officially supported but useful for dev)
    await prisma.tasks.update({
      where: { id: taskId, user_id: userId },
      data: { is_completed: false }
    });
  } else {
    // We are completing the task
    const xpReward = priority === "High" ? 150 : priority === "Medium" ? 75 : 30;
    const pointsReward = priority === "High" ? 50 : priority === "Medium" ? 25 : 10;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Mark task complete
      // DB Trigger "on_task_completion" will automatically create a point_log,
      // and "on_log_added" will automatically update user profiles (XP/Points).
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

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const category = (formData.get("category") as string) || "General";
  const priority = (formData.get("priority") as any) || "Medium";
  const frequency = (formData.get("frequency") as any) || "Daily";

  if (!title) return { error: "Title is required" };

  await prisma.tasks.create({
    data: {
      user_id: session.user.id,
      title,
      category,
      priority,
      frequency,
      is_custom: true,
      target_value: 1,
      current_value: 0
    }
  });

  revalidatePath("/quests");
  return { success: true };
}

export async function createTaskFromLibrary(libraryId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Cek apakah task dari library ini sudah ada di daftar user (aktif, bukan custom)
  const existing = await prisma.tasks.findFirst({
    where: {
      user_id: session.user.id,
      is_custom: false,
    }
  });

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