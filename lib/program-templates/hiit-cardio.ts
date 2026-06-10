import { TemplateDefinition } from "./types";

export const hiitCardio: TemplateDefinition = {
  id: "hiit-cardio-1w",
  title: "HIIT & Cardio Blast — 1 Minggu",
  description:
    "Program intensitas tinggi yang berfokus pada cardio dan explosive movement. 4 hari aktif per minggu. Sangat efektif untuk membakar kalori dan meningkatkan kondisi kardiovaskular. Satu siklus yang looping otomatis.",
  totalWeeks: 1,
  category: "HIIT",
  difficulty: "Intermediate",
  slots: [
    // Senin — HIIT Circuit
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Burpees",           targetTier: "C", notes: "Full effort. Istirahat minimal antar gerakan." },
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Jumping Jacks",     targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Mountain Climbers", targetTier: "C" },
    // Selasa — REST
    // Rabu — Cardio Focus
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Jogging",           targetTier: "C", notes: "Target 1km. Pace santai tapi konsisten." },
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Jump Rope",         targetTier: "C" },
    // Kamis — REST
    // Jumat — HIIT Circuit Intensif
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Burpees",           targetTier: "B", notes: "Hari ini target lebih tinggi. Keluarkan semua!" },
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Mountain Climbers", targetTier: "B" },
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Jumping Jacks",     targetTier: "B" },
    // Sabtu — Cardio Long Run
    { weekNumber: 1, dayOfWeek: 6, exerciseName: "Jogging",           targetTier: "B", notes: "Long run hari ini. Push sampai batas!" },
    { weekNumber: 1, dayOfWeek: 6, exerciseName: "Apnea Walk",        targetTier: "D", notes: "Bonus: latih kapasitas paru sambil jalan." },
    // Minggu — REST
  ],
};

export const coreAndMobility: TemplateDefinition = {
  id: "core-mobility-2w",
  title: "Core & Mobility — 2 Minggu",
  description:
    "Program khusus untuk memperkuat core dan meningkatkan fleksibilitas. 5 hari per minggu dengan intensitas sedang. Cocok sebagai program pelengkap atau recovery aktif dari program berat.",
  totalWeeks: 2,
  category: "Mobility",
  difficulty: "Beginner",
  slots: [
    // ─── WEEK 1 ───
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Plank",             targetTier: "C", notes: "Core stabilizer utama. Jaga pinggul lurus." },
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Bird Dog",          targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 1, exerciseName: "Dynamic Stretching", targetTier: "C" },

    { weekNumber: 1, dayOfWeek: 2, exerciseName: "Side Plank",        targetTier: "D" },
    { weekNumber: 1, dayOfWeek: 2, exerciseName: "Hollow Body Hold",  targetTier: "D" },
    { weekNumber: 1, dayOfWeek: 2, exerciseName: "Deep Squat Hold",   targetTier: "C" },

    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Leg Raise",         targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Russian Twist",     targetTier: "D" },
    { weekNumber: 1, dayOfWeek: 3, exerciseName: "Ribcage Expansion Stretch", targetTier: "C" },

    { weekNumber: 1, dayOfWeek: 4, exerciseName: "Plank",             targetTier: "B" },
    { weekNumber: 1, dayOfWeek: 4, exerciseName: "Side Plank Reach Through", targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 4, exerciseName: "Breathing Exercise", targetTier: "C" },

    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Bicycle Crunch",    targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Hollow Body Hold",  targetTier: "C" },
    { weekNumber: 1, dayOfWeek: 5, exerciseName: "Dynamic Stretching", targetTier: "B" },

    // ─── WEEK 2 ───
    { weekNumber: 2, dayOfWeek: 1, exerciseName: "Plank",             targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 1, exerciseName: "L-Sit",             targetTier: "D" },
    { weekNumber: 2, dayOfWeek: 1, exerciseName: "Deep Squat Hold",   targetTier: "B" },

    { weekNumber: 2, dayOfWeek: 2, exerciseName: "Side Plank",        targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 2, exerciseName: "Hanging Knee Raise", targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 2, exerciseName: "Ribcage Expansion Stretch", targetTier: "B" },

    { weekNumber: 2, dayOfWeek: 3, exerciseName: "Leg Raise",         targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 3, exerciseName: "Bicycle Crunch",    targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 3, exerciseName: "Box Breathing",     targetTier: "C" },

    { weekNumber: 2, dayOfWeek: 4, exerciseName: "L-Sit",             targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 4, exerciseName: "Side Plank Reach Through", targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 4, exerciseName: "Shoulder Rolls",    targetTier: "C" },

    { weekNumber: 2, dayOfWeek: 5, exerciseName: "Hollow Body Hold",  targetTier: "B" },
    { weekNumber: 2, dayOfWeek: 5, exerciseName: "Russian Twist",     targetTier: "C" },
    { weekNumber: 2, dayOfWeek: 5, exerciseName: "Dynamic Stretching", targetTier: "A" },
  ],
};
