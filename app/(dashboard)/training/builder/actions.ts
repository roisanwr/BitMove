"use server";

import { auth } from "@/lib/auth";
import { createAndActivateProgram, deleteProgram } from "@/lib/services/programService";
import { tier_enum } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface SlotInput {
  exerciseId: string;
  weekNumber: number;
  dayOfWeek: number;
  targetTier: tier_enum;
  notes?: string;
}

export async function saveAndActivateProgram(
  title: string,
  totalWeeks: number,
  slots: SlotInput[]
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!title.trim()) throw new Error("Judul program tidak boleh kosong");
  if (slots.length === 0) throw new Error("Program harus memiliki minimal 1 latihan");

  await createAndActivateProgram(session.user.id, {
    title: title.trim(),
    totalWeeks,
    slots,
  });

  revalidatePath("/training");
  revalidatePath("/training/builder");
}

export async function removeProgramAction(programId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await deleteProgram(programId, session.user.id);
  revalidatePath("/training");
  revalidatePath("/training/builder");
}
