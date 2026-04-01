"use client";

import { useEffect, useState } from "react";
import { Search, Bell, ShieldPlus, Flame } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Menghitung sisa waktu sampai jam 00:00 WIB (Asia/Jakarta) berikutnya.
 * Returns { hours, minutes, seconds }
 */
function getTimeUntilMidnightJakarta(): { hours: number; minutes: number; seconds: number; totalSeconds: number } {
  // Ambil waktu "sekarang" dalam zona Jakarta
  const now = new Date();
  const jakartaStr = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const jakartaNow = new Date(jakartaStr);

  // Hitung target: hari ini jam 00:00+1 hari (midnight berikutnya)
  const midnight = new Date(jakartaNow);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  const diffMs = midnight.getTime() - jakartaNow.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
}

export function TopBar({ isDesktopOpen, setIsDesktopOpen, streak = 0 }: { isDesktopOpen: boolean; setIsDesktopOpen: (val: boolean) => void; streak?: number }) {
  const [time, setTime] = useState("");
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  useEffect(() => {
    // Initial set
    setTime(formatTime(new Date()));
    setCountdown(getTimeUntilMidnightJakarta());

    const interval = setInterval(() => {
      setTime(formatTime(new Date()));
      setCountdown(getTimeUntilMidnightJakarta());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const countdownStr = `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`;

  // Warna berubah semakin dekat ke midnight
  const isUrgent = countdown.totalSeconds < 3600; // < 1 jam
  const isCritical = countdown.totalSeconds < 600; // < 10 menit

  return (
    <header className={cn(
      "hidden md:flex fixed top-0 right-0 justify-between items-center px-8 z-40 h-16 bg-[#000000]/80 backdrop-blur-md border-b-4 border-[#191919] transition-all duration-300",
      isDesktopOpen ? "w-[calc(100%-16rem)]" : "w-full"
    )}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsDesktopOpen(!isDesktopOpen)}
          className="text-primary hover:text-white transition-colors flex items-center justify-center p-1 rounded hover:bg-surface-container-high cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">
            {isDesktopOpen ? "menu_open" : "menu"}
          </span>
        </button>
        <span className="text-primary font-headline font-black text-xl tracking-widest">BIT MOVE</span>
        <span className="h-4 w-[2px] bg-outline-variant"></span>

        {/* Countdown Timer to Daily Reset */}
        <span className="flex items-center gap-2 font-headline font-bold text-xs uppercase tracking-tighter">
          <span className={cn(
            "w-2 h-2 rounded-full",
            isCritical ? "bg-error animate-pulse" : isUrgent ? "bg-tertiary animate-pulse-fast" : "bg-primary animate-pulse-fast"
          )}></span>
          <span className={cn(
            "transition-colors",
            isCritical ? "text-error" : isUrgent ? "text-tertiary" : "text-on-surface-variant"
          )}>
            DAILY RESET:
          </span>
          <span className={cn(
            "font-black tracking-widest tabular-nums min-w-[72px]",
            isCritical ? "text-error" : isUrgent ? "text-tertiary" : "text-secondary"
          )}>
            {countdownStr}
          </span>
        </span>

        <span className="h-4 w-[2px] bg-outline-variant ml-2"></span>
        <span className="font-headline font-bold text-xs text-on-surface-variant uppercase tracking-widest min-w-[100px]">
          {time}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 font-headline font-black text-secondary bg-surface-container-high px-3 py-1 border border-outline-variant/30 tooltip-trigger" title="Current Daily Streak">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm mt-0.5">{streak} Days</span>
          </div>
          <Bell className="w-5 h-5 text-on-surface-variant hover:text-secondary cursor-pointer transition-transform" />
          <ShieldPlus className="w-5 h-5 text-on-surface-variant hover:text-secondary cursor-pointer transition-transform" />
        </div>
        <div className="h-10 w-10 bg-primary-container p-[2px] cursor-pointer hover:bg-secondary transition-colors">
          <img
            alt="Commander"
            className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all"
            src="https://ui-avatars.com/api/?name=Elite+Op&background=000&color=8eff71&bold=true&font-size=0.4"
          />
        </div>
      </div>
    </header>
  );
}
