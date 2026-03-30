"use client";

import { useState } from "react";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { QuickQuests } from "@/components/dashboard/QuickQuests";
import { DisciplineQuota } from "@/components/dashboard/DisciplineQuota";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { MissionLog } from "@/components/dashboard/MissionLog";
import { formatTime } from "@/lib/utils";

export default function DashboardPage() {
  const [xp, setXp] = useState(50000);
  const [quota, setQuota] = useState(40);
  const [logs, setLogs] = useState([
    { id: "1", time: "12:04:22", action: "Training Ground: Heavy Lift Session", yield: "+450 XP" },
    { id: "2", time: "09:15:00", action: "Daily Quest: Morning Meditation", yield: "+100 XP" },
    { id: "3", time: "Yesterday", action: "Inactivity Penalty: Task Expired", yield: "-200 XP", isPenalty: true },
  ]);

  const handleQuestComplete = (xpGain: number, title: string) => {
    setXp((prev) => prev + xpGain);
    setQuota((prev) => Math.min(100, prev + 15));
    
    const newLog = {
      id: Date.now().toString(),
      time: formatTime(new Date()),
      action: `Quest: ${title}`,
      yield: `+${xpGain} XP`
    };
    
    setLogs((prev) => [newLog, ...prev.slice(0, 4)]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <HeroSection xp={xp} streak={45} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <QuickQuests onQuestComplete={handleQuestComplete} />
        </div>
      </section>

      <section>
        <DisciplineQuota quota={quota} />
      </section>

      <section>
        <Heatmap />
      </section>

      <section>
        <MissionLog logs={logs} />
      </section>
    </div>
  );
}
