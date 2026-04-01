"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

export function DashboardShell({ children, streak = 0 }: { children: React.ReactNode; streak?: number }) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  return (
    <div className="bg-surface-container-lowest text-white font-body">
      <Sidebar isDesktopOpen={isDesktopOpen} setIsDesktopOpen={setIsDesktopOpen} />
      <TopBar isDesktopOpen={isDesktopOpen} setIsDesktopOpen={setIsDesktopOpen} streak={streak} />
      <main 
        className={cn(
          "pt-24 px-4 pb-4 md:pt-28 md:px-8 md:pb-8 transition-all duration-300 min-h-screen",
          isDesktopOpen ? "md:ml-64" : "md:ml-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
