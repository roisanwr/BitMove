"use client";

import { useState, useTransition, useEffect } from "react";
import { Check, Plus, Clock, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleTask } from "./actions";

export function QuestList({ initialTasks }: { initialTasks: any[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleToggle = (taskId: string, currentStatus: boolean, priority: string) => {
    // Optimistic UI update
    setTasks((prev) => 
      prev.map((t) => t.id === taskId ? { ...t, is_completed: !currentStatus } : t)
    );

    startTransition(async () => {
      await toggleTask(taskId, currentStatus, priority);
    });
  };

  const dailyTasks = tasks.filter((t) => t.frequency === "Daily");
  const weeklyTasks = tasks.filter((t) => t.frequency === "Weekly");

  const TaskItem = ({ task }: { task: any }) => {
    const isCompleted = task.is_completed;
    const priorityColor = 
      task.priority === "High" ? "text-error" : 
      task.priority === "Medium" ? "text-secondary" : 
      "text-primary";
    const xpReward = task.priority === "High" ? 150 : task.priority === "Medium" ? 75 : 30;

    return (
      <div
        onClick={() => !isCompleted && handleToggle(task.id, isCompleted, task.priority)}
        className={cn(
          "flex items-center gap-4 p-4 transition-all group border-l-4",
          isCompleted 
            ? "bg-surface-container-highest border-outline-variant opacity-60" 
            : "bg-surface-container border-primary hover:bg-surface-bright cursor-pointer hover:translate-x-1"
        )}
      >
        <div className={cn(
          "w-6 h-6 border-2 flex items-center justify-center transition-colors",
          isCompleted 
            ? "border-outline-variant bg-surface-container-low" 
            : "border-primary group-hover:bg-primary/10"
        )}>
          {isCompleted && <Check className="w-4 h-4 text-outline-variant" />}
        </div>
        
        <div className="flex-1">
          <div className={cn(
            "font-headline font-bold text-sm uppercase transition-all flex items-center gap-2",
            isCompleted ? "line-through text-on-surface-variant" : "text-white"
          )}>
            {task.title}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className={cn(
              "font-body text-[10px] font-bold uppercase tracking-widest flex items-center gap-1",
              isCompleted ? "text-on-surface-variant" : priorityColor
            )}>
              {task.priority === "High" && <AlertTriangle className="w-3 h-3" />}
              {task.priority === "Medium" && <Target className="w-3 h-3" />}
              PRIORITY: {task.priority}
            </span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.category}
            </span>
          </div>
        </div>
        
        <span className={cn(
          "font-headline font-black text-sm",
          isCompleted ? "text-on-surface-variant" : "text-primary"
        )}>
          +{xpReward} XP
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline font-black uppercase tracking-tighter text-2xl mb-4 text-primary">DAILY DIRECTIVES</h2>
        <div className="space-y-3">
          {dailyTasks.length === 0 ? (
            <div className="p-8 border border-dashed border-outline-variant text-center text-on-surface-variant font-headline uppercase text-xs tracking-widest">
              No daily directives assigned.
            </div>
          ) : (
            dailyTasks.map(t => <TaskItem key={t.id} task={t} />)
          )}
        </div>
      </div>

      <div>
        <h2 className="font-headline font-black uppercase tracking-tighter text-2xl mb-4 text-secondary">WEEKLY OBJECTIVES</h2>
        <div className="space-y-3">
          {weeklyTasks.length === 0 ? (
            <div className="p-8 border border-dashed border-outline-variant text-center text-on-surface-variant font-headline uppercase text-xs tracking-widest">
              No weekly objectives assigned.
            </div>
          ) : (
            weeklyTasks.map(t => <TaskItem key={t.id} task={t} />)
          )}
        </div>
      </div>
    </div>
  );
}
