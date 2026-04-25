"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Check, Plus, Clock, Target, AlertTriangle, Trash2,
  ShieldAlert, Skull, TrendingUp, Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ProgressInputModal } from "@/components/shared/ProgressInputModal";
import { toggleTask, updateTaskProgress } from "./actions";

// ─── Types ──────────────────────────────────────────────────────────────────
type Task = {
  id: string;
  title: string;
  category: string;
  priority: string | null;
  frequency: string | null;
  polarity?: string;
  is_completed: boolean | null;
  unit?: string | null;
  current_value?: number | null;
  target_value?: number | null;
  is_custom?: boolean | null;
};

/** unit !== "Checklist" → task numerik */
const isNumeric = (task: Task) =>
  task.unit && task.unit !== "Checklist";

// ────────────────────────────────────────────────────────────────────────────
export function QuestList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [violateTarget, setViolateTarget] = useState<Task | null>(null);
  const [progressModal, setProgressModal] = useState<Task | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // ── Checklist toggle (for binary tasks + undo) ──────────────────────────
  const handleToggle = (taskId: string, currentStatus: boolean, priority: string) => {
    setTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, is_completed: !currentStatus } : t)
    );
    startTransition(async () => {
      await toggleTask(taskId, currentStatus, priority, "POSITIVE");
    });
  };

  // ── Numeric: quick +1 / -1 buttons ──────────────────────────────────────
  const handleQuickProgress = (task: Task, delta: number) => {
    const tv = task.target_value ?? 1;
    const cv = task.current_value ?? 0;
    const newValue = Math.max(0, Math.min(cv + delta, tv));
    const newCompleted = newValue >= tv;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, current_value: newValue, is_completed: newCompleted }
          : t
      )
    );
    startTransition(async () => {
      await updateTaskProgress(task.id, delta, tv);
    });
  };

  // ── Numeric: modal update callback ──────────────────────────────────────
  const handleProgressUpdate = (taskId: string, newValue: number, isCompleted: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, current_value: newValue, is_completed: isCompleted } : t
      )
    );
  };

  // ── Forbidden violation ──────────────────────────────────────────────────
  const handleViolateInitiate = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setViolateTarget(task);
  };

  const handleViolateConfirm = () => {
    if (!violateTarget) return;
    const task = violateTarget;
    setTasks((prev) =>
      prev.map((t) => t.id === task.id ? { ...t, is_completed: true } : t)
    );
    setViolateTarget(null);
    startTransition(async () => {
      await toggleTask(task.id, false, task.priority ?? "Medium", "NEGATIVE");
    });
  };

  const handleDeleteInitiate = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(task);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    const taskId = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const { deleteTask } = await import("./actions");
      await deleteTask(taskId);
    });
  };

  // ── Sorting ──────────────────────────────────────────────────────────────
  const priorityOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

  const processTasks = (taskList: Task[]) =>
    [...taskList].sort((a, b) => {
      const aComp = a.is_completed ?? false;
      const bComp = b.is_completed ?? false;
      if (aComp !== bComp) return aComp ? 1 : -1;
      return (priorityOrder[b.priority ?? "Low"] || 0) - (priorityOrder[a.priority ?? "Low"] || 0);
    });

  const positiveTasks  = tasks.filter((t) => (t.polarity ?? "POSITIVE") === "POSITIVE");
  const dailyTasks     = processTasks(positiveTasks.filter((t) => t.frequency === "Daily"));
  const weeklyTasks    = processTasks(positiveTasks.filter((t) => t.frequency === "Weekly"));
  const forbiddenTasks = processTasks(tasks.filter((t) => t.polarity === "NEGATIVE"));

  // ─────────────────────────────────────────────────────────────────────────
  // Task Item Component
  // ─────────────────────────────────────────────────────────────────────────
  const TaskItem = ({ task }: { task: Task }) => {
    const isCompleted  = task.is_completed ?? false;
    const numeric      = isNumeric(task);
    const cv           = task.current_value ?? 0;
    const tv           = task.target_value ?? 1;
    const percentage   = numeric ? Math.min(100, Math.round((cv / tv) * 100)) : (isCompleted ? 100 : 0);

    const priorityColor =
      task.priority === "High"   ? "text-error" :
      task.priority === "Medium" ? "text-secondary" :
      "text-primary";

    const xpReward = task.priority === "High" ? 50 : task.priority === "Medium" ? 30 : 10;

    // ── Numeric Task ────────────────────────────────────────────────────────
    if (numeric) {
      return (
        <div className={cn(
          "flex flex-col p-4 transition-all group border-l-4",
          isCompleted
            ? "bg-surface-container-highest border-outline-variant opacity-60"
            : "bg-surface-container border-primary hover:bg-surface-bright"
        )}>
          {/* Top Row: title + xp + delete */}
          <div className="flex items-start gap-4">
            {/* Status icon */}
            <div className={cn(
              "mt-0.5 w-6 h-6 border-2 flex items-center justify-center shrink-0 transition-colors",
              isCompleted
                ? "border-outline-variant bg-surface-container-low"
                : "border-primary"
            )}>
              {isCompleted
                ? <Check className="w-4 h-4 text-outline-variant" />
                : <TrendingUp className="w-3 h-3 text-primary" />
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-headline font-bold text-sm uppercase flex items-center gap-2",
                isCompleted ? "line-through text-on-surface-variant" : "text-white"
              )}>
                {task.title}
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className={cn(
                  "font-body text-[10px] font-bold uppercase tracking-widest flex items-center gap-1",
                  isCompleted ? "text-on-surface-variant" : priorityColor
                )}>
                  {task.priority === "High"   && <AlertTriangle className="w-3 h-3" />}
                  {task.priority === "Medium" && <Target className="w-3 h-3" />}
                  PRIORITY: {task.priority}
                </span>
                <span className="font-body text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.category}
                </span>
              </div>
            </div>

            {/* XP + Delete */}
            <div className="flex items-center gap-3 shrink-0">
              <span className={cn(
                "font-headline font-black text-sm",
                isCompleted ? "text-on-surface-variant" : "text-primary"
              )}>
                +{xpReward} XP
              </span>
              <button
                onClick={(e) => handleDeleteInitiate(task, e)}
                disabled={isPending}
                className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors rounded-sm opacity-0 group-hover:opacity-100"
                title="Delete Directive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-3 ml-10">
            {/* Progress Bar */}
            <div className="h-1.5 bg-surface-container-highest overflow-hidden mb-1.5">
              <div
                className={cn(
                  "h-full transition-all duration-500 ease-out",
                  isCompleted ? "bg-outline-variant" : "bg-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Labels + Controls */}
            <div className="flex items-center justify-between">
              <span className={cn(
                "font-headline font-bold text-[10px] uppercase tracking-widest",
                isCompleted ? "text-on-surface-variant" : "text-primary/80"
              )}>
                {cv} / {tv} {task.unit}
                {!isCompleted && percentage > 0 && ` (${percentage}%)`}
              </span>

              {/* Action Buttons */}
              {!isCompleted && (
                <div className="flex items-center gap-1">
                  {/* Minus */}
                  <button
                    disabled={isPending || cv <= 0}
                    onClick={() => handleQuickProgress(task, -1)}
                    className="w-7 h-7 flex items-center justify-center border border-outline-variant/50 text-on-surface-variant hover:border-error hover:text-error transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Kurangi 1"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  {/* Input Manual */}
                  <button
                    disabled={isPending}
                    onClick={() => setProgressModal(task)}
                    className="px-3 h-7 text-[9px] font-headline font-black uppercase tracking-widest border border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                    title="Input nilai"
                  >
                    <TrendingUp className="w-2.5 h-2.5" />
                    LOG
                  </button>

                  {/* Plus */}
                  <button
                    disabled={isPending || cv >= tv}
                    onClick={() => handleQuickProgress(task, 1)}
                    className="w-7 h-7 flex items-center justify-center border border-primary/50 text-primary hover:bg-primary/20 hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Tambah 1"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ── Checklist Task (behavior lama) ──────────────────────────────────────
    return (
      <div
        onClick={() => !isCompleted && handleToggle(task.id, isCompleted, task.priority ?? "Medium")}
        className={cn(
          "flex items-center gap-4 p-4 transition-all group border-l-4",
          isCompleted
            ? "bg-surface-container-highest border-outline-variant opacity-60"
            : "bg-surface-container border-primary hover:bg-surface-bright cursor-pointer hover:translate-x-1"
        )}
      >
        <div className={cn(
          "w-6 h-6 border-2 flex items-center justify-center transition-colors shrink-0",
          isCompleted
            ? "border-outline-variant bg-surface-container-low"
            : "border-primary group-hover:bg-primary/10"
        )}>
          {isCompleted && <Check className="w-4 h-4 text-outline-variant" />}
        </div>

        <div className="flex-1 min-w-0">
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
              {task.priority === "High"   && <AlertTriangle className="w-3 h-3" />}
              {task.priority === "Medium" && <Target className="w-3 h-3" />}
              PRIORITY: {task.priority}
            </span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={cn(
            "font-headline font-black text-sm",
            isCompleted ? "text-on-surface-variant" : "text-primary"
          )}>
            +{xpReward} XP
          </span>
          <button
            onClick={(e) => handleDeleteInitiate(task, e)}
            disabled={isPending}
            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors rounded-sm opacity-0 group-hover:opacity-100"
            title="Delete Directive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Forbidden Task Item
  // ─────────────────────────────────────────────────────────────────────────
  const ForbiddenItem = ({ task }: { task: Task }) => {
    const isViolated = task.is_completed ?? false;
    const xpPenalty  = task.priority === "High" ? 200 : task.priority === "Medium" ? 100 : 50;
    const ptsPenalty = task.priority === "High" ? 100 : task.priority === "Medium" ? 50  : 25;

    return (
      <div className={cn(
        "flex items-center gap-4 p-4 transition-all group border-l-4",
        isViolated
          ? "bg-error/5 border-error/30 opacity-50"
          : "bg-surface-container border-error/60 hover:bg-error/5"
      )}>
        <div className={cn(
          "w-6 h-6 border-2 flex items-center justify-center shrink-0 transition-colors",
          isViolated ? "border-error/30 bg-error/10" : "border-error/60"
        )}>
          {isViolated
            ? <Skull className="w-4 h-4 text-error/50" />
            : <ShieldAlert className="w-4 h-4 text-error/60" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-headline font-bold text-sm uppercase flex items-center gap-2",
            isViolated ? "line-through text-error/40" : "text-error/90"
          )}>
            {task.title}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-error/50 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              PENALTY: -{xpPenalty} XP / -{ptsPenalty} PTS
            </span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isViolated ? (
            <span className="font-headline font-black text-[10px] uppercase tracking-widest text-error/50 px-3 py-1 border border-error/20 bg-error/5">
              VIOLATED
            </span>
          ) : (
            <button
              onClick={(e) => handleViolateInitiate(task, e)}
              disabled={isPending}
              className="font-headline font-black text-[10px] uppercase tracking-widest px-3 py-2 bg-error/10 border border-error/40 text-error hover:bg-error/20 hover:border-error transition-all flex items-center gap-1.5"
            >
              <Skull className="w-3 h-3" />
              SAYA MELANGGAR
            </button>
          )}
          <button
            onClick={(e) => handleDeleteInitiate(task, e)}
            disabled={isPending}
            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors rounded-sm opacity-0 group-hover:opacity-100"
            title="Delete Protocol"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* DAILY DIRECTIVES */}
      <div>
        <h2 className="font-headline font-black uppercase tracking-tighter text-2xl mb-4 text-primary">
          DAILY DIRECTIVES
        </h2>
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

      {/* WEEKLY OBJECTIVES */}
      <div>
        <h2 className="font-headline font-black uppercase tracking-tighter text-2xl mb-4 text-secondary">
          WEEKLY OBJECTIVES
        </h2>
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

      {/* FORBIDDEN PROTOCOLS */}
      <div>
        <h2 className="font-headline font-black uppercase tracking-tighter text-2xl mb-1 text-error flex items-center gap-3">
          <ShieldAlert className="w-6 h-6" />
          FORBIDDEN PROTOCOLS
        </h2>
        <p className="font-headline font-bold text-[10px] uppercase tracking-widest text-error/50 mb-4 border-l-2 border-error/30 pl-3">
          PANTANGAN HARIAN — TAHAN GODAAN. MELANGGAR = HUKUMAN BERAT.
        </p>
        <div className="space-y-3">
          {forbiddenTasks.length === 0 ? (
            <div className="p-8 border border-dashed border-error/20 text-center text-error/40 font-headline uppercase text-xs tracking-widest">
              No forbidden protocols assigned. Kamu bebas dari pantangan... untuk sekarang.
            </div>
          ) : (
            forbiddenTasks.map(t => <ForbiddenItem key={t.id} task={t} />)
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      {/* Progress Input Modal */}
      {progressModal && (
        <ProgressInputModal
          task={{
            id:            progressModal.id,
            title:         progressModal.title,
            unit:          progressModal.unit ?? "unit",
            current_value: progressModal.current_value ?? 0,
            target_value:  progressModal.target_value ?? 1,
            priority:      progressModal.priority ?? "Medium",
          }}
          onClose={() => setProgressModal(null)}
          onUpdate={handleProgressUpdate}
        />
      )}

      {/* Delete confirm modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="HAPUS DIREKTIF"
        description={<>Apakah kamu yakin ingin membatalkan misi <span className="text-white font-bold">&quot;{deleteTarget?.title}&quot;</span>?</>}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isPending}
      />

      {/* Violation confirm modal */}
      <ConfirmModal
        isOpen={!!violateTarget}
        title="⚠ KONFIRMASI PELANGGARAN"
        description={
          <>
            Apakah kamu benar-benar telah melanggar pantangan{" "}
            <span className="text-error font-bold">&quot;{violateTarget?.title}&quot;</span>?
            <br /><br />
            <span className="text-error/70 text-xs">
              Hukuman:{" "}
              <strong>
                -{violateTarget?.priority === "High" ? 200 : violateTarget?.priority === "Medium" ? 100 : 50} XP
              </strong>{" "}
              &amp;{" "}
              <strong>
                -{violateTarget?.priority === "High" ? 100 : violateTarget?.priority === "Medium" ? 50 : 25} Points
              </strong>{" "}
              akan langsung dipotong. Ini tidak bisa di-undo.
            </span>
          </>
        }
        onConfirm={handleViolateConfirm}
        onCancel={() => setViolateTarget(null)}
        isLoading={isPending}
      />
    </div>
  );
}
