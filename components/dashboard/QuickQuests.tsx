"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Quest = {
  id: string;
  title: string;
  priority: "OMEGA" | "HIGH" | "NORMAL";
  xpGain: number;
  completed: boolean;
};

const initialQuests: Quest[] = [
  { id: "1", title: "Morning Drill: 5KM Run", priority: "OMEGA", xpGain: 150, completed: false },
  { id: "2", title: "Deep Work: 4 Hours", priority: "NORMAL", xpGain: 300, completed: true },
  { id: "3", title: "Cold Immersion: 3 Min", priority: "HIGH", xpGain: 100, completed: false },
];

export function QuickQuests({ onQuestComplete }: { onQuestComplete?: (xp: number, title: string) => void }) {
  const [quests, setQuests] = useState(initialQuests);

  const handleComplete = (id: string) => {
    setQuests(quests.map((q) => {
      if (q.id === id && !q.completed) {
        if (onQuestComplete) onQuestComplete(q.xpGain, q.title);
        return { ...q, completed: true };
      }
      return q;
    }));
  };

  return (
    <div className="bg-surface-container-low p-6 flex flex-col border-t-4 border-primary shadow-lg h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline font-black uppercase tracking-tighter text-xl">QUICK QUESTS</h2>
        <span className="font-headline font-bold text-[10px] text-error px-2 py-1 bg-error/10 border border-error/30">
          SKIP = -50 PT
        </span>
      </div>
      
      <div className="space-y-4">
        {quests.map((quest) => (
          <div
            key={quest.id}
            onClick={() => handleComplete(quest.id)}
            className={cn(
              "flex items-center gap-4 p-4 transition-all",
              quest.completed 
                ? "bg-surface-container-highest border-l-4 border-outline-variant opacity-60" 
                : "bg-surface-container-high border-l-4 border-primary hover:bg-surface-bright cursor-pointer hover:translate-x-1 group"
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
        ))}
      </div>
    </div>
  );
}
