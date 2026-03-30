"use client";

import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

type LogEntry = {
  id: string;
  time: string;
  action: string;
  yield: string;
  isPenalty?: boolean;
};

export function MissionLog({ logs }: { logs?: LogEntry[] }) {
  const defaultLogs: LogEntry[] = [
    { id: "1", time: "12:04:22", action: "Training Ground: Heavy Lift Session", yield: "+450 XP" },
    { id: "2", time: "09:15:00", action: "Daily Quest: Morning Meditation", yield: "+100 XP" },
    { id: "3", time: "Yesterday", action: "Inactivity Penalty: Task Expired", yield: "-200 XP", isPenalty: true },
  ];

  const displayLogs = logs || defaultLogs;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20 md:pb-0">
      <div className="md:col-span-1 bg-surface-container p-6 border-l-4 border-secondary overflow-hidden group hover:shadow-[0_0_20px_rgba(213,117,255,0.15)] transition-shadow flex flex-col">
        <h3 className="font-headline font-black text-lg uppercase mb-4 group-hover:text-secondary transition-colors flex justify-between items-center">
          <span>BLACK MARKET</span>
          <ShoppingCart className="w-5 h-5" />
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-surface-container-low p-3 hover:bg-surface-bright cursor-pointer transition-colors border border-transparent hover:border-secondary/50">
            <span className="font-headline text-xs uppercase text-on-surface-variant group-hover:text-white">XP Multiplier (2h)</span>
            <span className="font-headline font-black text-primary group-hover:scale-110 transition-transform">500 Cr</span>
          </div>
          <div className="flex justify-between items-center bg-surface-container-low p-3 hover:bg-surface-bright cursor-pointer transition-colors border border-transparent hover:border-secondary/50">
            <span className="font-headline text-xs uppercase text-on-surface-variant group-hover:text-white">Penalty Shield</span>
            <span className="font-headline font-black text-primary group-hover:scale-110 transition-transform">1200 Cr</span>
          </div>
        </div>
        <div className="mt-auto pt-8 relative overflow-hidden rounded-sm">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-secondary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity"></div>
          <div className="w-full h-24 bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
            <span className="font-headline text-[10px] text-on-surface-variant tracking-widest text-center leading-tight">
              ENCRYPTED<br/>MERCHANT NETWORK
            </span>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-2 bg-surface-container p-6 relative">
        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-transparent"></div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline font-black text-lg uppercase">MISSION LOG: RECENT INTEL</h3>
          <button className="font-headline text-[10px] text-primary hover:text-white uppercase tracking-widest transition-colors">
            View All Archive
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-headline">
            <thead>
              <tr className="text-[10px] text-on-surface-variant border-b border-outline-variant uppercase tracking-widest text-left">
                <th className="pb-3 px-2 font-normal">Timestamp</th>
                <th className="pb-3 px-2 font-normal">Action</th>
                <th className="pb-3 px-2 text-right font-normal">Yield</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {displayLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className={cn(
                    "border-b border-outline-variant/10 transition-colors",
                    log.isPenalty ? "hover:bg-error/10 text-error" : "hover:bg-surface-container-high"
                  )}
                >
                  <td className={cn("py-4 px-2 font-body", log.isPenalty ? "opacity-80" : "text-on-surface-variant")}>
                    {log.time}
                  </td>
                  <td className={cn("py-4 px-2 uppercase font-bold", !log.isPenalty && "text-white")}>
                    {log.action}
                  </td>
                  <td className={cn(
                    "py-4 px-2 text-right font-black",
                    !log.isPenalty && "text-primary"
                  )}>
                    {log.yield}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
