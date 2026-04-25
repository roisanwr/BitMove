"use client";

import { Check, TrendingUp } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toggleTask, updateTaskProgress } from "@/app/(dashboard)/quests/actions";
import { ProgressInputModal } from "@/components/shared/ProgressInputModal";
import { useRouter } from "next/navigation";

export type QuestProp = {
  id: string;
  title: string;
  priority: "OMEGA" | "HIGH" | "NORMAL";
  xpGain: number;
  completed: boolean;
  unit?: string;
  current_value?: number;
  target_value?: number;
};

const isNumeric = (q: QuestProp) => q.unit && q.unit !== "Checklist";

export function QuickQuests({ quests = [] }: { quests?: QuestProp[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localQuests, setLocalQuests] = useState<QuestProp[]>(quests);
  const [progressModal, setProgressModal] = useState<QuestProp | null>(null);

  useEffect(() => {
    setLocalQuests(quests);
  }, [quests]);

  // ── Checklist: direct toggle ─────────────────────────────────────────────
  const handleComplete = (id: string, priority: string) => {
    const q = localQuests.find(x => x.id === id);
    if (!q || q.completed) return;

    setLocalQuests(prev => prev.map(item => item.id === id ? { ...item, completed: true } : item));
    startTransition(async () => {
      const mappedPriority = priority === "OMEGA" || priority === "HIGH" ? "High" : priority === "NORMAL" ? "Medium" : "Low";
      await toggleTask(id, false, mappedPriority);
      router.refresh();
    });
  };

  // ── Numeric: progress modal update callback ──────────────────────────────
  const handleProgressUpdate = (taskId: string, newValue: number, isCompleted: boolean) => {
    setLocalQuests(prev =>
      prev.map(q =>
        q.id === taskId
          ? { ...q, current_value: newValue, completed: isCompleted }
          : q
      )
    );
    if (isCompleted) {
      setTimeout(() => router.refresh(), 1800);
    }
  };

  return (
    <>
      <div className="bg-surface-container-low p-6 flex flex-col border-t-4 border-primary shadow-lg h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-black uppercase tracking-tighter text-xl">QUICK QUESTS</h2>
          <span className="font-headline font-bold text-[10px] text-error px-2 py-1 bg-error/10 border border-error/30">
            DAILY PRIORITIES
          </span>
        </div>

        <div className="space-y-4">
          {localQuests.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-outline-variant/30 text-on-surface-variant font-headline font-bold text-xs uppercase">
              No active priorities found
            </div>
          ) : (
            localQuests.map((quest) => {
              const numeric = isNumeric(quest);
              const cv = quest.current_value ?? 0;
              const tv = quest.target_value ?? 1;
              const pct = numeric ? Math.min(100, Math.round((cv / tv) * 100)) : (quest.completed ? 100 : 0);

              if (numeric) {
                // ── Numeric Quest Card ──────────────────────────────────
                return (
                  <div
                    key={quest.id}
                    className={cn(
                      "flex flex-col p-4 transition-all border-l-4",
                      quest.completed
                        ? "bg-surface-container-highest border-outline-variant opacity-60"
                        : "bg-surface-container-high border-primary"
                    )}
                  >
                    {/* Top row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "w-5 h-5 border-2 flex items-center justify-center shrink-0",
                        quest.completed ? "border-outline-variant" : "border-primary"
                      )}>
                        {quest.completed
                          ? <Check className="w-3 h-3 text-outline-variant" />
                          : <TrendingUp className="w-3 h-3 text-primary" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-headline font-bold text-xs uppercase truncate",
                          quest.completed ? "line-through text-on-surface-variant" : "text-white"
                        )}>
                          {quest.title}
                        </div>
                      </div>
                      <span className={cn(
                        "font-headline font-black text-xs shrink-0",
                        quest.completed ? "text-on-surface-variant" : "text-primary"
                      )}>
                        +{quest.xpGain} XP
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-surface-container-highest overflow-hidden mb-1.5">
                      <div
                        className={cn("h-full transition-all duration-500", quest.completed ? "bg-outline-variant" : "bg-primary")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Labels + LOG button */}
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-on-surface-variant">
                        {cv} / {tv} {quest.unit}
                      </span>
                      {!quest.completed && (
                        <button
                          disabled={isPending}
                          onClick={() => setProgressModal(quest)}
                          className="px-2 py-1 text-[8px] font-headline font-black uppercase tracking-widest border border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                        >
                          <TrendingUp className="w-2 h-2" />
                          LOG
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // ── Checklist Quest Card ──────────────────────────────────
              return (
                <div
                  key={quest.id}
                  onClick={() => handleComplete(quest.id, quest.priority)}
                  className={cn(
                    "flex items-center gap-4 p-4 transition-all",
                    quest.completed
                      ? "bg-surface-container-highest border-l-4 border-outline-variant opacity-60 pointer-events-none"
                      : `bg-surface-container-high border-l-4 border-primary hover:bg-surface-bright cursor-pointer hover:translate-x-1 group ${isPending ? "opacity-70 pointer-events-none" : ""}`
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 border-2 flex items-center justify-center transition-colors",
                    quest.completed
                      ? "border-outline-variant bg-surface-container-low"
                      : "border-primary group-hover:bg-primary/10"
                  )}>
                    {quest.completed && <Check className="w-4 h-4 text-outline-variant" />}
                  </div>
                  <div className="flex-1">
                    <div className={cn(
                      "font-headline font-bold text-xs uppercase transition-all",
                      quest.completed ? "line-through text-on-surface-variant" : "text-white"
                    )}>
                      {quest.title}
                    </div>
                    <div className={cn(
                      "font-body text-[10px] font-bold uppercase",
                      quest.completed ? "text-on-surface-variant"
                      : quest.priority === "OMEGA" ? "text-error"
                      : quest.priority === "HIGH" ? "text-secondary"
                      : "text-primary"
                    )}>
                      {quest.completed ? "COMPLETED" : `PRIORITY: ${quest.priority}`}
                    </div>
                  </div>
                  <span className={cn(
                    "font-headline font-black text-xs",
                    quest.completed ? "text-on-surface-variant" : "text-primary"
                  )}>
                    +{quest.xpGain} XP
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Progress Modal */}
      {progressModal && (
        <ProgressInputModal
          task={{
            id:            progressModal.id,
            title:         progressModal.title,
            unit:          progressModal.unit ?? "unit",
            current_value: progressModal.current_value ?? 0,
            target_value:  progressModal.target_value ?? 1,
            priority:      progressModal.priority === "OMEGA" || progressModal.priority === "HIGH" ? "High" : "Medium",
          }}
          onClose={() => setProgressModal(null)}
          onUpdate={handleProgressUpdate}
        />
      )}
    </>
  );
}
