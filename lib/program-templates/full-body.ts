import { TemplateDefinition } from "./types";

export const fullBodyBeginner: TemplateDefinition = {
  id: "full-body-beginner-2w",
  title: "Full Body Beginner — 2 Minggu",
  description:
    "Program ideal untuk pemula. Latihan 3 hari per minggu (Senin, Rabu, Jumat) menargetkan seluruh tubuh dalam satu sesi. Fokus pada membangun fondasi kekuatan dan kebiasaan berolahraga.",
  totalWeeks: 2,
  category: "General",
  difficulty: "Beginner",
  slots: [
    // ─── WEEK 1 ───
    // Senin — Full Body A
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Push Up klasik",   targetTier: "D", notes: "Jika kesulitan, mulai dengan Incline Push Up." },
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Squat",            targetTier: "D" },
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Plank",            targetTier: "D", notes: "Tahan posisi plank selama mungkin, istirahat, ulangi." },
    // Rabu — Full Body B
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Incline Push Up",  targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Glute Bridge",     targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Bird Dog",         targetTier: "D" },
    // Jumat — Full Body C
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Push Up klasik",   targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Lunge",            targetTier: "D" },
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Plank",            targetTier: "C" },

    // ─── WEEK 2 ───
    // Senin — Full Body A (naik tier)
    { weekNumber: 2, dayOfWeek: 1, exerciseName: "Push Up klasik",   targetTier: "C", notes: "Kalau Week 1 lancar, kamu siap naik ke tier ini!" },
    { weekNumber: 2, dayOfWeek: 1, exerciseName: "Squat",            targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 1, exerciseName: "Plank",            targetTier: "B" },
    // Rabu — Full Body B
    { weekNumber: 2, dayOfWeek: 3, exerciseName: "Diamond Push Up",  targetTier: "D" },
    { weekNumber: 2, dayOfWeek: 3, exerciseName: "Glute Bridge",     targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 3, exerciseName: "Leg Raise",        targetTier: "C" },
    // Jumat — Full Body C
    { weekNumber: 2, dayOfWeek: 5, exerciseName: "Decline Push Up",  targetTier: "D" },
    { weekNumber: 2, dayOfWeek: 5, exerciseName: "Bulgarian Split Squat", targetTier: "D" },
    { weekNumber: 2, dayOfWeek: 5, exerciseName: "Hollow Body Hold", targetTier: "D" },
  ],
};
