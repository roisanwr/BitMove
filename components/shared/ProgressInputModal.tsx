"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTaskProgress } from "@/app/(dashboard)/quests/actions";

interface ProgressInputModalProps {
  task: {
    id: string;
    title: string;
    unit: string;
    current_value: number;
    target_value: number;
    priority: string;
  };
  onClose: () => void;
  onUpdate: (taskId: string, newValue: number, isCompleted: boolean) => void;
}

export function ProgressInputModal({ task, onClose, onUpdate }: ProgressInputModalProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = task.target_value - task.current_value;
  const percentage = Math.round((task.current_value / task.target_value) * 100);

  useEffect(() => {
    // Auto-focus input on open
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = (addValue: number) => {
    if (addValue <= 0 || isPending) return;

    startTransition(async () => {
      const newValue = Math.min(task.current_value + addValue, task.target_value);
      const isNowComplete = newValue >= task.target_value;

      // Optimistic update to parent
      onUpdate(task.id, newValue, isNowComplete);

      await updateTaskProgress(task.id, addValue, task.target_value);

      if (isNowComplete) {
        setCompleted(true);
        // Auto-close after celebration animation
        setTimeout(() => onClose(), 1800);
      } else {
        onClose();
      }
    });
  };

  const parsedInput = parseInt(inputValue) || 0;
  const presets = remaining >= 10
    ? [1, Math.floor(remaining / 2), remaining]
    : remaining >= 5
    ? [1, Math.ceil(remaining / 2), remaining]
    : remaining > 1
    ? [1, remaining]
    : [remaining];

  const xpReward = task.priority === "High" ? 50 : task.priority === "Medium" ? 30 : 10;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Panel */}
      <div className="bg-surface-container border-t-4 border-primary w-full sm:max-w-md sm:border-l-4 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

        {/* ───── Mission Complete Overlay ───── */}
        {completed && (
          <div className="absolute inset-0 bg-primary/10 border border-primary flex flex-col items-center justify-center gap-4 animate-in zoom-in duration-300 z-10">
            <CheckCircle2 className="w-16 h-16 text-primary animate-bounce" />
            <div className="text-center">
              <div className="font-headline font-black text-2xl uppercase tracking-tighter text-primary">
                MISSION COMPLETE!
              </div>
              <div className="font-headline font-bold text-xs uppercase tracking-widest text-primary/70 mt-1">
                +{xpReward} XP GRANTED
              </div>
            </div>
          </div>
        )}

        {/* ───── Header ───── */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-outline-variant/30">
          <div>
            <div className="font-headline font-black text-xs uppercase tracking-widest text-primary mb-1 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              LOG PROGRESS
            </div>
            <h3 className="font-headline font-black uppercase text-lg text-white leading-tight">
              {task.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white transition-colors p-1 shrink-0 mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ───── Progress Display ───── */}
        <div className="px-5 pt-5 pb-3">
          {/* Numbers */}
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="font-headline font-black text-3xl text-primary">
                {task.current_value}
              </span>
              <span className="font-headline font-bold text-lg text-on-surface-variant ml-1">
                / {task.target_value}
              </span>
              <span className="font-headline font-bold text-sm text-on-surface-variant ml-2 uppercase">
                {task.unit}
              </span>
            </div>
            <div className="font-headline font-black text-sm text-on-surface-variant">
              {percentage}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-surface-container-highest rounded-none overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Remaining indicator */}
          <div className="mt-2 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">
            {remaining > 0
              ? `Sisa ${remaining} ${task.unit} lagi untuk selesai`
              : "Sudah tercapai! 🎉"
            }
          </div>
        </div>

        {/* ───── Input Section ───── */}
        <div className="px-5 pb-5 space-y-4">
          {/* Quick Presets */}
          {remaining > 0 && (
            <div>
              <div className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                Quick Add
              </div>
              <div className="flex gap-2">
                {presets.map((val, i) => (
                  <button
                    key={i}
                    disabled={isPending}
                    onClick={() => handleSubmit(val)}
                    className={cn(
                      "flex-1 py-3 font-headline font-black text-sm uppercase tracking-widest border transition-all",
                      val === remaining
                        ? "bg-primary/20 border-primary text-primary hover:bg-primary/30"
                        : "bg-surface-container-high border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary"
                    )}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Input */}
          {remaining > 0 && (
            <div>
              <div className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                Input Manual ({task.unit})
              </div>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  min={1}
                  max={remaining}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && parsedInput > 0 && handleSubmit(parsedInput)}
                  placeholder={`0 – ${remaining}`}
                  className="flex-1 bg-surface-container-high border border-outline-variant/50 px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors font-mono text-white"
                />
                <button
                  disabled={isPending || parsedInput <= 0}
                  onClick={() => handleSubmit(parsedInput)}
                  className={cn(
                    "px-5 py-3 font-headline font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2",
                    parsedInput > 0 && !isPending
                      ? "bg-primary text-black hover:shadow-[0_0_15px_rgba(142,255,113,0.4)]"
                      : "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                  )}
                >
                  <Zap className="w-4 h-4" />
                  LOG
                </button>
              </div>
            </div>
          )}

          {/* Already complete */}
          {remaining <= 0 && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
              <div className="font-headline font-black text-sm uppercase tracking-widest text-primary">
                Target Sudah Tercapai!
              </div>
              <button
                onClick={onClose}
                className="mt-4 w-full py-3 bg-surface-container-high border border-outline-variant/50 text-on-surface-variant font-headline font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
              >
                TUTUP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
