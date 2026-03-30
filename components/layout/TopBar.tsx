"use client";

import { useEffect, useState } from "react";
import { Search, Bell, ShieldPlus, Menu } from "lucide-react";
import { formatTime } from "@/lib/utils";

export function TopBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(formatTime(new Date()));
    const interval = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="hidden md:flex fixed top-0 right-0 w-[calc(100%-16rem)] justify-between items-center px-8 z-40 h-16 bg-[#000000]/80 backdrop-blur-md border-b-4 border-[#191919] transition-all duration-300">
      <div className="flex items-center gap-4">
        <span className="text-primary font-headline font-black text-xl tracking-widest">BIT MOVE</span>
        <span className="h-4 w-[2px] bg-outline-variant"></span>
        <span className="flex items-center gap-2 font-headline font-bold text-xs text-on-surface-variant uppercase tracking-tighter">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-fast"></span>
          SYSTEM STATUS: OPTIMAL
        </span>
        <span className="h-4 w-[2px] bg-outline-variant ml-2"></span>
        <span className="font-headline font-bold text-xs text-secondary uppercase tracking-widest min-w-[100px]">
          {time}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex items-center bg-surface-container-high px-3 py-1 border border-outline-variant/30 focus-within:border-primary transition-colors">
          <Search className="w-4 h-4 text-primary mr-2" />
          <input
            className="bg-transparent border-none text-[10px] font-headline uppercase outline-none focus:ring-0 w-48 text-white placeholder-on-surface-variant"
            placeholder="QUERY DATABASE..."
            type="text"
          />
        </div>
        <div className="flex gap-4">
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
