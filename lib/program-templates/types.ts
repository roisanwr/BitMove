import { tier_enum } from "@prisma/client";

export interface TemplateSlot {
  weekNumber: number;   // 1–4
  dayOfWeek: number;    // 1–7 (Senin–Minggu)
  exerciseName: string; // Nama gerakan (untuk fuzzy match ke exercise_library)
  targetTier: tier_enum;
  notes?: string;
}

export type TemplateCategory = "Strength" | "Endurance" | "HIIT" | "Mobility" | "General";
export type TemplateDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface TemplateDefinition {
  id: string;                     // Slug unik, e.g. "push-pull-legs-4w"
  title: string;
  description: string;
  totalWeeks: number;
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  slots: TemplateSlot[];
}
