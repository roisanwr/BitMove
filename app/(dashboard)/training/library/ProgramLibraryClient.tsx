"use client";

import { useState, useTransition } from "react";
import { PROGRAM_TEMPLATES, TemplateCategory, TemplateDifficulty } from "@/lib/program-templates";
import { cloneTemplateToUser } from "./actions";
import {
  Dumbbell,
  Zap,
  Wind,
  Activity,
  LayoutGrid,
  ChevronRight,
  Loader2,
  Clock,
  BarChart3,
} from "lucide-react";

const CATEGORY_ICONS: Record<TemplateCategory, React.ElementType> = {
  Strength: Dumbbell,
  Endurance: Activity,
  HIIT: Zap,
  Mobility: Wind,
  General: LayoutGrid,
};

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  Strength: "text-primary border-primary bg-primary/10",
  Endurance: "text-tertiary border-tertiary bg-tertiary/10",
  HIIT: "text-yellow-400 border-yellow-400 bg-yellow-400/10",
  Mobility: "text-secondary border-secondary bg-secondary/10",
  General: "text-on-surface-variant border-outline-variant bg-surface-container-high",
};

const DIFFICULTY_COLORS: Record<TemplateDifficulty, string> = {
  Beginner: "text-primary",
  Intermediate: "text-yellow-400",
  Advanced: "text-tertiary",
};

const DIFFICULTY_BARS: Record<TemplateDifficulty, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const CATEGORIES: (TemplateCategory | "All")[] = [
  "All", "Strength", "Endurance", "HIIT", "Mobility", "General"
];

export function ProgramLibraryClient() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "All">("All");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = activeCategory === "All"
    ? PROGRAM_TEMPLATES
    : PROGRAM_TEMPLATES.filter((t) => t.category === activeCategory);

  const handleUse = (templateId: string) => {
    setPendingId(templateId);
    startTransition(async () => {
      await cloneTemplateToUser(templateId);
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const Icon = cat !== "All" ? CATEGORY_ICONS[cat] : LayoutGrid;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as typeof activeCategory)}
              className={`flex items-center gap-2 px-4 py-2 font-headline font-bold text-xs uppercase tracking-widest border transition-all ${
                isActive
                  ? "bg-primary text-black border-primary"
                  : "border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary"
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant font-headline uppercase tracking-widest text-sm">
          No templates found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((template) => {
            const CatIcon = CATEGORY_ICONS[template.category];
            const catColor = CATEGORY_COLORS[template.category];
            const diffColor = DIFFICULTY_COLORS[template.difficulty];
            const diffBars = DIFFICULTY_BARS[template.difficulty];
            const isLoading = isPending && pendingId === template.id;
            const totalDays = new Set(
              template.slots.map((s) => `${s.weekNumber}-${s.dayOfWeek}`)
            ).size;

            return (
              <div
                key={template.id}
                className="bg-surface-container border border-outline-variant/20 flex flex-col group hover:border-outline-variant/50 transition-all duration-200 relative overflow-hidden"
              >
                {/* Top accent line */}
                <div className={`h-[3px] w-full ${
                  template.category === "Strength" ? "bg-primary" :
                  template.category === "HIIT" ? "bg-yellow-400" :
                  template.category === "Mobility" ? "bg-secondary" :
                  template.category === "Endurance" ? "bg-tertiary" :
                  "bg-outline-variant"
                }`} />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-headline font-black uppercase tracking-widest border ${catColor}`}>
                          <CatIcon className="w-3 h-3" />
                          {template.category}
                        </span>
                      </div>
                      <h2 className="font-headline font-black text-xl uppercase text-white leading-tight">
                        {template.title}
                      </h2>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">
                    {template.description}
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-t border-b border-outline-variant/20">
                    <div className="text-center">
                      <div className="font-headline font-black text-2xl text-white">
                        {template.totalWeeks}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-on-surface-variant" />
                        <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-on-surface-variant">
                          Minggu
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-headline font-black text-2xl text-white">
                        {totalDays}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <Activity className="w-3 h-3 text-on-surface-variant" />
                        <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-on-surface-variant">
                          Sesi
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        {[1, 2, 3].map((bar) => (
                          <div
                            key={bar}
                            className={`h-4 w-2 ${bar <= diffBars ? diffColor.replace("text-", "bg-") : "bg-outline-variant/30"}`}
                          />
                        ))}
                      </div>
                      <div className={`font-headline font-black text-[9px] uppercase tracking-widest ${diffColor}`}>
                        {template.difficulty}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUse(template.id)}
                    disabled={isPending}
                    className={`w-full font-headline font-black py-4 uppercase tracking-widest flex items-center justify-center gap-3 transition-all glitch-effect ${
                      isLoading
                        ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                        : "bg-primary text-black hover:shadow-[0_0_20px_rgba(142,255,113,0.4)]"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        LOADING TEMPLATE...
                      </>
                    ) : (
                      <>
                        GUNAKAN TEMPLATE
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
