import { TemplateDefinition } from "./types";

export const pushPullLegs: TemplateDefinition = {
  id: "push-pull-legs-4w",
  title: "Push Pull Legs — 4 Minggu",
  description:
    "Program klasik PPL cocok untuk level intermediate. Latihan 6 hari per minggu dengan pemisahan otot Push, Pull, dan Legs. Minggu demi minggu tier meningkat untuk memaksimalkan progressive overload.",
  totalWeeks: 4,
  category: "Strength",
  difficulty: "Intermediate",
  slots: [
    // ─── WEEK 1 ───
    // Senin — Push (Dada, Bahu, Trisep)
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Push Up klasik",      targetTier: "C", notes: "Fokus pada form sempurna. Kontrol turun 3 detik." },
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Pike Push Up",        targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Triceps Dips",        targetTier: "C" },
    // Selasa — Pull (Punggung, Bisep)
    { weekNumber: 1, dayOfWeek: 2, exerciseName: "Pull Up",             targetTier: "D", notes: "Jika belum bisa full pull-up, lakukan Bodyweight Row." },
    { weekNumber: 1, dayOfWeek: 2, exerciseName: "Bodyweight Row",      targetTier: "C" },
    // Rabu — Legs (Kaki, Glutes)
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Squat",               targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Lunge",               targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Glute Bridge",        targetTier: "C" },
    // Kamis — Push
    { weekNumber: 1, dayOfWeek: 4, exerciseName: "Decline Push Up",     targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 4, exerciseName: "Incline Push Up",     targetTier: "B" },
    { weekNumber: 1, dayOfWeek: 4, exerciseName: "Diamond Push Up",     targetTier: "C" },
    // Jumat — Pull
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Chin Up",             targetTier: "D" },
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Bodyweight Row",      targetTier: "B" },
    // Sabtu — Legs
    { weekNumber: 1, dayOfWeek: 6, exerciseName: "Bulgarian Split Squat", targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 6, exerciseName: "Calf Raises",         targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 6, exerciseName: "Single Leg Glute Bridge", targetTier: "C" },
    // Minggu — REST

    // ─── WEEK 2 ───
    { weekNumber: 2, dayOfWeek: 1, exerciseName: "Push Up klasik",      targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 1, exerciseName: "Pike Push Up",        targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 1, exerciseName: "Triceps Dips",        targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 2, exerciseName: "Pull Up",             targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 2, exerciseName: "Bodyweight Row",      targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 3, exerciseName: "Squat",               targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 3, exerciseName: "Walking Lunge",       targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 3, exerciseName: "Single Leg Glute Bridge", targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 4, exerciseName: "Decline Push Up",     targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 4, exerciseName: "Archer Push Up",      targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 4, exerciseName: "Handstand Hold",      targetTier: "D" },
    { weekNumber: 2, dayOfWeek: 5, exerciseName: "Chin Up",             targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 5, exerciseName: "Muscle Up",           targetTier: "D" },
    { weekNumber: 2, dayOfWeek: 6, exerciseName: "Bulgarian Split Squat", targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 6, exerciseName: "Pistol Squat",        targetTier: "D" },
    { weekNumber: 2, dayOfWeek: 6, exerciseName: "Calf Raises",         targetTier: "B" },

    // ─── WEEK 3 ───
    { weekNumber: 3, dayOfWeek: 1, exerciseName: "Push Up klasik",      targetTier: "A" },
    { weekNumber: 3, dayOfWeek: 1, exerciseName: "Elevated Pike Push Up", targetTier: "C" },
    { weekNumber: 3, dayOfWeek: 1, exerciseName: "Triceps Dips",        targetTier: "A" },
    { weekNumber: 3, dayOfWeek: 2, exerciseName: "Pull Up",             targetTier: "B" },
    { weekNumber: 3, dayOfWeek: 2, exerciseName: "Muscle Up",           targetTier: "C" },
    { weekNumber: 3, dayOfWeek: 3, exerciseName: "Squat",               targetTier: "A" },
    { weekNumber: 3, dayOfWeek: 3, exerciseName: "Walking Lunge",       targetTier: "B" },
    { weekNumber: 3, dayOfWeek: 3, exerciseName: "Donkey Kicks",        targetTier: "C" },
    { weekNumber: 3, dayOfWeek: 4, exerciseName: "Archer Push Up",      targetTier: "B" },
    { weekNumber: 3, dayOfWeek: 4, exerciseName: "Handstand Hold",      targetTier: "C" },
    { weekNumber: 3, dayOfWeek: 4, exerciseName: "Handstand Push Up",   targetTier: "D" },
    { weekNumber: 3, dayOfWeek: 5, exerciseName: "Chin Up",             targetTier: "B" },
    { weekNumber: 3, dayOfWeek: 5, exerciseName: "Front Lever",         targetTier: "D" },
    { weekNumber: 3, dayOfWeek: 6, exerciseName: "Pistol Squat",        targetTier: "C" },
    { weekNumber: 3, dayOfWeek: 6, exerciseName: "Bulgarian Split Squat", targetTier: "A" },
    { weekNumber: 3, dayOfWeek: 6, exerciseName: "Wall Sit",            targetTier: "C" },

    // ─── WEEK 4 ───
    { weekNumber: 4, dayOfWeek: 1, exerciseName: "Push Up klasik",      targetTier: "S" },
    { weekNumber: 4, dayOfWeek: 1, exerciseName: "Handstand Push Up",   targetTier: "C" },
    { weekNumber: 4, dayOfWeek: 1, exerciseName: "Parallel Bar Dips",   targetTier: "B" },
    { weekNumber: 4, dayOfWeek: 2, exerciseName: "Pull Up",             targetTier: "A" },
    { weekNumber: 4, dayOfWeek: 2, exerciseName: "Muscle Up",           targetTier: "B" },
    { weekNumber: 4, dayOfWeek: 3, exerciseName: "Pistol Squat",        targetTier: "B" },
    { weekNumber: 4, dayOfWeek: 3, exerciseName: "Squat",               targetTier: "S" },
    { weekNumber: 4, dayOfWeek: 3, exerciseName: "Wall Sit",            targetTier: "B" },
    { weekNumber: 4, dayOfWeek: 4, exerciseName: "Handstand Push Up",   targetTier: "C" },
    { weekNumber: 4, dayOfWeek: 4, exerciseName: "Archer Push Up",      targetTier: "A" },
    { weekNumber: 4, dayOfWeek: 4, exerciseName: "L-Sit",               targetTier: "C" },
    { weekNumber: 4, dayOfWeek: 5, exerciseName: "Chin Up",             targetTier: "A" },
    { weekNumber: 4, dayOfWeek: 5, exerciseName: "Front Lever",         targetTier: "C" },
    { weekNumber: 4, dayOfWeek: 6, exerciseName: "Pistol Squat",        targetTier: "B" },
    { weekNumber: 4, dayOfWeek: 6, exerciseName: "Bulgarian Split Squat", targetTier: "S" },
    { weekNumber: 4, dayOfWeek: 6, exerciseName: "L-Sit",               targetTier: "D" },
  ],
};
