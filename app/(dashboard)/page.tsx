import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { QuickQuests } from "@/components/dashboard/QuickQuests";
import { DisciplineQuota } from "@/components/dashboard/DisciplineQuota";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { MissionLog } from "@/components/dashboard/MissionLog";

export const metadata = {
  title: "COMMAND CENTER | BITMOVE",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return redirect("/login");
  const userId = session.user.id;

  // 1. Fetch Profile Data
  const profile = await prisma.profiles.findUnique({
    where: { id: userId }
  });
  if (!profile) return redirect("/login");

  // Get Rank Title based on Level
  const levelRule = await prisma.level_rules.findFirst({
    where: { level: { lte: profile.level ?? 1 } },
    orderBy: { level: "desc" }
  });
  const rankTitle = levelRule?.title || "OPERATIVE";

  // 2. Fetch Tasks for Quick Quests & Quota
  const allDailyTasks = await prisma.tasks.findMany({
    where: { user_id: userId, frequency: "Daily" }
  });

  const completedCount = allDailyTasks.filter(t => t.is_completed).length;
  const totalCount = allDailyTasks.length;
  const quotaPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Top 3 Priority Uncompleted Quests
  const priorityOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const quickQuests = allDailyTasks
    .filter(t => !t.is_completed)
    .sort((a, b) => (priorityOrder[b.priority || "Medium"] || 0) - (priorityOrder[a.priority || "Medium"] || 0))
    .slice(0, 3)
    .map(t => ({
      id: t.id,
      title: t.title,
      priority: (t.priority?.toUpperCase() || "NORMAL") as "OMEGA" | "HIGH" | "NORMAL",
      xpGain: t.priority === "High" ? 50 : t.priority === "Medium" ? 30 : 10,
      completed: false,
      unit: t.unit ?? "Checklist",
      current_value: t.current_value ?? 0,
      target_value: t.target_value ?? 1,
    }));

  // 3. Fetch Mission Logs (Last 5)
  const recentLogs = await prisma.point_logs.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    take: 5
  });

  // Calculate local time for logs
  const logs = recentLogs.map(l => {
    const d = l.created_at ? new Date(l.created_at) : new Date();
    // Sangat penting format time, fallback ke format hh:mm:ss
    const timeStr = d.toLocaleTimeString("en-US", { hour12: false, timeZone: profile.timezone || "Asia/Jakarta" });
    return {
      id: l.id,
      time: timeStr,
      action: l.description || "Unknown Action",
      yield: `${l.xp_change && l.xp_change > 0 ? '+' : ''}${l.xp_change || 0} XP`,
      isPenalty: l.xp_change && l.xp_change < 0 ? true : false,
      sourceType: l.source_type
    };
  });

  // 4. Heatmap Activity Data
  // Hanya hitung: task yang selesai (bukan punishment/cron) + exercise dalam workout completed
  const tz = profile.timezone || "Asia/Jakarta";

  // Hitung window grid heatmap: 52 minggu dari Senin minggu ini
  const todayForGrid = new Date();
  const dowForGrid = todayForGrid.getDay();
  const daysToMonday = dowForGrid === 0 ? 6 : dowForGrid - 1;
  const heatmapStart = new Date(todayForGrid);
  heatmapStart.setDate(todayForGrid.getDate() - daysToMonday - 51 * 7);
  heatmapStart.setHours(0, 0, 0, 0);

  // Helper: konversi Date ke string YYYY-MM-DD di timezone user
  const toDateKey = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: tz });

  // A. Task yang benar-benar diselesaikan user (bukan undo/punishment/cron)
  const taskLogs = await prisma.point_logs.findMany({
    where: {
      user_id: userId,
      source_type: "task",
      xp_change: { gt: 0 },
      created_at: { gte: heatmapStart },
    },
    select: { created_at: true, description: true },
  });

  // B. Workout yang sudah selesai + nama exercise di dalamnya
  const completedWorkouts = await prisma.workouts.findMany({
    where: {
      user_id: userId,
      status: "completed",
      ended_at: { gte: heatmapStart },
    },
    select: {
      ended_at: true,
      workout_exercises: {
        select: {
          exercises: { select: { name: true, measurement_unit: true } },
          sets: {
            where: { is_completed: true },
            select: { completed_value: true },
          },
        },
      },
    },
  });

  // C. Metadata task user: unit & target_value untuk format desc popup
  //    + judul task NEGATIVE dikecualikan dari heatmap sepenuhnya
  const userTasks = await prisma.tasks.findMany({
    where: { user_id: userId },
    select: { title: true, unit: true, target_value: true, polarity: true },
  });
  // Map judul (lowercase) → { unit, target } — hanya task POSITIVE
  const taskMetaMap = new Map(
    userTasks
      .filter((t) => t.polarity !== "NEGATIVE")
      .map((t) => [t.title.toLowerCase(), { unit: t.unit, target: t.target_value }])
  );
  // Set judul task NEGATIVE untuk di-skip
  const negTitles = new Set(
    userTasks.filter((t) => t.polarity === "NEGATIVE").map((t) => t.title.toLowerCase())
  );

  // Helper: format volume exercise (seconds → "Xm Ys")
  const formatVolume = (total: number, unit: string): string => {
    if (unit === "seconds") {
      const m = Math.floor(total / 60);
      const s = total % 60;
      return m > 0 ? `${m}m ${s}s` : `${s}s`;
    }
    return `${total} ${unit}`;
  };

  // Build activityMap (count) dan dayDetails (detail untuk popup)
  type DayDetail = { tasks: { title: string; desc: string }[]; exercises: { title: string; desc: string }[] };
  const activityMap: Record<string, number> = {};
  const dayDetails: Record<string, DayDetail> = {};

  // Proses task logs — skip negative tasks sepenuhnya
  for (const log of taskLogs) {
    if (!log.created_at) continue;
    const title = log.description?.replace(/^Completed:\s*/i, "") ?? "Task";

    // Negative task yang dilanggar → exclude dari heatmap & popup
    if (negTitles.has(title.toLowerCase())) continue;

    const key = toDateKey(log.created_at);
    if (!dayDetails[key]) dayDetails[key] = { tasks: [], exercises: [] };

    // "Complete" untuk checklist | "target/target unit" untuk numeric
    const meta = taskMetaMap.get(title.toLowerCase());
    const isChecklist = !meta || meta.unit === "Checklist";
    const desc = isChecklist
      ? "Complete"
      : `${meta.target}/${meta.target} ${meta.unit}`;

    dayDetails[key].tasks.push({ title, desc });
    activityMap[key] = (activityMap[key] || 0) + 1;
  }

  // Proses workout exercises
  for (const workout of completedWorkouts) {
    if (!workout.ended_at) continue;
    const key = toDateKey(workout.ended_at);
    if (!dayDetails[key]) dayDetails[key] = { tasks: [], exercises: [] };
    for (const we of workout.workout_exercises) {
      if (we.sets.length === 0) continue; // skip exercise tanpa set apapun
      const totalReps = we.sets.reduce((sum, set) => sum + (set.completed_value || 0), 0);
      const unit = we.exercises.measurement_unit || "reps";
      dayDetails[key].exercises.push({
        title: we.exercises.name,
        desc: `${we.sets.length} Sets • ${formatVolume(totalReps, unit)}`,
      });
      activityMap[key] = (activityMap[key] || 0) + 1;
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <HeroSection 
            xp={profile.current_xp || 0} 
            streak={profile.streak_current || 0} 
            level={profile.level || 1}
            rankTitle={rankTitle}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <QuickQuests quests={quickQuests} />
        </div>
      </section>

      <section>
        <DisciplineQuota quota={quotaPercentage} />
      </section>

      <section>
        <Heatmap
          activityMap={activityMap}
          dayDetails={dayDetails}
          streakMax={profile.streak_max || 0}
        />
      </section>

      <section>
        <MissionLog logs={logs} credits={profile.current_points || 0} />
      </section>
    </div>
  );
}
