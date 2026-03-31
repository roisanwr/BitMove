"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, Settings, Grid, Award, Dumbbell, ReceiptText, Store } from "lucide-react";
import { useState } from "react";

export function Sidebar({ isDesktopOpen, setIsDesktopOpen }: { isDesktopOpen: boolean; setIsDesktopOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/", icon: Grid },
    { label: "Daily Quests", href: "/quests", icon: Award },
    { label: "Training Ground", href: "/training", icon: Dumbbell },
    { label: "Mission Log", href: "/mission-log", icon: ReceiptText },
    { label: "Black Market", href: "/market", icon: Store },
  ];

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#000000]/90 backdrop-blur-md border-b-2 border-primary z-50 flex items-center justify-between px-4">
        <span className="text-primary font-headline font-black text-lg tracking-widest">CMD CENTER</span>
        <button onClick={() => setIsOpen(!isOpen)} className="text-primary p-2">
          <span className="material-symbols-outlined">{isOpen ? "close" : "menu"}</span>
        </button>
      </div>

      <aside
        id="sidebar"
        className={cn(
          "fixed left-0 top-0 h-full flex flex-col z-50 bg-[#0e0e0e] w-64 border-r-0 shadow-[4px_0_0_0_#1f1f1f] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isDesktopOpen ? "md:translate-x-0" : "md:-translate-x-full"
        )}
      >
        <div className="p-6 pt-20 md:pt-6">
          <div className="text-2xl font-black tracking-tiled text-primary italic font-headline mb-1">COMMAND CENTER</div>
          <div className="font-headline font-bold uppercase text-[10px] tracking-widest text-on-surface-variant mb-8">RANK: ELITE OPERATIVE</div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 p-3 transition-colors font-headline uppercase text-xs tracking-tighter",
                    isActive 
                      ? "bg-primary text-[#0d6100] font-bold rounded-none scale-105" 
                      : "text-[#484848] hover:bg-surface-container-high hover:text-primary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-6 space-y-4">
          <button className="w-full bg-primary text-black font-headline font-black py-4 uppercase tracking-widest glitch-effect hover:shadow-[0_0_15px_#8eff71]">
            INITIATE MISSION
          </button>
          <div className="pt-4 border-t border-outline-variant/20 space-y-2">
            <Link href="/settings" className="flex items-center gap-3 p-2 text-[#484848] hover:text-primary font-headline uppercase text-[10px] tracking-tighter">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <Link href="/api/auth/signout" className="flex items-center gap-3 p-2 text-[#484848] hover:text-error font-headline uppercase text-[10px] tracking-tighter">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
