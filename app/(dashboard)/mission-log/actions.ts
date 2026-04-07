"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getWorkoutFromLog(logId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const log = await prisma.point_logs.findUnique({ where: { id: logId } });
  if (!log) throw new Error("Log not found");

  if (log.source_type !== "Training Session" && log.source_type !== "workout") {
      throw new Error("Not a training session");
  }

  if (!log.created_at) throw new Error("Missing creation timestamp");

  const workout = await prisma.workouts.findFirst({
    where: {
      user_id: log.user_id,
      status: "completed",
      total_xp_earned: (log.xp_change ?? 0) > 0 ? (log.xp_change ?? undefined) : undefined,
      ended_at: {
        gte: new Date(log.created_at.getTime() - 60000),
        lte: new Date(log.created_at.getTime() + 60000),
      }
    },
    include: {
      workout_exercises: {
        include: {
          exercises: true,
          sets: {
            orderBy: { set_number: 'asc' }
          }
        }
      }
    }
  });

  return workout;
}

// ─── Analytics types ──────────────────────────────────────────────────────────
export type TimeRange = "7D" | "30D" | "90D" | "1Y";

export type XpTimelinePoint = {
  label: string;     // formatted date label untuk X axis
  xp: number;        // XP earned di periode ini
  cumulative: number;
};

export type ActivityPoint = {
  label: string;
  quest: number;
  training: number;
  penalty: number;
  other: number;
};

export type AnalyticsStats = {
  totalXp: number;
  totalTasks: number;
  totalPenalties: number;
  bestDay: { label: string; xp: number } | null;
  avgXpPerDay: number;
  missedDays: number;
};

export type AnalyticsData = {
  xpTimeline: XpTimelinePoint[];
  activityBreakdown: ActivityPoint[];
  stats: AnalyticsStats;
};

// ─── Helper: format a date bucket label ──────────────────────────────────────
function bucketLabel(date: Date, groupBy: "day" | "week"): string {
  const TZ = "Asia/Jakarta";
  if (groupBy === "week") {
    // Use the monday of that week as label
    const monday = new Date(date);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);
    return monday.toLocaleDateString("id-ID", { day: "2-digit", month: "short", timeZone: TZ });
  }
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", timeZone: TZ });
}

// ─── Helper: get ISO date string in WIB (Asia/Jakarta) ───────────────────────
function toWIBDateString(date: Date): string {
  // Format: "YYYY-MM-DD" in WIB
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }); // en-CA gives YYYY-MM-DD
}

// ─── Helper: classify source_type ────────────────────────────────────────────
function classifySource(sourceType: string | null): "quest" | "training" | "penalty" | "other" {
  if (!sourceType) return "other";
  const s = sourceType.toLowerCase();
  if (s === "penalty" || s === "resistance_bonus") return "penalty";
  if (s.includes("training") || s === "workout") return "training";
  if (s.includes("task") || s.includes("quest") || s.includes("completion") || s === "resistance_bonus") return "quest";
  return "other";
}

// ─── Main analytics server action ────────────────────────────────────────────
export async function getAnalyticsData(range: TimeRange): Promise<AnalyticsData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Compute date range
  const now = new Date();
  const daysMap: Record<TimeRange, number> = { "7D": 7, "30D": 30, "90D": 90, "1Y": 365 };
  const days = daysMap[range];
  const since = new Date(now);
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  // Aggregate by day or week
  const groupBy: "day" | "week" = days > 30 ? "week" : "day";

  // Fetch all point_logs in range
  const rawLogs = await prisma.point_logs.findMany({
    where: {
      user_id: userId,
      created_at: { gte: since },
    },
    select: {
      created_at: true,
      xp_change: true,
      points_change: true,
      source_type: true,
    },
    orderBy: { created_at: "asc" },
  });

  // ── Build bucket map ──────────────────────────────────────────────────────
  // Key = "YYYY-WW" for week grouping, or "YYYY-MM-DD" for day grouping
  type Bucket = {
    label: string;
    xp: number;
    quest: number;
    training: number;
    penalty: number;
    other: number;
    taskCount: number;
    penaltyCount: number;
  };

  const bucketMap = new Map<string, Bucket>();

  // Pre-fill every bucket in range so there are no gaps
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);

    const isoKey =
      groupBy === "week"
        ? (() => {
            const monday = new Date(d);
            const dow = monday.getDay();
            const diff = dow === 0 ? -6 : 1 - dow;
            monday.setDate(monday.getDate() + diff);
            return toWIBDateString(monday);
          })()
        : toWIBDateString(d);

    if (!bucketMap.has(isoKey)) {
      bucketMap.set(isoKey, {
        label: bucketLabel(d, groupBy),
        xp: 0,
        quest: 0,
        training: 0,
        penalty: 0,
        other: 0,
        taskCount: 0,
        penaltyCount: 0,
      });
    }
  }

  // Aggregate raw logs into buckets
  for (const log of rawLogs) {
    if (!log.created_at) continue;

    const d = new Date(log.created_at);
    let isoKey: string;

    if (groupBy === "week") {
      const monday = new Date(d);
      const tz = "Asia/Jakarta";
      // Convert to WIB date, get day of week
      const wibStr = d.toLocaleDateString("en-CA", { timeZone: tz });
      const wibDate = new Date(wibStr + "T00:00:00");
      const dow = wibDate.getDay();
      const diff = dow === 0 ? -6 : 1 - dow;
      wibDate.setDate(wibDate.getDate() + diff);
      isoKey = wibDate.toLocaleDateString("en-CA");
    } else {
      isoKey = toWIBDateString(d);
    }

    const bucket = bucketMap.get(isoKey);
    if (!bucket) continue;

    const xp = log.xp_change ?? 0;
    const type = classifySource(log.source_type);

    // Only add positive XP to the flow chart (penalty is shown separately)
    if (xp > 0) bucket.xp += xp;

    bucket[type]++;

    if (type === "quest") bucket.taskCount++;
    if (type === "penalty") bucket.penaltyCount++;
  }

  // Convert to ordered arrays
  const sortedKeys = Array.from(bucketMap.keys()).sort();
  const xpTimeline: XpTimelinePoint[] = [];
  const activityBreakdown: ActivityPoint[] = [];

  let cumulative = 0;
  let totalXp = 0;
  let totalTasks = 0;
  let totalPenalties = 0;
  let missedDays = 0;
  let bestDay: { label: string; xp: number } | null = null;

  for (const key of sortedKeys) {
    const b = bucketMap.get(key)!;
    cumulative += b.xp;
    totalXp += b.xp;
    totalTasks += b.taskCount;
    totalPenalties += b.penaltyCount;

    if (!bestDay || b.xp > bestDay.xp) {
      bestDay = { label: b.label, xp: b.xp };
    }

    xpTimeline.push({ label: b.label, xp: b.xp, cumulative });
    activityBreakdown.push({
      label: b.label,
      quest: b.quest,
      training: b.training,
      penalty: b.penalty,
      other: b.other,
    });

    if (b.xp === 0 && b.quest === 0 && b.training === 0 && b.penalty === 0 && b.other === 0) {
      missedDays++;
    }
  }

  const avgXpPerDay = days > 0 ? Math.round(totalXp / days) : 0;

  return {
    xpTimeline,
    activityBreakdown,
    stats: { totalXp, totalTasks, totalPenalties, bestDay, avgXpPerDay, missedDays },
  };
}
