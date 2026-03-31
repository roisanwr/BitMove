"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  return (
    <div className="min-h-screen bg-surface-container-lowest text-white font-body">
      <Sidebar isDesktopOpen={isDesktopOpen} setIsDesktopOpen={setIsDesktopOpen} />
      <TopBar isDesktopOpen={isDesktopOpen} setIsDesktopOpen={setIsDesktopOpen} />
      <main 
        className={cn(
          "pt-20 md:pt-24 p-4 md:p-8 min-h-screen transition-all duration-300",
          isDesktopOpen ? "md:ml-64" : "md:ml-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
