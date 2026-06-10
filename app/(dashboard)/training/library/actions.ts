"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PROGRAM_TEMPLATES } from "@/lib/program-templates";
import { createAndActivateProgram } from "@/lib/services/programService";
import { tier_enum } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * Clone sebuah template ke program milik user.
 * Flow:
 * 1. Load template definition berdasarkan templateId
 * 2. Fuzzy match setiap exerciseName ke exercise_library
 * 3. createAndActivateProgram → simpan ke DB
 * 4. Redirect ke builder?edit=<id>&from=template
 */
export async function cloneTemplateToUser(templateId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // 1. Cari template
  const template = PROGRAM_TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error("Template tidak ditemukan");

  // 2. Kumpulkan nama exercise unik dari template
  const uniqueNames = [...new Set(template.slots.map((s) => s.exerciseName))];

  // 3. Fuzzy match ke exercise_library
  //    Untuk setiap nama, cari exercise dengan ILIKE %name%
  const matchedExercises = await Promise.all(
    uniqueNames.map(async (name) => {
      const found = await prisma.exercise_library.findFirst({
        where: {
          name: { contains: name, mode: "insensitive" },
          is_archived: false,
        },
        orderBy: { name: "asc" },
      });
      return { name, exerciseId: found?.id ?? null };
    })
  );

  // Build lookup map: exerciseName → exerciseId (null kalau tidak ketemu)
  const nameToId = new Map(
    matchedExercises.map(({ name, exerciseId }) => [name.toLowerCase(), exerciseId])
  );

  // 4. Build slots — skip slot yang exercise-nya tidak ditemukan
  const skippedSlots: string[] = [];
  const slots = template.slots.flatMap((slot) => {
    const exerciseId = nameToId.get(slot.exerciseName.toLowerCase());
    if (!exerciseId) {
      skippedSlots.push(slot.exerciseName);
      return [];
    }
    return [{
      exerciseId,
      weekNumber: slot.weekNumber,
      dayOfWeek: slot.dayOfWeek,
      targetTier: slot.targetTier as tier_enum,
      notes: slot.notes,
    }];
  });

  // 5. Simpan program ke DB
  const program = await createAndActivateProgram(userId, {
    title: template.title,
    totalWeeks: template.totalWeeks,
    slots,
  });

  // 6. Redirect ke builder untuk review sebelum aktif
  redirect(`/training/builder?edit=${program.id}&from=template`);
}
