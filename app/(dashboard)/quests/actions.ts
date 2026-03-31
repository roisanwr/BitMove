"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => { // <-- TAMBAHKAN TIPE DATANYA DI SINI
      // 1. Mark task complete
      await tx.tasks.update({
        where: { id: taskId, user_id: userId },
        data: {
          is_completed: true,
          last_completed_at: new Date(),
          current_value: 1
        }
      });

      // 2. Add point log
      await tx.point_logs.create({
        data: {
          user_id: userId,
          xp_change: xpReward,
          points_change: pointsReward,
          source_type: "Task Completion",
          description: `Completed task ${taskId}`
        }
      });

      // 3. Update profile totals (this is also handled by DB trigger process_game_stats, 
      //    but our manual update might conflict or duplicate if trigger is active. 
      //    Wait! db.sql has a trigger: "AFTER INSERT ON public.point_logs FOR EACH ROW EXECUTE FUNCTION public.process_game_stats()")
      // Therefore, we only need to insert into point_logs. The trigger will automatically update the profiles table!
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
